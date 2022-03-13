const express = require('express');
// const mongoose = require('mongoose');

const app = express();

//Middlewares

//ROUTES
app.get('/', (req, res) => {
    res.send('We are on home');
});

app.get('/test', (req, res) => {
    res.send('test');
});

//Connect to DB
// mongoose.connect()

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`You have been connected to the ${port}`));