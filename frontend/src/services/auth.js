import api_refresh from './api_refresh';

var jwtDecode = require('jwt-decode');

export const isAuthenticated = () => {
    if (localStorage.getItem('token') !== null) {
        if (is_expired(localStorage.getItem('token'))) {
            api_refresh.post('auth/refresh')
                .then(response => {
                    localStorage.setItem('token', response.data.access_token);
                }).catch(error => {
                    localStorage.clear();
                    return false
                });
            return true;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

export const getToken = () => localStorage.getItem('token');

export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const login = (access_token, refresh_token) => {
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
}

export const is_expired = token => {
    var decoded_token = jwtDecode(token);
    var now = Date.now();
    return now >= decoded_token.exp * 1000;
}

export const user_info = token => {
    var decoded_token = jwtDecode(token);
    console.log(decoded_token);
    return decoded_token;
}