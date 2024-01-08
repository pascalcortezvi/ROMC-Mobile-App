const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const checkCustomerExists = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const email = request.body.email;
    if (!email) {
      response.status(400).send("Email is required");
      return;
    }

    const shopifyDomain = functions.config().shopify.domain;
    const adminApiAccessToken = functions.config().shopify.admin_api_key;

    try {
      const customersResponse = await fetch(
        `https://${shopifyDomain}/admin/api/2023-10/customers/search.json?query=email:${email}`,
        {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": adminApiAccessToken,
            "Content-Type": "application/json",
          },
        }
      );

      const customersData = await customersResponse.json();

      if (customersData.customers && customersData.customers.length > 0) {
        response.send({ exists: true, customer: customersData.customers[0] });
      } else {
        response.send({ exists: false });
      }
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Internal server error");
    }
  });
});

module.exports = { checkCustomerExists };
