import sql from "mssql";
const user = process.env.NEXT_DB_USER;
const password = process.env.NEXT_DB_PASSWORD;
const database = process.env.NEXT_DATABASE;
const server = process.env.NEXT_DB_SERVER;
// SQL Server Configuration
const config = {
  user: user,
  password: password,
  server: server||"localhost", // Example: localhost, 1433
  database: database,
  options: {
    encrypt: false, // Set to true if using Azure SQL
  },
};

let pool: sql.ConnectionPool | null = null;

export async function connectToDB(retries = 5, delay = 1000) {
  if (pool && pool.connected) return pool;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      pool = await sql.connect(config);
      console.log("Connected to SQL Server");
      return pool;
    } catch (error) {
      console.error(`Attempt ${attempt} - Database connection error:`, error);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw new Error("Failed to connect to the database after retries");
      }
    }
  }

  throw new Error("Unexpected failure in connectToDB");
}
