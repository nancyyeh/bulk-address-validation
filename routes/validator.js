const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  stringifyAddress,
  createSmartyBatch,
  getSmartyAddresses,
  addAddressesToDb,
  getAddress,
} = require("./helper/helper_functions");

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
      const addressData = await getAddress(addressString);

      if (addressData) {
        data.push(addressData);
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
