const express = require('express');
const { db, errorHandlerCreator } = require('../../../model/db/db.js');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// CRUD for locations
const router = express.Router();

// read all locations
router.get('/', async (req, res) => {
    const query_res = await db.query('SELECT * from locations');
    res.json({
        locations: query_res.rows
    });
});

// read one location
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'
    const resultHandler = (response, result) => {
        res.json({user:result.rows[0]})
    };
    await db.query(
        'SELECT * from locations WHERE id = $1::integer', [id], 
        errorHandlerCreator(resultHandler, req, res, next));
});

// find nearby locations
router.get('/find/:latitude&:longitude&:radius', async (req, res, next) => {
    const { latitude, longitude } = req.params;

    const MAX_RADIUS_IN_MILES = 20;

    // constrain radius input to [0, MAX_RADIUS_IN_MILES] miles
    const radius = Math.max(0, Math.min(MAX_RADIUS_IN_MILES, req.params.radius));
    if (isNaN(radius)) {
        res.status(422);
        next({message: "Radius is not a valid floating point number."});
        return;
    }
    
    const query = "SELECT * FROM locations\
                   WHERE calculate_distance($1::float8, $2::float8, lat, long, 'M') <= $3::float8";
    
    const resultHandler = (response, result) => {
        response.json({
            "locations":result.rows
        })
    };
    await db.query(
        query, [latitude, longitude, radius],
        errorHandlerCreator(resultHandler, req, res, next));
});


module.exports = router;