`use strict`;
import DEFAULT_APP_SETTINGS from "../constants/default-app-settings.js";
import { _ShowActivityAlert } from "./activity-alert.js";
import { GET_DOM_ELEMENTS } from "./get-dom-elements.js";

// CALC. TIME TO EXE. A FN. && DISPLAY INDICATOR
export const _MonitorExecution = (function (dom) {
	let returnedData = null,
		executionMs;

	return {
		execute: async function (callbackFn) {
			_ShowActivityAlertactivityStart(dom.appActivityIndWrapper, dom.appActivityIndEl);

			console.log(
				`%c This funciton [${callbackFn}] is executing ..`,
				`background-color: lightgrey; color: blue;`
			);

			let exeStart = window.performance.now();

			returnedData = await callbackFn();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

			_ShowActivityAlert.activityEnd(dom.appActivityIndWrapper, dom.appActivityIndEl);
		},

		getExecutionTime: function () {
			console.log(
				`%c The fn. executed in: ${(executionMs / 1000).toFixed(2)} seconds`,
				`background-color: yellow; color: blue;`
			);
			return executionMs;
		},

		measureExecution: async function (callbackFn) {
			_MonitorExecution.execute(callbackFn);
			_MonitorExecution.getExecutionTime();
		},

		getData: function () {
			return returnedData;
		},
	};
})(GET_DOM_ELEMENTS());

/**
 * @function _MONITOR_EXECUTION
 * @description This module returns an object that provides the `execute` method to measure the execution time of a callback function. The execution time and the returned data from the callback are logged.
 * @param {function} [logger=console.log] - A logger function that logs the execution time in milliseconds.
 * @returns {object} - An object with the `execute` method.
 */
export const _MONITOR_EXECUTION = ({ logger } = {}) => ({
	/**
	 * @function execute
	 * @description Measures the execution time of a callback function and logs the result using the provided logger.
	 * @param {function} callback - The callback function to be executed and measured.
	 * @returns {object} - An object with two properties: `executionMs` which is the execution time in milliseconds,
	 * and `returnedData` which is the data returned from the callback.
	 */
	execute: async (
		callbackFn,
		{
			startDisplayFn = () => {},
			endDisplayFn = () => {},
			appActivityIndWrapper = null,
			appActivityIndEl = null,
			appActivityStartIndTextEl = null,
			appActivityEndIndTextEl = null,
			appActivityIndText = ``,
		} = {}
	) => {
		try {
			// if logger is not set when fn. is called, use `console.log` if settings allow
			if (!logger) {
				logger = DEFAULT_APP_SETTINGS.USE_DEFAULT_LOGGER === true ? console.log : undefined;
			}

			// Check for complete args. MTD. 1
			/**
			 * If the 4 display activity related fns. are not all present together, throw error
			 */
			// if (!startDisplayFn || !endDisplayFn || !appActivityIndWrapper || !appActivityIndEl || !appActivityStartIndTextEl || !appActivityEndIndTextEl || !appActivityIndText) {
			// 	throw new Error(`One or more required arguments for the 'execute' fn. are missing.`);
			// }

			// Check for complete args. MTD. 2
			/**
			 * This code checks if the variables startDisplayFn, endDisplayFn, appActivityIndWrapper, and appActivityIndEl are defined and truthy.
			 * If any of these variables are undefined or falsy, it throws an Error.
			 *
			 * [1 , 1 , 1].every(num => Boolean(num)) // true
			 * [0 , 1 , 1].every(num => Boolean(num)) // false
			 * ![0 , 1 , 1].every(num => Boolean(num)) // true
			 *
			 */
			if (
				![
					startDisplayFn,
					endDisplayFn,
					appActivityIndWrapper,
					appActivityIndEl,
					appActivityStartIndTextEl,
					appActivityEndIndTextEl,
					appActivityIndText,
				].every((fnArg) => Boolean(fnArg))
			) {
				throw new Error(
					"One or more required arguments for the 'execute' function are missing."
				);
			}

			// Start the app background activity display
			startDisplayFn(
				appActivityIndWrapper,
				appActivityIndEl,
				appActivityStartIndTextEl,
				appActivityEndIndTextEl,
				appActivityIndText
			);

			logger &&
				logger(
					`%c This funciton [ ${callbackFn.name} ] is executing ..`,
					`background-color: lightgrey; color: blue;`
				);

			// Get the current time in milliseconds
			const exeStart = Date.now();

			// Execute the callback fn. and store the returned data
			const returnedData = await callbackFn();

			// Get the time again in milliseconds
			const exeEnd = Date.now();

			// Calculate the execution time by subtracting the start time from the end time
			const executionMs = exeEnd - exeStart;

			// Get the formatted execution time in (s)
			const executionSecs = (executionMs / 1000).toFixed(2);

			// Log the execution time using the provided logger
			logger &&
				logger(
					`%c The fn. [ ${callbackFn.name} ] executed in: ${executionSecs} seconds`,
					`background-color: yellow; color: blue;`
				);

			// End the app background activity display
			endDisplayFn(
				appActivityIndWrapper,
				appActivityIndEl,
				appActivityStartIndTextEl,
				appActivityEndIndTextEl,
				executionSecs
			);

			// Return the execution time and the returned data from the callbackFn
			return { executionMs, returnedData };
		} catch (executeFnErr) {
			console.error(executeFnErr.message);
		}
	},
	simpleExecute: async (callbackFn) => {
		logger &&
			logger(
				`%c This funciton [ ${callbackFn.name} ] is executing ..`,
				`background-color: lightgrey; color: blue;`
			);

		// Get the current time in milliseconds
		const exeStart = Date.now();

		// Execute the callback fn. and store the returned data
		const returnedData = await callbackFn();

		// Get the time again in milliseconds
		const exeEnd = Date.now();

		// Calculate the execution time by subtracting the start time from the end time
		const executionMs = exeEnd - exeStart;

		// Get the formatted execution time in (s)
		const executionSecs = (executionMs / 1000).toFixed(2);

		// Log the execution time using the provided logger
		logger &&
			logger(
				`%c The fn. [ ${callbackFn.name} ] executed in: ${executionSecs} seconds`,
				`background-color: yellow; color: blue;`
			);
         
		// Return the execution time and the returned data from the callbackFn
		return { executionMs, returnedData };
	},
});
