const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

const login = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
      response.status(400).send("Missing email or password");
      return;
    }

    const shopifyDomain = functions.config().shopify.domain;
    const storefrontAccessToken = functions.config().shopify.storefront_api_key;

    // Step 1: Create customer access token
    const mutationQuery = JSON.stringify({
      query: `
        mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
          customerAccessTokenCreate(input: $input) {
            customerAccessToken {
              accessToken
              expiresAt
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          email: email,
          password: password,
        },
      },
    });

    try {
      const tokenResponse = await fetch(
        `https://${shopifyDomain}/api/2023-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            "Content-Type": "application/json",
          },
          body: mutationQuery,
        }
      );

      const tokenData = await tokenResponse.json();

      if (
        !tokenData.data ||
        !tokenData.data.customerAccessTokenCreate.customerAccessToken
      ) {
        response
          .status(401)
          .send(
            tokenData.data.customerAccessTokenCreate.customerUserErrors ||
              "Authentication failed"
          );
        return;
      }

      const accessToken =
        tokenData.data.customerAccessTokenCreate.customerAccessToken
          .accessToken;

      // Step 2: Fetch customer details including tags
      const customerQuery = JSON.stringify({
        query: `
          query customerQuery($accessToken: String!) {
            customer(customerAccessToken: $accessToken) {
              id
              tags
            }
          }
        `,
        variables: {
          accessToken: accessToken,
        },
      });

      const customerResponse = await fetch(
        `https://${shopifyDomain}/api/2023-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            "Content-Type": "application/json",
          },
          body: customerQuery,
        }
      );

      const customerData = await customerResponse.json();

      if (!customerData.data || !customerData.data.customer) {
        response.status(401).send("Failed to retrieve customer data");
        return;
      }

      // Send back the access token and customer tags
      response.send({
        accessToken: accessToken,
        tags: customerData.data.customer.tags || [],
      });
    } catch (error) {
      console.error("Error:", error);
      response.status(500).send("Internal server error");
    }
  });
});

module.exports = { login };
