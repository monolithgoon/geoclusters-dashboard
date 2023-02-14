`use strict`
import { _ManipulateDOM } from "../avg-controllers/ui-controller.js";
import { GET_DOM_ELEMENTS } from "./get-dom-elements.js";


/**
 * This module toggles the display of the app background activity indicator.
 * @module ShowActivity
 */

export const ShowActivity = (() => {
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
      activityStart: (wrapperDivEl, indicatorDivEl, activityStartTextEl, activityEndTextEl, startActivityText) => {
         toggleIndicatorWrapper(wrapperDivEl);
         toggleIndicator(indicatorDivEl);
         activityStartTextEl.innerText = startActivityText;
      },
      
      /**
       * Stops the activity indicator.
       * @param {Element} wrapperDivEl - The div element that wraps the indicator.
       * @param {Element} indicatorDivEl - The div element that displays the indicator.
       */
      activityEnd: (wrapperDivEl, indicatorDivEl, activityStartTextEl, activityEndTextEl, executionSecs ) => {
         toggleIndicator(indicatorDivEl);
         toggleIndicatorWrapper(wrapperDivEl);
         activityStartTextEl.innerText = ``;
         activityEndTextEl.innerText = `${executionSecs}s`
      },
   };
})();



// REMOVE > DEPRECATED
// CALC. TIME TO EXE. A FN. && DISPLAY INDICATOR
export const _MonitorExecution = (function(dom) {

	let returnedData=null, executionMs;

	return {

		execute: async function(callbackFn) {
						
			ShowActivity.activityStart(dom.appActivityIndWrapper, dom.appActivityIndEl);
	
         console.log(`%c This funciton [${callbackFn}] is executing ..`, `background-color: lightgrey; color: blue;`);

			let exeStart = window.performance.now();

			returnedData = await callbackFn();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

			ShowActivity.activityEnd(dom.appActivityIndWrapper, dom.appActivityIndEl);
		},

      getExecutionTime: function() {
         console.log(`%c The fn. executed in: ${((executionMs)/1000).toFixed(2)} seconds`, `background-color: yellow; color: blue;`);
         return executionMs;
      },

      measureExecution: async function(callbackFn) {
         _MonitorExecution.execute(callbackFn);
         _MonitorExecution.getExecutionTime();
      },

		getData: function() {
			return returnedData;
		},
	};
})(GET_DOM_ELEMENTS());