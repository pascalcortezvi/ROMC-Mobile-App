const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const banner = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const shopifyDomain = "musique-red-one-music.myshopify.com";
    const storefrontAccessToken = "d9a30de63933c02111f631e6d17f9f07";

    const metaobjectId = "gid://shopify/Metaobject/22626598991";

    const graphqlQuery = JSON.stringify({
      query: `{
        metaobject(id: "gid://shopify/Metaobject/22626598991") {
          type
          fields {
            value
          }
        }
      }`,
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
      response.send(jsonResponse);
      console.log(jsonResponse);
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Server error");
    }
  });
});

module.exports = { banner };
