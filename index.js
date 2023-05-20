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
        // Connect the client to the server	(optional starting in v4.7)
         client.connect();
        // Send a ping to confirm a successful connection

        const toysCollection = client.db('toyMarketplace').collection('toy');

        app.post('/addAToy', async (req, res) => {
            const body = req.body;
            const result = await toysCollection.insertOne(body);
            res.send(result)
            console.log(result);
        })

        app.get('/allToys', async (req, res) => {
            const result = await toysCollection.find({}).toArray();
            res.send(result);
        })

        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query);
            console.log(result);
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
})

app.listen(port, () => {
    console.log(`Toy Marketplace Server is Running on ${port}`);
})