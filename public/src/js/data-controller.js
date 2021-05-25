export async function getLegacyAGCs() {
	try {
		const apiResponse = await fetch(`https://geoclusters.herokuapp.com/api/v2/legacy-agcs/?fields=properties,features.properties.plot_owner_bvn,`);
		const data = await apiResponse.json();
		return data;
	} 
	catch (error) {
		console.error(error.message);
	};
};