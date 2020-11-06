import { NotificationManager } from 'react-notifications';

export const notifyError = (error) => {
    if (error && error.response) {
        for (var prop in error.response.data.errors.json) {
            NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
        }
    } else {
        NotificationManager.error("Network error. Please try again later", "Error", 4000)
    }
}
