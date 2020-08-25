const { Pool } = require('pg')
const pool = new Pool({
<<<<<<< HEAD
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
=======
    host:       process.env.PGHOST,
    port:       process.env.PGPORT,
    database:   process.env.PGDATABASE,
    user:       process.env.PGUSER,
    password:   process.env.PGPASSWORD,
>>>>>>> 33449e4383812bac05b618b3ee2facd87a62d044
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

<<<<<<< HEAD
function pgErrorHandlerCreator(res, next) {
    return (error, query_result) => {
        if (error) {
            res.status(422);
            next(error);
        }
        else if (query_result.rows.length === 0) {
            res.status(404);
            next({message: "No entries found"});
        }
        else {
            res.json({user: query_result});
        }
    }
}

module.exports = {
    db: pool,
    errorHandlerCreator: pgErrorHandlerCreator
=======
module.exports = {
    db: pool,
>>>>>>> 33449e4383812bac05b618b3ee2facd87a62d044
};