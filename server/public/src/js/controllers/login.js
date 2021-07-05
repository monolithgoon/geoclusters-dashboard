import { showAlert } from "./alerts.js";

export const login = async (email, password) => {
	try {
		const res = await axios({
			method: "POST",
			// url: "/api/v1/users/login",
			url: "http://127.0.0.1:1010/api/v1/users/login",
			data: {
				user_email: email,
				user_password: password,
			},
		});
		
		if (res && res.data.status === "success") {

			showAlert("success", "Logged In");
			window.setTimeout(() => {
				location.assign("/dashboard");
			}, 1500);
		};

		return true;

	} catch (loginErr) {
		showAlert("error", loginErr.response.data.message);
		return false;
	};
};

export const logout = async () => {
	try {
		const res = await axios({
			method: "GET",
			url: "/api/v1/users/logout",
		});

		if (res && res.data.status === "success") location.assign("/");

	} catch (logoutErr) {
		showAlert("error", "Error logging out! Try again.");
	};
};