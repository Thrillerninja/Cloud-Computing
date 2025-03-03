import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db('geoip');
    const collection = db.collection('locations');

    const data = await req.json();
    await collection.insertOne(data);

    return new Response(JSON.stringify({ message: 'Data added to the database successfully' }), { status: 200 });
  } catch (err) {
    console.error('Error adding to database:', err);
    return new Response(JSON.stringify({ message: 'Failed to add data to the database' }), { status: 500 });
  }
}
