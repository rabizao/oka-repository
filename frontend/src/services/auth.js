import jwt_decode from "jwt-decode";

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (token && !is_expired(token)) {
        return true;
    }
    return false;
}

export const getUserId = () => Number(localStorage.getItem('id'));
export const getUserUsername = () => localStorage.getItem('username');
export const getUserGravatar = () => localStorage.getItem('gravatar');
export const getUserName = () => localStorage.getItem('name');
export const getToken = () => localStorage.getItem('token');

export const login = (access_token) => {
    localStorage.setItem('token', access_token);
}

export const logout = () => {
    localStorage.clear();
}

export const timeStart = (new Date(Date.UTC(1970))).toISOString();

export const is_expired = token => {
    var decoded_token = jwt_decode(token);
    var now = Date.now();
    return now >= decoded_token.exp * 1000;
}
