var jwtDecode = require('jwt-decode');

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (token && !is_expired(token)) {
        return true;
    }
    return false;
}

export const getUserId = () => Number(localStorage.getItem('id'));
export const getUserUsername = () => localStorage.getItem('username');
export const getUserName = () => localStorage.getItem('name');
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
    return decoded_token;
}