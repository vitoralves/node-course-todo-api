const express = require('express');
var { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
var { authenticate } = require('../middleware/authenticate');

var router = express.Router();

router.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save(user).then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }, (e) => res.status(400).send(e));
});

router.get('/users', authenticate, async (req, res) => {
    const users = await User.find({})
    res.send({ users });
});

router.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

router.post('/users/login', (req, res) => {
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

router.post('/users/v2/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => res.status(400).send(e));
});

router.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((e) => res.status(400).send(e));
});

module.exports = router