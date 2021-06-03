`use strict`

// CALC. TIME TO EXE. A FN.
export const _ExecutionMeasureFn = (function() {

	let returnedData, executionMs;

	return {

		execute: async function(callback) {
							
         console.log(`%c This funciton [${callback}] is executing ..`, `background-color: lightgrey; color: blue;`);

			let exeStart = window.performance.now();

			returnedData = await callback();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

		},

		getExecutionTime: function() {
         console.log(`%c The fn. executed in: ${((executionMs)/1000).toFixed(2)} seconds`, `background-color: yellow; color: blue;`);
			return executionMs;
		},

		getData: function() {
			return returnedData;
		},
	};
})();


// get element states
export function _getCheckedRadio(radioGroup) {

   const checkedRadiosArray = [];
   let radioElement = null;
   let radioValue = null;

   try {

		if (radioGroup) {

			radioGroup.forEach(radio => {
				if (radio.checked) { checkedRadiosArray.push(radio) };
			});

			if (checkedRadiosArray.length > 1) { throw new Error(`Cannot have more than one checked radio per group`)}
			if (checkedRadiosArray.length === 0) { throw new Error(`At least one radio must be checked by default`)}
			if (checkedRadiosArray.length > 0) {
				radioElement = checkedRadiosArray[0];
				radioValue = checkedRadiosArray[0].value;
			};
			
			return {
				radioElement,
				radioValue,
			};
		};

   } catch (getCheckedRadioErr) {
      console.error(`getCheckedRadioErr: ${getCheckedRadioErr.message}`)
   };
};


// HACK
export function _isValidFeatOrColl(featOrFeatColl) {
	if (turf.area(featOrFeatColl)) return true;
	return false
};


// HACK > REMOVES THE "TAILS"  FROM THE CHUNKS
export function _getBufferedPolygon(polygon, bufferAmt, {bufferUnits="kilometers"}) {
	let bufferedPolygon;

	if (bufferAmt) {
		bufferedPolygon = turf.buffer(polygon, bufferAmt, { unit: bufferUnits });

		// SOMETIMES turf.buffer RETURNS "undefined" > DEAL WITH IT
		bufferedPolygon = bufferedPolygon ? bufferedPolygon : polygon;
	} else {
		bufferedPolygon = polygon;
	}

	return bufferedPolygon;
};


export function _calcPolyArea(polygon, { units = `hectares` }) {
	let polyArea;
	if (polygon) {
		polyArea = turf.area(polygon);
		switch (true) {
			case units === `hectares` || units === `ha.` || units === `ha`:
				polyArea = polyArea / 10000;
				break;
			case units === `acres` || units === `ac.` || units === `ac`:
				polyArea = polyArea / 4046.86;
				break;
			case units === `sqkm` || units === `square kilometers`:
				polyArea = polyArea / 1000000;
				break;
			case units === `sqm` || units === `square meters`:
				polyArea = polyArea;
				break;
			default:
				break;
		}
		return polyArea;
	};
};