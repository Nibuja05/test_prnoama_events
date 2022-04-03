interface WebAPIEndpoint {
	"match/before": {
		request: WebAPIBeforeMatchRequest;
		response: WebAPIBeforeMatchResponse;
	};
	"match/after_match_team": {
		request: WebAPIAfterMatchRequest;
	};
	"payment/create": {
		request: WebAPIPaymentCreateRequest;
	};
	"match/events": {
		request: WebAPIMatchEventRequest;
		response: WebAPIMatchEventResponse[];
	};
	"match/feedback": {
		request: WebAPIMatchFeedbackRequest;
	};
	"match/script-errors": {
		request: WebAPIMatchScriptErrorsRequest;
	};
}

type WebAPIRequestType<TEndpoint extends keyof WebAPIEndpoint> = WebAPIEndpoint[TEndpoint] extends {
	request: infer TRequest;
}
	? TRequest
	: undefined;

type WebAPIResponseType<TEndpoint extends keyof WebAPIEndpoint> = WebAPIEndpoint[TEndpoint] extends {
	response: infer TResponse;
}
	? TResponse
	: WebAPIResponseBase;

interface WebAPIData {
	custom_game?: string;
}

interface WebAPIResponseBase {
	url: string;
}

interface WebAPISuccess {}

interface WebAPIError {
	message: string;
	traceId: string;
	title: string;
}

interface WebAPIValidationError {
	detail: WebAPIValidationErrorDetail[];
}

interface WebAPIValidationErrorDetail {
	loc: string[];
	msg: string;
	type: string;
}

interface WebAPIBeforeMatchRequest extends WebAPIData {
	map_name: string;
	players: string[];
}

interface WebAPIBeforeMatchResponse {
	players: WebAPIBeforeMatchResponsePlayer[];
	leaderboards: number[][];
	quests_definitions: WebAPIQuestDefinition[];
	achievements_definitions: WebAPIAchievementDefinition[];
	patch_notes: WebAPIPatchNotes;
}

interface WebAPIBeforeMatchResponsePlayer {
	steam_id: string;
	match_count: number;
	supporter_state: WebAPISupporterState;
	achievements: WebAPIAchievement[];
	quests: WebAPIQuest[];
	inventory: WebAPIInventory[];
	equipped_items: WebAPIEquippedItem[];
	gift_codes: WebAPIGiftCode[];
	mail: WebAPIMail[];
	battle_pass_level: number;
	battle_pass_glory: number;
	battle_pass_exp: number;
}

interface WebAPISupporterState {
	level: number;
	end_date: Date;
}

interface WebAPIAchievement {
	steam_id: string;
	achievement_id: number;
	progress: number;
	completed: boolean;
	tier: number;
}

interface WebAPIQuest {
	steam_id: string;
	quest_id: number;
	progress: number;
	completed: boolean;
}

interface WebAPIInventory {
	steam_id: string;
	item_name: string;
	count: number;
}

interface WebAPIEquippedItem {}
interface WebAPIGiftCode {
	id: number;
	steam_id: string;
	code: string;
	payment_kind: string;
	item_name: string;
	item_count: number;
	redeemer_steam_id: string;
}

interface WebAPIMail {
	id: number;
	target_steam_id: string;
	source: string;
	topic: string;
	text_content: string;
	attachments: {};
	created_at: Date;
	is_read: boolean;
}

interface WebAPIQuestDefinition {}
interface WebAPIAchievementDefinition {}
interface WebAPIPatchNotes {}

interface WebAPIAfterMatchRequest extends WebAPIData {
	map_name: string;
	match_id: number;
	time: number;
	players: WebAPIAfterMatchRequestPlayer[];
}

interface WebAPIAfterMatchRequestPlayer {
	steam_id: string;
	networth: number;
	hero_id: number;
}

interface WebAPIEquippedWeapons {
	weapon_id: number;
	level: number;
	enchantments_count: number;
	elements: number[];
	rarity: number;
}

interface WebAPIPaymentCreateRequest extends WebAPIData {
	steam_id: string;
	match_id: number;
	method: string;
	payment_kind: string;
	is_gift_code?: boolean;
}

interface WebAPIMatchEventRequest extends WebAPIData {
	match_id: number;
}

interface WebAPIMatchEventResponse {
	steam_id: string;
	bp_level: number;
	kind: string;
	supporter_state: SupporterState;
	bp_exp: number;
	bp_required_exp: number;
	glory: number;
	error?: string;
}

interface WebAPIPaymentHandleResponse extends WebAPIMatchEventResponse {
	level: number;
	exp: number;
	expRequired: number;
	supporterState: SupporterState;
	glory: number;
}

interface SupporterState {
	level: number;
	endDate: string;
}

interface WebAPIMatchFeedbackRequest {
	steam_id: string;
	content: string;
	supporter_level?: number;
}

interface WebAPIMatchScriptErrorsRequest extends WebAPIData {
	match_id: number;
	errors: {
		[key: string]: number;
	};
}
