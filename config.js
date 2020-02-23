const port = process.env.PORT || 3000;
const dbName = 'link-shortener';
const dbUri = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const domain = process.env.PORT ? 'https://link-showortener.herokuapp.com/' : `localhost:${port}/`;

module.exports = { port, dbName, dbUri, domain };