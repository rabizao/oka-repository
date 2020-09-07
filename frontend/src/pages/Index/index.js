import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:5000/";

export default function Socket() {
  const [response, setResponse] = useState("");
  

  useEffect(() => {
    
    console.log("entrou")
    const socket = socketIOClient(ENDPOINT);
    
    socket.on('connect', function() {
        const response = socket.emit('my_event', {data: 'I\'m connected!'});
        console.log(response)
    });
  }, []);

  return (
    <h1>Go to <Link to="/home">Home</Link></h1>
  );
}