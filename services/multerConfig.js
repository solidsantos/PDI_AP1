const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback)=>{
        callback(null, path.resolve('uploads'));
    },
    filename: (req, file, callback)=>{
        const time = Date.now();
        callback(null, `${time}${file.originalname}`);
    }
})

module.exports = storage;