const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fwkvzgi.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {


    try {
        const serviceCollection = client.db('photographdb').collection('services');
        const reviewCollection = client.db('photographdb').collection('reviews')

        // service api

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        // service detaias api

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.send(result);
        });



    }
    finally {

    }
}
run().catch(err => console.error)



app.get('/', (req, res) => {
    res.send('hello from photo artisan server')
})
app.listen(port, () => {
    console.log(`listening to port ${port}`);
})