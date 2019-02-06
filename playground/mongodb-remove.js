const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {ObjectID} = require('mongodb');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//     console.log(result)
// });

// Todo.findOneAndRemove({_id: '5c5a2b392c3f641538e44722'}).then((res) => {
//     console.log(res);
// })

Todo.findByIdAndDelete('5c5a2b3b2c3f641538e44731').then((res) => {
    console.log(res);
})

