const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const client = new MongoClient(config.dbUri, { useUnifiedTopology: true });
let db;
client.connect(err => {
    if (!err) {
        db = client.db(config.dbName);
        console.log('Connected to the MongoDB database');
    } else {
        throw 'Database connection failed';
    }
});

app.post('/', (req, res) => {
    const originalLink = req.body.link;
    const isLink = checkIfLink(originalLink);

    if (isLink) {
        const shortLink = generateShortLink(originalLink);
        res.send(shortLink);
    } else {
        res.send('Invalid link');
    }
});

app.get('/:id', (req, res) => {
    const id = req.params.id;

    findDocument(db, {
        data: {id: id},
        callback: docs => {   
            if (docs.length > 0) {
                const link = docs[0].originalLink;
                res.redirect(link);
            } else {
                res.sendFile(__dirname + '/public/notfound.html');
            }
        }
    });
});

app.listen(config.port, () => {
    console.log(`Listening on ${config.port}`);
});

const generateShortLink = originalLink => {
    let id = generateID();

    insertDocument(db, {
        data: {
            id: id,
            originalLink: originalLink
        },
        callback: () => {
            console.log(`Inserted data`);
        }
    });

    return config.domain + id;
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

const findDocument = (db, args) => {
    const collection = db.collection('links');

    collection.find(args.data).toArray((err, docs) => {
        if (!err) {
            args.callback(docs);
        }
    });
}

const insertDocument = (db, args) => {
    const collection = db.collection('links');

    collection.insertOne(args.data, (err, result) => {
        if (!err && result.result.n === 1 && result.ops.length === 1) {
            args.callback(result);
        }
    });
}

const checkIfLink = link => {
    const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    return regex.test(link);
};