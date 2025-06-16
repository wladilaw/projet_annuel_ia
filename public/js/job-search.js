// Fonctionnalités avancées pour la recherche d'emploi

class JobSearch {
    constructor() {
        this.filters = {
            location: '',
            distance: 10,
            contractTypes: ['CDI'],
            salary: {
                min: 0,
                max: 100000
            },
            experience: '',
            remote: false,
            skills: []
        };
        
        this.jobs = [];
        this.filteredJobs = [];
        this.savedJobs = [];
        this.appliedJobs = [];
        
        this.init();
    }
    
    async init() {
        // Charger les emplois depuis l'API
        await this.fetchJobs();
        
        // Charger les emplois sauvegardés
        this.loadSavedJobs();
        
        // Charger les candidatures
        this.loadAppliedJobs();
        
        // Initialiser les filtres
        this.initFilters();
        
        // Afficher les emplois
        this.renderJobs();
        
        // Initialiser les écouteurs d'événements
        this.initEventListeners();
    }
    
    async fetchJobs() {
        try {
            // Dans une application réelle, on ferait un appel API
            // Pour l'instant, on utilise des données simulées
            this.jobs = [
                {
                    id: 1,
                    title: 'Senior Full Stack Engineer',
                    company: 'Google',
                    logo: 'https://logo.clearbit.com/google.com',
                    location: 'Paris 08',
                    salary: '70-90K€',
                    type: 'CDI',
                    remote: 'Télétravail flexible',
                    description: 'Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe Cloud Platform. Vous travaillerez sur des projets innovants à grande échelle...',
                    skills: ['React', 'Node.js', 'TypeScript', 'GCP'],
                    match: 85,
                    posted: '2h'
                },
                {
                    id: 2,
                    title: 'Frontend Developer - Growth Team',
                    company: 'Spotify',
                    logo: 'https://logo.clearbit.com/spotify.com',
                    location: 'Paris, La Défense',
                    salary: '55-70K€',
                    type: 'CDI',
                    remote: 'Hybrid',
                    description: 'Rejoignez l\'équipe Growth de Spotify pour créer des expériences utilisateur exceptionnelles. Vous travaillerez sur l\'optimisation de notre onboarding...',
                    skills: ['React', 'Redux', 'A/B Testing'],
                    match: 78,
                    posted: '5h'
                },
                {
                    id: 3,
                    title: 'Lead Backend Developer',
                    company: 'Leboncoin',
                    logo: 'https://logo.clearbit.com/leboncoin.fr',
                    location: 'Paris 10',
                    salary: '80-100K€',
                    type: 'CDI',
                    remote: '',
                    description: 'Nous recherchons un Lead Backend pour diriger notre équipe technique et participer à la refonte de notre architecture microservices...',
                    skills: ['Python', 'Go', 'Kubernetes'],
                    match: 65,
                    posted: '1 jour'
                },
                {
                    id: 4,
                    title: 'Développeur Full Stack Junior',
                    company: 'StartupTech',
                    logo: '',
                    location: 'Station F, Paris',
                    salary: '35-45K€',
                    type: 'CDI',
                    remote: 'Startup',
                    description: 'Startup en pleine croissance recherche un développeur junior motivé pour rejoindre notre équipe et participer au développement de notre plateforme SaaS...',
                    skills: ['Vue.js', 'Laravel', 'MySQL'],
                    match: 92,
                    posted: '2 jours'
                }
            ];
            
            // Appliquer les filtres initiaux
            this.filteredJobs = [...this.jobs];
        } catch (error) {
            console.error('Erreur lors du chargement des offres d\'emploi:', error);
        }
    }
    
    loadSavedJobs() {
        const savedJobs = localStorage.getItem('saved_jobs');
        if (savedJobs) {
            try {
                this.savedJobs = JSON.parse(savedJobs);
            } catch (error) {
                console.error('Erreur lors du chargement des emplois sauvegardés:', error);
                this.savedJobs = [];
            }
        }
    }
    
    loadAppliedJobs() {
        const appliedJobs = localStorage.getItem('applied_jobs');
        if (appliedJobs) {
            try {
                this.appliedJobs = JSON.parse(appliedJobs);
            } catch (error) {
                console.error('Erreur lors du chargement des candidatures:', error);
                this.appliedJobs = [];
            }
        }
    }
    
    initFilters() {
        // Initialiser les filtres à partir de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('location')) {
            this.filters.location = urlParams.get('location');
            document.querySelector('input[name="location"]').value = this.filters.location;
        }
        
        if (urlParams.has('distance')) {
            this.filters.distance = parseInt(urlParams.get('distance'));
            document.querySelector('select[name="distance"]').value = this.filters.distance;
        }
        
        if (urlParams.has('contractTypes')) {
            this.filters.contractTypes = urlParams.get('contractTypes').split(',');
            this.filters.contractTypes.forEach(type => {
                const checkbox = document.querySelector(`input[name="contractType"][value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (urlParams.has('minSalary')) {
            this.filters.salary.min = parseInt(urlParams.get('minSalary'));
            document.querySelector('input[name="minSalary"]').value = this.filters.salary.min;
        }
        
        if (urlParams.has('maxSalary')) {
            this.filters.salary.max = parseInt(urlParams.get('maxSalary'));
            document.querySelector('input[name="maxSalary"]').value = this.filters.salary.max;
        }
        
        if (urlParams.has('experience')) {
            this.filters.experience = urlParams.get('experience');
            document.querySelector(`input[name="experience"][value="${this.filters.experience}"]`).checked = true;
        }
        
        if (urlParams.has('remote')) {
            this.filters.remote = urlParams.get('remote') === 'true';
            document.querySelector('input[name="remote"]').checked = this.filters.remote;
        }
        
        if (urlParams.has('skills')) {
            this.filters.skills = urlParams.get('skills').split(',');
            // Initialiser les compétences (à implémenter)
        }
    }
    
    initEventListeners() {
        // Écouteurs pour les filtres
        document.querySelectorAll('input[name="location"], select[name="distance"]').forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });
        
        document.querySelectorAll('input[name="contractType"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
        
        document.querySelectorAll('input[name="minSalary"], input[name="maxSalary"]').forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });
        
        document.querySelectorAll('input[name="experience"]').forEach(radio => {
            radio.addEventListener('change', () => this.applyFilters());
        });
        
        document.querySelector('input[name="remote"]')?.addEventListener('change', () => this.applyFilters());
        
        // Écouteur pour le bouton d'application des filtres
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        
        // Écouteurs pour les boutons de sauvegarde
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-job-id');
                this.toggleSaveJob(jobId);
            });
        });
        
        // Écouteurs pour les boutons de candidature
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-job-id');
                this.applyToJob(jobId);
            });
        });
        
        // Écouteur pour les cartes d'emploi (navigation vers le détail)
        document.querySelectorAll('.job-card').forEach(card => {
            card.addEventListener('click', () => {
                const jobId = card.getAttribute('data-job-id');
                this.navigateToJobDetail(jobId);
            });
        });
    }
    
    applyFilters() {
        // Récupérer les valeurs des filtres
        this.filters.location = document.querySelector('input[name="location"]')?.value || '';
        this.filters.distance = parseInt(document.querySelector('select[name="distance"]')?.value || '10');
        
        this.filters.contractTypes = Array.from(document.querySelectorAll('input[name="contractType"]:checked'))
            .map(checkbox => checkbox.value);
        
        this.filters.salary.min = parseInt(document.querySelector('input[name="minSalary"]')?.value || '0');
        this.filters.salary.max = parseInt(document.querySelector('input[name="maxSalary"]')?.value || '100000');
        
        const experienceRadio = document.querySelector('input[name="experience"]:checked');
        this.filters.experience = experienceRadio ? experienceRadio.value : '';
        
        this.filters.remote = document.querySelector('input[name="remote"]')?.checked || false;
        
        // Filtrer les emplois
        this.filteredJobs = this.jobs.filter(job => {
            // Filtre par localisation
            if (this.filters.location && !job.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
                return false;
            }
            
            // Filtre par type de contrat
            if (this.filters.contractTypes.length > 0 && !this.filters.contractTypes.includes(job.type)) {
                return false;
            }
            
            // Filtre par salaire
            const salaryRange = job.salary.replace(/[^0-9-]/g, '').split('-');
            const minSalary = parseInt(salaryRange[0]) * 1000;
            const maxSalary = parseInt(salaryRange[1]) * 1000;
            
            if (minSalary > this.filters.salary.max || maxSalary < this.filters.salary.min) {
                return false;
            }
            
            // Filtre par expérience (à implémenter)
            
            // Filtre par télétravail
            if (this.filters.remote && !job.remote) {
                return false;
            }
            
            return true;
        });
        
        // Mettre à jour l'URL avec les filtres
        this.updateURL();
        
        // Afficher les résultats filtrés
        this.renderJobs();
    }
    
    updateURL() {
        const url = new URL(window.location.href);
        
        // Mettre à jour les paramètres d'URL
        if (this.filters.location) {
            url.searchParams.set('location', this.filters.location);
        } else {
            url.searchParams.delete('location');
        }
        
        url.searchParams.set('distance', this.filters.distance.toString());
        
        if (this.filters.contractTypes.length > 0) {
            url.searchParams.set('contractTypes', this.filters.contractTypes.join(','));
        } else {
            url.searchParams.delete('contractTypes');
        }
        
        url.searchParams.set('minSalary', this.filters.salary.min.toString());
        url.searchParams.set('maxSalary', this.filters.salary.max.toString());
        
        if (this.filters.experience) {
            url.searchParams.set('experience', this.filters.experience);
        } else {
            url.searchParams.delete('experience');
        }
        
        url.searchParams.set('remote', this.filters.remote.toString());
        
        if (this.filters.skills.length > 0) {
            url.searchParams.set('skills', this.filters.skills.join(','));
        } else {
            url.searchParams.delete('skills');
        }
        
        // Mettre à jour l'URL sans recharger la page
        window.history.replaceState({}, '', url.toString());
    }
    
    renderJobs() {
        const container = document.getElementById('jobsContainer');
        if (!container) return;
        
        if (this.filteredJobs.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-xl p-8 shadow-sm text-center">
                    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-icons text-gray-400 text-3xl">search_off</span>
                    </div>
                    <h3 class="text-xl font-semibold text-primary mb-2">Aucune offre trouvée</h3>
                    <p class="text-text-light mb-4">Essayez de modifier vos filtres pour voir plus de résultats.</p>
                    <button id="resetFilters" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition">
                        Réinitialiser les filtres
                    </button>
                </div>
            `;
            
            document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
            return;
        }
        
        container.innerHTML = this.filteredJobs.map(job => this.renderJobCard(job)).join('');
        
        // Réinitialiser les écouteurs d'événements
        this.initEventListeners();
    }
    
    renderJobCard(job) {
        const isSaved = this.savedJobs.some(savedJob => savedJob.id === job.id);
        const isApplied = this.appliedJobs.some(appliedJob => appliedJob.id === job.id);
        
        return `
            <article class="job-card bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer" data-job-id="${job.id}">
                <div class="flex items-start space-x-4">
                    ${job.logo ? `
                        <img src="${job.logo}" alt="${job.company}" class="w-16 h-16 rounded-xl object-contain bg-gray-50 p-2">
                    ` : `
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            ${job.company.substring(0, 2).toUpperCase()}
                        </div>
                    `}
                    
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div>
                                <h2 class="text-xl font-semibold text-primary group-hover:text-accent transition">
                                    ${job.title}
                                </h2>
                                <div class="flex items-center space-x-3 mt-1">
                                    <span class="font-medium text-gray-700">${job.company}</span>
                                    <span class="text-gray-400">•</span>
                                    <div class="flex items-center text-sm text-gray-600">
                                        <span class="material-icons text-base mr-1">location_on</span>
                                        ${job.location}
                                    </div>
                                    <span class="text-gray-400">•</span>
                                    <span class="text-sm text-gray-600">Il y a ${job.posted}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p class="text-gray-600 mt-3 line-clamp-2">
                            ${job.description}
                        </p>
                        
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${job.skills.map(skill => `
                                <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">${skill}</span>
                            `).join('')}
                        </div>
                        
                        <div class="flex items-center justify-between mt-4">
                            <div class="flex items-center space-x-4">
                                <span class="text-lg font-semibold text-primary">${job.salary}</span>
                                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">${job.type}</span>
                                ${job.remote ? `
                                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center">
                                        <span class="material-icons text-base mr-1">home</span>
                                        ${job.remote}
                                    </span>
                                ` : ''}
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="bookmark-btn p-2 text-gray-400 hover:text-accent transition" data-job-id="${job.id}">
                                    <span class="material-icons">${isSaved ? 'bookmark' : 'bookmark_border'}</span>
                                </button>
                                <button class="apply-btn px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition flex items-center" data-job-id="${job.id}">
                                    <span class="material-icons text-base mr-1">send</span>
                                    ${isApplied ? 'Déjà postulé' : 'Postuler'}
                                </button>
                            </div>
                        </div>

                        <!-- Match Score -->
                        <div class="mt-4 pt-4 border-t border-gray-100">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">Correspondance avec votre profil</span>
                                <div class="flex items-center">
                                    <div class="w-32 h-2 bg-gray-200 rounded-full mr-3">
                                        <div class="h-full bg-gradient-to-r ${job.match >= 80 ? 'from-green-500 to-green-600' : job.match >= 60 ? 'from-yellow-500 to-yellow-600' : 'from-orange-500 to-orange-600'} rounded-full" style="width: ${job.match}%"></div>
                                    </div>
                                    <span class="text-sm font-semibold ${job.match >= 80 ? 'text-green-600' : job.match >= 60 ? 'text-yellow-600' : 'text-orange-600'}">${job.match}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }
    
    toggleSaveJob(jobId) {
        const jobIndex = this.savedJobs.findIndex(job => job.id.toString() === jobId.toString());
        
        if (jobIndex === -1) {
            // Ajouter aux favoris
            const job = this.jobs.find(job => job.id.toString() === jobId.toString());
            if (job) {
                this.savedJobs.push({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    savedAt: new Date().toISOString()
                });
                
                // Mettre à jour l'icône
                const bookmarkBtn = document.querySelector(`.bookmark-btn[data-job-id="${jobId}"]`);
                if (bookmarkBtn) {
                    bookmarkBtn.querySelector('.material-icons').textContent = 'bookmark';
                    bookmarkBtn.classList.add('text-accent');
                    bookmarkBtn.classList.remove('text-gray-400');
                }
            }
        } else {
            // Retirer des favoris
            this.savedJobs.splice(jobIndex, 1);
            
            // Mettre à jour l'icône
            const bookmarkBtn = document.querySelector(`.bookmark-btn[data-job-id="${jobId}"]`);
            if (bookmarkBtn) {
                bookmarkBtn.querySelector('.material-icons').textContent = 'bookmark_border';
                bookmarkBtn.classList.remove('text-accent');
                bookmarkBtn.classList.add('text-gray-400');
            }
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('saved_jobs', JSON.stringify(this.savedJobs));
    }
    
    applyToJob(jobId) {
        const job = this.jobs.find(job => job.id.toString() === jobId.toString());
        if (!job) return;
        
        // Vérifier si déjà postulé
        if (this.appliedJobs.some(appliedJob => appliedJob.id.toString() === jobId.toString())) {
            alert('Vous avez déjà postulé à cette offre.');
            return;
        }
        
        // Rediriger vers le formulaire de candidature
        localStorage.setItem('current_job_application', JSON.stringify({
            id: job.id,
            title: job.title,
            company: job.company,
            skills: job.skills
        }));
        
        window.location.href = `/form?job=${job.id}`;
    }
    
    navigateToJobDetail(jobId) {
        window.location.href = `/job-detail?id=${jobId}`;
    }
    
    resetFilters() {
        // Réinitialiser les filtres
        this.filters = {
            location: '',
            distance: 10,
            contractTypes: [],
            salary: {
                min: 0,
                max: 100000
            },
            experience: '',
            remote: false,
            skills: []
        };
        
        // Réinitialiser les champs du formulaire
        document.querySelector('input[name="location"]').value = '';
        document.querySelector('select[name="distance"]').value = '10';
        
        document.querySelectorAll('input[name="contractType"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelector('input[name="minSalary"]').value = '';
        document.querySelector('input[name="maxSalary"]').value = '';
        
        document.querySelectorAll('input[name="experience"]').forEach(radio => {
            radio.checked = false;
        });
        
        document.querySelector('input[name="remote"]').checked = false;
        
        // Appliquer les filtres réinitialisés
        this.filteredJobs = [...this.jobs];
        this.updateURL();
        this.renderJobs();
    }
    
    // Méthode pour créer une alerte emploi
    createJobAlert() {
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-lg w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-primary">Créer une alerte emploi</h3>
                    <button class="text-gray-400 hover:text-primary transition" id="closeAlertModal">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                
                <form id="alertForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Intitulé du poste</label>
                        <input type="text" id="alertJobTitle" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${this.filters.location}" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                        <input type="text" id="alertLocation" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${this.filters.location}" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence des alertes</label>
                        <select id="alertFrequency" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required>
                            <option value="daily">Quotidienne</option>
                            <option value="weekly">Hebdomadaire</option>
                            <option value="instant">Instantanée</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancelAlertBtn" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                        <button type="submit" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition">Créer l'alerte</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la fermeture du modal
        document.getElementById('closeAlertModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelAlertBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Gérer la soumission du formulaire
        document.getElementById('alertForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const jobAlert = {
                id: Date.now(),
                jobTitle: document.getElementById('alertJobTitle').value,
                location: document.getElementById('alertLocation').value,
                frequency: document.getElementById('alertFrequency').value,
                createdAt: new Date().toISOString()
            };
            
            // Sauvegarder l'alerte
            const jobAlerts = JSON.parse(localStorage.getItem('job_alerts') || '[]');
            jobAlerts.push(jobAlert);
            localStorage.setItem('job_alerts', JSON.stringify(jobAlerts));
            
            // Fermer le modal
            document.body.removeChild(modal);
            
            // Afficher un message de confirmation
            alert('Alerte emploi créée avec succès ! Vous recevrez des notifications par email.');
        });
    }
}

// Initialiser la recherche d'emploi
const jobSearch = new JobSearch();

// Exposer l'instance globalement
window.jobSearch = jobSearch;