import mysql, { Pool, ResultSetHeader } from "mysql2/promise";
import logger from "./logger";

export type DatabaseResult = ResultSetHeader;

class Database {
  private readonly pool: Pool;

  public constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST ?? "localhost",
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "aanwezigheid_systeem",
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true
    });
  }

  public async query<T>(sql: string, values: unknown[] = []): Promise<T> {
    const [rows] = await this.pool.execute(sql, values as never[]);
    return rows as T;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async checkConnection(): Promise<void> {
    const connection = await this.pool.getConnection();
    connection.release();
    logger.info("Database connection ready");
  }
}

export default new Database();
