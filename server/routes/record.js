import express from "express";

import database, { client } from "../db/connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

// Retrieve current data
router.get("/", async (req, res) => {
  let collection = await database.collection("records");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});
// End section

router.get("/report/stats", async (req, res) => {
  try {
    let q = {};
    const { year, position } = req.query;
    if (position && typeof position === "string" && position !== "All") {
      q.position = position;
    }
    if (year && typeof year === "string" && year !== "All") {
      q.year = year;
    }
    let table = await database.collection("records");
    let records = await table.find(q).toArray();

    const total = records.length;

    const yearCounts = records.reduce((acc, r) => {
      acc[r.year] = (acc[r.year] || 0) + 1;
      return acc;
    }, {});

    const positionCounts = records.reduce((acc, r) => {
      acc[r.position] = (acc[r.position] || 0) + 1;
      return acc;
    }, {});

    // Get distinct values for filter dropdowns
    const mems = await table.find({}).toArray();
    const positions = [...new Set(mems.map(m => m.position).filter(Boolean))];
    const years = [...new Set(mems.map(m => m.year).filter(Boolean))];
    // End get distinct values for dropdowns
    // Send stats
    res.status(200).json({
      total,
      records,
      yearCounts,
      positionCounts,
      years,
      positions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});
router.get("/:id", async (req, res) => {
  let collection = await database.collection("records");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Adding a member:
router.post("/", async (req, res) => {

  // Injection protection
  if (typeof req.body.year !== "string" || typeof req.body.name !== "string" ||
      typeof req.body.position !== "string") {
    return res.status(400).send("Input is in incorrect format.");
  }
  // End injection protection
  // Start add member transaction
  const transaction = client.startSession();
  try {
    transaction.startTransaction({readConcern: {level: "snapshot"}, writeConcern: {w: "majority"}});
    let record = {
      name: req.body.name,
      position: req.body.position,
      year: req.body.year,
    };
    let table = await database.collection("records");
    let output = await table.insertOne(record, {session: transaction});
    await transaction.commitTransaction(); // Commit completed add member transaction
    res.send(output).status(204);
  } catch (err) {
    await transaction.abortTransaction(); // Abort add member transaction if it failed
    console.error(err);
    res.status(500).send("Couldn't add member");
  } finally {
    await transaction.endSession();
  }
});
// End adding a member section

router.patch("/:id", async (req, res) => {
  // Injection protection
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Request ID is not correct.");
  }
  if (typeof req.body.year !== "string" || typeof req.body.name !== "string" ||
      typeof req.body.position !== "string") {
    return res.status(400).send("Input is in incorrect format.");
  }
  // End injection protection
  // Start update member transaction
  const transaction = client.startSession();
  try {
    transaction.startTransaction({readConcern: {level: "snapshot"}, writeConcern: {w: "majority"}});
    
    const q = { _id: new ObjectId(req.params.id) };

    const newData = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        year: req.body.year,
      },
    };

    let table = await database.collection("records");
    let output = await table.updateOne(q, newData, {session: transaction});
    await transaction.commitTransaction(); // Commit completed update member transaction
    res.send(output).status(200);
  } catch (err) {
    await transaction.abortTransaction(); // Abort update member transaction if failed
    console.error(err);
    res.status(500).send("Couldn't update record");
  } finally {
    await transaction.endSession();
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // Injection protection
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Request ID is not correct.");
    }
    // End injection protection

    const query = { _id: new ObjectId(req.params.id) };

    const collection = database.collection("records");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

/* router.get("/report/stats", async (req, res) => {
  try {
    let q = {};
    const { year, position } = req.query;
    if (position && position !== "All" && typeof position === "string") {
      q.position = position;
    }
    if (year && year !== "All" && typeof year === "string") {
      q.year = year;
    }
    let table = await db.collection("records");
    let results = await table.find(q).toArray();

    const total = results.length;

    const yearCounts = results.reduce((acc, r) => {
      acc[r.year] = (acc[r.year] || 0) + 1;
      return acc;
    }, {});

    const positionCounts = results.reduce((acc, r) => {
      acc[r.position] = (acc[r.position] || 0) + 1;
      return acc;
    }, {});

    // Get distinct values for filter dropdowns
    const mems = await table.find({}).toArray();
    const positions = [...new Set(mems.map(m => m.position).filter(Boolean))];
    const years = [...new Set(mems.map(m => m.year).filter(Boolean))];
    // End get distinct values for dropdowns
    // Send stats
    res.status(200).json({
      total,
      results,
      yearCounts,
      positionCounts,
      years,
      positions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
}); */

export default router;
