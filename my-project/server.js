import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize dotenv to load .env variables
dotenv.config();

const app = express();

// Use CORS so your frontend can talk to this server
app.use(cors());

// Database connection using your connection string
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_MRyWf0xsKl2u@ep-red-shape-a7ktl0cf-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require'
});

// Test the database connection immediately
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error acquiring client:', err.stack);
    }
    console.log('✅ Successfully connected to Neon PostgreSQL database!');
    release();
});

// API Route to fetch skin cancer statistics
app.get('/api/skin-cancer-stats', async (req, res) => {
    try {
        // NOTE: Replace 'your_table_name' with your actual table name in Neon
        const result = await pool.query('SELECT age_group, cases FROM your_table_name');
        res.json(result.rows);
    } catch (err) {
        console.error("Database query error:", err.message);
        res.status(500).send(err.message);
    }
});

// Set the port and start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});