
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaSpinner } from "react-icons/fa";
import { api } from "../api"; 
export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", form);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      console.log("data", res.data.token);
      
      // Success animation delay
      setTimeout(() => {
        navigate("/chat");
      }, 500);
    } catch (err) {
      console.error("Login failed", err);
      setErrors({ general: "Invalid credentials. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl mb-4 shadow-lg animate-bounce-gentle">
              <FaUser className="text-white text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="text-purple-200/80 text-sm">
              Sign in to continue to Konvo
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-shake">
              <p className="text-red-200 text-sm text-center">{errors.general}</p>
            </div>
          )}

          {/* Username Field */}
          <div className="mb-6">
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className={`text-lg transition-colors duration-300 ${
                  form.username ? 'text-purple-400' : 'text-purple-300/50'
                }`} />
              </div>
              <input
                type="text"
                placeholder="Enter your username"
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                  errors.username 
                    ? 'border-red-400/50 focus:border-red-400' 
                    : 'border-white/20 focus:border-purple-400'
                }`}
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: '' });
                }}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.username && (
              <p className="text-red-300 text-xs mt-2 animate-fade-in">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className={`text-lg transition-colors duration-300 ${
                  form.password ? 'text-purple-400' : 'text-purple-300/50'
                }`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                  errors.password 
                    ? 'border-red-400/50 focus:border-red-400' 
                    : 'border-white/20 focus:border-purple-400'
                }`}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300/70 hover:text-purple-300 transition-colors duration-200"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.password && (
              <p className="text-red-300 text-xs mt-2 animate-fade-in">{errors.password}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={isLoading}
            className="group w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Signing you in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </div>
            
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-purple-200/80 text-sm">
              Don't have an account?{" "}
              <a 
                href="/register" 
                className="text-purple-300 hover:text-white font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Create one here
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Glow */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-purple-500/30 blur-2xl rounded-full"></div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}