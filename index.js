const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()


const port = 5000

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('Hello World!!! DB Working!!!!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwfp8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('Connection error', err);

    const serviceCollection = client.db("rainbowisp").collection("service");
    const ordersCollection = client.db("rainbowisp").collection("orders");
    const reviewCollection = client.db("rainbowisp").collection("reviews");
    const adminCollection = client.db("rainbowisp").collection("admin");

    console.log('DB connection successfully!');


    app.post('/addService', (req, res) => {
        const newService = req.body;
        console.log('Adding new Service', newService);
        serviceCollection.insertOne(newService)
            .then(result => {
                console.log('Inserted Count ', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })


    app.get('/services', (req, res) => {
        serviceCollection.find()
            .toArray((err, package) => {
                res.send(package)
            })
    })

    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewCollection.insertOne(newReview)
            .then(result => {
                console.log('Inserted Count ', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/review', (req, res) => {
        reviewCollection.find()
            .toArray((err, reviewList) => {
                res.send(reviewList)
            })
    })

    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id);
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                console.log(result);
            })
    })


    app.get('/service/:serviceId', (req, res) => {
        console.log(req.params.serviceId)
        serviceCollection.find({ _id: ObjectId(req.params.serviceId) })
            .toArray((err, service) => {

                res.send(service)
                console.log('From database', service);
            })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/orders', (req, res) => {
        console.log(req.query.email);
        ordersCollection.find()
            .toArray((err, orderList) => {
                res.send(orderList)
            })

    })

    app.get('/booking', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, orderList) => {
                res.send(orderList)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
            .then(result => {
                console.log('Inserted Count ', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })


    
    // code for status change
    
    app.patch('/done/:id', (req, res) => {
        console.log('id',req.params.id);
        console.log('status',req.body.status);
        ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: { 'shipment.Status': 'Done' }
            })
                .then(result => {
                    console.log(result);
                })
    })

    app.patch('/ongoing/:id', (req, res) => {
        console.log('id',req.params.id);
        console.log('status',req.body.status);
        ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: { 'shipment.Status': 'Ongoing' }
            })
                .then(result => {
                    console.log(result);
                })
    })

    app.patch('/pending/:id', (req, res) => {
        console.log('id',req.params.id);
        console.log('status',req.body.status);
        ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: { 'shipment.Status': 'Pending' }
            })
                .then(result => {
                    console.log(result);
                })
    })

});


app.listen(process.env.PORT || port)