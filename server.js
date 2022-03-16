const app = require("./app");

// Started Server
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`You have been connected to the port number:${port}`)
);
