// import { displayMap } from "./mapbox";
import { login, logout } from "./controllers/login.js";
// import { updateSettings } from "./updateSettings";


// DOM ELEMENTS
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");


// VALUES
if (mapBox) {
	const locations = JSON.parse(
		document.getElementById("map").dataset.locations
	);
	displayMap(locations);
};


// DELEGATION
if (loginForm) {

	loginForm.addEventListener("submit", (e) => {

		e.preventDefault();

		const email = document.getElementById("login_email").value;
		const password = document.getElementById("login_password").value;

		login(email, password);
	});
};


if (logoutBtn) logoutBtn.addEventListener("click", logout);


if (userDataForm) {
	userDataForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const email = document.getElementById("email").value;
		const name = document.getElementById("name").value;
		updateSettings({ name, email }, "data");
	});
};


if (userPasswordForm) {
	userPasswordForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		document.querySelector(".btn--save-password").innerHTML = "Updating...";
		document.querySelector(".btn--save-password").disabled = true;
		const passwordCurrent = document.getElementById("password-current").value;
		const password = document.getElementById("password").value;
		const passwordConfirm = document.getElementById("password-confirm").value;
		await updateSettings(
			{ passwordCurrent, password, passwordConfirm },
			"password"
		);

		document.querySelector(".btn--save-password").innerHTML = "Save Password";
		document.querySelector(".btn--save-password").disabled = false;

		document.getElementById("password-current").value = "";
		document.getElementById("password").value = "";
		document.getElementById("password-confirm").value = "";
	});
};