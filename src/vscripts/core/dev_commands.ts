import { Util } from "../lib/util";
import { Constants } from "./constants";

export abstract class DevManager {
	private static connectionDelay: number = Constants.ARTIFICIAL_DELAY_VALUE;

	static Init() {
		//Dev panel events
		Util.RegisterClientEventListener(
			"dev_add_gold",
			(event, playerId) => {
				this.RunDevCommand(DevUIEventType.ADD_GOLD, playerId, event.amount);
			},
			false
		);
		Util.RegisterClientEventListener(
			"dev_set_delay",
			(event, playerId) => {
				this.RunDevCommand(DevUIEventType.SET_DELAY, playerId, event.delay);
			},
			false
		);
	}

	static GetConnectionDelay() {
		return this.connectionDelay;
	}

	/**
	 * Fires a dev command, used for debugging based on the text provided. Only active in cheat enabeld lobby or tools mode.
	 * @param event
	 * @returns
	 */
	static DevCommandFromChat(text: string) {
		// Verify server should allow event call
		if (!IsInToolsMode() && !GameRules.IsCheatMode()) return;

		const command = text.split(" ")[0];

		switch (command) {
			case "-addgold":
				this.ProcessChatCommand(text, DevUIEventType.ADD_GOLD, true);
				break;
			case "-setdelay":
				this.ProcessChatCommand(text, DevUIEventType.SET_DELAY, true);
				break;
		}
	}

	/**
	 * Extracts all valueable data from a chat command.
	 * @param text input text
	 * @param type type of the command
	 * @param hasArg does this command has/needs args?
	 */
	private static ProcessChatCommand(text: string, type: DevUIEventType, hasArg: boolean = false) {
		const textArgs = text.split(" ");
		let playerId: PlayerID = 0;
		let value: number | undefined = undefined;

		if (hasArg) {
			if (!textArgs[1]) return;
			value = Number(textArgs[1]);
			if (isNaN(value)) return;
		}

		if (textArgs[hasArg ? 2 : 1]) {
			const affectedPlayer = textArgs[2];
			if (affectedPlayer === "all") {
				playerId = -1; // meaning all players
			} else if (isNaN(Number(affectedPlayer))) return;
			else {
				playerId = Number(affectedPlayer) as PlayerID;
			}
		}

		this.RunDevCommand(type, playerId, value);
	}

	/**
	 * Runs a dev command for a specific action and for a specified set of players.
	 * @param type what action should be executed?
	 * @param player for what players? -1 means all players
	 * @param optArg Optional. Any number argument
	 */
	private static RunDevCommand(type: DevUIEventType, player: PlayerID, optArg?: number) {
		const playerIDs: PlayerID[] = player === -1 ? Util.GetAllPlayerIDs() : [player];

		switch (type) {
			case DevUIEventType.ADD_GOLD:
				if (!optArg) return;
				for (const playerID of playerIDs) {
					if (!PlayerResource.IsValidPlayerID(playerID)) continue;
					PlayerResource.ModifyGold(playerID, optArg, true, ModifyGoldReason.CHEAT_COMMAND);
				}
				break;
			case DevUIEventType.SET_DELAY:
				if (!optArg) return;
				this.connectionDelay = optArg;
		}
	}
}
