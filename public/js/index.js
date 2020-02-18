const shortenButton = document.querySelector('.shorten-button');
const linkInput = document.querySelector('.link-input');

shortenButton.onclick = () => {
    fetch('/', {
        method : "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            link: linkInput.value
        })
    })
    .then(response => response.text())
    .then(data => {
        linkInput.value = data;
        linkInput.select();
    });
};