import React, { useContext } from "react";
import { View, Button } from "react-native";
import { UserContext } from "../contexts/UserContext";

export default function AccountScreen({ navigation }) {
  const { setUser } = useContext(UserContext);

  const handleLogout = () => {
    // Set user to null or empty object to represent logged out state
    setUser(null);

    // Optionally, navigate to another screen after logout
    // navigation.navigate('HomeScreen');
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* Logout Button */}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
