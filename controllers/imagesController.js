const multer = require('multer');
const images = require('../services/images');
const mStorage = require('../services/multerConfig');
const upload = multer({storage: mStorage});

class ImagesController{
    async new(req, res){
        upload.single('image')(req, res, (err) => {
            const filename = req.file.filename;
            if(err) return res.status(400).json({ message: err.message });
            return res.status(200).json({link: filename});
        });
    }
    async brightness(req, res){
        const image = req.body;
        console.log(image);
        try{
            const result = await images.brighten(image.title, image.coef);
            return res.status(200).json({msg: 'sucesso!'});
        }catch(err){
            console.log(err);
            return res.status(500).json({msg: 'erro interno do servidor!'});
        }
    }
    async invert(req, res){
        const image = req.body;
        console.log(image);
        try{
            const result = await images.invert(image.title);
            return res.status(200).json({msg: 'sucesso!'});
        }catch(err){
            console.log(err);
            return res.status(500).json({msg: 'erro interno do servidor!'});
        }
    }
}


module.exports = new ImagesController();