import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";

export default function ShopScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // State to track expanded items

  const isFocused = useIsFocused();

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const response = await fetch(
          "https://us-central1-romc-mobile-app.cloudfunctions.net/getMenu-getMenu"
        );
        const data = await response.json();

        if (data.errors) {
          console.error("API errors:", data.errors);
        } else if (data && data.length > 0) {
          // Assuming data is the array of menu items
          setMenuItems(data);
        } else {
          console.error("Unexpected structure of data:", data);
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      }
      setLoading(false);
    }

    if (isFocused) {
      fetchMenu(); // Only fetch menu when the screen is focused
    }
  }, [isFocused]);

  // Function to toggle the expanded state of a main menu item
  const toggleExpand = (index) => {
    setExpanded((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.menuContainer}>
        <Text style={styles.shopTitle}>Shop by Category</Text>
        {menuItems &&
          menuItems.map((item, index) => (
            <View key={index}>
              <Pressable onPress={() => toggleExpand(index)}>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemHeader}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.menuImage}
                    />
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                  <Text style={styles.iconText}>
                    {expanded[index] ? "-" : "+"}
                  </Text>
                  {expanded[index] && (
                    <View style={styles.subMenuContainer}>
                      {item.items.map((subItem, subIndex) => (
                        <Text style={styles.subItem} key={subIndex}>
                          {subItem.title}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  menuContainer: {
    borderRadius: 10,
    paddingBottom: 50,
  },
  subMenuContainer: {
    borderRadius: 10,
    marginTop: 15,
  },
  shopTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
  },
  menuImage: {
    width: 50,
    height: 50,
    borderRadius: 10, // optional for rounded corners
    marginRight: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    flex: 1, // Allow the title to take remaining space
  },
  menuItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItem: {
    // Adjust your menuItem style
    flexDirection: "column", // Changed to column to stack submenu items
    alignItems: "flex-start", // Align submenu items to the start
    borderWidth: 1,
    borderColor: "#B1B1B1",
    marginBottom: 10,
    backgroundColor: "#ececec",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
  },
  subItem: {
    fontSize: 18,
    marginLeft: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "bold",
    position: "absolute",
    top: 20,
    right: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
