import { Constants } from "../core/constants";
import { Util } from "../lib/util";

export class MatchEvents {
	static requestDelay: number;
	static requestTimer: Timer;
	static responseHandlers: Map<string, Function> = new Map();

	/**
	 * Initializes the match event request, which begins the cycle of periodical match event requests from the server.
	 */
	static Init() {
		this.requestDelay = Constants.WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY;

		this.ScheduleNextRequest();
	}

	/**
	 * Schedules the next request to the server based on the delay.
	 */
	static ScheduleNextRequest() {
		this.requestTimer = Timers.CreateTimer({
			useGameTime: false,
			endTime: this.requestDelay,
			callback: () => this.SendRequest(),
		});
	}

	/**
	 * Sends a match event request to the server.
	 * The server will usually respond with an empty object;
	 * However, when it does respond with an array of events, each event will have its response handler based on the response's kind.
	 */
	static SendRequest() {
		this.requestTimer = undefined;
		Managers.WebAPIManager.Send(
			"match/events",
			{
				custom_game: Managers.WebAPIManager.customGame,
				match_id: Managers.WebAPIManager.matchId,
			},
			(responses) => {
				this.ScheduleNextRequest();

				for (const response of responses) {
					this.HandleResponse(response);
				}
			},
			() => this.ScheduleNextRequest()
		);
	}

	/**
	 * Handles each response by calling the appropriate function for the response based on its kind.
	 * @param response
	 */
	static HandleResponse(response: WebAPIMatchEventResponse) {
		if (Util.WebAPIDebug()) {
			print("Match Event's Handle Response");
			DeepPrintTable(response);
		}

		const handler = this.responseHandlers.get(response.kind);
		if (!handler) {
			error(`No handler for ${response.kind} response kind.`);
		}

		if (Util.WebAPIDebug()) {
			print(`Handling the response by using the ${response.kind} function.`);
		}

		handler(response);
	}
}
