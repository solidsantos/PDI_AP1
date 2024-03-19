var imageName
const uploadBtn = document.getElementById('btn-upload');

const mainImage = document.getElementById('image-aplication');
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
        mainImage.setAttribute('src', `/uploads/${content.link}`)
        imageName = content.link;
        console.log(imageName);
    }catch(err){
        console.log(err);
    }

})






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
            'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
        }
    };
    try{
        const res = await fetch('http://localhost:8080/brightness', fetchOptions);
        mainImage.setAttribute('src', `/uploads/${imageName}`);
    }catch(err){
        console.log(err);
    }
})