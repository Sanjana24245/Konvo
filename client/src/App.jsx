import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./pages/NavBar";

import ErrorBoundary from "./context/ErrorBoundary";
import VideoRoom from "./pages/VideoRoom";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="*" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
           <Route path="/VideoRoom/:roomID" element={<VideoRoom />} />
            <Route path="/Navbar" element={<Navbar />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
