import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Dimensions,
} from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useNavigation } from "@react-navigation/native";

const Header = ({ isDropdownVisible, setDropdownVisible }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const isInStockCollection = (collections, targetCollectionId) => {
    // Check if collections is an array and has elements
    if (Array.isArray(collections.edges) && collections.edges.length > 0) {
      // Use some() to check if any edge's node has the target collection ID
      return collections.edges.some(
        (collectionEdge) => collectionEdge.node.id === targetCollectionId
      );
    }
    return false;
  };

  const renderInStockLabel = (item) => {
    if (
      isInStockCollection(
        item.collections,
        "gid://shopify/Collection/172174278735"
      )
    ) {
      return (
        <View style={styles.labelContainer}>
          <View style={styles.inStoreWrapper}>
            <View style={styles.iconContainer}>
              <FontAwesomeIcon name="check" size={12} color="#071B0F" />
            </View>
            <Text style={styles.inStore}>In-Store</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchData();
    } else {
      setSearchResults([]);
      setDropdownVisible(false);
    }
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://us-central1-romc-mobile-app.cloudfunctions.net/search-search?q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();
      setSearchResults(data);
      setDropdownVisible(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setDropdownVisible(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  const renderGridItems = () => {
    if (searchResults.length === 0) {
      return <Text style={styles.noResultsText}>No result</Text>;
    }
    return searchResults.map((item, index) => (
      <Pressable
        key={index}
        style={styles.gridItem}
        onPress={() => {
          // Dismiss the keyboard first
          Keyboard.dismiss();

          // Delay navigation to allow the keyboard to dismiss
          setTimeout(() => {
            const numericProductId = item.id.split("/").pop();
            if (!isNaN(numericProductId)) {
              navigation.navigate("Product", {
                productId: numericProductId,
                key: new Date().getTime(),
              });

              // Reset the search query and close the dropdown
              setSearchQuery("");
              setDropdownVisible(false);
            } else {
              console.log("Invalid product ID:", numericProductId);
            }
          }, 50); // A brief delay, e.g., 50 milliseconds
        }}
      >
        <View style={styles.itemContent}>
          {item.images.edges.length > 0 && (
            <View style={styles.productImageContainer}>
              <Image
                source={{ uri: item.images.edges[0].node.url }}
                style={styles.productImage}
              />
            </View>
          )}

          <View style={styles.itemTextContainer}>
            <View style={styles.priceContainer}>
              {/* Display the price and compare at price */}
              <Text
                style={
                  item.compareAtPriceRange.minVariantPrice.amount > 0
                    ? styles.resultPriceDiscounted
                    : styles.resultPrice
                }
              >
                ${formatPrice(item.priceRange.minVariantPrice.amount)}
              </Text>

              {item.compareAtPriceRange.minVariantPrice.amount > 0 && (
                <Text style={styles.resultComparePrice}>
                  $
                  {formatPrice(item.compareAtPriceRange.minVariantPrice.amount)}
                </Text>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.resultTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            {renderInStockLabel(item)}
            {/* Call renderInStockLabel with item */}
          </View>
        </View>
      </Pressable>
    ));
  };

  const handleScanIconPress = async () => {
    Keyboard.dismiss();
    // If permission is already granted, just open the scanner
    if (hasPermission) {
      setIsScannerVisible(true);
      setScanned(false);
      return;
    }

    // If permission status is unknown (null), request it
    if (hasPermission === null) {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      const isGranted = status === "granted";
      setHasPermission(isGranted);
      if (isGranted) {
        setIsScannerVisible(true);
        setScanned(false);
      }
    }
  };

  const handleBarCodeScanned = async ({ type, data: upc }) => {
    setScanned(true);
    setIsScannerVisible(false);

    console.log("Scanned UPC: ", upc); // Log the scanned UPC code

    try {
      const response = await fetch(
        `https://us-central1-romc-mobile-app.cloudfunctions.net/scan-scan?upc=${upc}`
      );
      const data = await response.json();
      console.log("Response from scan-scan function: ", data); // Log the response

      const { productId } = data;
      if (productId) {
        // Extract the numeric part of the productId
        const numericProductId = productId.split("/").pop();

        // Check if it's numeric before navigating
        if (!isNaN(numericProductId)) {
          console.log("Navigating to Product with ID: ", numericProductId);
          navigation.navigate("Product", {
            productId: numericProductId,
            key: new Date().getTime(),
          });
        } else {
          console.log("Invalid product ID:", numericProductId);
        }
      } else {
        console.log("Product not found for UPC:", upc);
      }
    } catch (error) {
      console.error("Error fetching product ID:", error);
    }
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.navigate("HomeScreen")}>
        <Image
          source={require("../assets/logo.webp")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>
      <View style={styles.searchContainer}>
        <TextInput
          placeholderTextColor="white"
          placeholder="Search products..."
          style={styles.searchBar}
          selectionColor="white"
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery("");
              Keyboard.dismiss(); // Add this line to dismiss the keyboard
            }}
          >
            <Text style={styles.clearButtonText}>X</Text>
          </Pressable>
        )}
        <Pressable style={styles.scanIcon} onPress={handleScanIconPress}>
          <FontAwesomeIcon name="barcode" size={24} color="white" />
        </Pressable>
      </View>
      <Modal
        visible={isScannerVisible}
        onRequestClose={() => setIsScannerVisible(false)}
        transparent={true}
      >
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.cameraContainer}>
            <View style={styles.scanFrame} />
            <Pressable
              style={styles.closeButton}
              onPress={() => setIsScannerVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>
        </BarCodeScanner>
      </Modal>

      {isDropdownVisible && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[
              styles.dropdown,
              {
                maxHeight:
                  Dimensions.get("window").height - keyboardHeight - 90,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.gridContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {renderGridItems()}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131313",
    padding: 15,
    zIndex: 10,
  },
  logo: {
    width: 100,
    height: 60,
    marginRight: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#505050",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  searchBar: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "white",
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    marginRight: 5,
  },
  clearButtonText: {
    fontSize: 13,
    color: "#131313",
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: "#E4E4E4",
    zIndex: 10,
    elevation: 1000,
    height: "auto",
    padding: 15,
  },
  priceContainer: {
    flexDirection: "row", // Arrange prices in a row
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 5,
  },
  gridItem: {
    width: "100%", // Full width of the dropdown
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Ensure the content takes the full width
  },
  itemTextContainer: {
    flex: 1, // Take the remaining space after the image
  },
  productImageContainer: {
    width: 100, // Fixed width for the image container
    height: 150, // Fixed height for the image container
    overflow: "hidden",
    marginRight: 10, // Margin between image and text
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  resultPriceDiscounted: {
    color: "#131313",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  resultPrice: {
    fontSize: 18,
  },
  resultComparePrice: {
    color: "grey",
    marginBottom: 10,
    fontWeight: "bold",
  },
  titleContainer: {
    height: 40,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "bold",
    // No change needed for numberOfLines, already set to 3
  },
  resultType: {
    color: "#131313",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  noResultsText: {
    alignSelf: "center",
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
    marginTop: 100,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  inStoreWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8F1DA",
    borderRadius: 5,
    width: 85,
    justifyContent: "center", // Horizontally center children
    paddingHorizontal: 5, // Add some horizontal padding for spacing
    textAlign: "center", // Text alignment in the center
  },
  iconContainer: {
    marginRight: 5, // Add some spacing between icon and text
  },
  inStore: {
    fontSize: 12,
    borderRadius: 5,
    paddingVertical: 5,
    fontWeight: "bold",
    color: "#071B0F",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: "white",
    opacity: 0.5,
    backgroundColor: "transparent",
  },
  closeButton: {
    position: "absolute",
    bottom: 80,
    right: 50,
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 2,
  },
  closeButtonText: {
    color: "#131313",
    fontSize: 20,
    fontWeight: "bold",
  },
  scanIcon: {
    marginLeft: 10,
  },
  resultComparePrice: {
    textDecorationLine: "line-through",
    color: "grey",
    marginLeft: 5,
    fontSize: 14, // slightly smaller font size for crossed out price
  },
});

export default Header;
