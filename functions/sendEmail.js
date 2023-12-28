const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

const sendEmail = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    if (!request.body.productData) {
      response.status(400).send("Missing product data");
      return;
    }

    const product = request.body.productData;
    const quantity = product.quantity || 1;

    const metafields = product.metafields.nodes;
    const rackReference =
      metafields.find((m) => m.key === "rackreference")?.value || "N/A";
    const reference =
      metafields.find((m) => m.key === "reference")?.value || "N/A";
    const warehouseString = `Warehouse: ${rackReference} / ${reference}`;

    const mailOptions = {
      from: `In-Store`,
      to: "warehouse@musicredone.com",
      subject: `Please bring ${product.title} in-store`,
      text: `Product details:
Title: ${product.title}
${warehouseString}
Quantity Needed: ${quantity}
      `,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      console.log("Email sent to:", mailOptions.to);
      response.status(200).send("Email sent");
    } catch (error) {
      console.error("There was an error while sending the email:", error);
      response.status(500).send(error.toString());
    }
  });
});

module.exports = { sendEmail };
