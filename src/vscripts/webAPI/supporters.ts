export class Supporters {
	static supporterStateMap: Map<PlayerID, SupporterState> = new Map();
	static developerSteamIds = new Set([
		"76561198132422587", // Sanctus Animus
		"76561198054179075", // darklord
		"76561198052211234", // bukka
		"76561198007141460", // Firetoad
		"76561198064622537", // Sheodar
		"76561198188258659", // Australia is my City
		"76561199069138789", // Dota 2 unofficial
		"76561198249367546", // Flames
		"76561197994333648", // Shush
		"76561198068804194", // Nibuja
		"76561198001376044", // TideS
		"76561198011433508", // Chariot
	]);

	/**
	 * Get the supporter level of a supporter.
	 * @param playerId player ID of a supporter.
	 * @returns The level of the supporter, or undefined if it does not exist in the supporter map.
	 */
	static GetSupporterLevel(playerId: PlayerID) {
		return this.supporterStateMap.get(playerId)?.level;
	}

	/**
	 * Gets the end date of a supporter.
	 * @param playerId Player ID of a supporter.
	 * @returns The end date of the supporter as a string, or undefined if it does not exist in the supporter map.
	 */
	static GetSupporterEndDate(playerId: PlayerID) {
		return this.supporterStateMap.get(playerId)?.endDate;
	}

	/**
	 * Set a player's supporter state in the supporter map.
	 * @param playerId Player ID to set.
	 * @param state Supporter State to set.
	 */
	static SetSupporterState(playerId: PlayerID, state: SupporterState) {
		this.supporterStateMap.set(playerId, state);
	}

	/**
	 * Get a player's supporter state in the supporter map.
	 * @param playerId Player ID to get.
	 * @returns The player's supporter state, or undefined if it does not exist in the supporter map.
	 */
	static GetSupporterState(playerId: PlayerID) {
		return this.supporterStateMap.get(playerId);
	}

	/**
	 * Query whether a player is a developer from the developer set.
	 * @param playerId Player ID to check.
	 * @returns Boolean; whether this player is a developer or not.
	 */
	static IsDeveloper(playerId: PlayerID) {
		const steamId = tostring(PlayerResource.GetSteamID(playerId));
		return this.developerSteamIds.has(steamId);
	}
}
