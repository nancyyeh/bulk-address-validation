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

const stringifyAddress = ({ line1, line2 = "", city, state, zip }) =>
  `${line1}${line2 ? ` ${line2}` : ""}, ${city}, ${state} ${zip}`;

async function createSmartyBatch(addresses) {
  const batch = new SmartyCore.Batch();
  for (const address of addresses) {
    const { address_line_one, city, state, zip_code } = address;

    const addressString = stringifyAddress({
      line1: address_line_one,
      city,
      state,
      zip: zip_code,
    });

    const addressInDB = await Address.findOne({
      input: addressString,
    }).exec();

    if (!addressInDB) {
      let lookup = new Lookup();
      lookup.street = address_line_one;
      lookup.city = city;
      lookup.state = state;
      lookup.zipCode = zip_code;
      batch.add(lookup);
    }
  }

  return batch;
}

async function getSmartyAddresses(batch) {
  if (batch.isEmpty()) {
    return [];
  }

  const result = await client.send(batch);
  const batchAddressData = result.lookups.map((lookup) => {
    let addressData = undefined;
    if (lookup.result && lookup.result.length) {
      const lookupResult = lookup.result[0];
      addressData = {
        address_line_one: lookupResult.deliveryLine1,
        city: lookupResult.components.cityName,
        state: lookupResult.components.state,
        zip_code: `${lookupResult.components.zipCode}-${lookupResult.components.plus4Code}`,
        latitude: lookupResult.metadata.latitude.toString(),
        longitude: lookupResult.metadata.longitude.toString(),
        input: stringifyAddress({
          line1: lookup.street,
          city: lookup.city,
          state: lookup.state,
          zip: lookup.zipCode,
        }),
      };
    }
    return addressData;
  });
  return batchAddressData;
}

async function addAddressesToDb(addresses) {
  for (const address of addresses) {
    if (address) {
      const {
        address_line_one: line1,
        city,
        state,
        zip_code: zip,
        latitude,
        longitude,
        input,
      } = address;
      await Address.create({
        line1,
        city,
        state,
        zip,
        latitude,
        longitude,
        input,
      });
    }
  }
}

router.post(
  "/",
  [
    body().isArray().notEmpty(),
    body(
      "*.address_line_one",
      "address_line_one is required, one must be a string."
    )
      .exists()
      .isString(),
    body("*.city", "city is required, must be a string.").exists().isString(),
    body("*.state", "state is required, and must be a string.")
      .exists()
      .isString(),
    body(
      "*.zip_code",
      "zip code is required, and must be a string and 5 characters."
    )
      .exists()
      .isString()
      .isLength({ min: 5, max: 5 }),
  ],
  async (req, res) => {
    const requestData = req.body;
    // Validate & take care of edge cases
    if (!requestData) {
      return res.status(204).json({ message: "There was no content sent" });
    }
    if (requestData && requestData.length > 5) {
      return res.status(400).json({
        errors: "You can only validate a max of 5 addresses at a time.",
      });
    }
    // Validate to ensure input is array and fit the requirements
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message:
          "There is a problem with the input data format, please check on it",
        errors: errors.array(),
      });
    }

    // Find those request data that's not in the db, and create the batch job of input address that's not in the db
    const batch = await createSmartyBatch(requestData);

    // If there is address that is not in the DB, valid it in Smarty
    let batchAddressData;
    try {
      batchAddressData = await getSmartyAddresses(batch);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Fail to validate addresses with Smarty",
      });
    }

    await addAddressesToDb(batchAddressData);

    // return data in the output format
    const data = [];
    for (const address of requestData) {
      const { address_line_one, city, state, zip_code } = address;
      const addressString = stringifyAddress({
        line1: address_line_one,
        city,
        state,
        zip: zip_code,
      });
      const addressDatainDB = await Address.findOne({
        input: addressString,
      }).exec();

      if (addressDatainDB) {
        data.push({
          address_line_one: addressDatainDB.line1,
          city: addressDatainDB.city,
          state: addressDatainDB.state,
          zip_code: addressDatainDB.zip,
          latitude: addressDatainDB.latitude,
          longitude: addressDatainDB.longitude,
          response: "Valid Address",
        });
      } else {
        data.push({ response: "Invalid Address" });
      }
    }

    return res.status(200).json({
      success: true,
      data,
    });
  }
);

module.exports = router;
