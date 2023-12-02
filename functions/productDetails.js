const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const productDetails = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const shopifyDomain = "musique-red-one-music.myshopify.com";
    const storefrontAccessToken = "d9a30de63933c02111f631e6d17f9f07";

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
        }
      }`,
    });

    try {
      const shopifyResponse = await fetch(
        `https://${shopifyDomain}/api/2021-04/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            "Content-Type": "application/json",
          },
          body: graphqlQuery,
        }
      );

      const jsonResponse = await shopifyResponse.json();
      console.log("Shopify API Response:", jsonResponse); // Log the Shopify API response
      response.send(jsonResponse);
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Server error");
    }
  });
});

module.exports = { productDetails };
