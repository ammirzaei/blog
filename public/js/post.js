document.getElementById('image').addEventListener('change', function () {
    if (this.files[0]) {
        const imagePreview = document.querySelector('#imagePreview');

        imagePreview.style.display = 'block';

        imagePreview.src = URL.createObjectURL(this.files[0]);
    }
});

CKEDITOR.replace('body', {
    language: 'fa'
});