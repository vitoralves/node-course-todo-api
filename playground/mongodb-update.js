
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to MongoDb server');

    const db = client.db('TodoApp')

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5c582ca0f9a6ae14b9d41a32')
    // }, {
    //         $set: {
    //             completed: true
    //         }
    //     }, {
    //         returnOriginal: false
    //     }).then((res) => {
    //         console.log(res)
    //     });


    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5c582dabd5714a170302d210')
    }, {
            $set: {
                name: 'Another nmae'
            },
            $inc: {
                age: 1
            }
        }, {
            returnOriginal: false
        }).then((res) => {
            console.log(res);
        });

});