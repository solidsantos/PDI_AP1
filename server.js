const express = require('express');
const app = express();
const imgC = require('./controllers/imagesController');
const path = require('path');
const bodyParser = require('body-parser');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res)=>{
    return res.render('index.ejs');
})
app.post('/upImage', imgC.new);
app.post('/brightness', imgC.brightness);
app.post('/invert', imgC.invert);


app.listen(8080);
console.log('the server is on!')