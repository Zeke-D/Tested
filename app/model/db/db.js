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

module.exports = {
    db: pool,
};