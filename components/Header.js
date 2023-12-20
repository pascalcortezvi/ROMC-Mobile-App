import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
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
      console.log("Response Data:", data); // Add this line to log the response data
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
      <TouchableOpacity
        key={index}
        style={styles.gridItem}
        onPress={() => {
          setSearchQuery("");
          setDropdownVisible(false);
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
      </TouchableOpacity>
    ));
  };

  const handleClosePress = () => {
    setDropdownVisible(false);
  };

  const handleScanIconPress = async () => {
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
          navigation.navigate("Product", { productId: numericProductId });
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
      <Image
        source={require("../assets/logo.webp")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.searchContainer}>
        <TextInput
          placeholderTextColor="white"
          placeholder="Search products..."
          style={styles.searchBar}
          selectionColor="white"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        <TouchableOpacity style={styles.scanIcon} onPress={handleScanIconPress}>
          <FontAwesomeIcon name="barcode" size={24} color="white" />
        </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsScannerVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </BarCodeScanner>
      </Modal>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <ScrollView contentContainerStyle={styles.gridContainer}>
            {renderGridItems()}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePress}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
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
  dropdown: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: "#E4E4E4",
    zIndex: 10,
    elevation: 1000,
    maxHeight: 500,
    minHeight: 500,
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
    color: "#D80000",
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
  closeButton: {
    position: "absolute",
    top: 25,
    right: 25,
    backgroundColor: "#131313",
    width: 30,
    height: 30,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
  },
  closeButtonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
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
    alignItems: "center", // Align items horizontally
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
    bottom: 100,
    right: 40,
    backgroundColor: "white",
    width: 50,
    height: 50,
    opacity: 0.5,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButtonText: {
    color: "#131313",
    fontSize: 20,
    fontWeight: "bold",
  },
  scanIcon: {
    marginLeft: 10,
  },
});

export default Header;
