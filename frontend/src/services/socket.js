import io from 'socket.io-client';
import { NotificationManager } from 'react-notifications';

const url = process.env.REACT_APP_URL ? process.env.REACT_APP_URL : "http://localhost:5000";

const socket = io.connect(url)

socket.on('task_done', function(message) {
    console.log(message["result"])
    NotificationManager.success("Your datasets were already processed and can be accessed in your account", "Finished", 10000)
});

export default socket;