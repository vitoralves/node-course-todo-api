var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { ObjectID } = require('mongodb');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos });
    }).catch((e) => {
        res.status(400).send(e)
    });
});

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    if (ObjectID.isValid(id)) {
        Todo.findById(id).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        }, (e) => res.status(400).send(e));
    } else {
        res.status(400).send({message: 'Invalid ID number'});
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app };