const jwt = require('jsonwebtoken');

var data = {
    id: 4
}

var token = jwt.sign(data, 'abc123');

console.log(token)

var decoded = jwt.verify(token, 'abc123')
console.log(decoded)