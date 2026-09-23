require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@'));
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log('Connected successfully to server');
  } catch(e) {
    console.error('Connection error:', e);
  } finally {
    await client.close();
  }
}
run();
