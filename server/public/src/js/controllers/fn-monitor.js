`use strict`
import { _ManipulateDOM } from "../avg-controllers/ui-controller.js";
import { GET_DOM_ELEMENTS } from "../utils/dom-elements.js";


// ACTIVATE THE DIV THAT DISPLAYS APP ACTIVITY
const ShowActivity = (()=>{
   
   try {
      
      function toggleIndicatorWrapper (wrapperDiv) {
         _ManipulateDOM.toggleClassList(wrapperDiv, "reveal");         
      };
      function toggleIndicator (indicatorDiv) {
         _ManipulateDOM.toggleClassList(indicatorDiv, "spinner-grow", "text-light", "spinner-grow-sm");
      };
      return {
         activityStart: (wrapperDiv, indicatorDiv) => {
            toggleIndicatorWrapper(wrapperDiv)
            toggleIndicator(indicatorDiv)
         },
         activityEnd: (wrapperDiv, indicatorDiv) => {
            // indicatorDiv.innerText = `Data Loaded`;
            // setTimeout(() => {
            //    indicatorDiv.innerText = ``
            //    toggleIndicator(indicatorDiv);
            //    toggleIndicatorWrapper(wrapperDiv);
            // }, 3000);
            toggleIndicator(indicatorDiv);
            toggleIndicatorWrapper(wrapperDiv);
         },
      };

   } catch (showActivityErr) {
      console.error(`showActivityErr: ${showActivityErr.message}`)
   };
})();


// CALC. TIME TO EXE. A FN. && DISPLAY INDICATOR
export const _MonitorExecution = (function(dom) {

	let returnedData, executionMs;

	return {

		execute: async function(callback) {
						
			ShowActivity.activityStart(dom.appActivityIndWrapper, dom.appActivityInd);
	
         console.log(`%c This funciton [${callback}] is executing ..`, `background-color: lightgrey; color: blue;`);

			let exeStart = window.performance.now();

			returnedData = await callback();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

			ShowActivity.activityEnd(dom.appActivityIndWrapper, dom.appActivityInd);
		},

		getExecutionTime: function() {
         console.log(`%c The fn. executed in: ${((executionMs)/1000).toFixed(2)} seconds`, `background-color: yellow; color: blue;`);
			return executionMs;
		},

		getData: function() {
			return returnedData;
		},
	};
})(GET_DOM_ELEMENTS());