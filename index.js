const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gu0z5kw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        client.connect();

        const toysCollection = client.db('toyMarketplace').collection('toy');

        // For Storing Data to MongoDB using Add A Toy Page
        app.post('/addAToy', async (req, res) => {
            const body = req.body;
            const result = await toysCollection.insertOne(body);
            res.send(result);
        });

        // For Getting Data from MongoDB to show All Toys Page
        app.get('/allToys', async (req, res) => {
            const result = await toysCollection.find({}).toArray();
            res.send(result);
        });

        // For Getting One Data from MongoDB to Show View Details Button in Homepage
        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        //  To Show Data from MongoDB as User Email in My Toys Page
        app.get('/myToys/:email', async (req, res) => {
            const result = await toysCollection.find({ sellerEmail: req.params.email }).toArray();
            res.send(result);
        });

        // To Update data
        app.put('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedToy = req.body;
            const options = { upsert: true }
            const updatedFields = {
                $set: {
                    price: updatedToy.price,
                    availableQuantity: updatedToy.availableQuantity,
                    description: updatedToy.description,
                }
            };
            const result = await toysCollection.updateOne(filter, updatedFields, options);
            res.send(result);
        });

        // Creating index on two fields
        const indexKeys = { subCategory: 1, name: 1 }; // Replace field1 and field2 with your actual field names
        const indexOptions = { name: "nameCategory" }; // Replace index_name with the desired index name
        const result = await toysCollection.createIndex(indexKeys, indexOptions);

        app.get("/toySearchByTitle/:text", async (req, res) => {
            const searchText = req.params.text;

            const result = await toysCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i" } },
                    { subCategory: { $regex: searchText, $options: "i" } },
                ]
            }).toArray()

            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Toy Marketplace is Running')
});

app.listen(port, () => {
    console.log(`Toy Marketplace Server is Running on ${port}`);
});
