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

        // FOr Display Specific Seller Product in My Toy Page
        app.get('/myToys/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await toysCollection.find({ sellerEmail: req.params.email }).toArray();
            res.send(result)
        })

        // For Update Data
        // app.put('myToys/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedToy = req.body;
        //     const toy = {
        //         $set:{
        //             price: updatedToy.price,
        //             availableQuantity : updatedToy.availableQuantity,
        //             description : updatedToy.description,
        //         } 
        //     }
        //     const result = await toysCollection.updateOne(filter, toy, options);
        //     res.send(result);
        // })

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


        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
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