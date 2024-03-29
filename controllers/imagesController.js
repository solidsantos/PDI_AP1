const multer = require('multer');
const images = require('../services/images');
const mStorage = require('../services/multerConfig');
const upload = multer({storage: mStorage});

class ImagesController{
    async new(req, res){
        upload.single('image')(req, res, (err) => {
            const filename = req.file.filename;
            res.setHeader('Cache-Control', 'no-cache');
            if(err) return res.status(400).json({ message: err.message });
            return res.status(200).json({link: filename});
        });
    }
    async brightness(req, res){
        const image = req.body;
        try{
            const result = await images.brighten(image.title, image.coef);
            res.setHeader('Cache-Control', 'no-cache');
            return res.status(200).json({msg: 'sucesso!'});
        }catch(err){
            console.log(err);
            return res.status(500).json({msg: 'erro interno do servidor!'});
        }
    }
    async invert(req, res){
        const image = req.body;
        try{
            const result = await images.invert(image.title);
            res.setHeader('Cache-Control', 'no-cache');
            return res.status(200).json({msg: 'sucesso!'});
        }catch(err){
            console.log(err);
            return res.status(500).json({msg: 'erro interno do servidor!'});
        }
    }
    async sobel(req, res){
        const image = req.body;
        try{
            const result = await images.sobel(image.title);
            return res.status(200).json({msg: 'sucesso!'});
        }catch(err){
            console.log(err);
            return res.status(500).json({msg: 'erro interno do servidor!'});
        }
    }
}


module.exports = new ImagesController();