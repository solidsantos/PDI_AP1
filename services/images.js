const path = require('path')
const Jimp = require('jimp');
const { text } = require('body-parser');
let sufix = 0;


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
            let mask = getTypicalMask(coef, center);

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
            console.log(err);
            return null;
        }


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
}
module.exports = new images