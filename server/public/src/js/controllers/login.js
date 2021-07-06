import { showAlert } from "./alerts.js";


export const login = async (email, password) => {

	try {
		const res = await axios({
			method: "POST",
			url: "/api/v1/users/login",
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

		console.log(res)

		return true;

	} catch (loginErr) {
		if (loginErr.response && loginErr.response.data) {
			showAlert("error", loginErr.response.data.message);
		} else {
			showAlert("error", `Check Internet Connection & Refresh Page`);
		};
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