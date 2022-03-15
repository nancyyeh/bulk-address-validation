const express = require("express");
const router = express.Router();
const Address = require("../models/Address");
const { body, validationResult } = require("express-validator");

const SmartySDK = require("smartystreets-javascript-sdk");
const SmartyCore = SmartySDK.core;
const Lookup = SmartySDK.usStreet.Lookup;

let authId = process.env.SMARTY_AUTH_ID;
let authToken = process.env.SMARTY_AUTH_TOKEN;
const credentials = new SmartyCore.StaticCredentials(authId, authToken);

let clientBuilder = new SmartyCore.ClientBuilder(credentials);
let client = clientBuilder.buildUsStreetApiClient();

router.post(
  "/",
  [
    body().isArray(),
    body("*.address_line_one", "address line one must be a string")
      .exists()
      .isString(),
    body("*.city", "city must be a string").exists().isString(),
    body("*.state", "state must be a string").exists().isString(),
    // NICE To Have validate that there is 5 character and all number.
    body("*.zip_code", "zip code must be a string and 5 characters")
      .exists()
      .isString()
      .isLength({ min: 5, max: 5 }),
  ],
  async (req, res) => {
    // Validate to ensure input is array and fit the requirements
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const inputData = req.body;

    let batch = new SmartyCore.Batch();
    for (const address of inputData) {
      const { address_line_one, city, state, zip_code } = address;
      let lookup = new Lookup();
      lookup.street = address_line_one;
      lookup.city = city;
      lookup.state = state;
      lookup.zipCode = zip_code;
      batch.add(lookup);
    }

    try {
      const result = await client.send(batch);
      const data = result.lookups.map((lookup) => {
        let addressData = undefined;
        if (lookup.result && lookup.result.length) {
          const lookupResult = lookup.result[0];
          addressData = {
            address_line_one: lookupResult.deliveryLine1,
            city: lookupResult.components.cityName,
            state: lookupResult.components.state,
            zip_code: `${lookupResult.components.zipCode}-${lookupResult.components.plus4Code}`,
            latitude: lookupResult.metadata.latitude,
            longitude: lookupResult.metadata.longitude,
          }
        }
        return addressData;
      });
      return res.json({ 
        success: true, 
        data,
        message: "Success" });
    } catch (err) {
      return res.json({ 
        success: false, 
        message: "Error" });
    }
  }
);

module.exports = router;
