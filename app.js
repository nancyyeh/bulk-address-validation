const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");

app.use(express.json());

//Connect to DB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error("***ERROR***", error));
db.once("open", () => console.log("Connected to Database"));

//Import Routes
const usAddress = require("./routes/validator");

//Middlewares
app.use("/validate", usAddress);

//Routes
app.get("/", (req, res) => {
  res.send("This is Nancy's Bulk Address Validator Tool");
});

module.exports = app;
