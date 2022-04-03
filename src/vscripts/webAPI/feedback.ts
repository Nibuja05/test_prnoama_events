import { Constants } from "../core/constants";
import { Util } from "../lib/util";

export class Feedback {
	static feedbackCooldowns: Map<PlayerID, number> = new Map();

	/**
	 * Initializes the Feedback class with relevant events.
	 */
	static Init() {
		Util.RegisterClientEventListener("webapi:send_feedback", (event, playerId) => {
			this.GetFeedbackFromPlayer(playerId, event);
		});

		Util.RegisterClientEventListener("webapi:check_feedback_cooldown", (_, playerId) => {
			this.CheckCooldown(playerId);
		});
	}

	/**
	 * Called when a player sends feedback.
	 * @param playerId The PlayerID of the player that sent the feedback.
	 * @param event An object that includes the feedback.
	 * @returns
	 */
	static GetFeedbackFromPlayer(playerId: PlayerID, event: SendFeedbackEvent) {
		if (!PlayerResource.IsValidPlayerID(playerId)) return;
		const player = PlayerResource.GetPlayer(playerId);
		if (!player) return;

		if (Util.WebAPIDebug()) {
			print(`Called GetFeedbackFromPlayer, initiated by PlayerID ${playerId}`);
			print("Event's contents:");
			DeepPrintTable(event);
		}

		const remainingCooldown = this.feedbackCooldowns.get(playerId);

		if (!remainingCooldown || GameRules.GetGameTime() - remainingCooldown > Constants.WEBAPI_FEEDBACK_COOLDOWN) {
			if (Util.WebAPIDebug()) {
				print("No cooldown on feedback, sending feedback to the server!");
			}

			this.feedbackCooldowns.set(playerId, GameRules.GetGameTime());
			Timers.CreateTimer(Constants.WEBAPI_FEEDBACK_COOLDOWN, () => {
				CustomGameEventManager.Send_ServerToPlayer(player, "webapi:update_feedback_cooldown", { cooldown: 0 });
			});
			const steamId = tostring(PlayerResource.GetSteamID(playerId));
			Managers.WebAPIManager.Send(
				"match/feedback",
				{
					steam_id: steamId,
					content: event.text,
					supporter_level: Managers.WebAPIManager.GetSupporterLevel(playerId),
				},
				() => print("Successfully sent feedback"),
				(error) => print(`Error while sending feedback: ${error}`)
			);
		}
	}

	/**
	 * Checks the feedback cooldown of the player.
	 * @param playerId Player to check cooldown.
	 */
	static CheckCooldown(playerId: PlayerID) {
		if (!PlayerResource.IsValidPlayerID(playerId)) return;
		const player = PlayerResource.GetPlayer(playerId);
		if (!player) return;

		if (Util.WebAPIDebug()) {
			print(`CheckCooldown initiated by PlayerID ${playerId}.`);
		}

		let isCooldown = true;

		const remainingCooldown = this.feedbackCooldowns.get(playerId);
		if (!remainingCooldown || GameRules.GetGameTime() - remainingCooldown > Constants.WEBAPI_FEEDBACK_COOLDOWN) {
			isCooldown = false;
		}

		if (Util.WebAPIDebug()) {
			print(
				`PlayerID ${playerId} is ${isCooldown ? "on cooldown" : "not on cooldown"}. Sending state to player.`
			);
		}

		CustomGameEventManager.Send_ServerToPlayer(player, "webapi:update_feedback_cooldown", {
			cooldown: isCooldown ? 1 : 0,
		});
	}
}
