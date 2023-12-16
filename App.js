import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View, TouchableOpacity } from "react-native"; // Ensure View is imported here
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import ShopScreen from "./screens/ShopScreen";
import AccountScreen from "./screens/AccountScreen";
import CartScreen from "./screens/CartScreen";
import ProductScreen from "./screens/ProductScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
    </Stack.Navigator>
  );
}

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "red",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-module"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleOverlayPress = () => {
    setDropdownVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        isDropdownVisible={isDropdownVisible}
        setDropdownVisible={setDropdownVisible}
      />

      <View style={styles.mainContent}>
        {isDropdownVisible && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleOverlayPress}
          />
        )}
        <NavigationContainer>
          <MainTabNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131313",
  },
  mainContent: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1, // Ensure this is above main content but below the header
  },
  tabBar: {
    backgroundColor: "#131313",
  },
});
