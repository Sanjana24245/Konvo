
// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser ] = useState(() => {
//     const storedUser  = localStorage.getItem("user");
//     return storedUser  ? JSON.parse(storedUser ) : null;
//   });

//   const login = (userData, token) => {
//     setUser (userData);
//     localStorage.setItem("user", JSON.stringify(userData));
    
//   };

//   const logout = () => {
//     setUser (null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser , login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restore user on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      axios
        .get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
        })
        .catch((err) => {
          console.error("Token invalid or expired:", err);
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user,setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


