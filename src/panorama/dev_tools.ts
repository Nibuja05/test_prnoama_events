// ======================================================================
// name: dev_tools.ts
// description: Manages functions of the dev tools UI and can
//				send dev function events to the server
// ======================================================================

declare const enum SliderTypes {
	SLIDER = "slider",
	VALUE = "value",
}

// Only display the dev tools, when either cheats are enabled or this is toolmode
let root = $("#DevPanelRoot");
root.style.visibility = "collapse";
SetCheatModeActivation(() => {
	root.style.visibility = "visible";
});

/**
 * Toggle open/close the dev tools
 */
function OnDevClose() {
	let root = $("#DevPanelRoot");
	let label = $("#DevPanelCloseLabel") as LabelPanel;
	if (root.BHasClass("active")) {
		root.RemoveClass("active");
		label.text = $.Localize("dev_title");
	} else {
		root.AddClass("active");
		label.text = $.Localize("dev_close");
	}
}

/**
 * Increment the value of a `NumberEntry`. Usually linked to arrow keys.
 * @param name id of the `NumberEntry`
 * @param step optional. step size per increment [Default: 1]
 */
function IncrementValue(name: string, step: number = 1) {
	let elem = $("#" + name) as NumberEntry;
	elem.value = elem.value + step;
}

/**
 * Decrement the value of a `NumberEntry`. Usually linked to arrow keys.
 * @param name id of the `NumberEntry`
 * @param step optional. step size per decrement [Default: 1]
 */
function DecrementValue(name: string, step: number = 1) {
	let elem = $("#" + name) as NumberEntry;
	elem.value = elem.value - step;
}

//
// Dev Functions
//

/**
 * Example dev panel action.
 */
function Dev_Activity() {
	print("Start Dev Activity!");
}

/**
 * Adds gold to the player.
 */
function Dev_AddGold() {
	let elem = $("#Dev_GoldCount") as NumberEntry;
	let amount = elem.value;
	GameEvents.SendCustomGameEventToServer("dev_add_gold", { amount: amount });
}

const delayMax = 300;
const delayStep = delayMax / 10;

/**
 * Function to be called whenever a slider moved or the number got adjusted manually.
 * Directly updates the server with adjusted values.
 * @param baseName base name of the slider group
 * @param type if the value or the slider was changed
 */
function CheckSliderValue(baseName: string, type: SliderTypes) {
	let slider = $(`#${baseName}Slider`) as unknown as SliderPanel;
	let valueText = $(`#${baseName}Value`) as TextEntry;
	if (type === SliderTypes.SLIDER) {
		let curValue = Math.floor(slider.value * delayMax);

		if (baseName === "Dev_Delay") Dev_UpdateConnectionDelay(curValue);

		if (curValue.toString() === valueText.text) return;
		valueText.text = curValue.toString();
	} else {
		const text = valueText.text;
		if (text === "") return;
		let curValue = parseInt(valueText.text, 10);
		if (curValue === slider.value * delayMax) return;
		slider.value = curValue / delayMax;
	}
}

/**
 * Set the artificial connection delay
 * @param delay delay
 */
function Dev_UpdateConnectionDelay(delay: number) {
	GameEvents.SendCustomGameEventToServer("dev_set_delay", { delay: delay });
}
