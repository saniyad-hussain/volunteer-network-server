const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectID } = require('mongodb');
const pass = 'AGuW5Az4Dg9ul7bj';
app.use(bodyParser.json());
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://volunteerNetwork:AGuW5Az4Dg9ul7bj@cluster0.zjgsq.mongodb.net/volunteerNetwork?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
	const collection = client.db('volunteerNetwork').collection('volunteers');

	app.post('/registered', (req, res) => {
		const newRegistration = req.body;
		collection.insertOne(newRegistration).then((result) => {
			res.send(result.insertedCount > 0);
		});
	});

	app.get('/showlist', (req, res) => {
		collection.find({ email: req.query.email }).toArray((err, documents) => {
			res.send(documents);
		});
	});
	app.delete('/cancel/:id', (req, res) => {
		collection.deleteOne({ _id: ObjectID(req.params.id) }).then((result) => {
			console.log(result);
		});
	});
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
