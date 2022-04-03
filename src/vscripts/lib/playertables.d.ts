declare interface PlayerTables {
	CreatePlayerTable<TName extends keyof PlayerTableDeclarations, T extends PlayerTableDeclarations[TName]>(
		tableName: TName,
		contents: T,
		playerId: PlayerID
	): void;
	DeletePlayerTable<TName extends keyof PlayerTableDeclarations>(tableName: TName, playerId: PlayerID): void;
	PlayerTableExists<TName extends keyof PlayerTableDeclarations>(tableName: TName, playerId: PlayerID): boolean;
	DeletePlayerKey<
		TName extends keyof PlayerTableDeclarations,
		T extends PlayerTableDeclarations[TName],
		K extends keyof T
	>(
		tableName: TName,
		keyName: K,
		playerId: PlayerID
	): void;
	DeletePlayerKeys<
		TName extends keyof PlayerTableDeclarations,
		T extends PlayerTableDeclarations[TName],
		K extends keyof T
	>(
		tableName: TName,
		keyNames: K[],
		playerId: PlayerID
	): void;
	GetPlayerValue<
		TName extends keyof PlayerTableDeclarations,
		T extends PlayerTableDeclarations[TName],
		K extends keyof T
	>(
		tableName: TName,
		playerId: PlayerID,
		keyName: K
	): NetworkedData<T[K]>;
	GetAllPlayerValues<TName extends keyof PlayerTableDeclarations, T extends PlayerTableDeclarations[TName]>(
		tableName: TName,
		playerId: PlayerID
	): NetworkedData<T>;
	SetPlayerValue<
		TName extends keyof PlayerTableDeclarations,
		T extends PlayerTableDeclarations[TName],
		K extends keyof T
	>(
		tableName: TName,
		playerId: PlayerID,
		keyName: K,
		value: T[K]
	): void;
	SetPlayerValues<TName extends keyof PlayerTableDeclarations, T extends PlayerTableDeclarations[TName]>(
		tableName: TName,
		playerId: PlayerID,
		values: Optional<T>
	): void;
}

declare var PlayerTables: PlayerTables;
