import axios from 'axios';
import { getToken, logout } from './auth';

const url = process.env.REACT_APP_URL ? process.env.REACT_APP_URL : "http://localhost:5000";

const api = axios.create({
	baseURL: `${url}/api/`
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
	if (error.response.status === 401) {
		logout()
		window.location.href = '/login'
		return
	}
	return Promise.reject(error);
});

export default api;
