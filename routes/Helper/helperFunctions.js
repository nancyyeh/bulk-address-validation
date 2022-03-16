const Address = require("../../models/Address");

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

module.exports = {
  stringifyAddress,
  createSmartyBatch,
  getSmartyAddresses,
  addAddressesToDb,
};
