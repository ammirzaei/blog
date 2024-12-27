document.getElementById('btnUpload').addEventListener('click', function () {
    const xhttp = new XMLHttpRequest(); // new instance AJAX request

    let file = document.getElementById('inputUpload');
    const imageStatus = document.querySelector('#imageStatus');
    const progressBar = document.querySelector('.progress-bar');
    const progressDiv = document.getElementById('progressDiv');

    xhttp.onreadystatechange = async function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            imageStatus.innerHTML = this.responseText;
            if (xhttp.status === 200) {
                await navigator.clipboard.writeText(this.getResponseHeader('url')); // get url image from headers
                alert('آدرس عکس در کلیپ بورد کپی شد');
                file.value = ''; // empty input file
            }
        }
    }

    xhttp.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            const result = Math.floor((e.loaded / e.total) * 100);
            if (result !== 100) {
                progressBar.innerHTML = result + '%';
                progressBar.style.width = result + '%';
            } else {
                progressDiv.style.display = 'none';
            }
        }
    }

    xhttp.open('post', '/dashboard/image-upload');

    if (file.files[0]) {
        let formData = new FormData();
        formData.append('imageUpload', file.files[0]);
        progressDiv.style.display = 'block';

        xhttp.send(formData);
    } else {
        imageStatus.innerHTML = 'ابتدا عکسی را انتخاب کنید';
    }

});