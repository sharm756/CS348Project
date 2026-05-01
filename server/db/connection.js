import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

/*try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log(
   "Pinged your deployment. You successfully connected to MongoDB!"
  );
  let database = client.db("members");
  await database.collection("records").createIndex({position: 1, year: 1});
  await database.collection("records").createIndex({year: 1});
  await database.collection("records").createIndex({position: 1});
} catch(err) {
  console.error(err);
}

let database = client.db("members");

export default database;
export {client}; */

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    let table = client.db("members");
    await table.collection("records").createIndex({ position: 1, year: 1 });
    await table.collection("records").createIndex({ year: 1 });
    await table.collection("records").createIndex({ position: 1 });
  } catch (err) {
    console.error(err);
    setTimeout(connectDB, 5000);
  }
}
connectDB().catch(console.error);

export async function getDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("members");
}

export { client };
export default client.db("members");
