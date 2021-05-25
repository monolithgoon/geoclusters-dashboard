import { getDOMElements } from "./ui-controller.js";

// RETREIVE DATA FROM BACKEND VIA HTML DATASET ATTRIBUTE IN [ 'agv-dashboard.pug' ]
export function GET_PARCELIZED_AGC_API_DATA() {
	try {
		
		const datastream = getDOMElements().parcelizedDataDiv.dataset.parcelizedgeoclusters;
		console.log(datastream);
		return datastream;

	} catch (getDataStreamErr) {
		console.log(chalk.fail(`getDataStreamErr: ${getDataStreamErr}`))
	}
}

export async function getLegacyAGCs() {
	console.log(`getting data from API`);
	try {
		// const apiResponse = await fetch(`https://geoclusters.herokuapp.com/api/v2/legacy-agcs/?fields=properties,features.properties.plot_owner_bvn,`);
		const apiResponse = await fetch(`http://127.0.0.1:9090/api/v2/legacy-agcs/?fields=properties,features.properties.plot_owner_bvn,`);
		const data = await apiResponse.json();
		console.log(data);
		console.log(`%c ${JSON.stringify(data)}`, `color: green`);
		return data;
	} 
	catch (error) {
		console.error(error.message);
	};
};

export async function APIRequest(resultElement, statusElement) {

	try {
		
		const resultsCountDiv = document.getElementById('results_count');
		const resultsStatus = document.getElementById('results_status');
	
		console.log(`this.id [ ${this.id} ] sending http request to API`);
		resultsCountDiv.innerHTML = ``;
		resultsStatus.classList.add(`spinner-grow`);
		resultsStatus.classList.add(`text-primary`);
		resultsStatus.classList.add(`spinner-grow-sm`);
	
		var xhttp = new XMLHttpRequest();
	
		xhttp.open('GET', 'http://127.0.0.1:9090/api/v2/legacy-agcs/?fields=properties,features.properties.plot_owner_bvn,`)', true);
		xhttp.setRequestHeader('Content-type', 'application/json');
		xhttp.send();
		
		xhttp.onreadystatechange = function () {
	
			const reqLogStyle = `color:white; background-color:green;`
			if (this.readyState === 0) { console.log(`req not initialized`);}
			if (this.readyState === 1) { console.log(`server connection established`);}
			if (this.readyState === 2) { console.log(`request received`);}
			if (this.readyState === 3) { console.log(`processing request`);}
			if (this.readyState === 4) { console.log(`%c request finished and response is ready`, `${reqLogStyle}`);}
			
			if (this.readyState === 4 && this.status === 200) {
				// console.log(this.responseText)
				resultsStatus.classList.remove(`spinner-grow`);
				resultsCountDiv.innerText = `${JSON.parse(this.responseText).num_legacy_agcs} Clusters ... ${JSON.parse(this.responseText).num_plot_owners} Plot Owners`
			};
		};
	
		xhttp.onload = function() {
			const parsedAPIData = JSON.parse(this.responseText);
			console.log(parsedAPIData.requested_at);
			console.log(parsedAPIData.num_legacy_agcs);
			console.log(parsedAPIData.num_plot_owners);
			console.log(parsedAPIData.legacy_agcs);
		};

		return {
			xhttp,
		}

	} catch (APIRequestErr) {
		console.log(chalk.highlight(`APIRequestErr: ${APIRequestErr}`))
	};
};