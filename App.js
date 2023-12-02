import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Header from "./components/Header";
import ShopScreen from "./screens/ShopScreen";
import CartScreen from "./screens/CartScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="ShopScreen"
            component={ShopScreen}
            options={{ headerShown: false }} // Add this line
          />
          <Tab.Screen
            name="CartScreen"
            component={CartScreen}
            options={{ headerShown: false }} // Add this line
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}
