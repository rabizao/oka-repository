import axios from 'axios';
import { getToken, logout } from './auth';

export const apiBaseUrl = process.env.REACT_APP_URL ? process.env.REACT_APP_URL : "http://localhost:5000";
export const frontendUrl = process.env.REACT_APP_FRONTENDURL ? process.env.REACT_APP_FRONTENDURL : "http://localhost:3000";
export const recaptchaKey = "6LftpFoaAAAAAJjVDNn3fXe25lWvX262R-FAq0QT";

const api = axios.create({
	baseURL: `${apiBaseUrl}/api/`
});

api.interceptors.request.use(async config => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(function (response) {
	return response;
}, function (error) {
	if (!axios.isCancel(error)) {
		if (error.response.status === 401) {
			logout()
			window.location.href = '/login'
			return
		}
	}

	return Promise.reject(error);
});

export default api;
