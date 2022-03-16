const app = require("./app");

// Started Server
const port = process.env.PORT || 3000;
let server = app.listen(port, () =>
  console.log(`You have been connected to the port number:${port}`)
);

server.on("clientError", (err, socket) => {
  console.error(err);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
