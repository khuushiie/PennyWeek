import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState(null);
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
            setPhoto(response.data.photo || '/default-avatar.png');
            setIsLoggedIn(true);
            setError(null);
          }
        } else {
          console.log('AuthContext: No token found');
        }
      } catch (err) {
        console.error('AuthContext: Error checking login status:', err.response?.data || err.message);
        localStorage.removeItem('token');
        setError(err.response?.data?.message || 'Failed to verify login status');
        setIsLoggedIn(false);
        setUser(null);
        setPhoto(null);
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
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    try {
      console.log('AuthContext: Attempting login:', { email, password });
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log('AuthContext: Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setPhoto(response.data.user.photo || '/default-avatar.png');
      setIsLoggedIn(true);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('AuthContext: Login error:', err.response?.data || err.message);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setPhoto(null);
      throw new Error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPhoto(null);
    setIsLoggedIn(false);
    setError(null);
    console.log('AuthContext: Logged out');
  };

  const updateUser = async (userData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    // Filter allowed fields
    const allowedFields = ['name', 'email', 'photo', 'preferences']; // Added preferences
    const updates = {};
    if (userData.name) updates.name = userData.name;
    if (userData.email) updates.email = userData.email;
    if (userData.photo && userData.photo.startsWith('data:image')) {
      updates.photo = userData.photo; // Send base64 string
    }
    if (userData.preferences) updates.preferences = userData.preferences; // Add preferences

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid updates provided');
    }

    try {
      console.log('AuthContext: Updating user with data:', updates);
      const isPhotoUpload = updates.photo != null;
      let response;

      if (isPhotoUpload) {
        const formData = new FormData();
        if (updates.photo) {
          const base64Data = updates.photo.split(',')[1];
          const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then((res) => res.blob());
          formData.append('photo', blob, 'profile.jpg');
        }
        if (updates.name) formData.append('name', updates.name);
        if (updates.email) formData.append('email', updates.email);
        if (updates.preferences) formData.append('preferences', JSON.stringify(updates.preferences)); // Stringify preferences

        response = await axios.put('http://localhost:5000/api/users/me', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await axios.put('http://localhost:5000/api/users/me', updates, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      console.log('AuthContext: User update response:', response.data);
      setUser(response.data.user);
      setPhoto(response.data.user.photo || '/default-avatar.png');
      setError(null);
      return response.data.user;
    } catch (err) {
      console.error('AuthContext: Error updating user:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  };
  const changePassword = async (oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
      throw new Error('Old and new passwords are required');
    }
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
      setError(null);
      return response.data;
    } catch (err) {
      console.error('AuthContext: Error changing password:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, photo, login, logout, updateUser, changePassword, error }}
    >
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