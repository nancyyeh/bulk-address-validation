# 📍 Bulk Address Validation

A standalone service that allows you to validate addresses with caching functionality to ensure that we don't want to keep looking up the same address again and
again.

Live Link[https://bulk-address-validation.herokuapp.com/]

# 🛠️ How to use

`Post` to `/validate` with array of address

Address must include

- address_line_one
- city
- state
- zip_code

Example Input

```
[{"address_line_one": "1600 Amphitheater Pkwy", "city": "Mountainview", "state": "CA", "zip_code":"94043"}, {"address_line_one": "One Apple Park Way", "city": "Cupertino", "state": "CA", "zip_code":"95014"}]
```

# 💡 Tech Spec

- The endpoint should accept an array of addresses(assume max size: 5).
- API should handle errors - bad requests, not found etc.
- Storage in a database
- Establish a caching mechanism to avoid re-validating recently validated addresses.
- When the endpoint is hit lookup the previously validated address and if not found
  use any Maps API to validate it. The result should be stored for future look ups.
- Basic Testing

# 🖥️ Tech Used

- Javascript, if time allowed, love to convert to Typescript
- Mongoose
- Jest & Supertest
- Smarty API endpoints

# 🚀 Launch

Run Dev: `npm run devStart`

Run Test: `npm run test`

.env file is needed, needs

- `DATABASE_URL`
- `SMARTY_AUTH_ID`
- `SMARTY_AUTH_TOKEN`
