const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config()

// Routers
const api_v1 = require('./API/v1/routes.js');
const errorMiddleware = require('./middlewares/errorMiddleware');

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

app.use(errorMiddleware.notFoundMiddleware);
app.use(errorMiddleware.errorHandlerMiddleware);

const port = process.env.PORT || 1337;
app.listen(port, () => {console.log("WOOHOO")});