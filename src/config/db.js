require('dotenv').config();
const {MongoClient} = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectDb(){
    try{
        await client.connect();
        db = client.db();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDb first.');
    }
    return db;
}

module.exports = { connectDb, getDb };