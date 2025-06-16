// MotivAI - Système de routage centralisé
// Ce fichier gère toutes les navigations entre les pages de l'application

class Router {
    constructor() {
        // Configuration des routes disponibles
        this.routes = {
            // Pages publiques
            HOME: { path: 'index.html', auth: false, title: 'MotivAI - Accueil' },
            LOGIN: { path: 'login.html', auth: false, title: 'MotivAI - Connexion' },
            
            // Pages authentifiées
            DASHBOARD: { path: 'dashboard.html', auth: true, title: 'MotivAI - Tableau de bord' },
            FORM: { path: 'form.html', auth: true, title: 'MotivAI - Créer une lettre' },
            RESULT: { path: 'result.html', auth: true, title: 'MotivAI - Votre lettre' },
            JOBS: { path: 'jobs.html', auth: true, title: 'MotivAI - Offres d\'emploi' },
            COMPANIES: { path: 'companies.html', auth: true, title: 'MotivAI - Entreprises' },
            CV_BUILDER: { path: 'cv-builder.html', auth: true, title: 'MotivAI - Créateur de CV' },
            PROFILE: { path: 'profile.html', auth: true, title: 'MotivAI - Mon profil' },
            TEMPLATES: { path: 'templates.html', auth: true, title: 'MotivAI - Modèles' },
            
            // Pages admin
            ADMIN: { path: 'admin-dashboard.html', auth: true, admin: true, title: 'MotivAI - Admin' }
        };

        // État de l'historique de navigation
        this.history = [];
        this.currentRoute = null;

        // Initialisation
        this.init();
    }

    init() {
        // Écouter les changements d'URL (pour le bouton retour du navigateur)
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.route) {
                this.handleRouteChange(event.state.route, false);
            }
        });

        // Intercepter tous les clics sur les liens
        document.addEventListener('click', (e) => {
            // Vérifier si c'est un lien interne
            const link = e.target.closest('a');
            if (link && link.href && !link.target && this.isInternalLink(link.href)) {
                e.preventDefault();
                const route = this.getRouteFromPath(link.pathname);
                if (route) {
                    this.navigate(route);
                }
            }
        });

        // Déterminer la route initiale
        this.detectCurrentRoute();
    }

    // Vérifier si un lien est interne
    isInternalLink(href) {
        try {
            const url = new URL(href);
            return url.origin === window.location.origin;
        } catch {
            return true; // Liens relatifs
        }
    }

    // Obtenir la route à partir du chemin
    getRouteFromPath(pathname) {
        const filename = pathname.split('/').pop() || 'index.html';
        for (const [key, route] of Object.entries(this.routes)) {
            if (route.path === filename) {
                return key;
            }
        }
        return null;
    }

    // Détecter la route actuelle
    detectCurrentRoute() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        for (const [key, route] of Object.entries(this.routes)) {
            if (route.path === currentPath) {
                this.currentRoute = key;
                this.updatePageTitle(route.title);
                break;
            }
        }
    }

    // Navigation principale
    navigate(routeName, params = {}, addToHistory = true) {
        const route = this.routes[routeName];
        
        if (!route) {
            console.error(`Route "${routeName}" non trouvée`);
            return false;
        }

        // Vérifier l'authentification
        if (route.auth && !this.isAuthenticated()) {
            // Sauvegarder la destination pour redirection après connexion
            sessionStorage.setItem('redirectAfterLogin', routeName);
            this.navigate('LOGIN');
            return false;
        }

        // Vérifier les droits admin
        if (route.admin && !this.isAdmin()) {
            this.navigate('DASHBOARD');
            return false;
        }

        // Construire l'URL avec les paramètres
        let url = route.path;
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }

        // Ajouter à l'historique
        if (addToHistory && this.currentRoute) {
            this.history.push({
                route: this.currentRoute,
                timestamp: new Date().toISOString(),
                params: this.getCurrentParams()
            });
        }

        // Mettre à jour l'historique du navigateur
        if (addToHistory) {
            window.history.pushState(
                { route: routeName, params },
                route.title,
                url
            );
        }

        // Effectuer la navigation
        this.currentRoute = routeName;
        window.location.href = url;
        
        return true;
    }

    // Navigation avec animation de chargement
    navigateWithLoading(routeName, params = {}) {
        // Afficher l'overlay de chargement
        this.showLoadingOverlay();
        
        // Petite attente pour l'effet visuel
        setTimeout(() => {
            this.navigate(routeName, params);
        }, 300);
    }

    // Retour à la page précédente
    goBack() {
        if (this.history.length > 0) {
            const previousRoute = this.history.pop();
            this.navigate(previousRoute.route, previousRoute.params, false);
        } else {
            // Par défaut, retour au dashboard
            this.navigate('DASHBOARD');
        }
    }

    // Rafraîchir la page actuelle
    refresh() {
        window.location.reload();
    }

    // Obtenir les paramètres actuels de l'URL
    getCurrentParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        return params;
    }

    // Vérifications d'authentification
    isAuthenticated() {
        return localStorage.getItem('motivai_user_data') !== null;
    }

    isAdmin() {
        const userData = this.getUserData();
        return userData && userData.role === 'admin';
    }

    getUserData() {
        const data = localStorage.getItem('motivai_user_data');
        return data ? JSON.parse(data) : null;
    }

    // Déconnexion
    logout() {
        // Nettoyer les données de session
        localStorage.removeItem('motivai_user_data');
        sessionStorage.clear();
        
        // Rediriger vers la page de connexion
        this.navigate('LOGIN');
    }

    // Connexion réussie
    handleLoginSuccess(userData) {
        // Sauvegarder les données utilisateur
        localStorage.setItem('motivai_user_data', JSON.stringify(userData));
        
        // Vérifier s'il y a une redirection en attente
        const redirectRoute = sessionStorage.getItem('redirectAfterLogin');
        if (redirectRoute && this.routes[redirectRoute]) {
            sessionStorage.removeItem('redirectAfterLogin');
            this.navigate(redirectRoute);
        } else {
            // Redirection par défaut selon le rôle
            if (userData.role === 'admin') {
                this.navigate('ADMIN');
            } else {
                this.navigate('DASHBOARD');
            }
        }
    }

    // Mise à jour du titre de la page
    updatePageTitle(title) {
        document.title = title || 'MotivAI';
    }

    // Afficher l'overlay de chargement
    showLoadingOverlay() {
        let overlay = document.getElementById('routerLoadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'routerLoadingOverlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Chargement...</p>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            document.body.appendChild(overlay);

            // Ajouter les styles
            const style = document.createElement('style');
            style.textContent = `
                .loading-spinner {
                    text-align: center;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #e17055;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        overlay.style.display = 'flex';
    }

    // Navigation helpers pour faciliter l'utilisation
    goToHome() { this.navigate('HOME'); }
    goToLogin() { this.navigate('LOGIN'); }
    goToDashboard() { this.navigate('DASHBOARD'); }
    goToForm() { this.navigate('FORM'); }
    goToResult(letterId) { this.navigate('RESULT', { id: letterId }); }
    goToJobs() { this.navigate('JOBS'); }
    goToCompanies() { this.navigate('COMPANIES'); }
    goToCvBuilder() { this.navigate('CV_BUILDER'); }
    goToProfile() { this.navigate('PROFILE'); }
    goToTemplates() { this.navigate('TEMPLATES'); }
    goToAdmin() { this.navigate('ADMIN'); }

    // Vérifier les permissions pour afficher/cacher des éléments
    canAccess(routeName) {
        const route = this.routes[routeName];
        if (!route) return false;
        
        if (route.auth && !this.isAuthenticated()) return false;
        if (route.admin && !this.isAdmin()) return false;
        
        return true;
    }

    // Obtenir l'URL complète d'une route
    getRouteUrl(routeName, params = {}) {
        const route = this.routes[routeName];
        if (!route) return '#';
        
        let url = route.path;
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }
        
        return url;
    }

    // Breadcrumb pour la navigation
    getBreadcrumb() {
        const breadcrumb = [];
        
        // Toujours ajouter Home
        breadcrumb.push({
            label: 'Accueil',
            route: 'HOME',
            active: this.currentRoute === 'HOME'
        });
        
        // Ajouter la page courante si ce n'est pas Home
        if (this.currentRoute && this.currentRoute !== 'HOME') {
            const currentRouteInfo = this.routes[this.currentRoute];
            if (currentRouteInfo) {
                breadcrumb.push({
                    label: currentRouteInfo.title.replace('MotivAI - ', ''),
                    route: this.currentRoute,
                    active: true
                });
            }
        }
        
        return breadcrumb;
    }
}

// Créer l'instance globale du router
const router = new Router();

// Exposer les fonctions principales pour compatibilité avec l'ancien code
window.Navigation = {
    redirectTo: (route) => router.navigate(route),
    checkAuth: () => {
        if (!router.isAuthenticated() && router.currentRoute !== 'LOGIN' && router.currentRoute !== 'HOME') {
            router.navigate('LOGIN');
        }
    }
};

// Exposer le router globalement
window.router = router;

// Auto-initialisation au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Vérifier l'authentification pour la page actuelle
        const currentRoute = router.routes[router.currentRoute];
        if (currentRoute && currentRoute.auth && !router.isAuthenticated()) {
            router.navigate('LOGIN');
        }
    });
} else {
    // DOM déjà chargé
    const currentRoute = router.routes[router.currentRoute];
    if (currentRoute && currentRoute.auth && !router.isAuthenticated()) {
        router.navigate('LOGIN');
    }
}

// Export pour utilisation en modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = router;
}

