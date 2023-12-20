const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const productDetails = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const shopifyDomain = "musique-red-one-music.myshopify.com";
    const adminApiAccessToken = "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";

    // Extract the numeric product ID from the query string and construct the full ID
    const productId = request.query.productId;
    const fullProductId = `gid://shopify/Product/${productId}`;

    if (!productId) {
      response.status(400).send("Missing productId parameter");
      return;
    }

    const graphqlQuery = JSON.stringify({
      query: `{
        product(id: "${fullProductId}") {
          id
          title
          images(first: 10) {
            nodes {
              url
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          productType
          descriptionHtml
          totalInventory
        }
      }`,
    });

    try {
      const shopifyAdminResponse = await fetch(
        `https://${shopifyDomain}/admin/api/2023-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": adminApiAccessToken,
            "Content-Type": "application/json",
          },
          body: graphqlQuery,
        }
      );

      const jsonResponse = await shopifyAdminResponse.json();
      console.log("Shopify API Response:", jsonResponse); // Log the Shopify API response
      response.send(jsonResponse);
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Server error");
    }
  });
});

module.exports = { productDetails };
