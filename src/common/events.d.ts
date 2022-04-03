/**
 * This file contains types for the events you want to send between the UI (Panorama)
 * and the server (VScripts).
 *
 * IMPORTANT:
 *
 * The dota engine will change the type of event data slightly when it is sent, so on the
 * Panorama side your event handlers will have to handle NetworkedData<EventType>, changes are:
 *   - Booleans are turned to 0 | 1
 *   - Arrays are automatically translated to objects when sending them as event. You have
 *     to change them back into arrays yourself! See 'toArray()' in src/panorama/hud.ts
 */

// To declare an event for use, add it to this table with the type of its data
interface CustomGameEventDeclarations {
	dev_add_gold: DevAddGoldEvent;
	dev_set_delay: DevSetDelayEvent;
	"webapi:payment_create": PaymentCreateEvent;
	"webapi:payment_succeeded": PaymentSucceededEvent;
	"webapi:payment_failed": PaymentFailedEvent;
	"webapi:payment_window": PaymentWindowStatusChangeEvent;
	"webapi:payment_update": {};
	"webapi:send_feedback": SendFeedbackEvent;
	"webapi:check_feedback_cooldown": {};
	"webapi:update_feedback_cooldown": UpdateFeedbackCooldown;
	"webapi:print_error": PrintErrorEvent;
}

interface DevAddGoldEvent {
	amount: number;
}

interface DevSetDelayEvent {
	delay: number;
}

interface PaymentCreateEvent {
	id: string;
	method: PaymentCreateMethods;
	paymentKind: PaymentCreateKinds;
	isGiftCode?: 0 | 1;
}

type PaymentCreateMethods = "checkout" | "wechat" | "alipay";
type PaymentCreateKinds = "base_booster";

interface PaymentSucceededEvent {
	id: string;
	url: string;
}

interface PaymentFailedEvent {
	id: string;
	error: string;
}

interface PaymentWindowStatusChangeEvent {
	visible: 0 | 1;
}

interface PrintErrorEvent {
	message: string;
}

interface SendFeedbackEvent {
	text: string;
}

interface UpdateFeedbackCooldown {
	cooldown: 0 | 1;
}

// Dev-Panel events
declare const enum DevUIEventType {
	ADD_GOLD = "dev_add_gold",
	SET_DELAY = "dev_set_delay",
}