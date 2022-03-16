# Bulk Address Validation

A standalone service that allows you to validate addresses with caching functionality to ensure that we don't want to keep looking up the same address again and
again.

# 💡Tech Spec

- The endpoint should accept an array of addresses(assume max size: 5).
- API should handle errors - bad requests, not found etc.
- Storage in a database
- Establish a caching mechanism to avoid re-validating recently validated addresses.
- When the endpoint is hit lookup the previously validated address and if not found
  use any Maps API to validate it. The result should be stored for future look ups.
- Basic Testing

# 🖥️ Tech

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
