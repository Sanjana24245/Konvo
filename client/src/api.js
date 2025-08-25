import axios from "axios";

const api = axios.create({
  baseURL: "https://konvo-nhhs.onrender.com/api",  // Make sure this is the backend URL
});

export { api };
a
