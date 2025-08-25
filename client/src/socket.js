// // src/socket.js
// import { io } from 'socket.io-client';

// const socket = io('https://konvo-nhhs.onrender.com');

// export default socket;
// socket.js (frontend)
import { io } from "socket.io-client";

// ✅ Replace with your Render/Heroku backend URL
const socket = io("https://konvo-nhhs.onrender.com", {
  withCredentials: true,
});

export default socket;
