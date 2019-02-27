require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { mongoose } = require('./db/mongoose');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
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

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({ todos });
    }).catch((e) => {
        res.status(400).send(e)
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
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

app.delete('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    if (ObjectID.isValid(id)) {
        Todo.findOne({
            _id: id,
            _creator: req.user.id
        }).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        }, (e) => res.status(400).send(e));
    } else {
        res.status(400).send({ message: 'Invalid ID number' });
    }
});

app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true }).then((todo) => {
        if (!todo) {
            return res.status(400).send({ message: 'Todo not found' });
        }

        res.send({ todo });
    }).catch((e) => res.status(400).send());
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save(user).then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }, (e) => res.status(400).send(e));
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    User.findOne({ 'email': req.body.email }).then((user) => {
        if (!user) {
            res.status(400).send('Wrong email!');
        }
        bcrypt.compare(req.body.password, user.password, (err, compare) => {
            if (err) {
                res.status(400).send();
            }

            if (compare) {
                res.status(200).send(user);
            } else {
                res.status(400).send('Wrong password!');
            }
        })
    }).catch((e) => res.status(400).send(e));
});

app.post('/users/v2/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => res.status(400).send(e));
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((e) => res.status(400).send(e));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app };