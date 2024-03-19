const path = require('path')
const Jimp = require('jimp');

class images{
    async brighten(imagePath, coef){
        try{
            let nCoef = parseFloat(coef)
            console.log(nCoef);
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                if(image.bitmap.data[idx]*nCoef > 255) image.bitmap.data[idx] = 255
                else image.bitmap.data[idx] *= nCoef;

                if(image.bitmap.data[idx + 1]*nCoef > 255) image.bitmap.data[idx + 1] = 255
                else image.bitmap.data[idx + 1] *= nCoef;

                if(image.bitmap.data[idx + 2]*nCoef > 255) image.bitmap.data[idx + 2] = 255
                else image.bitmap.data[idx + 2] *= nCoef;
            });
            await image.writeAsync(path.resolve('uploads', imagePath));
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    sobel(image){
        Jimp.read(path.resolve(image)).then(image => {
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx)=>{
                 
            })
        })
    }
}

module.exports = new images