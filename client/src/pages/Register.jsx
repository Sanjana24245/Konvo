
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../api"; 
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight, 
  FaSpinner, 
  FaCheckCircle,
  FaShieldAlt,
  FaPaperPlane,
  FaUserPlus
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const showNotification = (message, type = 'info') => {
    // You can implement a toast notification here
    alert(message);
  };

  // Send OTP
  const sendOtp = async () => {
    const { email } = formData;
  
    if (!email) {
      setErrors({ ...errors, email: "Email is required" });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await api.post("/auth/send-otp", {
        email,
      });
  
      showNotification("✅ OTP sent to your email!", 'success');
      setOtpSent(true);
      setOtpToken(response.data.otpToken);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setErrors({ ...errors, general: "Failed to send OTP. Please try again." });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setErrors({ ...errors, otp: "OTP is required" });
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: otp,
        otpToken: otpToken,
      });
  
      showNotification(response.data.msg, 'success');
      setIsOtpVerified(true);
      setErrors({});
    } catch (error) {
      console.error("Error verifying OTP", error);
      setErrors({ ...errors, otp: error.response?.data?.msg || "Failed to verify OTP" });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Register User
  const register = async () => {
    const { username, email, password, confirmPassword } = formData;
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!isOtpVerified) newErrors.general = "Please verify your OTP before proceeding";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        confirmPassword,
      });
      showNotification("🎉 Registration successful!", 'success');
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (err) {
      console.error("Registration failed", err);
      setErrors({ ...errors, general: err.response?.data?.msg || "Registration failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
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

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl mb-4 shadow-lg animate-bounce-gentle">
              <FaUserPlus className="text-white text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-purple-200/80 text-sm">
              Join Konvo and start chatting
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
                  formData.username ? 'text-purple-400' : 'text-purple-300/50'
                }`} />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                  errors.username 
                    ? 'border-red-400/50 focus:border-red-400' 
                    : 'border-white/20 focus:border-purple-400'
                }`}
                value={formData.username}
                onChange={handleChange}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.username && (
              <p className="text-red-300 text-xs mt-2 animate-fade-in">{errors.username}</p>
            )}
          </div>

          {/* Email Field with Send OTP Button */}
          <div className="mb-6">
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className={`text-lg transition-colors duration-300 ${
                  formData.email ? 'text-purple-400' : 'text-purple-300/50'
                }`} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`w-full pl-12 pr-32 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                  errors.email 
                    ? 'border-red-400/50 focus:border-red-400' 
                    : 'border-white/20 focus:border-purple-400'
                }`}
                value={formData.email}
                onChange={handleChange}
                disabled={otpSent}
              />
              {!otpSent && (
                <button
                  onClick={sendOtp}
                  disabled={otpLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                >
                  {otpLoading ? (
                    <FaSpinner className="animate-spin text-sm" />
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span className="hidden sm:inline">Send OTP</span>
                    </>
                  )}
                </button>
              )}
              {otpSent && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400">
                  <FaCheckCircle className="text-lg" />
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.email && (
              <p className="text-red-300 text-xs mt-2 animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* OTP Input and Verification */}
          {otpSent && !isOtpVerified && (
            <div className="mb-6 animate-slide-down">
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Enter OTP
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaShieldAlt className={`text-lg transition-colors duration-300 ${
                    otp ? 'text-purple-400' : 'text-purple-300/50'
                  }`} />
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP sent to your email"
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                    errors.otp 
                      ? 'border-red-400/50 focus:border-red-400' 
                      : 'border-white/20 focus:border-purple-400'
                  }`}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors({ ...errors, otp: '' });
                  }}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {errors.otp && (
                <p className="text-red-300 text-xs mt-2 animate-fade-in">{errors.otp}</p>
              )}
              <button
                onClick={verifyOtp}
                disabled={verifyLoading}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {verifyLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-lg" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Message for OTP Verification */}
          {isOtpVerified && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm animate-fade-in">
              <div className="flex items-center gap-3 text-green-200">
                <FaCheckCircle className="text-lg" />
                <p className="text-sm">Email verified successfully!</p>
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="mb-6">
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className={`text-lg transition-colors duration-300 ${
                  formData.password ? 'text-purple-400' : 'text-purple-300/50'
                }`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                  errors.password 
                    ? 'border-red-400/50 focus:border-red-400' 
                    : 'border-white/20 focus:border-purple-400'
                }`}
                value={formData.password}
                onChange={handleChange}
                disabled={!isOtpVerified}
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

          <div className="mb-8">
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className={`text-lg transition-colors duration-300 ${
                  formData.confirmPassword ? 'text-purple-400' : 'text-purple-300/50'
                }`} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`w-full pl-12 pr-12 py-4 bg-white/10 border-2 rounded-2xl backdrop-blur-sm text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/25 ${
                  errors.confirmPassword 
                    ? 'border-red-400/50 focus:border-red-400' 
                    : 'border-white/20 focus:border-purple-400'
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={!isOtpVerified}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300/70 hover:text-purple-300 transition-colors duration-200"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-300 text-xs mt-2 animate-fade-in">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Register Button */}
          {isOtpVerified && (
            <button
              onClick={register}
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden animate-fade-in"
            >
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FaArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          )}

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-purple-200/80 text-sm">
              Already have an account?{" "}
              <a 
                href="/login" 
                className="text-purple-300 hover:text-white font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Sign in here
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
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
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
};

export default Register;