// src/lib/db.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dateStrings: ["DATE", "DATETIME"],
  database: process.env.DB_NAME,
});
