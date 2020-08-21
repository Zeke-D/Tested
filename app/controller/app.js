const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const api_v1 = require('./API/v1/routes.js');
require('dotenv').config()

const app = express();
// setup middleware
app.use(morgan('common'));
app.use(helmet());
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use('/api/v1', api_v1);

app.get('/', (req, res) => {
    res.json({
        hello: "world"
    })
});


// not found middleware
app.use((req, res, next) => {
    const err = new Error(`URL ${req.originalUrl} not found`);
    res.status(404);
    next(err);
});

app.use((error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: error.message,
        stack: error.stack
    });
});

const port = process.env.PORT || 1337;
app.listen(port, () => {console.log("WOOHOO")});