const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {mongoose} = require('./db/mongoose');
const { ObjectID } = require('mongodb');

var { Todo } = require('./models/todo');


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

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;
    if (ObjectID.isValid(id)) {
        Todo.findByIdAndDelete(id).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        }, (e) => res.status(400).send(e));
    } else {
        res.status(400).send({message: 'Invalid ID number'});
    }
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return send.status(400, send({ message: 'Invalid ID' }));
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(400).send({message: 'Todo not found'});
        }

        res.send({todo});
    }).catch((e) => res.status(400).send());
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app };