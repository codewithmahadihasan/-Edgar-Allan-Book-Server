const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.hlyc9ph.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {
    try {
        const productCollection = client.db('Edgar-Allan').collection('Books')
        const reviewConnection = client.db('Edgar-Allan').collection('reviews')


        app.get('/book', async (req, res) => {
            const size = parseInt(req.query.size)
            const query = {}
            const cursor = productCollection.find(query)
            const books = await cursor.limit(size).sort({ date: -1 }).toArray()
            const count = await productCollection.estimatedDocumentCount()
            res.send({ count, books })
        })

        app.get('/book/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await productCollection.findOne(query)
            res.send(user)
        })




        app.get('/review/:id', async (req, res) => {
            const id = req.params.id
            const query = {
                postid: id
            }
            const postid = reviewConnection.find(query)
            const books = await postid.toArray()
            res.send(books)
        })

        app.get('/myReview', async (req, res) => {
            const query = req.query.email
            const allReviews = await reviewConnection.find({}).sort({ _id: -1 }).toArray()
            const myReview = allReviews.filter(item => item?.user?.email === query)
            res.send(myReview)

        })

        app.post('/addservice', async (req, res) => {
            const order = req.body
            const result = await productCollection.insertOne(order)
            res.send(result)
        })




        app.post('/review', async (req, res) => {
            const order = req.body
            const result = await reviewConnection.insertOne(order)
            res.send(result)
        })


        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewConnection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }

}
run().catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Server is running now')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})