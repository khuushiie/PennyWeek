import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      console.log('AuthContext: Verifying token');
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoggedIn(true);
      setUser(response.data);
      setPhoto(response.data.photo || null);
      console.log('AuthContext: Token verified, user:', response.data.email);
    } catch (err) {
      console.error('AuthContext: Token verification failed:', err.response?.data || err.message);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setPhoto(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, userData) => {
    try {
      console.log('AuthContext: Setting login state', { user: userData.email });
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      setUser(userData);
      setPhoto(userData.photo || null);
      console.log('AuthContext: Login state updated', userData.email);
      return { success: true };
    } catch (err) {
      console.error('AuthContext: Login state error:', err.message);
      throw new Error('Failed to set login state');
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setPhoto(null);
  };

  const updateUser = async (updatedData) => {
    try {
      console.log('AuthContext: Updating user', updatedData);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');

      const formData = new FormData();
      Object.keys(updatedData).forEach((key) => {
        if (key === 'photo' && updatedData[key]) {
          formData.append('photo', updatedData[key]);
        } else if (updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      });

      const response = await axios.put(`${API_BASE_URL}/api/users/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.user);
      setPhoto(response.data.user.photo || null);
      console.log('AuthContext: User updated successfully', response.data.user.email);
      return response.data.user;
    } catch (err) {
      console.error('AuthContext: Update user error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, photo, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};