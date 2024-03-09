const multer = require('multer');
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
}


module.exports = new ImagesController();