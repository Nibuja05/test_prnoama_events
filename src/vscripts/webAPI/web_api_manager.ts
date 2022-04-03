import { MatchEvents } from "./match_events";
import { Payments } from "./payments";
import { Feedback } from "./feedback";
import { Supporters } from "./supporters";
import { ErrorTracking } from "./error_tracking";
import { Util } from "../lib/util";
import { Constants } from "../core/constants";

export class WebAPIManager {
	static matchId: number;
	static serverHost: string = "https://api.revolt.dota2unofficial.com";
	static dedicatedServerKey: string;
	static customGame: string = "Typescript Template";

	/**
	 * Initializes the WebAPI Manager.
	 */
	static Init() {
		this.DefaultValues();
		this.InitWebAPIClasses();

		Timers.CreateTimer(() => {
			this.BeforeMatch();
		});
	}

	/**
	 * Initializes default values for the WebAPI Manager.
	 */
	private static DefaultValues() {
		WebAPIManager.matchId = IsInToolsMode()
			? RandomInt(-10000000, -1)
			: tonumber(tostring(GameRules.Script_GetMatchID()))!;
		WebAPIManager.dedicatedServerKey = GetDedicatedServerKeyV2("1");
	}

	/**
	 * Initializes all the WebAPI Manager subclasses that are utilized with the WebAPI Manager.
	 */
	private static InitWebAPIClasses() {
		MatchEvents.Init();
		Payments.Init();
		Feedback.Init();
		ErrorTracking.Init();
	}

	/**
	 * Sends a POST request to the WebAPI server.
	 * Can get a onSuccess function that triggers when the response is successful, and an OnError when the response fails.
	 * Can also optinonally be set to attempt multiple times.
	 * @param path Endpoint of the server. /api/lua is prefixed to the path, forming a complete endpoint for an API request.
	 * @param data The data to sent to the server in the request. The object is dependenant on the path.
	 * @param onSuccess The onSuccess function called when the response returns with a successful status code. The object in the response is dependant on the path.
	 * @param onError The onError function called when the response returns with a failure status code.
	 * @param retryTimes The amount of times to retry the API call when it fails.
	 */
	static Send<TEndpoint extends keyof WebAPIEndpoint>(
		path: TEndpoint,
		data: WebAPIRequestType<TEndpoint>,
		onSuccess?: (data: WebAPIResponseType<TEndpoint>) => void,
		onError?: (error: WebAPIError) => void,
		retryTimes?: number
	) {
		if (!data)
			error(
				`Upon sending data to ${path}, data is empty, which should never be the case. Check the provided information.`
			);

		const request = CreateHTTPRequestScriptVM("POST", `${this.serverHost}/api/lua/${path}`);
		if (Util.WebAPIDebug()) {
			print(`Sending request to ${path}`);
			DeepPrintTable(data as object);
		}

		request.SetHTTPRequestHeaderValue("Dedicated-Server-Key", this.dedicatedServerKey);
		request.SetHTTPRequestRawPostBody("application/json", json.encode(data));

		request.Send((response: CScriptHTTPResponse) => {
			if (response.StatusCode >= 200 && response.StatusCode < 300) {
				const [data] = json.decode(response.Body);
				if (Util.WebAPIDebug()) {
					print(`Response from ${path}:`);
					DeepPrintTable(data);
				}

				if (onSuccess) onSuccess(data as WebAPIResponseType<TEndpoint>);
			} else {
				let [error] = json.decode(response.Body) as unknown as [WebAPIError | undefined];

				if (Util.WebAPIDebug()) {
					print(`Status code error from ${path}: ${response.StatusCode}`);
					if (response.Body) {
						try {
							const [result] = json.decode(response.Body);
							DeepPrintTable(result as any);
						} catch {
							print("failed to deserialize body: ", response.Body);
						}
					}
				}

				if (!error) {
					print("No Error part in response!");
					return;
				}

				let message =
					response.StatusCode === 0
						? "Could not establish connection to the server. Please try again later."
						: error.title ?? "Unknown error";
				if (error.traceId) {
					message += ` Report it to the developer with this id: ${error.traceId}.`;
				}

				error.message = message;

				// Check if the function should retry sending itself. Otherwise, fire an error.
				if (retryTimes && retryTimes >= 0) {
					this.Send(path, data, onSuccess, onError, --retryTimes);
				} else if (onError) {
					onError(error);
				}
			}
		});
	}

	/**
	 * Collects information before the match begins and sends it to the server.
	 */
	private static BeforeMatch() {
		if (Util.WebAPIDebug()) print(`Firing BeforeMatch event to the server`);

		const players: string[] = [];
		for (let playerId = 0; playerId < Constants.MAX_PLAYERS - 1; playerId++) {
			if (PlayerResource.IsValidPlayerID(playerId) && !PlayerResource.IsFakeClient(playerId)) {
				const steamId = tostring(PlayerResource.GetSteamID(playerId));
				players[playerId] = steamId;
			}
		}

		this.Send(
			"match/before",
			{
				custom_game: this.customGame,
				map_name: GetMapName(),
				players: players,
			},
			(data) => {
				if (Util.WebAPIDebug()) print("BEFORE MATCH");

				// set first time player to false
				if (Constants.WEBAPI_PRINT_DEBUGS) {
					print("Confirm Settings and set first time player:");
				}
			},
			(error) => {
				print(error.message);
			},
			2
		);
	}

	/**
	 * Collects the after match results and sends them to the server.
	 */
	static AfterMatch() {
		if (!IsInToolsMode()) {
			if (GameRules.IsCheatMode()) return;
			if (GameRules.GetGameTime() < 60) return;
		}

		if (Util.WebAPIDebug()) print("Firing AfterMatch event call to the server.");

		const players: WebAPIAfterMatchRequestPlayer[] = [];
		const participatingPlayers = Util.GetAllPlayers();

		for (const participatingPlayer of participatingPlayers) {
			if (PlayerResource.IsFakeClient(participatingPlayer.GetPlayerID())) continue;
			const playerId = participatingPlayer.GetPlayerID();
			const hero = participatingPlayer.GetAssignedHero();

			const player: WebAPIAfterMatchRequestPlayer = {
				steam_id: tostring(PlayerResource.GetSteamID(playerId)),
				hero_id: hero.GetHeroID(),
				networth: PlayerResource.GetNetWorth(playerId),
			};

			players.push(player);
		}

		this.Send("match/after_match_team", {
			custom_game: this.customGame,
			map_name: GetMapName(),
			match_id: this.matchId,
			time: GameRules.GetGameTime(),
			players: players,
		});
	}

	static SetPlayerSupporterState(playerId: PlayerID, supporterState: SupporterState) {
		Supporters.SetSupporterState(playerId, supporterState);
	}

	static GetSupporterLevel(playerId: PlayerID) {
		return Supporters.GetSupporterLevel(playerId);
	}

	static IsDeveloper(playerId: PlayerID) {
		return Supporters.IsDeveloper(playerId);
	}

	static TryError(callback: any, ...args: any[]) {
		ErrorTracking.TryCollectError(callback, ...args);
	}
}
