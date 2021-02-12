import { NotificationManager } from 'react-notifications';

export const notifyError = (error, force = true) => {
    const response = {};
    let accessDenied = false;
    if (error && error.response && error.response.data && error.response.data.errors) {
        if (error.response.data.errors.json) {
            for (var prop in error.response.data.errors.json) {
                NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                if (error.response.data.errors.json[prop].indexOf("Access denied.") !== -1) {
                    accessDenied = true;
                }
            }
        }
        if (error.response.data.errors.query) {
            for (var prop2 in error.response.data.errors.query) {
                NotificationManager.error(error.response.data.errors.query[prop2], `${prop2}`, 4000)
            }
        }
        response["accessDenied"] = accessDenied
    } else {
        if (force) {
            NotificationManager.error("Network error. Please try again later", "Error", 4000)
        }
    }
    return response
}
