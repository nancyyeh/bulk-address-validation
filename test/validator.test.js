const { mongoose } = require("mongoose");
const request = require("supertest");
const app = require("../app");

describe("validator", () => {
  const testData2 = [
    {
      address_line_one: "1600 Amphitheater Pkwy",
      city: "Mountainview",
      state: "CA",
      zip_code: "94043",
    },
    {
      address_line_one: "1600 Amphitheater Pkwy",
      city: "Mountainview",
      state: "CA",
      zip_code: "94043",
    },
    {
      address_line_one: "1600 Amphitheater Pkwy",
      city: "Mountainview",
      state: "CA",
      zip_code: "94043",
    },
    {
      address_line_one: "1600 Amphitheater Pkwy",
      city: "Mountainview",
      state: "CA",
      zip_code: "94043",
    },
    {
      address_line_one: "1600 Amphitheater Pkwy",
      city: "Mountainview",
      state: "CA",
      zip_code: "94043",
    },
    {
      address_line_one: "1600 Amphitheater Pkwy",
      city: "Mountainview",
      state: "CA",
      zip_code: "94043",
    },
  ];

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /", () => {
    test("the app is working", async () => {
      const response = await request(app).get("/");
      expect(response.statusCode).toBe(200);
    });
  });

  describe("POST /validate", () => {
    describe("Given a list of valid addresses", () => {
      // respond with a json object of success to address, lat and long
      test("should respond with a 200 status code", async () => {
        const testData1 = [
          {
            address_line_one: "1600 Amphitheater Pkwy",
            city: "Mountainview",
            state: "CA",
            zip_code: "94043",
          },
          {
            address_line_one: "One Apple Park Way",
            city: "Cupertino",
            state: "CA",
            zip_code: "95014",
          },
          {
            address_line_one: "test test",
            city: "Cupertino",
            state: "CA",
            zip_code: "90210",
          },
        ];

        const testData1ExpectedResponse = [
          {
            address_line_one: "1600 Amphitheatre Pkwy",
            city: "Mountain View",
            state: "CA",
            zip_code: "94043-1351",
            latitude: "37.42356",
            longitude: "-122.08652",
            response: "Valid Address",
          },
          {
            address_line_one: "1 Apple Park Way",
            city: "Cupertino",
            state: "CA",
            zip_code: "95014-0642",
            latitude: "37.33736",
            longitude: "-122.01471",
            response: "Valid Address",
          },
          {
            response: "Invalid Address",
          },
        ];

        const response = await request(app).post("/validate").send(testData1);

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toEqual(
          expect.stringContaining("json")
        );
        expect(response.body.data).toEqual(testData1ExpectedResponse);
      });
    });

    describe("When list is longer than 5 items", () => {
      // respond with status code 400
      test("should respond with a 400 status code", async () => {
        const response = await request(app).post("/validate").send(testData2);
        expect(response.statusCode).toBe(400);
      });
    });
  });
});
