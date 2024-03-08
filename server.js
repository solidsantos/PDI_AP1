const express = require('express');
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res)=>{
    return res.render('index.ejs');
})

app.listen(8080);
console.log('the server is on!')