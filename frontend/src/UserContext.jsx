import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    photo: null, // Base64 string for profile photo
    preferences: {
      notifications: true,
      theme: "light",
      defaultCurrency: "USD",
      dataSharing: false,
    },
  });

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}