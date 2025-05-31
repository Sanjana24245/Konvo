
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import axios from "axios";
import logo from "../../public/konvo.png";
export default function Navbar({ onUserSelect }) {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`/api/auth/search-users?q=${searchTerm}`);
        setSuggestions(res.data.filter((u) => u.username !== user.username));
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, user.username]);

  const handleUserClick = (u) => {
    onUserSelect(u);
    setSearchTerm('');
    setSuggestions([]);
    setShowSearch(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  return (
    <div className="relative">
      {/* Modern Gradient Navbar */}
      <div className="w-full flex justify-between items-center bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 p-4 shadow-lg backdrop-blur-sm">
        {/* Brand Logo with Animation */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
         <img
  src={logo}
  alt="Logo"
  className="w-8 h-8 object-contain"
/>

          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            Konvo
          </h1>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Search/Add Button with Morphing Animation */}
          <button
            onClick={toggleSearch}
            className={`relative group p-3 rounded-2xl transition-all duration-300 ease-out transform hover:scale-110 ${
              showSearch 
                ? 'bg-red-500/90 shadow-lg shadow-red-500/30 rotate-180' 
                : 'bg-white/20 shadow-lg shadow-purple-900/30 hover:bg-white/30'
            } backdrop-blur-sm border border-white/20`}
            title={showSearch ? "Close search" : "Start a new chat"}
          >
            <div className="relative overflow-hidden">
              {showSearch ? (
                <FaTimes className="text-white transition-all duration-300 transform" />
              ) : (
                <FaPlus className="text-white transition-all duration-300 transform group-hover:rotate-90" />
              )}
            </div>
            
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
          </button>

          {/* User Profile Section */}
          {user && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <FaUser className="text-white text-sm" />
              </div>
              <span className="hidden sm:block text-white font-medium tracking-wide">
                {user.username}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Animated Search Dropdown */}
      <div className={`absolute left-0 right-0 z-50 transition-all duration-500 ease-out ${
        showSearch 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="mx-4 mt-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Search Input Section */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg" />
              <input
                type="text"
                placeholder="Search for users to start chatting..."
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200/50 transition-all duration-300 text-gray-700 placeholder-gray-500 shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              
              {/* Input Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Results Section */}
          <div className="max-h-80 overflow-y-auto">
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((u, index) => (
                  <div
                    key={u._id}
                    className={`group flex items-center gap-4 p-4 m-2 bg-gradient-to-r from-purple-50 to-transparent rounded-2xl hover:from-purple-100 hover:to-purple-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-purple-200 ${
                      index === 0 ? 'animate-fade-in-down' : ''
                    }`}
                    onClick={() => handleUserClick(u)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* User Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                      <FaUser className="text-white text-lg" />
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-200">
                        {u.username}
                      </p>
                      <p className="text-sm text-gray-500 group-hover:text-purple-500 transition-colors duration-200">
                        Click to start chatting
                      </p>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results State */}
            {suggestions.length === 0 && searchTerm && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No users found</p>
                <p className="text-gray-400 text-sm mt-1">Try searching with a different username</p>
              </div>
            )}
            
            {/* Empty State */}
            {suggestions.length === 0 && !searchTerm && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-purple-400 text-xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">Start typing to search</p>
                <p className="text-gray-400 text-sm mt-1">Find users to start new conversations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSearch}
        />
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}