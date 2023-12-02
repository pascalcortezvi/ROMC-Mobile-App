const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const featuredCollection = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const shopifyDomain = "musique-red-one-music.myshopify.com";
    const storefrontAccessToken = "d9a30de63933c02111f631e6d17f9f07";

    // Extract the collection ID from the query string
    const collectionId = request.query.collectionId;

    if (!collectionId) {
      response.status(400).send("Missing collectionId parameter");
      return;
    }

    const graphqlQuery = JSON.stringify({
      query: `{
        collection(id: "${collectionId}") {
          products(first: 8) {
            nodes {
              id
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              handle
            }
          }
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
      response.send(jsonResponse);
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Server error");
    }
  });
});

module.exports = { featuredCollection };
