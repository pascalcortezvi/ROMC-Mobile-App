const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const createCheckout = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const shopifyDomain = functions.config().shopify.domain;
    const storefrontAccessToken = functions.config().shopify.storefront_api_key;

    // Assuming cartItems are sent in the request body as an array of {variantId, quantity}
    const cartItems = request.body.cartItems;

    if (!cartItems || cartItems.length === 0) {
      response.status(400).send("Cart is empty");
      return;
    }

    // Prepare line items for the Shopify checkout creation
    const lineItems = request.body.cartItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const graphqlQuery = {
      query: `
          mutation checkoutCreate($lineItems: [CheckoutLineItemInput!]!) {
            checkoutCreate(input: { lineItems: $lineItems }) {
              checkout {
                webUrl
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
      variables: {
        lineItems: lineItems,
      },
    };

    try {
      const shopifyResponse = await fetch(
        `https://${shopifyDomain}/api/2023-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(graphqlQuery),
        }
      );

      const jsonResponse = await shopifyResponse.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Server error");
    }
  });
});

module.exports = { createCheckout };
