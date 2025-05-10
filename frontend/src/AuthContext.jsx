import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkLoginStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && isMounted) {
          const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (isMounted) {
            console.log('AuthContext: User fetched:', response.data);
            setUser(response.data);
            setIsLoggedIn(true);
          }
        } else {
          console.log('AuthContext: No token found');
        }
      } catch (err) {
        console.error('AuthContext: Error checking login status:', err.response?.data || err.message);
        localStorage.removeItem('token');
        setError('Failed to verify login status');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkLoginStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login:', { email });
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log('AuthContext: Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      const userResponse = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      console.log('AuthContext: User fetched after login:', userResponse.data);
      setUser(userResponse.data);
      setIsLoggedIn(true);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('AuthContext: Login error:', err.response?.data || err.message);
      throw new Error(err.response?.data.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
  };

  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      console.log('AuthContext: Updating user with data:', userData);
      const formData = new FormData();
      if (userData.photo && userData.photo.startsWith('data:image')) {
        const response = await fetch(userData.photo);
        const blob = await response.blob();
        formData.append('photo', blob, 'profile.jpg');
      }
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      if (userData.preferences) {
        formData.append('preferences', JSON.stringify(userData.preferences));
      }

      const response = await axios.put('http://localhost:5000/api/users/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('AuthContext: User update response:', response.data);
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('AuthContext: Error updating user:', err.response?.data || err.message);
      throw new Error(err.response?.data.message || 'Failed to update user');
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      console.log('AuthContext: Changing password');
      const response = await axios.post(
        'http://localhost:5000/api/users/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('AuthContext: Password changed:', response.data);
      return response.data;
    } catch (err) {
      console.error('AuthContext: Error changing password:', err.response?.data || err.message);
      throw new Error(err.response?.data.message || 'Failed to update user');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser, changePassword, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}