import { WebAPIManager } from "../webAPI/web_api_manager";
import { DevManager } from "./dev_commands";

export class GameLogicManager {
	// example:	BattleManager: typeof BattleManager;
	WebAPIManager: typeof WebAPIManager;
	DevCommands: typeof DevManager;

	constructor() {
		// Assign managers
		// Example: this.BattleManager = BattleManager;
		this.WebAPIManager = WebAPIManager;
		this.DevCommands = DevManager;

		// Assign the global Managers variable
		Managers = this;

		// initalize the managers
		this.Init();
	}

	private Init() {
		// example: this.BattleManager.Init();
		WebAPIManager.Init();
		DevManager.Init();
	}

	/**
	 * Initializes all relevant managers for a specific player.
	 * @param playerId Player to initialize managers for.
	 */
	InitForPlayer(playerId: PlayerID) {
		// example: this.BattleManager.InitForPlayer(playerId);
	}
}
