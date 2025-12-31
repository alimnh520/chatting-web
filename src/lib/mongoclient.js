import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const dbName = process.env.MONGODB_DB;

if (!uri) throw new Error("❌ Please add MONGODB_URI to .env.local");

if (!dbName) throw new Error("❌ Please add MONGODB_DB to .env.local");

let client;

let clientPromise;

if (process.env.NODE_ENV === "development") {
    
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;

} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getCollection(collectionName) {
    const client = await clientPromise;
    const db = client.db(dbName);
    return db.collection(collectionName);
}