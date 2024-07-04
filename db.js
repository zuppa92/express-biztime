// db.js
const { Client } = require('pg');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const client = new Client({
    connectionString: "postgresql://localhost/biztime"
});

client.connect();

module.exports = client;
