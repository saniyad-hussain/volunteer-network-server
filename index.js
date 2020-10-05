const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectID } = require('mongodb');
const env = require('dotenv').config();
const fileUpload = require('express-fileupload');
app.use(bodyParser.json());
app.use(cors());
var admin = require('firebase-admin');

var serviceAccount = require('./configs/volunteer-network-34555-firebase-adminsdk-dqoik-c5186ce085.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://volunteer-network-34555.firebaseio.com',
});

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjgsq.mongodb.net/volunteerNetwork?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
	const collection = client.db('volunteerNetwork').collection('volunteers');
	const eventsCollection = client.db('volunteerNetwork').collection('events');

	app.post('/registered', (req, res) => {
		const newRegistration = req.body;
		collection.insertOne(newRegistration).then((result) => {
			res.send(result.insertedCount > 0);
		});
	});

	app.get('/showlist', (req, res) => {
		const bearer = req.headers.authorization;
		if (bearer && bearer.startsWith('Bearer ')) {
			const idToken = bearer.split(' ')[1];
			admin
				.auth()
				.verifyIdToken(idToken)
				.then(function (decodedToken) {
					let tokenEmail = decodedToken.email;
					if (req.query.email == tokenEmail) {
						collection.find({ email: req.query.email }).toArray((err, documents) => {
							res.send(documents);
						});
					} else {
						res.status(401).send('Un-authorized Access');
					}
				})
				.catch(function (error) {
					res.status(401).send('Un-authorized Access');
				});
		} else {
			res.status(401).send('Un-authorized Access');
		}
	});
	app.delete('/cancel/:id', (req, res) => {
		collection.deleteOne({ _id: ObjectID(req.params.id) }).then((result) => {
			res.send(result.deletedCount > 0);
		});
	});

	app.get('/dashboard', (req, res) => {
		collection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	app.post('/addevent', (req, res) => {
		const newEvents = req.body;
		eventsCollection.insertOne(newEvents).toArray((err, documents) => {
			res.send(documents);
		});
	});

	app.get('/events', (req, res) => {
		eventsCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});
});

app.listen(process.env.PORT || port);
