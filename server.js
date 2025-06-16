const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DB_PATH);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Accès non autorisé' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      const token = jwt.sign(
        { id: this.lastID, email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        id: this.lastID,
        email,
        name,
        role: 'user',
        token
      });
    }
  );
});

// Admin API routes
// Users
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  db.all('SELECT id, email, name, role, created_at FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(users);
  });
});

app.get('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  db.get('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  });
});

app.put('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  const { name, role } = req.body;
  
  db.run(
    'UPDATE users SET name = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, role, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (this.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json({ message: 'Utilisateur mis à jour avec succès' });
    }
  );
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (this.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// Companies
app.get('/api/admin/companies', authenticateToken, isAdmin, (req, res) => {
  db.all('SELECT * FROM companies', (err, companies) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(companies);
  });
});

app.post('/api/admin/companies', authenticateToken, isAdmin, (req, res) => {
  const { name, logo, industry, description, size, locations, website, rating } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });

  db.run(
    `INSERT INTO companies (name, logo, industry, description, size, locations, website, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, logo, industry, description, size, locations, website, rating || 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      
      db.get('SELECT * FROM companies WHERE id = ?', [this.lastID], (err, company) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(201).json(company);
      });
    }
  );
});

app.put('/api/admin/companies/:id', authenticateToken, isAdmin, (req, res) => {
  const { name, logo, industry, description, size, locations, website, rating } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });

  db.run(
    `UPDATE companies 
     SET name = ?, logo = ?, industry = ?, description = ?, size = ?, 
         locations = ?, website = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, logo, industry, description, size, locations, website, rating, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (this.changes === 0) return res.status(404).json({ error: 'Entreprise non trouvée' });
      
      db.get('SELECT * FROM companies WHERE id = ?', [req.params.id], (err, company) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(company);
      });
    }
  );
});

app.delete('/api/admin/companies/:id', authenticateToken, isAdmin, (req, res) => {
  db.run('DELETE FROM companies WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (this.changes === 0) return res.status(404).json({ error: 'Entreprise non trouvée' });
    res.json({ message: 'Entreprise supprimée avec succès' });
  });
});

// Jobs
app.get('/api/admin/jobs', authenticateToken, isAdmin, (req, res) => {
  db.all(`
    SELECT j.*, c.name as company_name 
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
  `, (err, jobs) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(jobs);
  });
});

app.post('/api/admin/jobs', authenticateToken, isAdmin, (req, res) => {
  const { title, company_id, location, description, requirements, salary_range, type, remote, skills } = req.body;
  
  if (!title || !company_id) return res.status(400).json({ error: 'Titre et entreprise requis' });

  db.run(
    `INSERT INTO jobs (title, company_id, location, description, requirements, salary_range, type, remote, skills)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, company_id, location, description, requirements, salary_range, type, remote ? 1 : 0, skills],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      
      db.get(`
        SELECT j.*, c.name as company_name 
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
      `, [this.lastID], (err, job) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(201).json(job);
      });
    }
  );
});

app.put('/api/admin/jobs/:id', authenticateToken, isAdmin, (req, res) => {
  const { title, company_id, location, description, requirements, salary_range, type, remote, skills } = req.body;
  
  if (!title || !company_id) return res.status(400).json({ error: 'Titre et entreprise requis' });

  db.run(
    `UPDATE jobs 
     SET title = ?, company_id = ?, location = ?, description = ?, requirements = ?, 
         salary_range = ?, type = ?, remote = ?, skills = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, company_id, location, description, requirements, salary_range, type, remote ? 1 : 0, skills, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (this.changes === 0) return res.status(404).json({ error: 'Offre non trouvée' });
      
      db.get(`
        SELECT j.*, c.name as company_name 
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
      `, [req.params.id], (err, job) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(job);
      });
    }
  );
});

app.delete('/api/admin/jobs/:id', authenticateToken, isAdmin, (req, res) => {
  db.run('DELETE FROM jobs WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (this.changes === 0) return res.status(404).json({ error: 'Offre non trouvée' });
    res.json({ message: 'Offre supprimée avec succès' });
  });
});

// Dashboard stats for admin
app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  const stats = {};
  
  // Get user count
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    stats.users = result.count;
    
    // Get job count
    db.get('SELECT COUNT(*) as count FROM jobs', (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      stats.jobs = result.count;
      
      // Get company count
      db.get('SELECT COUNT(*) as count FROM companies', (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        stats.companies = result.count;
        
        // Get application count
        db.get('SELECT COUNT(*) as count FROM applications', (err, result) => {
          if (err) return res.status(500).json({ error: 'Erreur serveur' });
          stats.applications = result.count;
          
          // Get letter count
          db.get('SELECT COUNT(*) as count FROM letters', (err, result) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur' });
            stats.letters = result.count;
            
            res.json(stats);
          });
        });
      });
    });
  });
});

// Public API routes
app.get('/api/jobs', (req, res) => {
  const query = `
    SELECT j.*, c.name as company_name, c.logo as company_logo
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    ORDER BY j.created_at DESC
  `;
  
  db.all(query, (err, jobs) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(jobs);
  });
});

app.get('/api/companies', (req, res) => {
  db.all('SELECT * FROM companies', (err, companies) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(companies);
  });
});

// Routes pour les pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Catch-all route to serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur MotivAI démarré sur http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`👑 Admin: http://localhost:${PORT}/admin`);
});