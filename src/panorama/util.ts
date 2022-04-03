// ======================================================================
// Name: util.ts
// Description: General purpose functions for a wide variety of scenarios
// ======================================================================

/**
 * Base class for object-oriented class structuring.
 */
abstract class PanelClass {
	protected readonly panel: Panel;

	constructor(panel: Panel) {
		this.panel = panel;
	}
}

const PlayerTables = GetGlobalValue("PlayerTables")!;

/**
 * A namespace for all kinds of general purpose functions handling numbers.
 */
namespace Numbers {
	/**
	 * Generates a random integer between min and max (inclusive)
	 * @param  {number} min
	 * @param  {number} max
	 * @returns randomly generated integer
	 */
	export function RandomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	/**
	 * Round a number to a given amount of maximum decimal places.
	 * @param num number to round
	 * @param places maximum decimal places
	 * @returns rounded number
	 */
	export function Round(num: number, places: number): number {
		let factor = Math.pow(10, places);
		return Math.round((num + Number.EPSILON) * factor) / factor;
	}

	/**
	 * Shortens a floting point number for better readbility.
	 * Note that this function *does not* round the number.
	 * This only 'cuts' the number's decimal length, and does not alter the number at all.
	 * Consider using Numbers.Round and only use this function if this is exactly what you're looking for.
	 * @param num number to shorten
	 * @returns shortened number
	 */
	export function Shorten(num: number, decimal?: number) {
		return Number(num.toFixed(decimal ?? 2));
	}

	/**
	 * checks wether a number is positive, 0 or negative.
	 * @param x
	 * @returns
	 */
	export function Sign(x: number): 1 | 0 | -1 {
		return x > 0 ? 1 : x < 0 ? -1 : 0;
	}

	/**
	 * Check if a number is valud
	 * @param num number to check
	 * @returns true, if the number is valid
	 */
	export function IsValid(num: number): boolean {
		if (isNaN(num)) return false;
		return isFinite(num);
	}

	/**
	 * Parses int from a string, e.g. "RuneSlot5" would return 5.
	 * @param s string that contains digit characters
	 * @returns number
	 */
	export function ExtractFromString(s: string): number {
		return parseInt(s.replace(/^\D+/g, ""));
	}

	/**
	 * Calculates an angle in degree from an input angle in radians.
	 * @param rad radian input angle
	 * @returns degree output angle
	 */
	export function RadToDeg(rad: number): number {
		return (360 * rad) / (Math.PI * 2);
	}
}

/**
 * A namespace for all kinds of general purpose functions handling vectors.
 */
namespace Vectors {
	/**
	 * Normalize this vector. This sets this vectors length to 1 while not changing its direction.
	 * @param vec input vector
	 * @returns normalized vector
	 */
	export function Normalize(vec: PanoramaVector): PanoramaVector {
		const val = Vectors.Length(vec);
		return { x: vec.x * val, y: vec.y * val };
	}

	/**
	 * Calculate the length of a given vector.
	 * @param vec input vector
	 * @returns length of the vector
	 */
	export function Length(vec: PanoramaVector): number {
		return 1 / Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
	}

	/**
	 * Multiply a vector by a given number.
	 * @param vec input vector
	 * @param mult input multiplicator
	 * @returns multiplied vector
	 */
	export function Mult(vec: PanoramaVector, mult: number): PanoramaVector {
		return { x: vec.x * mult, y: vec.y * mult };
	}

	/**
	 * Adds two vectors together.
	 * @param vec1 first input vector
	 * @param vec2 second input vector
	 * @returns added vector
	 */
	export function Add(vec1: PanoramaVector, vec2: PanoramaVector): PanoramaVector {
		return { x: vec1.x + vec2.x, y: vec1.y + vec2.y };
	}

	/**
	 * Substracts a vector from another one.
	 * @param vec1 vector to substract from
	 * @param vec2 vector to substract
	 * @returns substracted vector
	 */
	export function Sub(vec1: PanoramaVector, vec2: PanoramaVector): PanoramaVector {
		return { x: vec1.x - vec2.x, y: vec1.y - vec2.y };
	}

	/**
	 * Negates a vector.
	 * @param vec input vector
	 * @returns negated vector
	 */
	export function Negate(vec: PanoramaVector): PanoramaVector {
		return { x: -vec.x, y: -vec.y };
	}

	/**
	 * Calculates the 2d angle between to a second vector
	 * @param vec first input vector
	 * @param refVec Optional. [-1, 0] is used as default.
	 * @returns angle in degrees
	 */
	export function Angle(vec: PanoramaVector, refVec?: PanoramaVector): number {
		const referenceVec = refVec ?? { x: -1, y: 0 };
		let dot = DotProduct(vec, referenceVec);
		let angleOld = Math.acos(dot / Vectors.Length(vec));
		return Numbers.RadToDeg(angleOld);
	}

	/**
	 * Calculates the dot product of two given vectors
	 * @param vec1 first input vector
	 * @param vec2 second input vector
	 * @returns dot product
	 */
	export function DotProduct(vec1: PanoramaVector, vec2: PanoramaVector) {
		return vec1.x * vec2.x + vec1.y * vec2.y;
	}
}

/**
 * A namespace for all kinds of general purpose functions handling arrays.
 */
namespace Arrays {
	/**
	 * Returns a random element from an array.
	 * @param arr array to choose from
	 * @returns random element
	 */
	export function GetRandomElement<T>(arr: T[]): T {
		return arr[Numbers.RandomInt(0, arr.length - 1)];
	}

	/**
	 * Turn a table-like object into an array.
	 * @param obj The object to transform to an array
	 * @returns An array with items of the value type of the original object
	 */
	export function FromTable<T>(obj: Record<number, T>): T[] {
		const result = [];
		let key = 1;
		while (obj[key]) {
			result.push(obj[key]);
			key++;
		}
		return result;
	}
}

namespace Colors {
	/**
	 * Darkens or lightens input color by simply modifying each of RGB channels by provided amount.
	 * @param hexcolor
	 * @param amount
	 * @returns new hex color
	 */
	function Shade(color: string, amount: number) {
		return (
			"#" +
			color
				.replace(/^#/, "")
				.replace(/../g, (color) =>
					("0" + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
				)
		);
	}

	/**
	 * Highlights a text through html formatting.
	 * @param text text to highlight
	 * @returns formatted text
	 */
	export function MarkText(text: string | number): string {
		return "<font color='#ffffff'><b>" + text + "</b></font>";
	}
}

/**
 * A namespace for all kinds of general purpose functions handling panels.
 */
namespace Panels {
	/**
	 * Counterpart to `FindChildTraverse`: Searches the parents of a child until it finds a panel with given id.
	 * @param panel child panel
	 * @param id id of the parent
	 * @returns found parent or null, if no matching panels existed
	 */
	export function FindParentTraverse(panel: Panel, id: string): Panel | null {
		let parent = panel.GetParent();
		while (parent !== null && parent.id !== id) {
			parent = parent.GetParent();
		}
		return parent;
	}

	/**
	 * Executes a callback function when given player table gets its data
	 * Callback is being executed only once
	 * @param tableName player table name
	 * @param callback callback function
	 */
	export function InitializeOnPlayerTableUpdate<TName extends keyof PlayerTableDeclarations>(
		tableName: TName,
		callback: () => void
	) {
		if (PlayerTables.GetAllPlayerValues(tableName)) {
			callback();
			return;
		}
		const contextPanel = $.GetContextPanel();
		if (contextPanel.GetAttributeInt("playerTableInit", 0) === 0) {
			contextPanel.SetAttributeInt(
				"playerTableInit",
				PlayerTables.SubscribePlayerTableListener(tableName, () => {
					callback();
					PlayerTables.UnsubscribePlayerTableListener(
						contextPanel.GetAttributeInt("playerTableInit", -1) as PlayerTableListenerID
					);
				})
			);
		}
	}

	/**
	 * Set a panel tooltip that gets shown while hovered.
	 * @param panel panel to show the tooltip
	 * @param localizationKey localization key name to localize and show the text on panel
	 */
	export function SetTooltip(panel: Panel, localizationKey: string) {
		panel.SetPanelEvent("onmouseover", () => {
			const text = $.Localize(localizationKey);
			$.DispatchEvent("DOTAShowTextTooltip", panel, text);
		});
		panel.SetPanelEvent("onmouseout", () => {
			$.DispatchEvent("DOTAHideTextTooltip", panel);
		});
	}

	/**
	 * Set a panel tooltip with title and description that gets shown while hovered.
	 * @param panel panel to show the tooltip
	 * @param titleLocalizationKey localization key to localize for the title.
	 * @param descriptionLocalizationKey localization key to localize for the description.
	 */
	export function SetTitleTooltip(panel: Panel, titleLocalizationKey: string, descriptionLocalizationKey: string) {
		panel.SetPanelEvent("onmouseover", () => {
			const title = $.Localize(titleLocalizationKey);
			const description = $.Localize(descriptionLocalizationKey);
			$.DispatchEvent("DOTAShowTitleTextTooltip", panel, title, description);
		});
		panel.SetPanelEvent("onmouseout", () => {
			$.DispatchEvent("DOTAHideTitleTextTooltip", panel);
		});
	}

	/**
	 * Enables the `SetAcceptsFocus` for all children recursively
	 * @param panel root panel
	 */
	export function EnableFocusForAllChilds(panel: Panel) {
		panel.SetAcceptsFocus(true);
		panel.Children().forEach((child) => {
			EnableFocusForAllChilds(child);
		});
	}

	let checkboxCallbacks: Map<Panel, (state: boolean) => void> = new Map();
	let checkBoxes: Panel[] = [];
	$.RegisterForUnhandledEvent("StyleClassesChanged", (panel) => {
		if (!checkBoxes.includes(panel)) return;
		let state = panel.checked;
		checkboxCallbacks.get(panel)!(state);
	});

	/**
	 * Register a callback for a checkbox, that is called whenever the checkbox state changes.
	 * @param panel checkbox panel.
	 * @param callback callback function to call.
	 */
	export function RegisterCheckboxEvent(panel: Panel, callback: (state: boolean) => void) {
		checkboxCallbacks.set(panel, callback);
		checkBoxes = [...checkboxCallbacks.keys()];
	}

	/**
	 * Unregister a previously registered checkbox callback.
	 * @param panel checkbox panel.
	 */
	export function UnregisterCheckboxEvent(panel: Panel) {
		checkboxCallbacks.delete(panel);
		checkBoxes = [...checkboxCallbacks.keys()];
	}

	/**
	 * Calculate the real pixel value for a given measured pixel scale.
	 * @param value pixel value to scale
	 * @param isHeight is this height or width?
	 * @returns scaled pixel value
	 */
	export function ToAbsPixelValue(value: number): number {
		return Math.floor((1 / $.GetContextPanel().actualuiscale_x) * value);
	}

	/**
	 * Get the absolute position of ap panel in relation to its context panel.
	 * @param panel panel to check
	 * @returns Absolute world position as a Panorama vector
	 */
	export function GetAbsPosition(panel: Panel): PanoramaVector {
		let parent = panel.GetParent();
		if (!parent) return { x: 0, y: 0 };
		let posX = ToAbsPixelValue(panel.actualxoffset) + ToAbsPixelValue(panel.actuallayoutwidth) / 2;
		let posY = ToAbsPixelValue(panel.actualyoffset) + ToAbsPixelValue(panel.actuallayoutheight) / 2;
		while (parent.id !== "CustomUIContainer_Hud" && parent.id !== "Tooltips") {
			posX += ToAbsPixelValue(parent.actualxoffset);
			posY += ToAbsPixelValue(parent.actualyoffset);
			parent = parent.GetParent()!;
		}
		return { x: Math.floor(posX), y: Math.floor(posY) };
	}

	/**
	 * Get the absolute bounds of a panel (realitve to complete window).
	 * @param panel panel to check
	 * @returns bounds object
	 */
	export function GetAbsBounds(panel: Panel): PanelBounds {
		const windowPosition = panel.GetPositionWithinWindow();
		const posX = ToAbsPixelValue(windowPosition.x);
		const poxY = ToAbsPixelValue(windowPosition.y);
		const height = ToAbsPixelValue(panel.actuallayoutheight);
		const width = ToAbsPixelValue(panel.actuallayoutwidth);

		return {
			minX: posX,
			maxX: posX + width,
			minY: poxY,
			maxY: poxY + height,
		};
	}

	/**
	 * Calculate the absolute center of a panel.
	 * @param panel panel to calculate the center
	 * @returns center x and y coordinate
	 */
	export function GetAbsCenter(panel: Panel): PanoramaVector {
		const panelBounds = GetAbsBounds(panel);
		const panelHeight = panelBounds.maxY - panelBounds.minY;
		const panelWidth = panelBounds.maxX - panelBounds.minX;
		return {
			x: panelBounds.minX + panelWidth / 2,
			y: panelBounds.minY + panelHeight / 2,
		};
	}

	/**
	 * Set the position of a panel.
	 * @param panel panel to set
	 * @param position new position
	 */
	export function SetPosition(panel: Panel, position: PanoramaVector) {
		$.Schedule(0, () => {
			const height = ToAbsPixelValue(panel.actuallayoutheight);
			const width = ToAbsPixelValue(panel.actuallayoutwidth);
			panel.style.position = `${position.x - width / 2}px ${position.y - height / 2}px 0`;
		});
	}
}

const hudRoot = Panels.FindParentTraverse($.GetContextPanel(), "Hud")!;

// ==================================
// =      CROSS COMPATIBILITY       =
// ==================================

/**
 * Same as $.Msg() but a little more convenient to use.
 * @param args stuff to print
 */
function print(...args: any[]) {
	$.Msg(
		args.reduce((prev, cur) => {
			return `${prev}    ${cur}`;
		})
	);
}

/**
 * Duplicate of the server (vscripts) function
 * @param message error message
 * @param level Not used.
 */
function error(message: string, level?: number) {
	throw new Error(message);
}

// ==================================
// =       PLAYER/NET TABLES        =
// ==================================

/**
 * Subscribes to NetTable changes also firing callback on current contents
 * @param tableName table name
 * @param callback callback
 * @returns NetTableListenerID
 */
function SubscribeAndFirePlayerTable<
	TName extends keyof PlayerTableDeclarations,
	T extends PlayerTableDeclarations[TName],
	K extends keyof T
>(
	tableName: TName,
	callback: (
		tableName: TName,
		changesObject: Optional<NetworkedData<PlayerTableDeclarations[TName]>>,
		deletions: K[]
	) => void
): PlayerTableListenerID {
	const currentValue = PlayerTables.GetAllPlayerValues(tableName) as Optional<
		NetworkedData<PlayerTableDeclarations[TName]>
	>;
	if (currentValue) {
		callback(tableName, currentValue, []);
	}
	return PlayerTables.SubscribePlayerTableListener(tableName, (tableName, changesObject, deletionsObject) => {
		callback(tableName, changesObject as Optional<NetworkedData<T>>, deletionsObject as unknown as K[]);
	});
}

/**
 * Subscribes to NetTable changes also firing callback on current contents
 * @param tableName table name
 * @param keyName table key
 * @param callback callback
 * @returns NetTableListenerID
 */
function SubscribeAndFireNetTableByKey<
	TName extends keyof CustomNetTableDeclarations,
	K extends keyof CustomNetTableDeclarations[TName],
	T extends CustomNetTableDeclarations[TName][K]
>(tableName: TName, keyName: K, callback: (value: T) => void): NetTableListenerID {
	const currentValue = CustomNetTables.GetTableValue(tableName, keyName) as unknown as T;
	if (currentValue) {
		callback(currentValue);
	}
	return CustomNetTables.SubscribeNetTableListener(tableName, (name, key, values) => {
		if (key == keyName) {
			callback(values as unknown as T);
		}
	});
}

// ==================================
// =       GENERAL FUNCTIONS        =
// ==================================

/**
 * Set a global value, that can be accessed by any script
 * @param name name of the value
 * @param value value
 */
function SetGlobalValue<TName extends keyof CustomUIConfig, T extends CustomUIConfig[TName]>(name: TName, value: T) {
	GameUI.CustomUIConfig()[name] = value;
	GameEvents.SendEventClientSide("on_global_value_changed", { name });
}

/**
 * Get a previously set global value.
 * @param name name of the value
 * @param defaultVal Optional. return value, if no value was set before
 * @returns value or undefined. Will never return undefined, if the optional default value was given
 */
function GetGlobalValue<TName extends keyof CustomUIConfig, T extends CustomUIConfig[TName]>(
	name: TName,
	defaultVal?: undefined
): T | undefined;
function GetGlobalValue<TName extends keyof CustomUIConfig, T extends CustomUIConfig[TName]>(
	name: TName,
	defaultVal: T
): SuperType<T, NonNullable<CustomUIConfig[TName]>>;

function GetGlobalValue(name: keyof CustomUIConfig, defaultVal?: any): any {
	let value = GameUI.CustomUIConfig()[name];
	return value ?? defaultVal;
}

const globalValueCallbacks: Map<keyof CustomUIConfig, (value: any) => void> = new Map();
/**
 * Register a callback function, that gets called, whenever a global value gets changed.
 * @param name
 * @param callback
 */
function RegisterGlobalValueCallback<TName extends keyof CustomUIConfig, T extends CustomUIConfig[TName]>(
	name: TName,
	callback: (value: T) => void
) {
	globalValueCallbacks.set(name, callback);
}

GameEvents.Subscribe("on_global_value_changed", (event) => {
	const name = event.name as keyof CustomUIConfig;

	if (globalValueCallbacks.has(name)) {
		globalValueCallbacks.get(name)!(GetGlobalValue(name));
	}
});

// Alt Button Detection:

let altDown = false;
let altRunning: ScheduleID | undefined;
let altCallbacks: Set<(down: boolean) => void> = new Set();
/**
 * Periodically checks if the alt button status has changed.
 * If yes, registered callbacks may be called.
 */
function CheckAltOption() {
	if (GameUI.IsAltDown() && altDown === false) {
		altDown = true;
		for (const callback of altCallbacks) {
			callback(altDown);
		}
	} else if (!GameUI.IsAltDown() && altDown === true) {
		altDown = false;
		for (const callback of altCallbacks) {
			callback(altDown);
		}
	}
	altRunning = $.Schedule(Game.GetGameFrameTime(), CheckAltOption);
}

/**
 * Registers a function to be called whenever the alt button status changes.
 * @param callback callback to call. Receives a boolean value about the current alt status
 */
function RegisterAltCallback(callback: (down: boolean) => void) {
	altCallbacks.add(callback);
	if (!altRunning) {
		CheckAltOption();
	}
}

/**
 * Clear all currently used alt callbacks.
 */
function ClearAltCallbacks() {
	altCallbacks.clear();
	if (altRunning) {
		$.CancelScheduled(altRunning);
		altRunning = undefined;
	}
}

// ctrl Button Detection:

let ctrlDown = false;
let ctrlRunning: ScheduleID | undefined;
let ctrlCallbacks: Set<(down: boolean) => void> = new Set();
/**
 * Periodically checks if the ctrl button status has changed.
 * If yes, registered callbacks may be called.
 */
function CheckCtrlOption() {
	if (GameUI.IsControlDown() && ctrlDown === false) {
		ctrlDown = true;
		for (const callback of ctrlCallbacks) {
			callback(ctrlDown);
		}
	} else if (!GameUI.IsControlDown() && ctrlDown === true) {
		ctrlDown = false;
		for (const callback of ctrlCallbacks) {
			callback(ctrlDown);
		}
	}
	ctrlRunning = $.Schedule(Game.GetGameFrameTime(), CheckAltOption);
}

/**
 * Registers a function to be called whenever the ctrl button status changes.
 * @param callback callback to call. Receives a boolean value about the current ctrl status
 */
function RegisterCtrlCallback(callback: (down: boolean) => void) {
	ctrlCallbacks.add(callback);
	if (!ctrlRunning) {
		CheckAltOption();
	}
}

/**
 * Clear all currently used ctrl callbacks.
 */
function ClearCtrlCallbacks() {
	ctrlCallbacks.clear();
	if (ctrlRunning) {
		$.CancelScheduled(ctrlRunning);
		ctrlRunning = undefined;
	}
}

/**
 * Reads constant from constants nettable.
 * @param name
 */
function GetConstant(name: string) {
	const constantTable = CustomNetTables.GetTableValue("constants", name);
	if (!constantTable) error(`Constant "${name}" not found!`);
	return constantTable.value;
}

/**
 * Return localized string if one exists; Returns undefined otherwise
 * @param localizationKey
 * @returns localized string or undefined
 */
function TryLocalize(localizationKey: string): string | undefined {
	let localizedName = $.Localize(localizationKey);
	if (localizedName !== localizationKey) return localizedName;
}

/**
 * Checks if cheats are enabled, or if this is in tools mode.
 * @returns true if either cheats or tools are active, false otherwise
 */
let cheatModeCallbacks: (() => void)[] = [];
function IsCheatMode(): boolean {
	if (Game.IsInToolsMode()) return true;
	let cheatMode = $.GetContextPanel().GetAttributeInt("cheats_enabled", 0) === 1;
	return cheatMode;
}

/**
 * Registers a function to be called, as soon as cheats are registered enabled.
 * @param callback function to call when cheats are enabled.
 */
function SetCheatModeActivation(callback: () => void) {
	if (IsCheatMode()) {
		callback();
		return;
	}
	cheatModeCallbacks.push(callback);
}

SubscribeAndFireNetTableByKey("game_status", "dev", (dev) => {
	$.GetContextPanel().SetAttributeInt("cheats_enabled", dev.cheats_enabled ? 1 : 0);
	if (dev.cheats_enabled) {
		for (const callback of cheatModeCallbacks) {
			callback();
		}
		cheatModeCallbacks = [];
	}
});
