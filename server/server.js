require('./config/config');
const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouter');
const todoRouter = require('./routers/todoRouter');

var app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(todoRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app };