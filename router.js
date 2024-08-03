const express = require('express');
const router = express.Router();
const imgC = require('./controllers/imagesController');
const path = require('path');

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));
router.get('/', (req, res)=>{ return res.render('index.ejs'); })

router.post('/upImage', imgC.new);
router.post('/upChroma', imgC.newChroma);
router.post('/brightness', imgC.brightness);
router.post('/sepia', imgC.sepia);
router.post('/gray', imgC.toGray);
router.post('/grayPond', imgC.toGrayW);
router.post('/log', imgC.log);
router.post('/gama', imgC.gama);
router.post('/histogramGraph', imgC.histogramGraph);
router.post('/binary', imgC.binary);
router.post('/meanSmoothing', imgC.meanSmoothing);
router.post('/invert', imgC.invert);
router.post('/sobel', imgC.sobel);
router.post('/sobelX', imgC.sobelX);
router.post('/sobelY', imgC.sobelY);
router.post('/rotate', imgC.rotation);
router.post('/laplaciano', imgC.laplaciano);
router.post('/hiboost', imgC.hiboost);
router.post('/adjustHsi', imgC.adjustHsi);
router.post('/chroma', imgC.chroma);
router.post('/spin', imgC.spin);
router.post('/spinIL', imgC.spinIL);
router.post('/scale', imgC.scale);
router.post('/scaleIL', imgC.scaleIL);

router.post('/encode', imgC.encode);
router.post('/decode', imgC.decode);
module.exports = router;