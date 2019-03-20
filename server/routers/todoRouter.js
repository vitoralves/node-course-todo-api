const express = require('express');
var { Todo } = require('../models/todo');
var { authenticate } = require('../middleware/authenticate');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

var router = express.Router();

router.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({ todos });
    }).catch((e) => {
        res.status(400).send(e)
    });
});

router.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    if (ObjectID.isValid(id)) {
        Todo.findOne({
            _id: id,
            _creator: req.user._id
        }).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        }, (e) => res.status(400).send(e));
    } else {
        res.status(400).send({ message: 'Invalid ID number' });
    }
})

router.delete('/todos/:id', authenticate, async (req, res) => {
    let id = req.params.id;
    if (ObjectID.isValid(id)) {
        try {
            const todo = await Todo.findOneAndDelete({ _id: id, _creator: req.user.id });
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        } catch (e) {
            res.status(500).send(e);
        }
    } else {
        res.status(400).send({ message: 'Invalid ID number' });
    }
});

router.patch('/todos/:id', authenticate, async (req, res) => {
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

    try {
        const todo = await Todo.findOneAndUpdate({ _id: id, _creator: req.user.id }, { $set: body }, { new: true });
        if (!todo) {
            return res.status(404).send({ message: 'Todo not found' });
        }
        res.send({ todo });
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router