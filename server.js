const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

let data = {};

app.post('/', (req, res) => {
    const originalLink = req.body.link;
    const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    const matches = regex.test(originalLink);

    if (matches) {
        const shortLink = generateShortLink(originalLink);
        res.send(shortLink);
    } else {
        res.send('invalid link');
    }
});

app.get('/:id', (req, res) => {
    const id = req.params.id;
    if (data[id]) {
        res.redirect(data[id]);
    } else {
        res.sendFile(__dirname + '/public/notfound.html');
    }
});

app.listen(3000, () => {
    console.log('listening on 3000');
});


const generateShortLink = originalLink => {
    let id = generateID();

    while (data[id]) {
        id = generateID();
    }

    data[id] = originalLink;

    return 'localhost:3000/' + id;
};

const generateID = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;

    let id = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * characters.length);
        id += characters[index];
    }
    return id;
};