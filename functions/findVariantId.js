const functions = require("firebase-functions");
const Shopify = require("shopify-api-node");
const cors = require("cors")({ origin: true });

// Fetching the Admin API Key from Firebase environment configuration
const adminApiToken = functions.config().shopify.admin_api_key;

// Initialize Shopify with your credentials
const shopify = new Shopify({
  shopName: "musique-red-one-music", // Replace with your Shopify shop name
  accessToken: adminApiToken, // Use the Admin API Access Token from environment variables
});

exports.findVariantId = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log("Received request for Product ID:", req.body.productId); // Logging incoming Product ID
      const productId = req.body.productId; // The Product ID from the request

      if (!productId) {
        console.error("Product ID is undefined");
        res.status(400).send("Product ID is undefined");
        return;
      }

      // Fetching product details using Shopify Admin API
      const product = await shopify.product.get(productId);
      const firstVariantId = product.variants[0].id; // Getting the first variant's ID

      console.log("Found Variant ID:", firstVariantId); // Logging the found Variant ID
      res.status(200).send({ variantId: firstVariantId }); // Send back the first variant's ID
    } catch (error) {
      console.error("Error finding variant ID:", error);
      res
        .status(500)
        .send({ error: "Error finding variant ID", details: error.message });
    }
  });
});
