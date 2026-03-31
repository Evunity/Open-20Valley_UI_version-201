import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { seedDatabase } from './seeds';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

let dbInstance: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
  try {
    const dbExists = fs.existsSync(DB_PATH);
    
    const db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Run schema if database is new
    if (!dbExists) {
      console.log('Creating database schema...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      
      // Split by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        db.exec(statement);
      }
      
      console.log('Schema created successfully');
      
      // Seed with initial data
      console.log('Seeding database...');
      seedDatabase(db);
      console.log('Database seeded successfully');
    } else {
      console.log('Database already exists');
    }
    
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Helper to run a query
export function runQuery<T = any>(
  query: string,
  params: any[] = []
): T[] {
  const db = getDatabase();
  const stmt = db.prepare(query);
  
  if (query.trim().toUpperCase().startsWith('SELECT')) {
    return stmt.all(...params) as T[];
  } else {
    return [stmt.run(...params) as T];
  }
}

// Helper to get a single row
export function getOne<T = any>(
  query: string,
  params: any[] = []
): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(query);
  return stmt.get(...params) as T | undefined;
}

// Helper to execute insert/update/delete
export function executeQuery(query: string, params: any[] = []): void {
  const db = getDatabase();
  const stmt = db.prepare(query);
  stmt.run(...params);
}
