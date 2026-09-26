import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'sistema_rrhh',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export const executeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export default pool;