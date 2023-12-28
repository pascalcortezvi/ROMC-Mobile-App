import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { UserContext } from "../contexts/UserContext";

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    // Initialize login status based on user context
    if (user && user.accessToken) {
      // User is logged in, check for 'staff' tag
      const hasStaffTag = user.tags && user.tags.includes("staff");
      if (hasStaffTag) {
        // Do something specific for 'staff' users if necessary
      }
    }
  }, [user]); // Dependency on user context

  const handleLogin = async () => {
    const loginUrl =
      "https://us-central1-romc-mobile-app.cloudfunctions.net/login-login";

    // Clear previous user data
    setUser(null);

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        const newUser = {
          email: email,
          accessToken: data.accessToken,
          tags: data.tags || [],
        };

        setUser(newUser); // Update context with new user data
        Alert.alert("Login Successful", "You are now logged in.");
      } else {
        const errorMessages =
          data.customerUserErrors?.map((e) => e.message).join(", ") ||
          "Unknown error";
        Alert.alert("Login Failed", errorMessages);
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert(
        "Login Error",
        "An error occurred while attempting to login. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Conditionally render text based on user's authentication and tags */}
      {user && user.accessToken && (
        <Text style={styles.authStatusText}>Logged In</Text>
      )}
      <Text style={styles.tagStatusText}>
        {user && user.tags && user.tags.includes("staff") ? "YES" : "NO"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#ECECEC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#AFAFAF",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#131313",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  authStatusText: {
    fontSize: 18,
    color: "green",
    marginTop: 10,
  },
  staffText: {
    fontSize: 16,
    color: "blue",
    marginTop: 5,
  },
  tagStatusText: {
    fontSize: 18,
    color: "black",
    marginTop: 10,
  },
});
