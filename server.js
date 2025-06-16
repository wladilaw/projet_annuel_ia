const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static('public'));

// Routes API simulées
app.get('/api/jobs', (req, res) => {
    const jobs = [
        {
            id: 1,
            title: 'Senior Full Stack Engineer',
            company: 'Google',
            location: 'Paris 08',
            salary: '70-90K€',
            type: 'CDI',
            remote: 'Télétravail flexible',
            description: 'Nous recherchons un développeur Full Stack passionné...',
            skills: ['React', 'Node.js', 'TypeScript', 'GCP'],
            match: 85,
            posted: '2h'
        },
        {
            id: 2,
            title: 'Frontend Developer - Growth Team',
            company: 'Spotify',
            location: 'Paris, La Défense',
            salary: '55-70K€',
            type: 'CDI',
            remote: 'Hybrid',
            description: 'Rejoignez l\'équipe Growth de Spotify...',
            skills: ['React', 'Redux', 'A/B Testing'],
            match: 78,
            posted: '5h'
        }
    ];
    res.json(jobs);
});

app.get('/api/companies', (req, res) => {
    const companies = [
        {
            id: 1,
            name: 'Google',
            industry: 'Tech',
            size: '150K+ employés',
            location: 'Paris, Lyon',
            openJobs: 156,
            rating: 4.8,
            logo: 'https://logo.clearbit.com/google.com'
        },
        {
            id: 2,
            name: 'Spotify',
            industry: 'Music Tech',
            size: '9K+ employés',
            location: 'Paris',
            openJobs: 42,
            rating: 4.7,
            logo: 'https://logo.clearbit.com/spotify.com'
        }
    ];
    res.json(companies);
});

// Routes pour les pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cv-builder', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cv-builder.html'));
});

app.get('/jobs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jobs.html'));
});

app.get('/companies', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'companies.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/ai-coach', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai-coach.html'));
});

app.get('/interview-prep', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'interview-prep.html'));
});

app.get('/salary-analyzer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'salary-analyzer.html'));
});

app.get('/career-path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'career-path.html'));
});

app.get('/networking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'networking.html'));
});

app.get('/skills-assessment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'skills-assessment.html'));
});

app.get('/market-insights', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'market-insights.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

app.get('/templates', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'templates.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur MotivAI démarré sur http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`💼 CV Builder: http://localhost:${PORT}/cv-builder`);
    console.log(`🏢 Entreprises: http://localhost:${PORT}/companies`);
    console.log(`💼 Offres: http://localhost:${PORT}/jobs`);
});