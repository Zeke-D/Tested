const { Pool } = require('pg')
const pool = new Pool({
    host:       process.env.PGHOST,
    port:       process.env.PGPORT,
    database:   process.env.PGDATABASE,
    user:       process.env.PGUSER,
    password:   process.env.PGPASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

// Higher Order function to create postgres error handler
// takes in:
//      - responseHandler (which performs actions on the res object based on the query result)
//      - res (response object)
//      - next
function pgErrorHandlerCreator(responseHandler, res, next) {
    return (error, query_result) => {
        if (error) {
            res.status(422);
            next(error);
        }
        else {
            // if we've gotten a response and no errors, 
            // we proceed to handle the response with provided responseHandler
            responseHandler(res, query_result);
        }
    }
}

module.exports = {
    db: pool,
    errorHandlerCreator: pgErrorHandlerCreator
};