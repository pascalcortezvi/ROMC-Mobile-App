// UserContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from AsyncStorage when the application starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage.");
      }
    };

    loadUser();
  }, []);

  // Listen for changes in user state to update AsyncStorage
  useEffect(() => {
    const saveUser = async (userData) => {
      try {
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      } catch (e) {
        console.error("Failed to save user to storage.");
      }
    };

    if (user) {
      saveUser(user);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
