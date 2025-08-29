// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // ← nom de ta base existante
  password: 'zak',
  port: 5432,
});

module.exports = pool;
