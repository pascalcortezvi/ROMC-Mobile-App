const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const runtimeOpts = {
  minInstances: 5,
};

const productDetails = functions
  .runWith(runtimeOpts)
  .https.onRequest((request, response) => {
    cors(request, response, async () => {
      const shopifyDomain = functions.config().shopify.domain;
      const adminApiAccessToken = functions.config().shopify.admin_api_key;

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
            productType
            descriptionHtml
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              nodes {
                weight
                weightUnit
                inventoryItem {
                  inventoryLevels(first: 10) {
                    edges {
                      node {
                        id
                        quantities(names: "available") {
                          quantity
                        }
                        location {
                          name
                        }
                      }
                    }
                  }
                  variant {
                    price
                    compareAtPrice
                    id
                  }
                }
              }
            }
            metafields(first: 10, namespace: "warehouse") {
              nodes {
                id
                namespace
                key
                value
              }
            }
            tags
            compareAtPriceRange {
              minVariantCompareAtPrice {
                amount
                currencyCode
              }
            }
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
        console.log("Shopify API Response:", jsonResponse);
        response.send(jsonResponse);
      } catch (error) {
        console.error("Error:", error);
        response.status(500).send("Server error");
      }
    });
  });

module.exports = { productDetails };
