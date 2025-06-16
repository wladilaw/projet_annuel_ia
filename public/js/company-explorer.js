// Fonctionnalités avancées pour l'exploration des entreprises

class CompanyExplorer {
    constructor() {
        this.companies = [];
        this.filteredCompanies = [];
        this.followedCompanies = [];
        this.sectors = [];
        this.filters = {
            search: '',
            sector: '',
            size: [],
            location: '',
            remote: false,
            rating: 0
        };
        
        this.init();
    }
    
    async init() {
        // Charger les entreprises depuis l'API
        await this.fetchCompanies();
        
        // Charger les entreprises suivies
        this.loadFollowedCompanies();
        
        // Extraire les secteurs
        this.extractSectors();
        
        // Initialiser les filtres
        this.initFilters();
        
        // Afficher les entreprises
        this.renderCompanies();
        
        // Initialiser les écouteurs d'événements
        this.initEventListeners();
    }
    
    async fetchCompanies() {
        try {
            // Dans une application réelle, on ferait un appel API
            // Pour l'instant, on utilise des données simulées
            this.companies = [
                {
                    id: 1,
                    name: 'Google',
                    logo: 'https://logo.clearbit.com/google.com',
                    industry: 'Tech',
                    description: 'Leader mondial de la technologie et de l\'innovation',
                    size: '150K+ employés',
                    locations: ['Paris', 'Lyon'],
                    rating: 4.8,
                    reviews: 1234,
                    openJobs: 156,
                    benefits: ['Repas gratuits', 'Salle de sport', 'Télétravail flexible'],
                    culture: ['Innovation', 'Collaboration', 'Diversité'],
                    growth: 'high',
                    remote: true,
                    international: true
                },
                {
                    id: 2,
                    name: 'Spotify',
                    logo: 'https://logo.clearbit.com/spotify.com',
                    industry: 'Music Tech',
                    description: 'Révolutionne l\'industrie musicale avec la technologie',
                    size: '9K+ employés',
                    locations: ['Paris'],
                    rating: 4.7,
                    reviews: 876,
                    openJobs: 42,
                    benefits: ['Abonnement premium', 'Événements musicaux', 'Télétravail hybride'],
                    culture: ['Créativité', 'Passion', 'Agilité'],
                    growth: 'high',
                    remote: true,
                    international: true
                },
                {
                    id: 3,
                    name: 'Airbnb',
                    logo: 'https://logo.clearbit.com/airbnb.com',
                    industry: 'Travel',
                    description: 'Connecte les voyageurs du monde entier',
                    size: '6K+ employés',
                    locations: ['Remote'],
                    rating: 4.6,
                    reviews: 743,
                    openJobs: 28,
                    benefits: ['Crédits voyage', 'Télétravail complet', 'Semaine de 4 jours'],
                    culture: ['Aventure', 'Communauté', 'Appartenance'],
                    growth: 'medium',
                    remote: true,
                    international: true
                },
                {
                    id: 4,
                    name: 'Salesforce',
                    logo: 'https://logo.clearbit.com/salesforce.com',
                    industry: 'CRM & Cloud',
                    description: 'Leader mondial des solutions CRM',
                    size: '70K+ employés',
                    locations: ['Paris', 'Lyon', 'Nantes'],
                    rating: 4.8,
                    reviews: 1234,
                    openJobs: 87,
                    benefits: ['Volontariat rémunéré', 'Formation continue', 'Télétravail flexible'],
                    culture: ['Confiance', 'Innovation', 'Égalité'],
                    growth: 'high',
                    remote: true,
                    international: true
                },
                {
                    id: 5,
                    name: 'Microsoft',
                    logo: 'https://logo.clearbit.com/microsoft.com',
                    industry: 'Software & Cloud',
                    description: 'Leader mondial des logiciels et services cloud',
                    size: '180K+ employés',
                    locations: ['Paris', 'Issy-les-Moulineaux'],
                    rating: 4.7,
                    reviews: 2891,
                    openJobs: 124,
                    benefits: ['Stock options', 'Assurance santé premium', 'Horaires flexibles'],
                    culture: ['Croissance', 'Inclusion', 'Responsabilité'],
                    growth: 'medium',
                    remote: true,
                    international: true
                },
                {
                    id: 6,
                    name: 'Adobe',
                    logo: 'https://logo.clearbit.com/adobe.com',
                    industry: 'Creative Software',
                    description: 'Leader des logiciels créatifs et marketing',
                    size: '25K+ employés',
                    locations: ['Paris'],
                    rating: 4.6,
                    reviews: 967,
                    openJobs: 56,
                    benefits: ['Licences produits gratuites', 'Congés sabbatiques', 'Bien-être'],
                    culture: ['Créativité', 'Qualité', 'Intégrité'],
                    growth: 'medium',
                    remote: true,
                    international: true
                }
            ];
            
            // Appliquer les filtres initiaux
            this.filteredCompanies = [...this.companies];
        } catch (error) {
            console.error('Erreur lors du chargement des entreprises:', error);
        }
    }
    
    loadFollowedCompanies() {
        const followedCompanies = localStorage.getItem('followed_companies');
        if (followedCompanies) {
            try {
                this.followedCompanies = JSON.parse(followedCompanies);
            } catch (error) {
                console.error('Erreur lors du chargement des entreprises suivies:', error);
                this.followedCompanies = [];
            }
        }
    }
    
    extractSectors() {
        // Extraire les secteurs uniques
        const sectors = new Set();
        this.companies.forEach(company => {
            sectors.add(company.industry);
        });
        
        this.sectors = Array.from(sectors);
    }
    
    initFilters() {
        // Initialiser les filtres à partir de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('search')) {
            this.filters.search = urlParams.get('search');
            document.querySelector('input[name="search"]').value = this.filters.search;
        }
        
        if (urlParams.has('sector')) {
            this.filters.sector = urlParams.get('sector');
            document.querySelector('select[name="sector"]').value = this.filters.sector;
        }
        
        if (urlParams.has('size')) {
            this.filters.size = urlParams.get('size').split(',');
            this.filters.size.forEach(size => {
                const checkbox = document.querySelector(`input[name="size"][value="${size}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (urlParams.has('location')) {
            this.filters.location = urlParams.get('location');
            document.querySelector('input[name="location"]').value = this.filters.location;
        }
        
        if (urlParams.has('remote')) {
            this.filters.remote = urlParams.get('remote') === 'true';
            document.querySelector('input[name="remote"]').checked = this.filters.remote;
        }
        
        if (urlParams.has('rating')) {
            this.filters.rating = parseInt(urlParams.get('rating'));
            document.querySelector(`input[name="rating"][value="${this.filters.rating}"]`).checked = true;
        }
    }
    
    initEventListeners() {
        // Écouteurs pour les filtres
        document.querySelector('input[name="search"]')?.addEventListener('input', () => this.applyFilters());
        
        document.querySelector('select[name="sector"]')?.addEventListener('change', () => this.applyFilters());
        
        document.querySelectorAll('input[name="size"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
        
        document.querySelector('input[name="location"]')?.addEventListener('input', () => this.applyFilters());
        
        document.querySelector('input[name="remote"]')?.addEventListener('change', () => this.applyFilters());
        
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.addEventListener('change', () => this.applyFilters());
        });
        
        // Écouteur pour le bouton d'application des filtres
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        
        // Écouteurs pour les boutons de suivi
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const companyId = btn.getAttribute('data-company-id');
                this.toggleFollowCompany(companyId);
            });
        });
        
        // Écouteur pour les cartes d'entreprise (navigation vers le détail)
        document.querySelectorAll('.company-card').forEach(card => {
            card.addEventListener('click', () => {
                const companyId = card.getAttribute('data-company-id');
                this.navigateToCompanyDetail(companyId);
            });
        });
        
        // Écouteurs pour les filtres rapides
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.addEventListener('click', () => {
                const filterType = filter.getAttribute('data-filter');
                this.applyQuickFilter(filterType);
            });
        });
    }
    
    applyFilters() {
        // Récupérer les valeurs des filtres
        this.filters.search = document.querySelector('input[name="search"]')?.value || '';
        this.filters.sector = document.querySelector('select[name="sector"]')?.value || '';
        
        this.filters.size = Array.from(document.querySelectorAll('input[name="size"]:checked'))
            .map(checkbox => checkbox.value);
        
        this.filters.location = document.querySelector('input[name="location"]')?.value || '';
        this.filters.remote = document.querySelector('input[name="remote"]')?.checked || false;
        
        const ratingRadio = document.querySelector('input[name="rating"]:checked');
        this.filters.rating = ratingRadio ? parseInt(ratingRadio.value) : 0;
        
        // Filtrer les entreprises
        this.filteredCompanies = this.companies.filter(company => {
            // Filtre par recherche
            if (this.filters.search && !company.name.toLowerCase().includes(this.filters.search.toLowerCase()) && 
                !company.description.toLowerCase().includes(this.filters.search.toLowerCase())) {
                return false;
            }
            
            // Filtre par secteur
            if (this.filters.sector && company.industry !== this.filters.sector) {
                return false;
            }
            
            // Filtre par taille
            if (this.filters.size.length > 0) {
                const sizeMatches = this.filters.size.some(size => {
                    switch (size) {
                        case 'small':
                            return company.size.includes('1-50') || company.size.includes('51-200');
                        case 'medium':
                            return company.size.includes('201-1000') || company.size.includes('1K-5K');
                        case 'large':
                            return company.size.includes('5K+') || company.size.includes('10K+') || company.size.includes('50K+') || company.size.includes('100K+');
                        default:
                            return false;
                    }
                });
                
                if (!sizeMatches) return false;
            }
            
            // Filtre par localisation
            if (this.filters.location && !company.locations.some(location => 
                location.toLowerCase().includes(this.filters.location.toLowerCase()))) {
                return false;
            }
            
            // Filtre par télétravail
            if (this.filters.remote && !company.remote) {
                return false;
            }
            
            // Filtre par note
            if (this.filters.rating > 0 && company.rating < this.filters.rating) {
                return false;
            }
            
            return true;
        });
        
        // Mettre à jour l'URL avec les filtres
        this.updateURL();
        
        // Afficher les résultats filtrés
        this.renderCompanies();
    }
    
    updateURL() {
        const url = new URL(window.location.href);
        
        // Mettre à jour les paramètres d'URL
        if (this.filters.search) {
            url.searchParams.set('search', this.filters.search);
        } else {
            url.searchParams.delete('search');
        }
        
        if (this.filters.sector) {
            url.searchParams.set('sector', this.filters.sector);
        } else {
            url.searchParams.delete('sector');
        }
        
        if (this.filters.size.length > 0) {
            url.searchParams.set('size', this.filters.size.join(','));
        } else {
            url.searchParams.delete('size');
        }
        
        if (this.filters.location) {
            url.searchParams.set('location', this.filters.location);
        } else {
            url.searchParams.delete('location');
        }
        
        url.searchParams.set('remote', this.filters.remote.toString());
        
        if (this.filters.rating > 0) {
            url.searchParams.set('rating', this.filters.rating.toString());
        } else {
            url.searchParams.delete('rating');
        }
        
        // Mettre à jour l'URL sans recharger la page
        window.history.replaceState({}, '', url.toString());
    }
    
    renderCompanies() {
        const container = document.getElementById('companiesContainer');
        if (!container) return;
        
        if (this.filteredCompanies.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-xl p-8 shadow-sm text-center">
                    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-icons text-gray-400 text-3xl">business_off</span>
                    </div>
                    <h3 class="text-xl font-semibold text-primary mb-2">Aucune entreprise trouvée</h3>
                    <p class="text-text-light mb-4">Essayez de modifier vos filtres pour voir plus de résultats.</p>
                    <button id="resetFilters" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition">
                        Réinitialiser les filtres
                    </button>
                </div>
            `;
            
            document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
            return;
        }
        
        container.innerHTML = this.filteredCompanies.map(company => this.renderCompanyCard(company)).join('');
        
        // Réinitialiser les écouteurs d'événements
        this.initEventListeners();
    }
    
    renderCompanyCard(company) {
        const isFollowed = this.followedCompanies.includes(company.id);
        
        let badge = '';
        if (company.growth === 'high') {
            badge = `<span class="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full">
                ⭐ Top employeur
            </span>`;
        } else if (company.remote) {
            badge = `<span class="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full">
                🌍 Remote first
            </span>`;
        }
        
        return `
            <div class="company-card bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition" data-company-id="${company.id}">
                <div class="h-48 relative bg-gradient-to-br ${company.id % 3 === 0 ? 'from-red-500 to-pink-600' : company.id % 3 === 1 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'}">
                    <img src="${company.logo}" alt="${company.name}" 
                         class="absolute bottom-4 left-4 w-20 h-20 bg-white rounded-xl p-3 shadow-lg">
                    ${badge}
                </div>
                <div class="p-6">
                    <h3 class="text-2xl font-bold text-primary mb-2">${company.name}</h3>
                    <p class="text-text-light mb-4">${company.description}</p>
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="material-icons text-base mr-1">location_on</span>
                            ${company.locations.join(', ')}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="material-icons text-base mr-1">people</span>
                            ${company.size}
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">${company.industry}</span>
                        ${company.remote ? `<span class="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Remote</span>` : ''}
                        ${company.international ? `<span class="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">International</span>` : ''}
                    </div>

                    <div class="flex items-center justify-between pt-4 border-t">
                        <span class="text-lg font-semibold text-accent">${company.openJobs} postes ouverts</span>
                        <button class="follow-btn text-gray-400 hover:text-accent transition" data-company-id="${company.id}">
                            <span class="material-icons">${isFollowed ? 'bookmark' : 'bookmark_border'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    toggleFollowCompany(companyId) {
        const index = this.followedCompanies.indexOf(parseInt(companyId));
        
        if (index === -1) {
            // Ajouter aux entreprises suivies
            this.followedCompanies.push(parseInt(companyId));
            
            // Mettre à jour l'icône
            const followBtn = document.querySelector(`.follow-btn[data-company-id="${companyId}"]`);
            if (followBtn) {
                followBtn.querySelector('.material-icons').textContent = 'bookmark';
                followBtn.classList.add('text-accent');
                followBtn.classList.remove('text-gray-400');
            }
        } else {
            // Retirer des entreprises suivies
            this.followedCompanies.splice(index, 1);
            
            // Mettre à jour l'icône
            const followBtn = document.querySelector(`.follow-btn[data-company-id="${companyId}"]`);
            if (followBtn) {
                followBtn.querySelector('.material-icons').textContent = 'bookmark_border';
                followBtn.classList.remove('text-accent');
                followBtn.classList.add('text-gray-400');
            }
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('followed_companies', JSON.stringify(this.followedCompanies));
    }
    
    navigateToCompanyDetail(companyId) {
        window.location.href = `/company-detail?id=${companyId}`;
    }
    
    applyQuickFilter(filterType) {
        switch (filterType) {
            case 'growing':
                this.filteredCompanies = this.companies.filter(company => company.growth === 'high');
                break;
            case 'remote':
                this.filteredCompanies = this.companies.filter(company => company.remote);
                break;
            case 'startup':
                this.filteredCompanies = this.companies.filter(company => 
                    company.size.includes('1-50') || company.size.includes('51-200'));
                break;
            case 'international':
                this.filteredCompanies = this.companies.filter(company => company.international);
                break;
            default:
                this.filteredCompanies = [...this.companies];
        }
        
        // Mettre à jour l'interface
        this.renderCompanies();
    }
    
    resetFilters() {
        // Réinitialiser les filtres
        this.filters = {
            search: '',
            sector: '',
            size: [],
            location: '',
            remote: false,
            rating: 0
        };
        
        // Réinitialiser les champs du formulaire
        document.querySelector('input[name="search"]').value = '';
        document.querySelector('select[name="sector"]').value = '';
        
        document.querySelectorAll('input[name="size"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelector('input[name="location"]').value = '';
        document.querySelector('input[name="remote"]').checked = false;
        
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Appliquer les filtres réinitialisés
        this.filteredCompanies = [...this.companies];
        this.updateURL();
        this.renderCompanies();
    }
}

// Initialiser l'explorateur d'entreprises
const companyExplorer = new CompanyExplorer();

// Exposer l'instance globalement
window.companyExplorer = companyExplorer;