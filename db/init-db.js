const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure the db directory exists
const dbDir = path.dirname(process.env.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DB_PATH);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Companies table
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      industry TEXT,
      description TEXT,
      size TEXT,
      locations TEXT,
      website TEXT,
      rating REAL DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Jobs table
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company_id INTEGER NOT NULL,
      location TEXT,
      description TEXT,
      requirements TEXT,
      salary_range TEXT,
      type TEXT,
      remote BOOLEAN DEFAULT 0,
      skills TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id)
    )
  `);

  // CVs table
  db.run(`
    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      template TEXT DEFAULT 'modern',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Letters table
  db.run(`
    CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      job_id INTEGER,
      title TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (job_id) REFERENCES jobs (id)
    )
  `);

  // Applications table
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      letter_id INTEGER,
      cv_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (job_id) REFERENCES jobs (id),
      FOREIGN KEY (letter_id) REFERENCES letters (id),
      FOREIGN KEY (cv_id) REFERENCES cvs (id)
    )
  `);

  // Insert admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT OR IGNORE INTO users (email, password, name, role)
    VALUES ('admin@motivai.com', ?, 'Admin MotivAI', 'admin')
  `, [hashedPassword]);

  // Insert sample companies
  db.run(`
    INSERT OR IGNORE INTO companies (name, logo, industry, description, size, locations, website, rating, reviews)
    VALUES 
    ('Google', 'https://logo.clearbit.com/google.com', 'Tech', 'Leader mondial de la technologie et de l''innovation', '150K+ employés', 'Paris, Lyon', 'https://google.com', 4.8, 1234),
    ('Spotify', 'https://logo.clearbit.com/spotify.com', 'Music Tech', 'Révolutionne l''industrie musicale avec la technologie', '9K+ employés', 'Paris', 'https://spotify.com', 4.7, 876),
    ('Airbnb', 'https://logo.clearbit.com/airbnb.com', 'Travel', 'Connecte les voyageurs du monde entier', '6K+ employés', 'Remote', 'https://airbnb.com', 4.6, 743)
  `);

  // Insert sample jobs
  db.run(`
    INSERT OR IGNORE INTO jobs (title, company_id, location, description, requirements, salary_range, type, remote, skills)
    VALUES 
    ('Senior Full Stack Engineer', 1, 'Paris 08', 'Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe Cloud Platform.', 'JavaScript, React, Node.js, TypeScript, GCP', '70-90K€', 'CDI', 1, 'React,Node.js,TypeScript,GCP'),
    ('Frontend Developer - Growth Team', 2, 'Paris, La Défense', 'Rejoignez l''équipe Growth de Spotify pour créer des expériences utilisateur exceptionnelles.', 'JavaScript, React, Redux, A/B Testing', '55-70K€', 'CDI', 1, 'React,Redux,A/B Testing'),
    ('Lead Backend Developer', 3, 'Paris 10', 'Nous recherchons un Lead Backend pour diriger notre équipe technique et participer à la refonte de notre architecture microservices.', 'Python, Go, Kubernetes', '80-100K€', 'CDI', 0, 'Python,Go,Kubernetes')
  `);

  console.log('Database initialized successfully!');
  console.log('Admin user created:');
  console.log('Email: admin@motivai.com');
  console.log('Password: admin123');
});

// Close the database connection
db.close();