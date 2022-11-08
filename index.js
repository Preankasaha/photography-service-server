
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
// middlewares
app.use(cors());
app.use(express.json());




console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);


const uri = "mongodb+srv://process.env.DB_USER:process.env.DB_PASSWORD@cluster0.ul9g96g.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get('/', (req, res) => {
    res.send('hello from photo artisan server')
})
app.listen(port, () => {
    console.log(`listening to port ${port}`);
})