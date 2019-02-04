
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to MongoDb server');

    const db = client.db('TodoApp')
    
    db.collection('Todos').find().count().then((docs) => {
        console.log(`Todos count: ${docs}`);
    }, (err) => {
        console.log(err);
    })

    // client.close();
});