const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const PORT = process.env.PORT || 3000;
const isLocal = process.env.PORT ? false : true;

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const dbName = 'link-shortener';
const client = new MongoClient(url, { useUnifiedTopology: true });


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

    connectAndCall(findDocument, {
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

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});


const generateShortLink = originalLink => {
    let id = generateID();

    let foundDocs;

    connectAndCall(findDocument, {
        data: {id: id},
        callback: docs => {
            foundDocs = docs;
        }
    });

    while (foundDocs) {
        id = generateID();

        connectAndCall(findDocument, {
            data: {id: id},
            callback: docs => {
                foundDocs = docs;
            }
        });
    }

    connectAndCall(insertDocument, {
        data: {
            id: id,
            originalLink: originalLink
        },
        callback: () => {
            console.log('insertion');
        }
    });

    return isLocal ? 'localhost:3000/' + id : 'https://link-showortener.herokuapp.com/' + id;
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

const connectAndCall = (func, args) => {
    client.connect(err => {
        if (!err) {
            const db = client.db(dbName);

            func(db, args);
        }
    });
};