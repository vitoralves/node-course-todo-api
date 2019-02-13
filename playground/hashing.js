const {SHA256} = require('crypto-js');

var message = 'I am user number 3';
var hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);

var data = {
    id: 4
}
var token = {
    data,
    hash: SHA256(JSON.stringify(data)+ 'test').toString()
}

var resultHash = SHA256(JSON.stringify(token.data) + 'test').toString();

if (resultHash === token.hash) {
    console.log('was not changed')
}else {
    console.log('was changed')
}