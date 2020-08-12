import axios from 'axios';
import { getRefreshToken } from './auth'

const url = process.env.REACT_APP_URL ? process.env.REACT_APP_URL : "http://localhost:5000";

const api_refresh = axios.create({
	baseURL: `${url}/api/`
});

api_refresh.interceptors.request.use(async config => {
	const refresh_token = getRefreshToken();
	if (refresh_token) {
		config.headers.Authorization = `Bearer ${refresh_token}`;
	}
	return config;
});


export default api_refresh;