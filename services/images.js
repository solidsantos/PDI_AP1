const path = require('path')
const Jimp = require('jimp');
const { text } = require('body-parser');
let sufix = 0;

function rgbToHsi(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const intensity = (r + g + b) / 3;

    let min = Math.min(r, g, b);
    let saturation = 1 - min / intensity;
    if (intensity === 0) saturation = 0;

    let hue = 0;
    if (saturation !== 0) {
        hue = Math.acos(((r - g) + (r - b)) / (2 * Math.sqrt((r - g) ** 2 + (r - b) * (g - b))));
        if (b > g) {
            hue = 2 * Math.PI - hue;
        }
    }
    hue = hue / (2 * Math.PI);

    return [hue, saturation, intensity];
}

function hsiToRgb(h, s, i) {
    h = h * 2 * Math.PI;

    let r, g, b;

    if (h < 2 * Math.PI / 3) {
        b = i * (1 - s);
        r = i * (1 + s * Math.cos(h) / Math.cos(Math.PI / 3 - h));
        g = 3 * i - (r + b);
    } else if (h < 4 * Math.PI / 3) {
        h = h - 2 * Math.PI / 3;
        r = i * (1 - s);
        g = i * (1 + s * Math.cos(h) / Math.cos(Math.PI / 3 - h));
        b = 3 * i - (r + g);
    } else {
        h = h - 4 * Math.PI / 3;
        g = i * (1 - s);
        b = i * (1 + s * Math.cos(h) / Math.cos(Math.PI / 3 - h));
        r = 3 * i - (g + b);
    }

    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    b = Math.max(0, Math.min(1, b));

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function equalizeHistogram(intensityArray) {
    const histogram = new Array(256).fill(0);
    intensityArray.forEach(i => {
        histogram[Math.round(i * 255)]++;
    });

    const cdf = new Array(256).fill(0);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
    }

    const cdfMin = cdf.find(value => value !== 0);
    const totalPixels = intensityArray.length;
    const scaleFactor = 255 / (totalPixels - cdfMin);

    const equalizedArray = intensityArray.map(i => {
        const cdfValue = cdf[Math.round(i * 255)];
        return (cdfValue - cdfMin) * scaleFactor / 255;
    });

    return equalizedArray;
}

function binaryToAscii(binaryString) {
    const decimalValue = parseInt(binaryString, 2);
    return String.fromCharCode(decimalValue);
}

// Função para converter um caractere para binário
function charToBinary(char) {
    const asciiCode = char.charCodeAt(0);
    return asciiCode.toString(2).padStart(8, '0');
}

// Função para modificar o último bit de um byte
function modifyLastBit(byteString, newBits) {
    return byteString.slice(0, -2) + newBits;
}

// Função para converter a sequência binária em valores de pixels
function binaryToPixelArray(sequence) {
    return sequence.map(byte => parseInt(byte, 2));
}

// Função para converter um valor de 0-255 para binário de 8 bits
function valueToBinary(value) {
    return value.toString(2).padStart(8, '0');
}

function sliceBinaryText(text) {
    const firstSlice = text.slice(0, 2);
    const secondSlice = text.slice(2, 4);
    const thirdSlice = text.slice(4, 6);
    const fourthSlice = text.slice(6, 8);

    return {
        firstSlice,
        secondSlice,
        thirdSlice,
        fourthSlice,
    }
}

async function extractBinaryFromImage(imagePath) {
    try {
        // Lê a imagem
        const image = await Jimp.read(imagePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        let binaryString = '';

        // Lê cada pixel e extrai os valores RGBA
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = image.getPixelColor(x, y);
                const red = (color >> 24) & 0xFF;   // Canal vermelho
                const green = (color >> 16) & 0xFF; // Canal verde
                const blue = (color >> 8) & 0xFF;   // Canal azul
                const alpha = color & 0xFF;         // Canal alfa

                // Converte cada valor para binário e adiciona à sequência
                binaryString += valueToBinary(red);
                binaryString += valueToBinary(green);
                binaryString += valueToBinary(blue);
                binaryString += valueToBinary(alpha);
            }
        }

        // Divide a string binária em bytes
        const bytes = binaryString.match(/.{8}/g) || [];

        // Cria o array de sequência binária no formato desejado
        const formattedSequence = bytes.map(byte => `${byte}`);

        // Exibe o array no formato desejado
        return {
            width: width,
            height: height,
            value: formattedSequence
        };
    } catch (error) {
        console.error('Erro ao extrair sequência binária:', error);
    }
}

function byteToBinaryString(byte) {
    return byte.toString(2).padStart(8, '0');
}

class images {
    async brighten(imagePath, coef) {
        try {
            let nCoef = parseFloat(coef)
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                if (image.bitmap.data[idx] * nCoef > 255) image.bitmap.data[idx] = 255
                else image.bitmap.data[idx] *= nCoef;

                if (image.bitmap.data[idx + 1] * nCoef > 255) image.bitmap.data[idx + 1] = 255
                else image.bitmap.data[idx + 1] *= nCoef;

                if (image.bitmap.data[idx + 2] * nCoef > 255) image.bitmap.data[idx + 2] = 255
                else image.bitmap.data[idx + 2] *= nCoef;
            });
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    async sepia(imagePath) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];

            if (!this.convertIntoGray(imageBox, height, width)) return false;
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    let r = imageBox[i][j].r;
                    let g = imageBox[i][j].g;
                    let b = imageBox[i][j].b;

                    imageBox[i][j].r = 0.393 * r + 0.769 * g + 0.189 * b; if (imageBox[i][j].r > 255) imageBox[i][j].r = 255;
                    imageBox[i][j].g = 0.349 * r + 0.868 * g + 0.168 * b; if (imageBox[i][j].g > 255) imageBox[i][j].g = 255;
                    imageBox[i][j].b = 0.272 * r + 0.534 * g + 0.131 * b; if (imageBox[i][j].b > 255) imageBox[i][j].b = 255;
                }
            }
            const res = await this.saveImageBox(imagePath, imageBox);
            return res;
        } catch (err) {
            console.log(err)
            return false;
        }
    }
    async invert(imagePath) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                image.bitmap.data[idx] = Math.abs(image.bitmap.data[idx] - 255);
                image.bitmap.data[idx + 1] = Math.abs(image.bitmap.data[idx + 1] - 255);
                image.bitmap.data[idx + 2] = Math.abs(image.bitmap.data[idx + 2] - 255);
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async laplaciano(imagePath) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let laplaceMask = JSON.parse(JSON.stringify(imageBox));
            let min = { r: 256, g: 256, b: 256 }
            for (let i = 1; i < height - 1; i++) {
                for (let j = 1; j < width - 1; j++) {
                    laplaceMask[i][j].r = -4 * imageBox[i][j].r + imageBox[i - 1][j].r + imageBox[i + 1][j].r + imageBox[i][j - 1].r + imageBox[i][j + 1].r;
                    laplaceMask[i][j].g = -4 * imageBox[i][j].g + imageBox[i - 1][j].g + imageBox[i + 1][j].g + imageBox[i][j - 1].g + imageBox[i][j + 1].g;
                    laplaceMask[i][j].b = -4 * imageBox[i][j].b + imageBox[i - 1][j].b + imageBox[i + 1][j].b + imageBox[i][j - 1].b + imageBox[i][j + 1].b;

                    laplaceMask[i][j].r = Math.max(0, Math.min(laplaceMask[i][j].r, 255));
                    laplaceMask[i][j].g = Math.max(0, Math.min(laplaceMask[i][j].g, 255));
                    laplaceMask[i][j].b = Math.max(0, Math.min(laplaceMask[i][j].b, 255));

                    /*if(laplaceMask[i][j].r < min.r) min.r = laplaceMask[i][j].r;
                    if(laplaceMask[i][j].g < min.g) min.g = laplaceMask[i][j].g;
                    if(laplaceMask[i][j].b < min.b) min.b = laplaceMask[i][j].b; */
                }
            }
            /*
            for(let i=1; i<height-1; i++){
                for(let j=1; j<width-1; j++){
                    laplaceMask[i][j].r = laplaceMask[i][j].r + (-1)*min.r;
                    if(laplaceMask[i][j].r > 255) laplaceMask[i][j].r = 255;
                    laplaceMask[i][j].g = laplaceMask[i][j].g + (-1)*min.g;
                    if(laplaceMask[i][j].g > 255) laplaceMask[i][j].g = 255;
                    laplaceMask[i][j].b = laplaceMask[i][j].b + (-1)*min.b;
                    if(laplaceMask[i][j].b > 255) laplaceMask[i][j].b = 255;
                }
            }*/
            for (let i = 1; i < height - 1; i++) {
                for (let j = 0; j < width - 1; j++) {
                    imageBox[i][j].r -= laplaceMask[i][j].r;
                    imageBox[i][j].r = Math.max(0, Math.min(imageBox[i][j].r, 255));

                    imageBox[i][j].g -= laplaceMask[i][j].g;
                    imageBox[i][j].g = Math.max(0, Math.min(imageBox[i][j].g, 255));

                    imageBox[i][j].b -= laplaceMask[i][j].b;
                    imageBox[i][j].b = Math.max(0, Math.min(imageBox[i][j].b, 255));
                }
            }
            const res = await this.saveImageBox(imagePath, imageBox);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async hiboost(imagePath) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let blurred = [];
            let filterImage = [];
            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 };
                    let count = 0;
                    for (let k = -1; k <= 1; k++) {
                        for (let l = -1; l <= 1; l++) {
                            if (i + k >= 0 && i + k < height && j + l >= 0 && j + l < width) {
                                pixel.r += imageBox[i + k][j + l].r;
                                pixel.g += imageBox[i + k][j + l].g;
                                pixel.b += imageBox[i + k][j + l].b;
                                count++;
                            }
                        }
                    }
                    pixel.r /= count;
                    pixel.g /= count;
                    pixel.b /= count;

                    pixel.r = Math.round(pixel.r);
                    pixel.g = Math.round(pixel.g);
                    pixel.b = Math.round(pixel.b);
                    line.push(pixel);
                }
                blurred.push(line);
            }
            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 };
                    pixel.r = Math.max(0, Math.min(imageBox[i][j].r - blurred[i][j].r, 255));
                    pixel.g = Math.max(0, Math.min(imageBox[i][j].g - blurred[i][j].g, 255));
                    pixel.b = Math.max(0, Math.min(imageBox[i][j].b - blurred[i][j].b, 255));
                    line.push(pixel);
                }
                filterImage.push(line);
            }
            const res = await this.saveImageBox(imagePath, filterImage);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async log(imagePath, coef) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 }
                    pixel.r = coef * Math.log(imageBox[i][j].r + 1);
                    pixel.g = coef * Math.log(imageBox[i][j].g + 1);
                    pixel.b = coef * Math.log(imageBox[i][j].b + 1);
                    line.push(pixel);
                }
                imageResult.push(line);
            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async gama(imagePath, coef) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 };
                    pixel.r = Math.pow(imageBox[i][j].r / 255, coef);
                    pixel.g = Math.pow(imageBox[i][j].g / 255, coef);
                    pixel.b = Math.pow(imageBox[i][j].b / 255, coef);

                    pixel.r *= 255;
                    pixel.b *= 255;
                    pixel.g *= 255;

                    pixel.r = parseInt(pixel.r);
                    pixel.b = parseInt(pixel.b);
                    pixel.g = parseInt(pixel.g);

                    line.push(pixel);
                }
                imageResult.push(line);

            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async histogramGraph(imagePath) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let histogram = {
                width: width,
                height: height,
                red: Array(256).fill(0),
                green: Array(256).fill(0),
                blue: Array(256).fill(0)
            };
            console.log(imageBox[0][0].r);
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    histogram.red[imageBox[i][j].r]++;
                    histogram.green[imageBox[i][j].g]++;
                    histogram.blue[imageBox[i][j].b]++;
                }
            }
            let totalPixels = width * height;
            for (let i = 0; i < 256; i++) {
                histogram.red[i] /= totalPixels;
                histogram.green[i] /= totalPixels;
                histogram.blue[i] /= totalPixels;
            }
            return histogram;
        } catch (err) {
            console.log(err);
        }
    }
    async binary(imagePath, coef) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 };
                    if (imageBox[i][j].r > coef) pixel.r = 255;
                    else pixel.r = 0;
                    if (imageBox[i][j].g > coef) pixel.g = 255;
                    else pixel.g = 0;
                    if (imageBox[i][j].b > coef) pixel.b = 255;
                    else pixel.b = 0;
                    line.push(pixel);
                }
                imageResult.push(line);
            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }

    }
    async sobel(imagePath, arg) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            const imageSobel = await Jimp.create(image.bitmap.width, image.bitmap.height);
            const imageSobelX = await Jimp.create(image.bitmap.width, image.bitmap.height);
            const imageSobelY = await Jimp.create(image.bitmap.width, image.bitmap.height);

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = [
                    this.bitmap.data[idx],
                    this.bitmap.data[idx + 1],
                    this.bitmap.data[idx + 2],
                ];
                const gray = 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
                image.setPixelColor(Jimp.rgbaToInt(gray, gray, gray, 255), x, y);
            });
            await image.writeAsync('uploads/mid.jpg');
            image.scan(1, 1, image.bitmap.width - 2, image.bitmap.height - 2, function (x, y, idx) {
                const sobelX = (
                    -image.bitmap.data[((y - 1) * image.bitmap.width + x - 1) * 4] +
                    image.bitmap.data[((y - 1) * image.bitmap.width + x + 1) * 4] +
                    -2 * image.bitmap.data[((y) * image.bitmap.width + x - 1) * 4] +
                    2 * image.bitmap.data[((y) * image.bitmap.width + x + 1) * 4] +
                    -image.bitmap.data[((y + 1) * image.bitmap.width + x - 1) * 4] +
                    image.bitmap.data[((y + 1) * image.bitmap.width + x + 1) * 4]
                );
                const sobelY = (
                    -image.bitmap.data[((y - 1) * image.bitmap.width + x - 1) * 4] +
                    -2 * image.bitmap.data[((y - 1) * image.bitmap.width + x) * 4] +
                    -image.bitmap.data[((y - 1) * image.bitmap.width + x + 1) * 4] +
                    image.bitmap.data[((y + 1) * image.bitmap.width + x - 1) * 4] +
                    2 * image.bitmap.data[((y + 1) * image.bitmap.width + x) * 4] +
                    image.bitmap.data[((y + 1) * image.bitmap.width + x + 1) * 4]
                );

                let magnitudeX = Math.abs(sobelX);
                let magnitudeY = Math.abs(sobelY);

                magnitudeX = Math.floor(magnitudeX);
                if (magnitudeX < 0) magnitudeX = 0;
                if (magnitudeX > 255) magnitudeX = 255;

                magnitudeY = Math.floor(magnitudeY);
                if (magnitudeY < 0) magnitudeY = 0;
                if (magnitudeY > 255) magnitudeY = 255;

                const grayValueX = Jimp.rgbaToInt(magnitudeX, magnitudeX, magnitudeX, 255);
                const grayValueY = Jimp.rgbaToInt(magnitudeY, magnitudeY, magnitudeY, 255);

                imageSobelX.setPixelColor(grayValueX, x, y);
                imageSobelY.setPixelColor(grayValueY, x, y);

                let magnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
                magnitude = Math.floor(magnitude);
                if (magnitude < 0) magnitude = 0;
                if (magnitude > 255) magnitude = 255;

                const grayValue = Jimp.rgbaToInt(magnitude, magnitude, magnitude, 255);
                imageSobel.setPixelColor(grayValue, x, y);
            });
            sufix++;
            if (arg == 'x') await imageSobelX.writeAsync(`uploads/output${sufix}.jpg`);
            else if (arg == 'y') await imageSobelY.writeAsync(`uploads/output${sufix}.jpg`);
            else await imageSobel.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (error) {
            console.error('Error:', error);
        }
    }
    async meanSmoothing(imagePath, coef) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            function getMean(pixels) {
                const totalPixels = pixels.length;
                let sumR = 0, sumG = 0, sumB = 0;
                for (const pixel of pixels) {
                    sumR += pixel.r;
                    sumG += pixel.g;
                    sumB += pixel.b;
                }
                const meanR = Math.floor(sumR / totalPixels);
                const meanG = Math.floor(sumG / totalPixels);
                const meanB = Math.floor(sumB / totalPixels);
                return { r: meanR, g: meanG, b: meanB };
            }
            function getNeighbors(i, j) {
                const neighbor = [];
                for (let k = Math.max(0, i - coef); k <= Math.min(height - 1, i + coef); k++) {
                    for (let l = Math.max(0, j - coef); l <= Math.min(width - 1, j + coef); l++) {
                        neighbor.push(imageBox[k][l]);
                    }
                }
                return neighbor;
            }
            for (let i = 0; i < height; i++) {
                const line = [];
                for (let j = 0; j < width; j++) {
                    const neighbor = getNeighbors(i, j);
                    const mean = getMean(neighbor);
                    line.push(mean);
                }
                imageResult.push(line);
            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async gaussSmoothing(imagePath, coef) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            let center = Math.floor(coef / 2);
            let mask = this.getTypicalMask(coef, center);

            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let sum = 0;
                    let pixel = { r: 0, g: 0, b: 0 };
                    for (let m = 0; m < coef; m++) {
                        for (let n = 0; n < coef; n++) {
                            let rowIndex = i - center + m;
                            let colIndex = j - center + n;
                            if (rowIndex >= 0 && rowIndex < height && colIndex >= 0 && colIndex < width) {
                                pixel.r += imageBox[rowIndex][colIndex].r * mask[m][n];
                                pixel.g += imageBox[rowIndex][colIndex].g * mask[m][n];
                                pixel.b += imageBox[rowIndex][colIndex].b * mask[m][n];
                            }
                        }
                    }
                    line.push(pixel);
                }
                imageResult.push(line);
            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async filterOpen(imagePath, coef, filter) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            let center = Math.floor(coef / 2);
            const numbers = filter.split(',').map(Number);

            if (numbers.length < coef * coef) {
                throw new Error('Números insuficientes para preencher a matriz.');
                return false;
            }
            const mask = [];
            for (let i = 0; i < coef; i++) {
                const row = [];
                for (let j = 0; j < coef; j++) {
                    row.push(numbers[i * coef + j]);
                }
                mask.push(row);
            }

            const maskSum = numbers.reduce((sum, val) => sum + val, 0);
            const normalize = maskSum !== 0 ? maskSum : 1;

            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 };
                    for (let m = 0; m < coef; m++) {
                        for (let n = 0; n < coef; n++) {
                            let rowIndex = i - center + m;
                            let colIndex = j - center + n;
                            if (rowIndex >= 0 && rowIndex < height && colIndex >= 0 && colIndex < width) {
                                pixel.r += imageBox[rowIndex][colIndex].r * mask[m][n];
                                pixel.g += imageBox[rowIndex][colIndex].g * mask[m][n];
                                pixel.b += imageBox[rowIndex][colIndex].b * mask[m][n];
                            }
                        }
                    }
                    pixel.r = Math.min(Math.max(Math.round(pixel.r / normalize), 0), 255);
                    pixel.g = Math.min(Math.max(Math.round(pixel.g / normalize), 0), 255);
                    pixel.b = Math.min(Math.max(Math.round(pixel.b / normalize), 0), 255);
                    line.push(pixel);
                }
                imageResult.push(line);
            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async toGray(imagePath) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let imageResult = [];
            for (let i = 0; i < height; i++) {
                let line = [];
                for (let j = 0; j < width; j++) {
                    let pixel = { r: 0, g: 0, b: 0 };
                    let mean = (imageBox[i][j].r + imageBox[i][j].g + imageBox[i][j].b) / 3;
                    pixel.r = mean;
                    pixel.g = mean;
                    pixel.b = mean;
                    line.push(pixel);
                }
                imageResult.push(line);
            }
            const res = await this.saveImageBox(imagePath, imageResult);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }

    }
    async toGrayWeighted(imagePath) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            if (!this.convertIntoGray(imageBox, height, width)) return false;
            const res = await this.saveImageBox(imagePath, imageBox);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    getTypicalMask(n, center) {
        let mask = [];
        for (let i = 0; i < n; i++) {
            mask[i] = new Array(n).fill(0);
        }
        let total_weight = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let x = i - center;
                let y = j - center;
                mask[i][j] = Math.exp(-(x ** 2 + y ** 2) / 2);
                total_weight += mask[i][j];
            }
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                mask[i][j] /= total_weight;
            }
        }
        return mask;
    }
    async adjustHSI(imagePath, hCoef, sCoef, iCoef) {
        try {
            let { imageBox, height, width } = await this.createImageBoxHSI(imagePath);
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    imageBox[i][j].h += hCoef; if (imageBox[i][j].h > 360) imageBox[i][j].h = 360; else if (imageBox[i][j].h < 0) imageBox[i][j].h = 0;
                    imageBox[i][j].s *= sCoef; if (imageBox[i][j].s > 1) imageBox[i][j].s = 1; else if (imageBox[i][j].s < 0) imageBox[i][j].s = 0;
                    imageBox[i][j].i *= iCoef; if (imageBox[i][j].i > 1) imageBox[i][j].i = 1; else if (imageBox[i][j].i < 0) imageBox[i][j].i = 0;
                }
            }
            const res = await this.saveImageBoxHsi(imagePath, imageBox, height, width);
            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async chroma(imagePath, imagePathBG, { r, g, b }, range) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let result = await this.createImageBox(imagePathBG);
            let { bgImageBox, bgHeight, bgWidth } = {}
            bgImageBox = result.imageBox;
            bgHeight = result.height;
            bgWidth = result.width;
            console.log({ bgHeight, bgWidth })
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    let distance = Math.sqrt((r - imageBox[i][j].r) ** 2 + (g - imageBox[i][j].g) ** 2 + (b - imageBox[i][j].b) ** 2);
                    if (distance <= range && i < bgHeight && j < bgWidth) {
                        imageBox[i][j].r = bgImageBox[i][j].r;
                        imageBox[i][j].g = bgImageBox[i][j].g;
                        imageBox[i][j].b = bgImageBox[i][j].b;
                    }
                }
            }

            const res = await this.saveImageBox(imagePath, imageBox);
            return res;
        } catch (err) {
            console.log(err);
            return false
        }
    }
    async rotate(imagePath, ang, rp) {
        try {
            let imageBox = await this.createImageBox(imagePath);
            let imageRot = rotacao(imageBox, ang, rp);
            let res = await this.saveImageBox('uploads/output.jpg', imageRot);
            return res;

        } catch (err) {
            console.log(err);
            return false;
        }

        function rotacao(im, ang, pv) {
            const pi = Math.PI;
            ang = ang * (pi / 180);

            const t = [
                [1, 0, -pv[0]],
                [0, 1, -pv[1]],
                [0, 0, 1]
            ];

            const r = [
                [Math.cos(ang), -Math.sin(ang), 0],
                [Math.sin(ang), Math.cos(ang), 0],
                [0, 0, 1]
            ];

            const tm = [
                [1, 0, pv[0]],
                [0, 1, pv[1]],
                [0, 0, 1]
            ];

            const tr = multiplyMatrices(multiplyMatrices(tm, r), t);

            const p1 = transforma(1, 1, tr);
            const p2 = transforma(1, 256, tr);
            const p3 = transforma(256, 256, tr);
            const p4 = transforma(256, 1, tr);

            const minx = Math.min(p1[0], p2[0], p3[0], p4[0]);
            const maxx = Math.max(p1[0], p2[0], p3[0], p4[0]);
            const miny = Math.min(p1[1], p2[1], p3[1], p4[1]);
            const maxy = Math.max(p1[1], p2[1], p3[1], p4[1]);

            const tmin = [
                [1, 0, minx],
                [0, 1, miny],
                [0, 0, 1]
            ];

            const tr2 = multiplyMatrices(multiplyMatrices(multiplyMatrices(tm, r), t), tmin);

            const linhas = Math.round(maxy - miny);
            const colunas = Math.round(maxx - minx);
            const img = new Array(linhas).fill(0).map(() => new Array(colunas).fill(0));

            for (let l = 0; l < img.length; l++) {
                for (let c = 0; c < img[0].length; c++) {
                    const pt = transforma(c + 1, l + 1, tr2);
                    const lo = pt[0];
                    const co = pt[1];
                    if (lo >= 1 && lo <= im.length && co >= 1 && co <= im[0].length) {
                        img[l][c] = im[Math.round(lo) - 1][Math.round(co) - 1];
                    }
                }
            }

            return img;
        }
        function transforma(linha, coluna, m) {
            const pc = [coluna, linha, 1];
            const pt = multiplyMatrices([pc], m);
            return [pt[0][0], pt[0][1]];
        }
        function multiplyMatrices(m1, m2) {
            const result = [];
            for (let i = 0; i < m1.length; i++) {
                result[i] = [];
                for (let j = 0; j < m2[0].length; j++) {
                    let sum = 0;
                    for (let k = 0; k < m1[0].length; k++) {
                        sum += m1[i][k] * m2[k][j];
                    }
                    result[i][j] = sum;
                }
            }
            return result;
        }
    }
    async spin(imagePath, angle) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let zRad = angle * (Math.PI) / 180;
            let diag = Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2));
            diag = Math.floor(diag)
            //            let maxHei = diag; let maxWid = diag;
            let maxHei = Math.abs(width * Math.sin(zRad)) + Math.abs(height * Math.cos(zRad));
            let maxWid = Math.abs(width * Math.cos(zRad)) + Math.abs(height * Math.sin(zRad));
            maxHei = Math.ceil(maxHei);
            maxWid = Math.ceil(maxWid);

            console.log(maxHei, maxWid);

            let result = []
            for (let i = 0; i < maxHei; i++) {
                result[i] = []
                for (let j = 0; j < maxWid; j++) {
                    let pixel = { r: 255, g: 255, b: 255 };
                    let x = Math.round((j - maxWid / 2) * Math.cos(-zRad) - (i - maxHei / 2) * Math.sin(-zRad) + width / 2);
                    let y = Math.round((j - maxWid / 2) * Math.sin(-zRad) + (i - maxHei / 2) * Math.cos(-zRad) + height / 2);
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        pixel = imageBox[y][x];
                    }
                    result[i][j] = pixel;
                }
            }
            let res = false;
            const newImage = await new Jimp(maxWid, maxHei, 0xFFFFFFFF);
            await newImage.writeAsync('./uploads/new-img.png');

            const image = await Jimp.read(path.resolve('uploads', 'new-img.png'));


            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = result[y][x];
                this.bitmap.data[idx] = pixel.r;
                this.bitmap.data[idx + 1] = pixel.g;
                this.bitmap.data[idx + 2] = pixel.b;
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.log('erro na excução do giro de imagem:');
            console.log(err);
            return false;
        }
    }
    async spinIL(imagePath, angle) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            let zRad = angle * (Math.PI) / 180;
            let maxHei = Math.abs(width * Math.sin(zRad)) + Math.abs(height * Math.cos(zRad));
            let maxWid = Math.abs(width * Math.cos(zRad)) + Math.abs(height * Math.sin(zRad));
            let centerX = width / 2;
            let centerY = height / 2;
            let newCenterX = maxWid / 2;
            let newCenterY = maxHei / 2;

            let result = [];
            for (let i = 0; i < Math.ceil(maxHei); i++) {
                result[i] = [];
                for (let j = 0; j < Math.ceil(maxWid); j++) {
                    let origX = (j - newCenterX) * Math.cos(-zRad) - (i - newCenterY) * Math.sin(-zRad) + centerX;
                    let origY = (j - newCenterX) * Math.sin(-zRad) + (i - newCenterY) * Math.cos(-zRad) + centerY;

                    let x1 = Math.floor(origX);
                    let y1 = Math.floor(origY);
                    let x2 = Math.ceil(origX);
                    let y2 = Math.ceil(origY);

                    let Q11 = (x1 >= 0 && y1 >= 0 && x1 < width && y1 < height) ? imageBox[y1][x1] : { r: 255, g: 255, b: 255 };
                    let Q21 = (x2 >= 0 && y1 >= 0 && x2 < width && y1 < height) ? imageBox[y1][x2] : { r: 255, g: 255, b: 255 };
                    let Q12 = (x1 >= 0 && y2 >= 0 && x1 < width && y2 < height) ? imageBox[y2][x1] : { r: 255, g: 255, b: 255 };
                    let Q22 = (x2 >= 0 && y2 >= 0 && x2 < width && y2 < height) ? imageBox[y2][x2] : { r: 255, g: 255, b: 255 };

                    let dx = origX - x1;
                    let dy = origY - y1;

                    let pixel = {
                        r: Math.round((Q11.r * (1 - dx) * (1 - dy)) + (Q21.r * dx * (1 - dy)) + (Q12.r * (1 - dx) * dy) + (Q22.r * dx * dy)),
                        g: Math.round((Q11.g * (1 - dx) * (1 - dy)) + (Q21.g * dx * (1 - dy)) + (Q12.g * (1 - dx) * dy) + (Q22.g * dx * dy)),
                        b: Math.round((Q11.b * (1 - dx) * (1 - dy)) + (Q21.b * dx * (1 - dy)) + (Q12.b * (1 - dx) * dy) + (Q22.b * dx * dy))
                    };

                    result[i][j] = pixel;
                }
            }

            const newImage = await new Jimp(maxWid, maxHei, 0xFFFFFFFF);
            await newImage.writeAsync('./uploads/new-img.png');

            const image = await Jimp.read(path.resolve('uploads', 'new-img.png'));


            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = result[y][x];
                this.bitmap.data[idx] = pixel.r;
                this.bitmap.data[idx + 1] = pixel.g;
                this.bitmap.data[idx + 2] = pixel.b;
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async scale(imagePath, scale) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);
            console.log(scale);
            let newWidth = Math.floor(width * scale);
            let newHeight = Math.floor(height * scale);

            let result = [];
            for (let i = 0; i < newHeight; i++) {
                result[i] = [];
                for (let j = 0; j < newWidth; j++) {
                    let origX = Math.floor(j / scale);
                    let origY = Math.floor(i / scale);

                    if (origX >= 0 && origX < width && origY >= 0 && origY < height) {
                        result[i][j] = imageBox[origY][origX];
                    } else {
                        result[i][j] = { r: 255, g: 255, b: 255 };
                    }
                }
            }
            console.log(newWidth, newHeight);
            const newImage = await new Jimp(newWidth, newHeight, 0xFFFFFFFF);
            await newImage.writeAsync('./uploads/new-img.png');

            const image = await Jimp.read(path.resolve('uploads', 'new-img.png'));

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = result[y][x];
                this.bitmap.data[idx] = pixel.r;
                this.bitmap.data[idx + 1] = pixel.g;
                this.bitmap.data[idx + 2] = pixel.b;
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;

        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async scaleIL(imagePath, scale) {
        try {
            let { imageBox, height, width } = await this.createImageBox(imagePath);

            let newWidth = Math.floor(width * scale);
            let newHeight = Math.floor(height * scale);

            let result = [];

            for (let i = 0; i < newHeight; i++) {
                result[i] = [];
                for (let j = 0; j < newWidth; j++) {
                    let origX = j / scale;
                    let origY = i / scale;

                    let x1 = Math.floor(origX);
                    let y1 = Math.floor(origY);
                    let x2 = Math.ceil(origX);
                    let y2 = Math.ceil(origY);

                    let Q11 = (x1 >= 0 && y1 >= 0 && x1 < width && y1 < height) ? imageBox[y1][x1] : { r: 255, g: 255, b: 255 };
                    let Q21 = (x2 >= 0 && y1 >= 0 && x2 < width && y1 < height) ? imageBox[y1][x2] : { r: 255, g: 255, b: 255 };
                    let Q12 = (x1 >= 0 && y2 >= 0 && x1 < width && y2 < height) ? imageBox[y2][x1] : { r: 255, g: 255, b: 255 };
                    let Q22 = (x2 >= 0 && y2 >= 0 && x2 < width && y2 < height) ? imageBox[y2][x2] : { r: 255, g: 255, b: 255 };

                    let dx = origX - x1;
                    let dy = origY - y1;

                    let pixel = {
                        r: Math.round((Q11.r * (1 - dx) * (1 - dy)) + (Q21.r * dx * (1 - dy)) + (Q12.r * (1 - dx) * dy) + (Q22.r * dx * dy)),
                        g: Math.round((Q11.g * (1 - dx) * (1 - dy)) + (Q21.g * dx * (1 - dy)) + (Q12.g * (1 - dx) * dy) + (Q22.g * dx * dy)),
                        b: Math.round((Q11.b * (1 - dx) * (1 - dy)) + (Q21.b * dx * (1 - dy)) + (Q12.b * (1 - dx) * dy) + (Q22.b * dx * dy))
                    };

                    result[i][j] = pixel;
                }
            }

            const newImage = await new Jimp(newWidth, newHeight, 0xFFFFFFFF);
            await newImage.writeAsync('./uploads/new-img.png');
            const image = await Jimp.read(path.resolve('uploads', 'new-img.png'));

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = result[y][x];
                this.bitmap.data[idx] = pixel.r;
                this.bitmap.data[idx + 1] = pixel.g;
                this.bitmap.data[idx + 2] = pixel.b;
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async cmy(imagePath, c, m, y) {
        let { imageBox, height, width } = await this.createImageBox(imagePath);
        let result = []
        for (let i = 0; i < height; i++) {
            let line = [];
            for (let j = 0; j < width; j++) {
                let pixel = { r: 0, g: 0, b: 0 };
                pixel.r = imageBox[i][j].r * (1 - c);
                pixel.g = imageBox[i][j].g * (1 - m);
                pixel.b = imageBox[i][j].b * (1 - y);
                line.push(pixel);
            }
            result.push(line);
        }
        const res = await this.saveImageBox(imagePath, result);
        return res;
    }
    async createImageBox(imagePath) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            let height = image.bitmap.height; let width = image.bitmap.width;
            let imageBox = [];
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = {
                    r: this.bitmap.data[idx],
                    g: this.bitmap.data[idx + 1],
                    b: this.bitmap.data[idx + 2]
                };
                if (!imageBox[y]) {
                    imageBox[y] = [];
                }
                imageBox[y][x] = pixel;
            })
            let result = { imageBox, height, width };
            return result;
        } catch (err) {
            console.log('erro na criação da imagem no createImageBox:');
            console.log(err);
            return null;
        }


    }
    async createImageBoxHSI(imagePath) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            let height = image.bitmap.height; let width = image.bitmap.width;
            let imageBox = [];
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {

                let r = this.bitmap.data[idx];
                let g = this.bitmap.data[idx + 1];
                let b = this.bitmap.data[idx + 2];

                r = r / 255.0;
                g = g / 255.0;
                b = b / 255.0;

                let i = (r + g + b) / 3;
                let s = (i == 0) ? 0 : 1 - (Math.min(r, g, b) / i);
                let h;
                if (s == 0 || (r == g && r == b)) h = 0;
                else {
                    const teta = Math.acos((0.5 * ((r - g) + (r - b))) / Math.sqrt((r - g) ** 2 + (r - b) * (g - b)));
                    if (b <= g) h = teta;
                    else h = 2 * Math.PI - teta;
                    h = (h * 180) / Math.PI;
                }


                const pixel = {
                    h: h,
                    s: s,
                    i: i
                };
                if (!imageBox[y]) {
                    imageBox[y] = [];
                }
                imageBox[y][x] = pixel;
            })
            let result = { imageBox, height, width };
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }


    }
    createImageColor(height, width, color) {
        let imageBox = [];
        const pixel = { r: color, g: color, b: color };
        for (let i = 0; i < height; i++) {
            imageBox[i] = [];
            for (let j = 0; j < width; j++) {
                imageBox[i][j] = pixel;
            }
        }
        return imageBox;
    }
    async saveImageBox(imagePath, imageBox) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = imageBox[y][x];
                this.bitmap.data[idx] = pixel.r;
                this.bitmap.data[idx + 1] = pixel.g;
                this.bitmap.data[idx + 2] = pixel.b;
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.log('erro no saveImageBox:');
            console.log(err)
            return false;
        }
    }

    async saveImageBoxHsi(imagePath, imageBox, height, width) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            ///let resultImage = this.createImageColor(height, width, -1);
            let resultImage = [];
            for (let j = 0; j < height; j++) {
                resultImage[j] = [];
                for (let k = 0; k < width; k++) {
                    let h = imageBox[j][k].h; let s = imageBox[j][k].s; let i = imageBox[j][k].i;
                    let r, g, b;
                    let pixel = {}

                    h = h * Math.PI / 180;

                    if (h >= 0 && h < 2 * Math.PI / 3) {
                        b = i * (1 - s);
                        r = i * (1 + (s * Math.cos(h) / Math.cos(Math.PI / 3 - h)));
                        g = 3 * i - (r + b);
                    } else if (h >= 2 * Math.PI / 3 && h < 4 * Math.PI / 3) {
                        h = h - 2 * Math.PI / 3;
                        r = i * (1 - s);
                        g = i * (1 + (s * Math.cos(h) / Math.cos(Math.PI / 3 - h)));
                        b = 3 * i - (r + g);
                    } else {
                        h = h - 4 * Math.PI / 3;
                        g = i * (1 - s);
                        b = i * (1 + (s * Math.cos(h) / Math.cos(Math.PI / 3 - h)));
                        r = 3 * i - (g + b);
                    }

                    r = r * 255; if (r > 255) r = 255;
                    g = g * 255; if (g > 255) g = 255;
                    b = b * 255; if (b > 255) b = 255;

                    pixel.r = Math.floor(r);
                    pixel.g = Math.floor(g);
                    pixel.b = Math.floor(b);

                    resultImage[j][k] = pixel;
                    k
                }
            }

            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const pixel = resultImage[y][x];
                this.bitmap.data[idx] = pixel.r;
                this.bitmap.data[idx + 1] = pixel.g;
                this.bitmap.data[idx + 2] = pixel.b;
            })
            sufix++;
            await image.writeAsync(`uploads/output${sufix}.jpg`);
            return `output${sufix}.jpg`;
        } catch (err) {
            console.log(err)
            return false;
        }
    }

    async encode(imagePath, message) {
        try {
            let outputImage;
            const binaryImage = await extractBinaryFromImage(path.resolve('uploads', imagePath));
            if (!binaryImage) {
                console.error('Não foi possível extrair a sequência binária.');
                return;
            }
            // Cria a imagem
            const width = binaryImage.width;
            const height = binaryImage.height;

            // Modifica a sequência original
            let sliceIndex = 0
            let counter = 0;

            // Sequência original de bytes
            const textDelimiter = '00000000';
            // Caractere para converter
            const text = message;

            let textBinary = []
            for (let i = 0; i < text.length; i++) {
                textBinary.push(charToBinary(text[i]));
            }

            textBinary.push(textDelimiter);

            const modifiedSequence = binaryImage.value.map((byte) => {
                if (counter < textBinary.length) {
                    if (sliceIndex == 0) {
                        sliceIndex++;
                        return modifyLastBit(byte, sliceBinaryText(textBinary[counter]).firstSlice);

                    } else if (sliceIndex == 1) {
                        sliceIndex++;
                        return modifyLastBit(byte, sliceBinaryText(textBinary[counter]).secondSlice);

                    } else if (sliceIndex == 2) {
                        sliceIndex++;
                        return modifyLastBit(byte, sliceBinaryText(textBinary[counter]).thirdSlice);

                    } else if (sliceIndex == 3) {
                        sliceIndex = 0;
                        counter++;
                        return modifyLastBit(byte, sliceBinaryText(textBinary[counter - 1]).fourthSlice);

                    }
                } else {
                    return byte;
                }
            });

            const pixelArray = binaryToPixelArray(modifiedSequence);

            Jimp.create(width, height, (err, image) => {
                if (err) throw err;

                // Preenche a imagem com os valores dos pixels
                for (let i = 0; i < pixelArray.length; i += 4) {
                    const r = pixelArray[i];
                    const g = pixelArray[i + 1];
                    const b = pixelArray[i + 2];
                    const a = pixelArray[i + 3];
                    const x = (i / 4) % width;
                    const y = Math.floor((i / 4) / width);

                    image.setPixelColor(Jimp.rgbaToInt(r, g, b, a), x, y);
                }

                // Salva a imagem
                image.write(`uploads/output${sufix}.png`, (err) => {
                    if (err) throw err;
                });
            });
            return `Image saved successfully with encoded text: uploads/output${sufix}.png`;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async decode(imagePath) {
        try {
            const binaryImageOutput = await extractBinaryFromImage(path.resolve('uploads', imagePath));
            if (!binaryImageOutput) {
                console.error('Não foi possível extrair a sequência binária.');
                return;
            }

            let decodedBinaryText = [];
            let bitAccumulator = '';

            binaryImageOutput.value.map((byte) => {
                if (decodedBinaryText[decodedBinaryText.length - 1] != '00000000') {
                    bitAccumulator += byte.slice(-2);
                    while (bitAccumulator.length >= 8) {
                        decodedBinaryText.push(bitAccumulator.slice(0, 8));
                        bitAccumulator = bitAccumulator.slice(8);
                    }
                }
            });
            if (bitAccumulator.length > 0) {
                decodedBinaryText.push(bitAccumulator.padEnd(8, '0'));
            }

            let decodedText = '';
            decodedBinaryText.pop();
            decodedBinaryText.forEach(char => {
                decodedText += binaryToAscii(char);
            });
            return decodedText;

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    convertIntoGray(imageBox, height, width) {
        try {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    let gray = 0.299 * imageBox[i][j].r + 0.587 * imageBox[i][j].g + 0.114 * imageBox[i][j].b;
                    imageBox[i][j].r = gray;
                    imageBox[i][j].g = gray;
                    imageBox[i][j].b = gray;
                }
            }
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async generateHistogram(imagePath) {
        try {
            console.log(imagePath);
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            // Inicializar os arrays para os histogramas
            const histR = new Array(256).fill(0);
            const histG = new Array(256).fill(0);
            const histB = new Array(256).fill(0);
            const histI = new Array(256).fill(0);

            // Preencher os histogramas
            image.scan(0, 0, width, height, function (x, y, idx) {
                const r = this.bitmap.data[idx];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                const i = (r + g + b) / 3;

                histR[r]++;
                histG[g]++;
                histB[b]++;
                histI[Math.round(i)]++;
            });

            // Função para criar uma imagem de histograma
            async function createHistogramImage(hist, color, fileName) {
                const histImage = new Jimp(256, 100, 0xffffffff);
                const maxCount = Math.max(...hist);

                hist.forEach((count, i) => {
                    const barHeight = Math.round((count / maxCount) * 100);
                    for (let j = 0; j < barHeight; j++) {
                        histImage.setPixelColor(Jimp.cssColorToHex(color), i, 99 - j);
                    }
                });

                await histImage.writeAsync(`uploads/${fileName}`, (err) => {
                    if (err) throw err;
                });
            }

            // Criar e salvar as imagens de histograma
            await createHistogramImage(histR, 'red', 'histogramR.png');
            await createHistogramImage(histG, 'green', 'histogramG.png');
            await createHistogramImage(histB, 'blue', 'histogramB.png');
            await createHistogramImage(histI, 'gray', 'histogramI.png');

        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async colorequalization(imagePath) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            const fileName = "equalized_picture.jpg";
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            const hsiArray = [];
            const intensityArray = [];

            image.scan(0, 0, width, height, (x, y, idx) => {
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];

                const [h, s, i] = rgbToHsi(r, g, b);
                hsiArray.push([h, s, i]);
                intensityArray.push(i);
            });

            const equalizedIntensityArray = equalizeHistogram(intensityArray);

            let i = 0;
            image.scan(0, 0, width, height, (x, y, idx) => {
                const [h, s] = hsiArray[i];
                const equalizedI = equalizedIntensityArray[i];

                const [r, g, b] = hsiToRgb(h, s, equalizedI);

                image.bitmap.data[idx] = r;
                image.bitmap.data[idx + 1] = g;
                image.bitmap.data[idx + 2] = b;

                i++;
            });
            await image.writeAsync(`uploads/${fileName}`, (err) => {
                if (err) throw err;
            });
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async grayequalization(imagePath) {
        try {
            const image = await Jimp.read(path.resolve('uploads', imagePath));
            const fileName = "equalizedgrayscale_picture.jpg";
            const width = image.bitmap.width;
            const height = image.bitmap.height;
            const totalPixels = width * height;

            // Helper function to compute histogram and equalize a channel
            const equalizeChannel = (channelData) => {
                const histogram = new Array(256).fill(0);
                channelData.forEach(value => histogram[value]++);

                const cdf = new Array(256).fill(0);
                cdf[0] = histogram[0];
                for (let i = 1; i < 256; i++) {
                    cdf[i] = cdf[i - 1] + histogram[i];
                }

                const cdfMin = cdf.find(value => value !== 0);
                const scaleFactor = 255 / (totalPixels - cdfMin);

                return channelData.map(value => Math.round((cdf[value] - cdfMin) * scaleFactor));
            };

            // Extract RGB channels
            const redChannel = [];
            const greenChannel = [];
            const blueChannel = [];
            image.scan(0, 0, width, height, (x, y, idx) => {
                redChannel.push(image.bitmap.data[idx]);
                greenChannel.push(image.bitmap.data[idx + 1]);
                blueChannel.push(image.bitmap.data[idx + 2]);
            });

            // Equalize each channel
            const equalizedRed = equalizeChannel(redChannel);
            const equalizedGreen = equalizeChannel(greenChannel);
            const equalizedBlue = equalizeChannel(blueChannel);

            // Update image with equalized channels
            let i = 0;
            image.scan(0, 0, width, height, (x, y, idx) => {
                image.bitmap.data[idx] = equalizedRed[i];
                image.bitmap.data[idx + 1] = equalizedGreen[i];
                image.bitmap.data[idx + 2] = equalizedBlue[i];
                i++;
            });
            await image.writeAsync(`uploads/${fileName}`, (err) => {
                if (err) throw err;
            });
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}
module.exports = new images

