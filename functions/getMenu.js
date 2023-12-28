const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const runtimeOpts = {
  minInstances: 5,
};

const getMenu = functions
  .runWith(runtimeOpts)
  .https.onRequest((request, response) => {
    cors(request, response, async () => {
      const shopifyDomain = functions.config().shopify.domain;
      const storefrontAccessToken =
        functions.config().shopify.storefront_api_key;

      // First GraphQL query to get menu items
      const menuQuery = JSON.stringify({
        query: `{
        menu(handle: "square-menu") {
          id
          items {
            title
            items {
              title
              url
            }
            url
          }
        }
      }`,
      });

      try {
        const menuResponse = await fetch(
          `https://${shopifyDomain}/api/2023-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
              "Content-Type": "application/json",
            },
            body: menuQuery,
          }
        );

        const menuData = await menuResponse.json();
        const menuItems = menuData.data.menu.items;

        // Prepare to fetch images for each menu item
        const imageFetchPromises = menuItems.map((menuItem) => {
          const handle = extractHandleFromURL(menuItem.url);

          // Second GraphQL query for each handle to get image
          const imageQuery = JSON.stringify({
            query: `{
            collectionByHandle(handle: "${handle}") {
              image {
                url
              }
            }
          }`,
          });

          return fetch(`https://${shopifyDomain}/api/2023-10/graphql.json`, {
            method: "POST",
            headers: {
              "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
              "Content-Type": "application/json",
            },
            body: imageQuery,
          }).then((response) =>
            response.json().then((data) => {
              // Check if the image object exists before trying to access it
              if (
                data &&
                data.data &&
                data.data.collectionByHandle &&
                data.data.collectionByHandle.image
              ) {
                return data.data.collectionByHandle.image.url;
              } else {
                // Handle the case where image is null or the structure is unexpected
                console.warn(`Image not found for handle: ${handle}`);
                return null; // or provide a default image URL
              }
            })
          );
        });

        // Resolve all image fetching promises
        const images = await Promise.all(imageFetchPromises);

        // Combine menu items with their images
        const combinedResults = menuItems.map((item, index) => ({
          ...item,
          imageUrl: images[index], // Add image URL to each menu item
        }));

        response.send(combinedResults); // Send combined results
      } catch (error) {
        console.error("Error:", error);
        response
          .status(500)
          .json({ error: "Server error", details: error.message });
      }
    });
  });

// Extract handle from the URL (assuming last segment after "/collections/")
function extractHandleFromURL(url) {
  const matches = url.match(/collections\/([^\/]+)$/);
  return matches ? matches[1] : null;
}

module.exports = { getMenu };
