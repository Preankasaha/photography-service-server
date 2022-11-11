const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.ACCESS_TOKEN_SECRET);




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fwkvzgi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fwkvzgi.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, { connectTimeoutMS: 30000 }, { keepAlive: 1 });

function verifyJWT(req, res, next) {
    console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.send(401)({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    // jwt verify function
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}



async function run() {


    try {
        const serviceCollection = client.db('photographdb').collection('services');
        const reviewCollection = client.db('photographdb').collection('reviews')
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
            res.send({ token })
        })
        // service api

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        //service api for limit
        app.get('/serviceswithlimit', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        // service deta by id api

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });


        // review api by serviceID
        app.get('/reviews', async (req, res) => {
            let query = {};

            if (req.query.serviceID) {
                query = { 'review.serviceId': req.query.service };
            }

            const cursor = reviewCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // review get api by email
        app.get('/myreviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('inside orders api', decoded);
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};

            if (req.query.email) {
                query = { 'review.email': req.query.email };
            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        // reviews post api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log([{ review, time: new Date() }]);
            const result = await reviewCollection.insertMany([{ review: review, time: new Date() }]);
            res.send(result);
        });

        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const review = req.body
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    review: review

                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });
        //Add service api
        app.post('/services', async (req, res) => {
            const services = req.body;
            const result = await serviceCollection.insertOne(services);
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