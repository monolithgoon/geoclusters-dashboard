`use strict`;

//- Get the "documentElement" (<html>) in order to display the page in fullscreen
const docElem = document.documentElement;

//- FN. FORCES PAGE INTO FULL SCREEN MODE
export default function _openFullScreen() {
	if (docElem.requestFullscreen) {
		docElem
			.requestFullscreen()
			.then(function () {
				// element has entered fullscreen mode successfully
				console.log("in fs");
			})
			.catch(function (error) {
				// element could not enter fullscreen mode
			});
	} else if (docElem.webkitRequestFullscreen) {
		/* Safari */
		docElem.webkitRequestFullscreen();
	} else if (docElem.msRequestFullscreen) {
		/* IE11 */
		docElem.msRequestFullscreen();
	}

	//- REMOVE THE CLICK LISTENER AFTER 2 SECONDS
	if (!window.screenTop && !window.screenY) {
		console.log("Browser is in fullscreen");
		setTimeout(() => {
			document.removeEventListener("click", _openFullScreen);
		}, 2000);
	}
}
