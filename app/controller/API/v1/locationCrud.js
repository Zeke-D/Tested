const express = require('express');
const { Location } = require('../../../model/location');

// CRUD for locations
const router = express.Router();

// default location handler for returning an array of location results
const locationResultHandler = (response, result) => {
    response.json({locations: result.rows})
};


// read one location
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'
    Location.find(id)
    .then(result => res.json({location:result}))
    .catch(err => next(err));
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
    Location.findNearby(latitude, longitude, radius)
    .then(result => res.json({locations:result}))
    .catch(err => next(err));
});


module.exports = router;