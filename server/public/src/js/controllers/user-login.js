import ALERT_MESSAGES from "../constants/alert-messages.js";
import DURATION from "../constants/duration.js";
import { showAlert } from "./alerts.js";


export const login = async (email, password) => {

	try {
		const loginResponse = await axios({
			method: "POST",
			url: "/api/v1/users/login",
			data: {
				user_email: email,
				user_password: password,
			},
		});
		
		if (loginResponse && loginResponse.data.status === "success") {

			showAlert("success", ALERT_MESSAGES.LOGIN_SUCCESS);
			window.setTimeout(() => {
				location.assign("/dashboard/");
			}, DURATION.LOGIN_NAVIGATION_DELAY);
		};

		// console.log({loginResponse})

		return true;

	} catch (loginErr) {
		if (loginErr.response && loginErr.response.data) {
			showAlert("error", loginErr.response.data.message);
		} else {
			showAlert("error", ALERT_MESSAGES.LOGIN_FAIL);
		};
		return false;
	};
};


export const logout = async () => {
	try {
		const logoutResponse = await axios({
			method: "GET",
			url: "/api/v1/users/logout",
		});

		if (logoutResponse && logoutResponse.data.status === "success") location.assign("/");

	} catch (logoutErr) {
		showAlert("error", "Error logging out! Try again.");
	};
};