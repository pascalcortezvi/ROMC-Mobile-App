const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const runtimeOpts = {
  minInstances: 5,
};

const search = functions
  .runWith(runtimeOpts)
  .https.onRequest((request, response) => {
    cors(request, response, async () => {
      const shopifyDomain = "musique-red-one-music.myshopify.com";
      const storefrontAccessToken = "ff22e43cfa2c734aea496f1307b9370b";
      const searchQuery = request.query.q;

      const graphqlQuery = JSON.stringify({
        query: `
        query MyQuery($searchQuery: String!) {
          products(first: 18, query: $searchQuery) {
            nodes {
              title
              productType
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                }
              }
              id
              collections(first: 50) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      `,
        variables: {
          searchQuery: searchQuery,
        },
      });

      try {
        const shopifyResponse = await fetch(
          `https://${shopifyDomain}/api/2023-10/graphql.json`,
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
        response.send(jsonResponse.data.products.nodes);
      } catch (error) {
        console.error("Error:", error);
        response.status(500).send("Server error");
      }
    });
  });

module.exports = { search };
