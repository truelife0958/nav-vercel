const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./config');
const initSqlJs = require('sql.js');
const { seed } = require('./seed');

const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(__dirname, 'database');
const dbPath = path.join(dbDir, 'nav.db');

let db;
let dbReady;

function initializeDatabase() {
  dbReady = new Promise(async (resolve, reject) => {
    try {
      if (!isVercel && !fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
      }
    
      const SQL = await initSqlJs();
    
      let buffer = null;
      if (!isVercel && fs.existsSync(dbPath)) {
        buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
      } else {
        db = new SQL.Database();
        createSchema();
        seed(db);
        saveDb();
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function createSchema() {
  db.run(`CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    "order" INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sub_menus (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(parent_id) REFERENCES menus(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    menu_id INTEGER,
    sub_menu_id INTEGER,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT,
    custom_logo_path TEXT,
    desc TEXT,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY(sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    last_login_time TEXT,
    last_login_ip TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY,
    position TEXT NOT NULL,
    img TEXT NOT NULL,
    url TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    logo TEXT
  )`);
}

function saveDb() {
  if (!isVercel) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

initializeDatabase();

module.exports = {
  getDb: async () => {
    await dbReady;
    return db;
  },
  saveDb
};
