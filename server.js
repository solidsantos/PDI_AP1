const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const router = require('./router');
// TODO To add environment variables
const PORT = 8080;

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use('/', router);

app.listen(PORT);
console.log(`the server is running on http://localhost:${8080}/`);