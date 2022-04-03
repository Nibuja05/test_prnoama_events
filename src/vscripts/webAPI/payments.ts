import { Constants } from "../core/constants";
import { Util } from "../lib/util";
import { MatchEvents } from "./match_events";

export class Payments {
	static openPaymentWindows: Set<PlayerID> = new Set();

	/**
	 * Initializes the Payment class, which listens to payment related events.
	 */
	static Init() {
		Util.RegisterClientEventListener("webapi:payment_create", (event, playerId) => {
			this.CreatePayment(playerId, event);
		});

		Util.RegisterClientEventListener("webapi:payment_window", (event, playerId) => {
			this.OnPaymentWindowStatusChange(playerId, event);
		});

		ListenToGameEvent(
			"player_disconnect",
			(event) => {
				this.OnPaymentWindowStatusChange(event.PlayerID, { visible: 0 });
			},
			undefined
		);

		// Set the "paymentUpdate" response kind to handle payment update responses
		MatchEvents.responseHandlers.set("payment_update", this.HandlePaymentUpdateResponse);
	}

	/**
	 * Creates a new payment link, which is returned from the server as a generated URL.
	 * The URL then needs to be passed to panorama and be used as a link for the player to access.
	 * The player then pays from this generated URL for its type of payment.
	 * @param playerId Player ID of the player initiating the payment.
	 * @param event Object that holds all needed information to create a new payment.
	 */
	static CreatePayment(playerId: PlayerID, event: PaymentCreateEvent) {
		if (Util.WebAPIDebug()) {
			print(`Creating payment for PlayerID ${playerId}`);
			print("Event details:");
			DeepPrintTable(event);
		}

		Managers.WebAPIManager.Send(
			"payment/create",
			{
				match_id: Managers.WebAPIManager.matchId,
				steam_id: tostring(PlayerResource.GetSteamID(playerId)),
				method: event.method,
				payment_kind: event.paymentKind,
				is_gift_code: event.isGiftCode === 1 ? true : false,
			},
			(response) => {
				const player = PlayerResource.GetPlayer(playerId);
				if (!player) return;

				CustomGameEventManager.Send_ServerToPlayer(player, "webapi:payment_succeeded", {
					id: event.id,
					url: response.url,
				});
			},
			(error) => {
				const player = PlayerResource.GetPlayer(playerId);
				if (!player) return;

				CustomGameEventManager.Send_ServerToPlayer(player, "webapi:payment_failed", {
					id: event.id,
					error: error.message,
				});
			}
		);
	}

	/**
	 * Event function called whenever the window status changes, or the player disconnects.
	 * Reports the current state of the payment window - open - 1 or closed - 0.
	 * While there is at least one player that has its payment window open, the Match Event becomes very frequent.
	 * When all players have their payment window closed, the delay becomes shorter.
	 * @param playerId Player ID who opened or closed its payment window.
	 * @param event Object that holds whether the payment window is open or closed.
	 */
	static OnPaymentWindowStatusChange(playerId: PlayerID, event: PaymentWindowStatusChangeEvent) {
		if (Util.WebAPIDebug()) {
			print(`On payment window status change, called by player ${playerId}`);
			print("Event details:");
			DeepPrintTable(event);
		}

		if (event.visible === 1) {
			Payments.openPaymentWindows.add(playerId);
			MatchEvents.requestDelay = Constants.WEBAPI_MATCHEVENT_QUICK_REQUESTS_DELAY;

			if (Util.WebAPIDebug()) {
				print(
					`Added player ID ${playerId} to the list of opened payment windows and set request delay to ${Constants.WEBAPI_MATCHEVENT_QUICK_REQUESTS_DELAY}.`
				);
			}
		} else {
			Payments.openPaymentWindows.delete(playerId);
			if (Util.WebAPIDebug()) print(`Deleted playerId ${playerId} from the list of open payment windows.`);

			if (Payments.openPaymentWindows.size === 0) {
				MatchEvents.requestDelay = Constants.WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY;
				if (Util.WebAPIDebug()) {
					print(
						`Payment windows are closed for all players. Set request delay to ${Constants.WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY}`
					);
				}
			}
		}
	}

	/**
	 * Called whenever a match event is called with the "paymentUpdate" kind property.
	 * Handles the response of both the server and the client to the payment, updating relevant information.
	 * @param response Server's response, including various information of a player's details after payment.
	 * @returns
	 */
	private static HandlePaymentUpdateResponse(response: WebAPIPaymentHandleResponse) {
		if (Util.WebAPIDebug()) {
			print("Handling payment update response");
			DeepPrintTable(response);
		}

		const steamId = response.steam_id;
		const playerId = Util.GetPlayerIdBySteamId(steamId);

		if (!playerId || playerId === -1) return;

		const player = PlayerResource.GetPlayer(playerId);
		if (!player) return;

		CustomGameEventManager.Send_ServerToPlayer(player, "webapi:payment_update", response);

		if (response.error) {
			if (Util.WebAPIDebug()) {
				print(`There was an error handling the payment update response, error: ${response.error}`);
			}
			return;
		}

		Managers.WebAPIManager.SetPlayerSupporterState(playerId, response.supporterState);

		// Update player information with the response' details on the server side, such sa its global XP.
		// To be done later when we define what kind of payments we want to do and their contents
	}
}
