const express = require("express"); // Import the Express framework.
const bodyParser = require("body-parser"); // Import the body-parser middleware.
const MongoClient = require("mongodb").MongoClient; // Import the MongoDB client.
const cors = require("cors"); // Import the CORS middleware.
const { ObjectID, ObjectId } = require("bson"); // Import ObjectID from BSON.
const app = express(); // Create an Express application.
require("dotenv").config(); // Load environment variables from a .env file.

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000; // Define the port for the application, using an environment variable or 5000 as the default.

app.use(cors()); // Enable CORS for the Express app.
app.use(bodyParser.json()); // Parse JSON request bodies.

// Extracting MongoDB URI and other variables from .env
const {
  MONGODB_URI
} = process.env;

// Constructing the MongoDB URI using the extracted variables
const uri = MONGODB_URI;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully");
  }

  const serviceCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("services"); // Define a collection for services.
  const reviewCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("reviews"); // Define a collection for reviews.
  const adminsCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("admins"); // Define a collection for admins.
  const orderCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("orders"); // Define a collection for orders.

  // Define API endpoints for adding services, reviews, orders, and admins.

  app.post("/add-services", (req, res) => {
    const newService = req.body;
    serviceCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/add-review", (req, res) => {
    const newReview = req.body;
    reviewCollection
      .insertOne({
        name: newReview.name,
        address: newReview.address,
        description: newReview.description,
        img: newReview.img,
        star: newReview.star,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/add-order", (req, res) => {
    orderCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/add-admin", (req, res) => {
    const newAdmin = req.body.email;
    adminsCollection.insertOne({ email: newAdmin }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Define API endpoints for retrieving services, reviews, orders, and admins.

  app.get("/all-services", (req, res) => {
    serviceCollection.find().toArray((err, services) => {
      res.send(services);
    });
  });

  app.get("/all-services/:id", (req, res) => {
    serviceCollection
      .find({ _id: ObjectID(req.params.id) })
      .toArray((err, service) => {
        res.send(service[0]);
      });
  });

  app.get("/all-review", (req, res) => {
    reviewCollection.find({}).toArray((err, reviews) => {
      res.send(reviews);
    });
  });

  app.get("/all-orders", (req, res) => {
    orderCollection.find({}).toArray((err, orders) => {
      res.send(orders);
    });
  });

  app.get("/orderedByEmail", (req, res) => {
    orderCollection.find({ email: req.query.email }).toArray((err, order) => {
      res.send(order);
    });
  });

  app.get("/isAdmin", (req, res) => {
    const email = req.query.email;
    adminsCollection.find({ email: email }).toArray((err, admins) => {
      res.send(admins.length > 0);
    });
  });

  app.get("/all-admin", (req, res) => {
    adminsCollection.find({}).toArray((err, reviews) => {
      res.send(reviews);
    });
  });

  // Define API endpoints for deleting services, orders, reviews, and admins.

  app.delete("/service-delete/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  app.delete("/cancel-order/:id", (req, res) => {
    orderCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  app.delete("/delete-review/:id", (req, res) => {
    reviewCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  app.delete("/remove-admin/:id", (req, res) => {
    adminsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  // Define an API endpoint for updating order status.

  app.patch("/update-order-status", (req, res) => {
    const { id, status } = req.body;
    orderCollection
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        {
          $set: { status },
        }
      )
      .then((result) => res.send(result.lastErrorObject.updatedExisting));
  });

  // Define a welcome endpoint.
  app.get("/", (req, res) => {
    res.send("Welcome to Bike Service application Server API");
  });

  // Start the server and listen on the defined port.
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
});
