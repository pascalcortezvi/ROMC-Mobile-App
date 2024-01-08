const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const createAccount = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const email = request.body.email;
    const password = request.body.password;

    const shopifyDomain = functions.config().shopify.domain;
    const adminApiAccessToken = functions.config().shopify.admin_api_key;

    const createCustomerEndpoint = `https://${shopifyDomain}/admin/api/2023-10/customers.json`;

    try {
      const customerResponse = await fetch(createCustomerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminApiAccessToken,
        },
        body: JSON.stringify({
          customer: {
            email: email,
            password: password,
            verified_email: true,
            send_email_welcome: false,
          },
        }),
      });

      const data = await customerResponse.json();

      if (!customerResponse.ok) {
        response.status(customerResponse.status).send(data);
        return;
      }

      response.send({
        message: "Customer created successfully",
        customer: data.customer,
      });
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Internal server error");
    }
  });
});

module.exports = { createAccount };
