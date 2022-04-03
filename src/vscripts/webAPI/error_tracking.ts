// Current issues:
// debug tracebacks do not include the error when an error occurs outside of TryCollectError()

import { Constants } from "../core/constants";
import { Util } from "../lib/util";

export class ErrorTracking {
	static collectedErrors: {
		[key: string]: number;
	} = {};

	static Init() {
		const oldTraceback = debug.traceback;
		debug.traceback = ((...args: any[]) => {
			const stack = oldTraceback(...args);
			this.CollectErrors(stack);

			for (const playerId of Util.GetAllPlayerIDs()) {
				if (PlayerResource.IsValidPlayerID(playerId) && Managers.WebAPIManager.IsDeveloper(playerId)) {
					const player = PlayerResource.GetPlayer(playerId);
					if (player) {
						CustomGameEventManager.Send_ServerToPlayer(player, "webapi:print_error", { message: stack });
					}
				}
			}
			return stack;
		}) as typeof debug.traceback;

		this.StartErrorTimer();
	}

	private static CollectErrors(stack: string) {
		stack = stack.replace(": at 0x%x+", ": at 0x");
		this.collectedErrors[stack] = this.collectedErrors[stack] ?? 0 + 1;
	}

	private static PrintTryError(...args: any) {
		const stack = debug.traceback(...args);
		GameRules.GetGameModeEntity().SetContextThink(
			DoUniqueString("emitError"),
			function () {
				error(stack, 0);
			},
			0
		);

		return stack;
	}

	static TryCollectError(callback: any, ...args: any) {
		return xpcall(
			callback,
			(err) => {
				IsInToolsMode() ? ErrorTracking.PrintTryError(err) : debug.traceback(err);
			},
			...args
		);
	}

	static StartErrorTimer() {
		Timers.CreateTimer({
			useGameTime: false,
			callback: () => {
				if (Object.keys(this.collectedErrors).length > 0) {
					if (Constants.WEBAPI_ERROR_TRACKING_FORCE_SEND_ERRORS || !IsInToolsMode()) {
						Managers.WebAPIManager.Send("match/script-errors", {
							custom_game: Managers.WebAPIManager.customGame,
							errors: this.collectedErrors,
							match_id: Managers.WebAPIManager.matchId,
						});
					}

					this.collectedErrors = {};
				}

				return 60;
			},
		});
	}
}
