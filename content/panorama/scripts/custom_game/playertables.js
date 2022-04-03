"use strict";

const PT = {
    listeners: {},
    tableListeners: {},
    nextListener: 0,
    tables: {},
    subs: [],
};

const playerTables = {};

/**
 * @param {string} tableName
 * @returns the current keys and values of all keys within the table "tableName" or null if no table exists with that name.
 */
playerTables.GetAllTableValues = function (tableName) {
    const table = PT.tables[tableName];
    if (table) return JSON.parse(JSON.stringify(table));

    return null;
};

/**
 * @param {string} tableName
 * @param {string} keyName
 * @returns the current value for the key given by "keyName" if it exists on the table given by "tableName" or null if no table exists, or undefined if the key does not exist.
 */
playerTables.GetTableValue = function (tableName, keyName) {
    const table = PT.tables[tableName];
    if (!table) return null;

    const val = table[keyName];

    if (typeof val === "object") return JSON.parse(JSON.stringify(val));

    return val;
};

/**
 * Sets up a callback for when this playertable is changed.
 * @param {string} tableName
 * @param {(tableName: string, changesObject: object, deletionsObject: object) => void} callback
 * @returns listener ID
 */
playerTables.SubscribeNetTableListener = function (tableName, callback) {
    let listeners = PT.tableListeners[tableName];
    if (!listeners) {
        listeners = {};
        PT.tableListeners[tableName] = listeners;
    }

    const ID = PT.nextListener;
    PT.nextListener++;

    listeners[ID] = callback;
    PT.listeners[ID] = tableName;

    return ID;
};

/**
 * Removes the existing subscription as given by the callbackID (the integer returned from SubscribeNetTableListener)
 * @param {number} callbackID
 */
playerTables.UnsubscribeNetTableListener = function (callbackID) {
    const tableName = PT.listeners[callbackID];
    if (tableName) {
        if (PT.tableListeners[tableName]) {
            const listener = PT.tableListeners[tableName][callbackID];
            if (listener) {
                delete PT.tableListeners[tableName][callbackID];
            }
        }

        delete PT.listeners[callbackID];
    }

    return;
};

/**
 * @param {string} tableName
 * @returns the current keys and values of all keys within the table "tableName" or null if no table exists with that name. Adds local player ID to table name.
 */
playerTables.GetAllPlayerValues = function (tableName) {
    return playerTables.GetAllTableValues(tableName + Players.GetLocalPlayer());
};

/**
 * @param {string} tableName
 * @param {string} keyName
 * @returns the current value for the key given by "keyName" if it exists on the table given by "tableName" or null if no table exists, or undefined if the key does not exist. Adds local player ID to table name.
 */
playerTables.GetPlayerValue = function (tableName, keyName) {
    return playerTables.GetTableValue(
        tableName + Players.GetLocalPlayer(),
        keyName
    );
};

/**
 * Sets up a callback for when this playertable is changed.
 * Adds player ID to tableName
 * @param {string} tableName
 * @param {(tableName: string, changesObject: object, deletionsObject: object) => void} callback
 * @returns listener ID
 */
playerTables.SubscribePlayerTableListener = function (tableName, callback) {
    return playerTables.SubscribeNetTableListener(
        tableName + Players.GetLocalPlayer(),
        callback
    );
};

/**
 * Removes the existing subscription as given by the callbackID (the integer returned from SubscribeNetTableListener)
 * @param {number} callbackID
 */
playerTables.UnsubscribePlayerTableListener = function (callbackID) {
    playerTables.UnsubscribeNetTableListener(callbackID);
};

/**
 * Equality check for two objects
 * @param {object} a
 * @param {object} b
 * @returns true if equal
 */
function isEquivalent(a, b) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    if (aProps.length != bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
}

/**
 * Compares two tables and writes changes and deletions objects
 * @param {object} newTable
 * @param {object} oldTable
 * @param {object} changes object to write changes to
 * @param {object} dels object to write deletions to
 */
function ProcessTable(newTable, oldTable, changes, dels) {
    for (const k in newTable) {
        const n = newTable[k];
        const old = oldTable[k];

        if (typeof n == typeof old && typeof n == "object") {
            if (!isEquivalent(n, old)) {
                changes[k] = n;
            }

            delete oldTable[k];
        } else if (n !== old) {
            changes[k] = n;
            delete oldTable[k];
        } else if (n === old) {
            delete oldTable[k];
        }
    }

    for (const k in oldTable) {
        dels[k] = true;
    }
}

/**
 * Register client in PlayerTables
 */
function SendPID() {
    const pid = Players.GetLocalPlayer();
    const spec = Players.IsSpectator(pid);

    if (pid == -1 && !spec) {
        $.Schedule(1 / 30, SendPID);
        return;
    }

    GameEvents.SendCustomGameEventToServer("PlayerTables_Connected", {
        pid: pid,
    });
}

/**
 * Process full table update event
 * @param {*} msg
 */
function TableFullUpdate(msg) {
    const newTable = msg.table;
    const oldTable = PT.tables[msg.name];

    if (!newTable) delete PT.tables[msg.name];
    else PT.tables[msg.name] = newTable;

    const listeners = PT.tableListeners[msg.name] || {};
    const len = Object.keys(listeners).length;
    let changes = null;
    let dels = null;

    if (len > -1 && newTable) {
        if (!oldTable) {
            changes = newTable;
            dels = {};
        } else {
            changes = {};
            dels = {};
            ProcessTable(newTable, oldTable, changes, dels);
        }
    }

    for (const k in listeners) {
        try {
            listeners[k](msg.name, changes, dels);
        } catch (err) {
            $.Msg(
                "PlayerTables.TableFullUpdate callback error for '",
                msg.name,
                " -- ",
                newTable,
                "': ",
                err.stack
            );
        }
    }
}

/**
 * Process partial table update event
 * @param {*} msg
 */
function UpdateTable(msg) {
    const table = PT.tables[msg.name];
    if (!table) {
        $.Msg("PlayerTables.UpdateTable invoked on nonexistent playertable.");
        return;
    }

    const t = {};

    for (const k in msg.changes) {
        const value = msg.changes[k];

        table[k] = value;
        if (typeof value === "object") t[k] = JSON.parse(JSON.stringify(value));
        else t[k] = value;
    }

    const listeners = PT.tableListeners[msg.name] || {};
    for (const k in listeners) {
        if (listeners[k]) {
            try {
                listeners[k](msg.name, t, {});
            } catch (err) {
                $.Msg(
                    "PlayerTables.UpdateTable callback error for '",
                    msg.name,
                    " -- ",
                    t,
                    "': ",
                    err.stack
                );
            }
        }
    }
}

/**
 * Process table deletions event from server
 * @param {*} msg
 */
function DeleteTableKeys(msg) {
    const table = PT.tables[msg.name];
    if (!table) {
        $.Msg(
            "PlayerTables.DeleteTableKey invoked on nonexistent playertable."
        );
        return;
    }

    const t = {};

    for (const k in msg.keys) {
        delete table[k];
    }

    const listeners = PT.tableListeners[msg.name] || {};
    for (const k in listeners) {
        if (listeners[k]) {
            try {
                listeners[k](msg.name, {}, msg.keys);
            } catch (err) {
                $.Msg(
                    "PlayerTables.DeleteTableKeys callback error for '",
                    msg.name,
                    " -- ",
                    msg.keys,
                    "': ",
                    err.stack
                );
            }
        }
    }
}

(function () {
    GameUI.CustomUIConfig().PlayerTables = playerTables;

    SendPID();

    GameEvents.Subscribe("pt_fu", TableFullUpdate);
    GameEvents.Subscribe("pt_uk", UpdateTable);
    GameEvents.Subscribe("pt_kd", DeleteTableKeys);

    $.Msg("PlayerTables Loaded");
})();
