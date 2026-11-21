import { JSONFilePreset } from 'lowdb/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbFilePath = path.resolve(__dirname, 'db.json');

// When deployed to Vercel (serverless environment), file writes must happen in /tmp
if (process.env.VERCEL) {
  const tmpPath = path.join('/tmp', 'db.json');
  if (!fs.existsSync(tmpPath)) {
    try {
      const initialData = fs.readFileSync(dbFilePath, 'utf-8');
      fs.writeFileSync(tmpPath, initialData, 'utf-8');
    } catch (e) {
      console.warn('Could not copy db.json to /tmp, fallback to empty:', e);
    }
  }
  dbFilePath = tmpPath;
}

// In-memory singleton to eliminate redundant disk reads on every request
let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await JSONFilePreset(dbFilePath, {
      users: [],
      tasks: [],
      attendance: [],
      announcements: []
    });
  }
  return dbInstance;
}
