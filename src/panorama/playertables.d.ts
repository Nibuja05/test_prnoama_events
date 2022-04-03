type PlayerTableListenerID = number & {
    readonly __tag__: "PlayerTableListenerID";
};

declare interface PlayerTables {
    GetAllPlayerValues<
        TName extends keyof PlayerTableDeclarations,
        T extends PlayerTableDeclarations[TName]
    >(
        tableName: TName
    ): NetworkedData<T>;
    GetPlayerValue<
        TName extends keyof PlayerTableDeclarations,
        T extends PlayerTableDeclarations[TName],
        K extends keyof T
    >(
        tableName: TName,
        keyName: K
    ): NetworkedData<T[K]>;
    SubscribePlayerTableListener<
        TName extends keyof PlayerTableDeclarations,
        T extends PlayerTableDeclarations[TName],
        K extends keyof T
    >(
        tableName: TName,
        callback: (
            tableName: TName,
            changesObject: Optional<NetworkedData<T>>,
            deletions: K[]
        ) => void
    ): PlayerTableListenerID;
    UnsubscribePlayerTableListener(listenerId: PlayerTableListenerID): void;
}

interface CustomUIConfig {
    PlayerTables: PlayerTables;
}
