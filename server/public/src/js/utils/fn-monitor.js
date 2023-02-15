`use strict`;
import DEFAULT_APP_SETTINGS from "../constants/default-app-settings.js";
import { _ShowActivityAlert } from "./activity-alert.js";
import { GET_DOM_ELEMENTS } from "./get-dom-elements.js";

/**
 * @function _MONITOR_EXECUTION
 * @module
 * @description This module returns two methods: `executeNotify` and `execute` to measure the execution time of a callback function.
 * The execute method is similar to executeNotify but does not display an activity indicator.
 * The execution time and the returned data from the callback are logged.
 * @param {function} [logger=console.log] - A logger function that logs the execution time in milliseconds.
 * @returns {object} - An object with the `executeNotify` method.
 */
export const _MONITOR_EXECUTION = ({
	// Default logger is console.log but can be overridden by setting the `logger` parameter to another function.
	logger = DEFAULT_APP_SETTINGS.USE_DEFAULT_LOGGER ? console.log : undefined,
} = {}) => {

	/**
	 * @function executeNotify
	 * @description This method measures the execution time of a provided callback function and logs the result using a provided logger function.
	 * It also accepts several optional parameters for displaying an activity indicator while the function is executing.
	 * @param {function} callback - The callback function to be executed and measured.
	 * @returns {object} - An object with two properties: `executionMs` which is the execution time in milliseconds,
	 * and `returnedData` which is the data returned from the callback.
	 */
	const executeNotify = async (
		callbackFn,
		{
			startDisplayFn = () => {}, // Function to be called when execution starts
			endDisplayFn = () => {}, // Function to be called when execution ends
			appActivityIndWrapper = null, // Wrapper element for activity indicator
			appActivityIndEl = null, // Activity indicator element
			appActivityStartIndTextEl = null, // Element to display start text of activity indicator
			appActivityEndIndTextEl = null, // Element to display end text of activity indicator
			appActivityIndText = ``, // Text to be displayed in the activity indicator
		} = {}
	) => {
		// Throw an error if any of the required arguments is missing
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
			].every(Boolean)
		) {
			throw new Error(
				"One or more required arguments for the 'executeNotify' function are missing."
			);
		}

		// Call the start display function with the given parameters
		startDisplayFn(
			appActivityIndWrapper,
			appActivityIndEl,
			appActivityStartIndTextEl,
			appActivityEndIndTextEl,
			appActivityIndText
		);

		// Log the start of execution if a logger function is provided
		logger &&
			logger(
				`%c This function [ ${callbackFn.name} ] is executing ..`,
				`background-color: lightgrey; color: blue;`
			);

		// Measure the execution time and executeNotify the callback function
		const [returnedData, executionMs] = await Promise.all([
			callbackFn(),
			new Promise((resolve) => {
				const exeStart = Date.now();
				setTimeout(() => resolve(Date.now() - exeStart), 0);
			}),
		]);

		// Calculate the execution time in seconds with two decimal points
		const executionSecs = (executionMs / 1000).toFixed(2);

		// Log the execution time if a logger function is provided
		logger &&
			logger(
				`%c The fn. [ ${callbackFn.name} ] executed in: ${executionSecs} seconds`,
				`background-color: yellow; color: blue;`
			);

		// Call the end display function with the given parameters and the execution time
		endDisplayFn(
			appActivityIndWrapper,
			appActivityIndEl,
			appActivityStartIndTextEl,
			appActivityEndIndTextEl,
			executionSecs
		);

		// Return the execution time and the returned data from the callbackFn
		return { executionMs, returnedData };
	};

	const execute = async (callbackFn) => {

		// Log the start of execution if a logger function is provided
		logger &&
			logger(
				`%c This function [ ${callbackFn.name} ] is executing ..`,
				`background-color: lightgrey; color: blue;`
			);

		// Measure the execution time and execute the callback function
		const [returnedData, executionMs] = await Promise.all([
			callbackFn(),
			new Promise((resolve) => {
				const exeStart = Date.now();
				setTimeout(() => resolve(Date.now() - exeStart), 0);
			}),
		]);

		// Calculate the execution time in seconds with two decimal points
		const executionSecs = (executionMs / 1000).toFixed(2);

		// Log the execution time if a logger function is provided
		logger &&
			logger(
				`%c The fn. [ ${callbackFn.name} ] executed in: ${executionSecs} seconds`,
				`background-color: yellow; color: blue;`
			);

		// Return the execution time and the returned data from the callbackFn
		return { executionMs, returnedData };
	};
	return { executeNotify, execute };
};
