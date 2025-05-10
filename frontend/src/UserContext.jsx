import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    photo: "",
    preferences: {
      dataSharing: false,
      notifications: true,
      smsNotifications: false,
      pushNotifications: false,
      notificationFrequency: "immediate",
      theme: "light",
      defaultCurrency: "USD",
      twoFactor: false,
    },
  });

  const updateUser = (updates) => {
    try {
      setUser((prev) => ({ ...prev, ...updates }));
      console.log("User updated successfully:", updates);
    } catch (err) {
      console.error("Error updating user:", err);
      throw new Error("Failed to update user data.");
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    console.error("useUser must be used within a UserProvider");
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}