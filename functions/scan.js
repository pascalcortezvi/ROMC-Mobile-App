const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const scan = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const shopifyDomain = "musique-red-one-music.myshopify.com";
    const adminApiAccessToken = "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";
    const upc = request.query.upc;

    console.log("Received UPC:", upc);

    if (!upc) {
      response.status(400).send("Missing UPC parameter");
      return;
    }

    const graphqlQuery = JSON.stringify({
      query: `query MyQuery {
        products(first: 1, query: "barcode:${upc}") {
          nodes {
            id
          }
        }
      }`,
    });

    console.log("GraphQL Query:", graphqlQuery);

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
      console.log("Shopify Response:", jsonResponse);

      if (jsonResponse.errors) {
        console.error("Shopify API Error:", jsonResponse.errors);
        response.status(500).send("Shopify API Error");
        return;
      }

      if (!jsonResponse.data || !jsonResponse.data.products) {
        console.error("Invalid response structure:", jsonResponse);
        response.status(500).send("Invalid response structure");
        return;
      }

      const nodes = jsonResponse.data.products.nodes;
      if (nodes.length > 0) {
        const productId = nodes[0].id;
        console.log("Product ID:", productId);
        response.send({ productId });
      } else {
        console.log("No product found for UPC:", upc);
        response.status(404).send("Product not found");
      }
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Server error");
    }
  });
});

module.exports = { scan };
