const express = require('express');
const router = express.Router();
const imgC = require('./controllers/imagesController');
const path = require('path');

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));
router.get('/', (req, res)=>{ return res.render('index.ejs'); })

router.post('/upImage', imgC.new);
router.post('/brightness', imgC.brightness);
router.post('/gama', imgC.gama);
router.post('/meanSmoothing', imgC.meanSmoothing);
router.post('/invert', imgC.invert);
router.post('/sobel', imgC.sobel);
router.post('/rotate', imgC.rotation);

module.exports = router;