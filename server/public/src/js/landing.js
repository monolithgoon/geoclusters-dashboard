`use strict`
// import { displayMap } from "./mapbox";
import { login, logout } from "./controllers/authentication.js";
// import { updateSettings } from "./updateSettings";


// DOM ELEMENTS
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
// const logoutBtn = document.querySelector(".nav__el--logout");
// const userDataForm = document.querySelector(".form-user-data");
// const userPasswordForm = document.querySelector(".form-user-password");


// VALUES
if (mapBox) {
	const locations = JSON.parse(
		document.getElementById("map").dataset.locations
	);
	console.log({locations})
	displayMap(locations);
};


/* USER AUTH. EVENT(S) DELEGATION */

// 1. USER LOGIN => EMAIL + PASSWORD SUBMIT
if (loginForm) {

	loginForm.addEventListener("submit", async (e) => {

		e.preventDefault();

		const email = document.getElementById("login_email_input").value;
		const password = document.getElementById("login_password_input").value;
		const loginSubmitBtn = document.getElementById(`login_submit_btn`);
		const loginSubmitBtnTxt = document.getElementById(`login_submit_btn_txt`);		
		const appActivityInd = document.querySelector(`.app-activity-indicator`);
		
		loginSubmitBtn.disabled = true;

		if (!(await login(email, password))) {
			loginSubmitBtn.style.backgroundColor = `#0d6efd`;
			loginSubmitBtn.style.color = `#fff`;
			loginSubmitBtn.style.border = `1px solid #0d6efd`;
			loginSubmitBtnTxt.innerText = `Submit`;
			appActivityInd.classList.remove(`spinner-border`, `text-dark`, `spinner-border-sm`);
		} else {
			loginSubmitBtn.disabled = true;
			loginSubmitBtn.style.backgroundColor = `lightgrey`;
			loginSubmitBtn.style.color = `#333`;
			loginSubmitBtn.style.border = `1px solid lightgrey`;
			loginSubmitBtnTxt.innerText = `Please Wait`;
			appActivityInd.classList.remove(`spinner-border`, `text-dark`, `spinner-border-sm`);
		};
	});
};


// 2. USER LOGOUT
// if (logoutBtn) logoutBtn.addEventListener("click", logout);


// 3. USER NAME + EMAIL REGISTRATION
// TODO
// if (userDataForm) {
	// userDataForm.addEventListener("submit", (e) => {
	// 	e.preventDefault();
	// 	const email = document.getElementById("email").value;
	// 	const name = document.getElementById("name").value;
	// 	updateSettings({ name, email }, "data");
	// });
// };


// 4. USER PASSWORD REGISTRATION
// TODO
// if (userPasswordForm) {
// 	userPasswordForm.addEventListener("submit", async (e) => {
// 		e.preventDefault();
// 		document.querySelector(".btn--save-password").innerHTML = "Updating...";
// 		document.querySelector(".btn--save-password").disabled = true;
// 		const passwordCurrent = document.getElementById("password-current").value;
// 		const password = document.getElementById("password").value;
// 		const passwordConfirm = document.getElementById("password-confirm").value;
// 		await updateSettings(
// 			{ passwordCurrent, password, passwordConfirm },
// 			"password"
// 		);

// 		document.querySelector(".btn--save-password").innerHTML = "Save Password";
// 		document.querySelector(".btn--save-password").disabled = false;

// 		document.getElementById("password-current").value = "";
// 		document.getElementById("password").value = "";
// 		document.getElementById("password-confirm").value = "";
// 	});
// };