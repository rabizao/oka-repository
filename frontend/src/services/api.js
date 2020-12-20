import axios from 'axios';
import { getToken, logout } from './auth';

export const url = process.env.REACT_APP_URL ? process.env.REACT_APP_URL : "http://localhost:5000";
export const frontendUrl = process.env.REACT_APP_FRONTENDURL ? process.env.REACT_APP_FRONTENDURL : "http://localhost:3000";
export const dashUrl = process.env.REACT_APP_DASHURL ? process.env.REACT_APP_DASHURL : "http://localhost:8050/view";
export const downloadsUrl = process.env.REACT_APP_DOWNLOADS_FOLDER ? process.env.REACT_APP_DOWNLOADS_FOLDER : "http://localhost:5000/api/downloads";

const api = axios.create({
	baseURL: `${url}/api/`
});

export const cancelToken = axios.CancelToken.source();

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
	if (error.response.status === 401) {
		logout()
		window.location.href = '/login'
		return
	}
	return Promise.reject(error);
});

export default api;
