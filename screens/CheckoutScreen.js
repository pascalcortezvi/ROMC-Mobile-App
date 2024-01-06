import { View, StyleSheet } from "react-native";
import WebView from 'react-native-webview';

export default function CheckoutScreen({ route }) {
  const { checkoutUrl } = route.params;

  return (
    <View style={styles.container}>
      <WebView source={{ uri: checkoutUrl }} style={styles.webView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
