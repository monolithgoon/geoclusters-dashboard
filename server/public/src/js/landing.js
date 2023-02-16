`use strict`;
import { login, logout } from "./controllers/login-controller.js";
// import { updateSettings } from "./updateSettings";

/** DOM ELEMENTS */
// const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
// const logoutBtn = document.querySelector(".nav__el--logout");
// const userDataForm = document.querySelector(".form-user-data");
// const userPasswordForm = document.querySelector(".form-user-password");
// const inputs = loginForm.querySelectorAll("input[type='text']");
const inputs = loginForm.querySelectorAll("input[type='password']");
const passwordInput = inputs[inputs.length - 1];
const loginEmailInput = document.getElementById("login_email_input");
const loginPasswordInput = document.getElementById("login_password_input");
const loginNextBtn = document.getElementById("login_next_btn");
const loginBackBtn = document.getElementById("login_back_btn");
const loginSubmitBtn = document.getElementById("login_submit_btn");
const loginSubmitBtnTxt = document.getElementById("login_submit_btn_txt");
const appActivityIndEl = document.querySelector(`.app-activity-indicator`);

// REMOVE
// // VALUES
// if (mapBox) {
// 	const locations = JSON.parse(
// 		document.getElementById("map").dataset.locations
// 	);
// 	console.log({locations})
// 	displayMap(locations);
// };

/** HANDLERS */

// A helper function to show/hide an element
const toggleDisplay = (element, isShown) => {
  document.getElementById(element).style.display = isShown ? 'block' : 'none';
};

// Event listener callback for login `next` button click 
const handleLoginNextBtnClick = (e) => {
  e.preventDefault();
  toggleDisplay("account_question", false);
  toggleDisplay("password_question", true);
  toggleDisplay("email_form_group", false);
  e.target.style.display = "none";
  toggleDisplay("password_form_group", true);
  document.getElementById("login_password_input").focus();
  toggleDisplay("login_back_btn", true);
  toggleDisplay("login_submit_btn", true);
};

// Event listener callback for login `back` button click
const handleLoginBackBtnClick = (e) => {
  e.preventDefault();
  toggleDisplay("account_question", true);
  toggleDisplay("password_question", false);
  toggleDisplay("email_form_group", true);
  e.target.style.display = "none";
  toggleDisplay("password_form_group", false);
  loginNextBtn.disabled = false;
  toggleDisplay("login_submit_btn", false);
};

// Re-style some form elements while awaiting auth.
const awaitAuthentication = () => {

	// Disable password input field
	loginPasswordInput.disabled = true;
	
	// Remove the text inside the login submit button
	loginSubmitBtnTxt.innerText = ``;

	// Remove the background color of the login submit button
	loginSubmitBtn.style.backgroundColor = `transparent`;

	// Remove the border of the login submit button
	loginSubmitBtn.style.border = `none`;

	// Add the classes to show the spinner activity indicator
	appActivityIndEl.classList.add(`spinner-border`, `text-dark`, `spinner-border-sm`);
};

// Handle form submission
const handleFormSubmit = async (evt) => {

	evt.preventDefault();

	const email = document.getElementById("login_email_input").value;
	const password = document.getElementById("login_password_input").value;

	// DISABLE THE SUBMIT BUTTON BY DEFAULT
	loginSubmitBtn.disabled = true;

	if (!(await login(email, password))) {
		// LOGIN FAIL
		loginPasswordInput.disabled = false; // re-enable the password input
		loginPasswordInput.focus();
		loginPasswordInput.value = ``; // vacate the password input
		loginSubmitBtn.style.backgroundColor = `#0d6efd`;
		loginSubmitBtn.style.color = `#fff`;
		loginSubmitBtn.style.border = `1px solid #0d6efd`;
		loginSubmitBtnTxt.innerText = `Submit`;
		appActivityIndEl.classList.remove(`spinner-border`, `text-dark`, `spinner-border-sm`);
	} else {
		// LOGIN SUCCESS
		loginSubmitBtn.disabled = true;
		loginSubmitBtn.style.backgroundColor = `lightgrey`;
		loginSubmitBtn.style.color = `#333`;
		loginSubmitBtn.style.border = `1px solid lightgrey`;
		loginSubmitBtnTxt.innerText = `Please Wait`;
		appActivityIndEl.classList.remove(`spinner-border`, `text-dark`, `spinner-border-sm`);
	}
};

// Handle enter key on last form input
const handlePasswordInputEnter = (evt) => {
	if (evt.keyCode === 13) {
		evt.preventDefault();
		const form = evt.target.form;
		awaitAuthentication();
		handleFormSubmit(evt);
	}
};

/* USER AUTH. EVENT(S) DELEGATION */

// 1. USER LOGIN => EMAIL + PASSWORD SUBMIT
if (loginNextBtn) loginNextBtn.addEventListener('click', handleLoginNextBtnClick);
if (loginBackBtn) loginBackBtn.addEventListener('click', handleLoginBackBtnClick);
if (loginSubmitBtn) loginSubmitBtn.addEventListener("click", awaitAuthentication);
if (loginForm) loginForm.addEventListener("submit", handleFormSubmit);
if (loginPasswordInput) loginPasswordInput.addEventListener("keydown", handlePasswordInputEnter);

// REMOVE
// if (loginForm) {
// 	loginForm.addEventListener("submit", async (e) => {
// 		e.preventDefault();

// 		const email = document.getElementById("login_email_input").value;
// 		const password = document.getElementById("login_password_input").value;
// 		const loginSubmitBtn = document.getElementById(`login_submit_btn`);
// 		const loginSubmitBtnTxt = document.getElementById(`login_submit_btn_txt`);
// 		const appActivityIndEl = document.querySelector(`.app-activity-indicator`);
// 		const loginPasswordInput = document.getElementById("login_password_input");

// 		// DISABLE THE SUBMIT BUTTON BY DEFAULT
// 		loginSubmitBtn.disabled = true;

// 		if (!(await login(email, password))) {
// 			// LOGIN FAIL
// 			loginPasswordInput.value = ``; // vacate the password input
// 			loginSubmitBtn.style.backgroundColor = `#0d6efd`;
// 			loginSubmitBtn.style.color = `#fff`;
// 			loginSubmitBtn.style.border = `1px solid #0d6efd`;
// 			loginSubmitBtnTxt.innerText = `Submit`;
// 			appActivityIndEl.classList.remove(`spinner-border`, `text-dark`, `spinner-border-sm`);
// 		} else {
// 			// LOGIN SUCCESS
// 			loginSubmitBtn.disabled = true;
// 			loginSubmitBtn.style.backgroundColor = `lightgrey`;
// 			loginSubmitBtn.style.color = `#333`;
// 			loginSubmitBtn.style.border = `1px solid lightgrey`;
// 			loginSubmitBtnTxt.innerText = `Please Wait`;
// 			appActivityIndEl.classList.remove(`spinner-border`, `text-dark`, `spinner-border-sm`);
// 		}
// 	});
// }

// REMOVE
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
