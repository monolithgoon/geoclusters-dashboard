import ALERT_MESSAGES from "../constants/alert-messages.js";
import INTERVALS from "../constants/intervals.js";
import { showAlert } from "./alerts-controller.js";

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
			}, INTERVALS.LOGIN_NAVIGATION_DELAY);
		}

		// console.log({loginResponse})

		return true;

	} catch (error) {
		if (error.response && error.response.data) {
			const { message } = error.response.data;
			const statusText = error.response.statusText;
			if (message) {
				showAlert("error", message);
			} else if (statusText === "Bad Gateway") {
				showAlert("error", "Server Is Offline");
			} else {
				showAlert("error", "Something Went Wrong");
			}
		} else {
			showAlert("error", "Something Went Wrong");
			console.log("Login error:", error);
		}
		return false;
	}
};

export const logout = async () => {
	try {
		const logoutResponse = await axios({
			method: "GET",
			url: "/api/v1/users/logout",
		});

		console.log({ logoutResponse });

		if (logoutResponse && logoutResponse.data.status === "success") location.assign("/");
	} catch (logoutErr) {
		// showAlert("error", "Error logging out! Try again.");
		console.error({ logoutErr });
	}
};
