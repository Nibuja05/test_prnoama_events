export abstract class Constants {
	// General
	static VERSION = 0.1; // Version of the game. Please adjust with each major release
	static SUB_VERSION = 0; // Sub-Version of the game. Please adjust with each minor release
	static IS_PRERELEASE_VERSION = true; // Is this still in prerelease phase?

	// Gamemode
	static MAX_PLAYERS = 8;

	// Event delay constants
	private static _ENABLE_ARTIFICIAL_DELAY = false;
	static ARTIFICIAL_DELAY_VALUE = 300; // measured in milliseconds

	// WebAPI
	static WEBAPI_PRINT_DEBUGS = false; // Should WebAPI print debug messages? Only triggers in testing mode if printing outside tools is disabled.
	static WEBAPI_DEBUG_TOOLS_ONLY = true; // Should WebAPI print debug messages only in tools mode? In production, should be set to true.
	static WEBAPI_FEEDBACK_COOLDOWN = 30; // How long, in seconds, should feedbacks be locked for the player after submitting a feedback?
	static WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY = IsInToolsMode() ? 20 : 120; // How often should MatchEvents probe the server for new matchevents?
	static WEBAPI_MATCHEVENT_QUICK_REQUESTS_DELAY = 5; // When in Quick Matchevents mode, how often should MatchEvents probe the server for new matchevents?
	static WEBAPI_ERROR_TRACKING_FORCE_SEND_ERRORS = false; // When set to true, send errors to the server even if in tools mode.

	// Debug default values
	@productionDefault(false)
	static get ENABLE_ARTIFICIAL_DELAY() {
		return this._ENABLE_ARTIFICIAL_DELAY;
	}
}

// return the given default, if this is not the tools mode
function productionDefault(defaultVal: any) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const curVal = target[propertyKey];
		descriptor.get = () => {
			return IsInToolsMode() ? curVal : defaultVal;
		};
	};
}
