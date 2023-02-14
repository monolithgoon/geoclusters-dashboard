`use strict`
import { _ManipulateDOM } from "../avg-controllers/ui-controller.js";

/**
 * This module toggles the display of the app background activity indicator.
 * @module _ShowActivityAlert
 */

export const _ShowActivityAlert = (() => {
	/**
	 * Toggles the class list of the inicator wrapper div.
	 * @param {Element} wrapperDivEl - The div element that wraps the indicator.
	 * @private
	 */
	function toggleIndicatorWrapper(wrapperDivEl) {
		_ManipulateDOM.toggleClassList(wrapperDivEl, "reveal");
	}

	/**
	 * Toggles the class list of the indicator div.
	 * @param {Element} indicatorDivEl - The div element that displays the indicator.
	 * @private
	 */
	function toggleIndicator(indicatorDivEl) {
		_ManipulateDOM.toggleClassList(
			indicatorDivEl,
			"spinner-grow",
			"text-light",
			"spinner-grow-sm"
		);
	}

	return {
		/**
		 * Starts the activity indicator.
		 * @param {Element} wrapperDivEl - The div element that wraps the indicator.
		 * @param {Element} indicatorDivEl - The div element that displays the indicator.
		 */
		activityStart: (
			wrapperDivEl,
			indicatorDivEl,
			activityStartTextEl,
			activityEndTextEl,
			startActivityText
		) => {
			toggleIndicatorWrapper(wrapperDivEl);
			toggleIndicator(indicatorDivEl);
			activityStartTextEl.innerText = startActivityText;
		},

		/**
		 * Stops the activity indicator.
		 * @param {Element} wrapperDivEl - The div element that wraps the indicator.
		 * @param {Element} indicatorDivEl - The div element that displays the indicator.
		 */
		activityEnd: (
			wrapperDivEl,
			indicatorDivEl,
			activityStartTextEl,
			activityEndTextEl,
			executionSecs
		) => {
			toggleIndicator(indicatorDivEl);
			toggleIndicatorWrapper(wrapperDivEl);
			activityStartTextEl.innerText = ``;
			activityEndTextEl.innerText = `${executionSecs}s`;
		},
	};
})();
