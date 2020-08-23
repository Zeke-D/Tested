const express = require('express');
const { db, errorHandlerCreator } = require('../../../model/db/db.js');

// CRUD for locations
const router = express.Router();

// default location handler for returning an array of location results
const locationResultHandler = (response, result) => {
    response.json({locations: result.rows})
};

// read all locations
router.get('/', async (req, res) => {
    const query_res = await db.query('SELECT * from locations',[],
        errorHandlerCreator(locationResultHandler, req, res, next));
});

// read one location
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'
    await db.query(
        'SELECT * from locations WHERE id = $1::integer', [id], 
        errorHandlerCreator(locationResultHandler, res, next));
});

// find nearby available locations/times
router.get('/findTimes/:latitude&:longitude&:radius', async (req, res, next) => {
    const { latitude, longitude } = req.params;

    const MAX_RADIUS_IN_MILES = 20;

    // constrain radius input to [0, MAX_RADIUS_IN_MILES] miles
    const radius = Math.max(0, Math.min(MAX_RADIUS_IN_MILES, req.params.radius));
    if (isNaN(radius)) {
        res.status(422);
        next({message: "Radius is not a valid floating point number."});
        return;
    }

    // this will return all available times slots and locations within a set radius
    const query =  "select \
                        array_agg(time) as times,\
                        lat, long, ran_by, name, \
                        nearby_locs.id as loc_id\
                    from time_slots \
                    inner join ( \
	                    select id, lat, long, ran_by, name from locations \
                        where calculate_distance($1::float8, $2::float8, lat, long, 'M') <= $3::float8 \
                    ) as nearby_locs on time_slots.location_id=nearby_locs.id \
                    where time_slots.user_id isnull and time_slots.time >= CURRENT_DATE\
	                group by nearby_locs.id, lat, long, ran_by, name;";

    await db.query(
        query, [latitude, longitude, radius],
        errorHandlerCreator(locationResultHandler, res, next));
});


module.exports = router;