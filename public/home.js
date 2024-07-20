var imageName
const uploadBtn = document.getElementById('btn-upload');
const chromaUp = document.getElementById('chroma-upload');

const imageContainer = document.getElementById('image-container');
const subdivs = document.getElementsByClassName('sub-div');

uploadBtn.addEventListener('change', async()=>{
    const reader = new FileReader();
    reader.onload = () => {
        const base64Content = reader.result;
    };
    const formData = new FormData();
    formData.append('image', uploadBtn.files[0]);

    const fetchOptions = {
        method: 'POST',
        body: formData,
    };

    try{
        const res = await fetch('http://localhost:8080/upImage', fetchOptions);
        const content = await res.json();
        imageName = content.link;
        alterateImage(imageName);
    }catch(err){
        console.log(err);
    }

})


chromaUp.addEventListener('change', async()=>{
    const reader = new FileReader();
    reader.onload = () => {
        const base64Content = reader.result;
    };
    const formData = new FormData();
    formData.append('image', chromaUp.files[0]);

    const fetchOptions = {
        method: 'POST',
        body: formData,
    };

    try{
        const res = await fetch('http://localhost:8080/upChroma', fetchOptions);
        const content = await res.json();
    }catch(err){
        console.log(err);
    }

})

function alterateImage(imgTitle){
    if(imageContainer.children.length > 0) imageContainer.removeChild(imageContainer.children[0]);
    const imageField = document.createElement('img');
    imageField.setAttribute('id', 'image-aplication');
    imageField.setAttribute('src', `/uploads/Loading_icon.gif`);
    imageContainer.appendChild(imageField);
    setTimeout(()=>{
        imageField.setAttribute('src', `/uploads/${imgTitle}`);
        imageContainer.appendChild(imageField);
    }, 1000);
}

/// Brilho da Imagem

const brightnessRange = document.getElementById('brightness-range');
const brightnessBtn = document.getElementById('brightness-btn');
var brightnessCoef = 0;

brightnessRange.addEventListener('change', ()=>{
    const val = document.getElementById('brightness-value');
    brightnessCoef = brightnessRange.value;
    val.innerText = brightnessCoef;
})
brightnessBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
        coef: 1 + (parseInt(brightnessCoef)/100)
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/brightness', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})

/// Sépia

const sepiaBtn = document.getElementById('sepia-btn');

sepiaBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/sepia', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})


/// Transformação logaritma:

const logInput = document.getElementById('log-input');
const logBtn = document.getElementById('log-btn');
var logCoef = 0;

logInput.addEventListener('change', ()=>{
    logCoef = parseFloat(logInput.value);
})
logBtn.addEventListener('click', async ()=>{
    const body = JSON.stringify({
        title: imageName,
        coef: logCoef
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/log', fetchOptions);
        if(res.status == 200) alterateImage(imageName);
    }catch(err){
        console.log(err);
    }
})

/// Gama

const gamaRange = document.getElementById('gama-range');
const gamaBtn = document.getElementById('gama-btn');
var gamaCoef = 0;

gamaRange.addEventListener('change', ()=>{
    const val = document.getElementById('gama-value');
    gamaCoef = gamaRange.value;
    val.innerText = gamaCoef;
})
gamaBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
        coef: (parseInt(gamaCoef)/10)
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/gama', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);   
        }
    }catch(err){
        console.log(err);
    }
})


/// Geracao de Histograma


const histBtn = document.getElementById('histogram-btn');
histBtn.addEventListener('click', async ()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/histogramGraph', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            console.log(body);
            let histogram = body.msg;
            var histogramaData = {
                labels: Array.from({length: 256}, (_, i) => i),
                datasets: [
                    {
                        label: 'Vermelho',
                        data: histogram.red,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Verde',
                        data: histogram.green,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Azul',
                        data: histogram.blue,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            };
    
            var histogramaOptions = {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            };
            var ctx = document.getElementById('histogram').getContext('2d');

            var histogramaChart = new Chart(ctx, {
                type: 'bar',
                data: histogramaData,
                options: histogramaOptions
            });
        }
    }catch(err){
        console.log(err);
    }
})


/// Linearização (binarização)

const binaryRange = document.getElementById('binary-range');
const binaryBtn = document.getElementById('binary-btn');
var binaryCoef = 0;

binaryRange.addEventListener('change', ()=>{
    const val = document.getElementById('binary-value');
    binaryCoef = binaryRange.value;
    val.innerText = binaryCoef;
})
binaryBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
        coef: (parseInt(binaryCoef))
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/binary', fetchOptions);
        if(res.status == 200) alterateImage(imageName);
    }catch(err){
        console.log(err);
    }
})


/// Filtros

const filterRange = document.getElementById('filter-range');
const smoothingBtn = document.getElementById('smoothing-btn');
const gaussBtn = document.getElementById('gauss-btn');
var filterCoef = 0;

filterRange.addEventListener('change', ()=>{
    const val = document.getElementById('filter-value');
    filterCoef = 2*parseInt(filterRange.value) - 1;
    val.innerText = filterCoef;
})
smoothingBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
        coef: parseInt(filterCoef)
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/meanSmoothing', fetchOptions);
        if(res.status == 200){
            const body = await res.json()
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})

gaussBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
        coef: parseInt(filterCoef)
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/gauss', fetchOptions);
        if(res.status == 200){
            const body = await res.json()
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})

/// Rotação
const degreeInput = document.getElementById('rotation-input');
const argX = document.getElementById('rotation-x');
const argY = document.getElementById('rotation-y');
const rotationBtn = document.getElementById('rotation-btn');

rotationBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName,
        ang: parseInt(degreeInput),
        x: parseInt(argX),
        y: parseInt(argY)
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/rotate', fetchOptions);
        if(res.status == 200) alterateImage(imageName);
    }catch(err){
        console.log(err);
    }
})



/// Inverter cores
const invertBtn = document.getElementById('invert-btn');
invertBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/invert', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);   
        }
    }catch(err){
        console.log(err);
    }
})


///Aguçamento Laplaciano
const laplacianoBtn = document.getElementById('laplaciano-btn');
laplacianoBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/laplaciano', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);   
        }
    }catch(err){
        console.log(err);
    }
})


/// High-Boost

const hiboostBtn = document.getElementById('hiboost-btn');
hiboostBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/hiboost', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);   
        }
    }catch(err){
        console.log(err);
    }
})



/// Sobel
const sobelBtn = document.getElementById('sobel-btn');
sobelBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/sobel', fetchOptions);
        if(res.status == 200){
            const body = await res.json()
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})

const sobelXBtn = document.getElementById('sobelX-btn');
sobelXBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/sobelX', fetchOptions);
        if(res.status == 200){
            const body = await res.json()
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})

const sobelYBtn = document.getElementById('sobelY-btn');
sobelYBtn.addEventListener('click', async()=>{
    const body = JSON.stringify({
        title: imageName
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/sobelY', fetchOptions);
        if(res.status == 200){
            const body = await res.json()
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})


//// other

function convertIntoHSi(){
    try{
        const rgbColors = document.getElementsByClassName('rgb-input');
        const hsiLabel = document.getElementById('hsi-label');
    
        let r = parseInt(rgbColors[0].value); if(r>255) r = 255; else if(r<0) r = 0;
        let g = parseInt(rgbColors[1].value); if(g>255) g = 255; else if(g<0) g = 0;
        let b = parseInt(rgbColors[2].value); if(b>255) b = 255; else if(b<0) b = 0;

        r = r/255.0;
        g = g/255.0;
        b = b/255.0;

        let i = (r+g+b)/3;
        let s = (i == 0) ? 0 : 1 - (Math.min(r, g, b) / i);
        let h;
        if(s==0 || (r==g && r==b)) h = 0;
        else{
            const teta = Math.acos((0.5 * ((r-g) + (r-b)))/Math.sqrt((r-g)**2 + (r-b)*(g-b)));
            if(b<=g) h = teta;
            else h = 2 * Math.PI - teta;
            h = (h*180)/Math.PI;
        } 

        hsiLabel.innerText = `h: ${h.toFixed(2)}; s: ${s.toFixed(2)}; i: ${i.toFixed(2)}`;;
    }catch(err){
        console.log(err);
    }


}


/// Chroma

const chromaRange = document.getElementById('chroma-range');
const chromaBtn = document.getElementById('chroma-btn');
const chromaRGB = document.getElementsByClassName('chroma-rgb');
var chromaCoef = 100;

chromaRange.addEventListener('change', ()=>{
    chromaCoef = chromaRange.value;
})
chromaBtn.addEventListener('click', async()=>{
    let rgb = {};
    rgb.r = chromaRGB[0].value; rgb.g = chromaRGB[1].value; rgb.b = chromaRGB[2].value;
    const body = JSON.stringify({
        title: imageName,
        rgb: rgb,
        range: (parseInt(chromaCoef))
    })
    const fetchOptions = {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try{
        const res = await fetch('http://localhost:8080/chroma', fetchOptions);
        if(res.status == 200){
            const body = await res.json();
            alterateImage(body.msg);
        }
    }catch(err){
        console.log(err);
    }
})