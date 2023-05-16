const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.port || 3000;

// middlware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzertuj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const doctorCollection = client.db("oreoHospital").collection("ores");
    const appointmentDetailsCollection = client
      .db("oreoHospital")
      .collection("appointmentDetails");

    app.get("/doctors", async (req, res) => {
      const cursor = doctorCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/doctors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await doctorCollection.findOne(query);
      res.send(result);
    });

    // appointment details
    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await appointmentDetailsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const appointmentDetails = req.body;
      console.log(appointmentDetails);
      const result = await appointmentDetailsCollection.insertOne(
        appointmentDetails
      );
      res.send(result);
    });

    // update appointment
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedAppointment = req.body;
      console.log(updatedAppointment);
      const updateDoc = {
        $set: {
          status: updatedAppointment.status,
        },
      };
      const result = await appointmentDetailsCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // delete appointment
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appointmentDetailsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Oreo is running");
});

app.listen(port, () => {
  console.log(`Oreo hospital server is running on port: ${port}`);
});
