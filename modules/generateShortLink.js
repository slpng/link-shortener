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