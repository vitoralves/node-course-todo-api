const { SAH256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = 'uhull123';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    })
})

var hashedPass = '$2a$10$q.LMRzIwijbISCtZeFLfWOB7HcKFcsJle/araaWtPXEelHIxVyqeC';

bcrypt.compare('uhull123', hashedPass, (err, res) => {
    console.log(res)
});
