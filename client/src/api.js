import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",  // Make sure this is the backend URL
});

export { api };
a
