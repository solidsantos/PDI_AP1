const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const router = require('./router');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use('/', router);

app.listen(8080);
console.log('the server ir running on port:8080!');