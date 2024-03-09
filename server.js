const express = require('express');
const app = express();
const imgC = require('./controllers/imagesController');
const path = require('path');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res)=>{
    return res.render('index.ejs');
})
app.post('/upImage', imgC.new);

app.listen(8080);
console.log('the server is on!')