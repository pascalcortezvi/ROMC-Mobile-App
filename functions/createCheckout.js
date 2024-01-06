// Import necessary modules
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const Client = require("shopify-buy");

const client = Client.buildClient({
  domain: "musique-red-one-music.myshopify.com",
  storefrontAccessToken: "ff22e43cfa2c734aea496f1307b9370b",
});

exports.createCheckout = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const cartItems = req.body.cartItems;
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).send("Cart is empty");
      }

      // Create a new checkout
      const checkout = await client.checkout.create();

      // Prepare line items in the format expected by the Shopify SDK
      // Ensure variant IDs are correctly prefixed and quantities are integers
      const lineItemsToAdd = cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: parseInt(item.quantity, 10),
      }));

      // Add line items to the checkout
      const checkoutWithItems = await client.checkout.addLineItems(
        checkout.id,
        lineItemsToAdd
      );

      // Respond with the checkout webUrl
      res.status(200).send({ url: checkoutWithItems.webUrl });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res
        .status(500)
        .send({ error: "Error creating checkout", details: error.message });
    }
  });
});
