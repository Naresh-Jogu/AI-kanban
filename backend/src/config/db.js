// Pool class from postgresql library pg
const { Pool } = require("pg");

// database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}, // ssl => Secure socket layer
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// shows error when db not connected
pool.on("error", (err) => {
    console.error("Unexpected postgreSQL pool error:", err)
});

// query is helper function 
const query = (text, params) => pool.query(text, params);

// mutli query async helper function
const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result
    } catch (err) {
        await client.query("ROLLBACK");
        
        throw err 
    } finally {
        client.release();
    }
}

module.exports = {pool, query, withTransaction};