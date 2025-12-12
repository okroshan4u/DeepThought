// db.js
const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017"; // local MongoDB
const client = new MongoClient(uri);

let db;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("dt_events_db"); 
        console.log("MongoDB Connected");
    }
    return db;
}

module.exports = connectDB;
