const uploadBtn = document.getElementById('btn-upload');
const mainImage = document.getElementById('image-aplication');

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

    }catch(err){
        console.log(err);
    }

})