const { db } = require('./db/db.js');
const { parsePgError, BadQueryError } = require('./errors/dbErrors.js');

class Location {
    constructor(name, lat, long, ran_by) {
        this.name = name;
        this.lat = lat;
        this.long = long;
        this.ran_by = ran_by;
    }

    // attempts to save the location by inserting into db (async tag is just noting its return type)
    // returns a promise that will resolve with success, reject with db error
    async save() {
        //query that adds user to db
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO locations (name, lat, long, ran_by)\
                    VALUES ($1, $2, $3, $4)',
            [this.name, this.lat, this.long, this.ran_by])
            .then(result => resolve({message: "Location created succesfully."}))
            .catch(err => reject(parsePgError(err)));

        });
    }

    // finds a user with a given id
    // returns a promise that resolves with a user, rejects with a db error
    static async find(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * from locations WHERE id=$1::integer', [id])
            .then(result => resolve(result.rows[0]))
            .catch(err => reject(new NotFoundError("Location could not be found.")))
        });
    }

    static findNearby(lat, long, radius) {
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

        return new Promise((resolve, reject) => {
            db.query( query, [lat, long, radius])
            .then(result => resolve(result.rows))
            .catch(err => reject(new BadQueryError("Please ensure latitute, longitude, and radius are floating point numbers.")));
        })

    }

}

module.exports = {
    Location,
}