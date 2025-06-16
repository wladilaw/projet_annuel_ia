// MotivAI - Configuration globale et système d'authentification
// Version 2.0 avec fonctionnalités révolutionnaires

// Configuration de l'application
const CONFIG = {
    APP_NAME: 'MotivAI',
    VERSION: '2.0.0',
    API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://api.motivai.com' 
        : 'http://localhost:3000/api',
    FEATURES: {
        AI_COACH: true,
        INTERVIEW_PREP: true,
        SALARY_ANALYZER: true,
        CAREER_PATH: true,
        NETWORKING: true,
        SKILLS_ASSESSMENT: true,
        MARKET_INSIGHTS: true,
        REAL_TIME_COLLABORATION: true,
        VIDEO_INTERVIEWS: true,
        BLOCKCHAIN_CERTIFICATES: true
    },
    SUBSCRIPTION_PLANS: {
        FREE: {
            name: 'Gratuit',
            price: 0,
            features: ['3 lettres/mois', 'Templates de base', 'Support email'],
            limits: { letters: 3, cvs: 1, interviews: 0 }
        },
        PREMIUM: {
            name: 'Premium',
            price: 9.99,
            features: ['Lettres illimitées', 'Coach IA', 'Préparation entretiens', 'Analyse salaire'],
            limits: { letters: -1, cvs: 5, interviews: 10 }
        },
        PRO: {
            name: 'Pro',
            price: 19.99,
            features: ['Tout Premium +', 'Networking IA', 'Insights marché', 'Certificats blockchain'],
            limits: { letters: -1, cvs: -1, interviews: -1 }
        }
    }
};

// Système d'authentification avancé
class AuthSystem {
    constructor() {
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.init();
    }

    init() {
        // Charger les données utilisateur depuis le localStorage
        const userData = localStorage.getItem('motivai_user');
        const token = localStorage.getItem('motivai_token');
        const refreshToken = localStorage.getItem('motivai_refresh_token');

        if (userData && token) {
            this.user = JSON.parse(userData);
            this.token = token;
            this.refreshToken = refreshToken;
            this.scheduleTokenRefresh();
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.setUserData(data.user, data.token, data.refreshToken);
                return { success: true, user: data.user };
            } else {
                const error = await response.json();
                return { success: false, error: error.message };
            }
        } catch (error) {
            // Simulation pour la démo
            if (email && password) {
                const mockUser = {
                    id: Date.now(),
                    email,
                    name: email.split('@')[0],
                    role: email.includes('admin') ? 'admin' : 'user',
                    subscription: 'FREE',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    joinDate: new Date().toISOString(),
                    stats: {
                        lettersGenerated: 0,
                        interviewsCompleted: 0,
                        jobsApplied: 0,
                        networkConnections: 0
                    }
                };
                this.setUserData(mockUser, 'mock-token', 'mock-refresh-token');
                return { success: true, user: mockUser };
            }
            return { success: false, error: 'Erreur de connexion' };
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                this.setUserData(data.user, data.token, data.refreshToken);
                return { success: true, user: data.user };
            } else {
                const error = await response.json();
                return { success: false, error: error.message };
            }
        } catch (error) {
            // Simulation pour la démo
            const mockUser = {
                id: Date.now(),
                email: userData.email,
                name: userData.name,
                role: 'user',
                subscription: 'FREE',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
                joinDate: new Date().toISOString(),
                stats: {
                    lettersGenerated: 0,
                    interviewsCompleted: 0,
                    jobsApplied: 0,
                    networkConnections: 0
                }
            };
            this.setUserData(mockUser, 'mock-token', 'mock-refresh-token');
            return { success: true, user: mockUser };
        }
    }

    setUserData(user, token, refreshToken) {
        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken;

        localStorage.setItem('motivai_user', JSON.stringify(user));
        localStorage.setItem('motivai_token', token);
        localStorage.setItem('motivai_refresh_token', refreshToken);

        this.scheduleTokenRefresh();
    }

    logout() {
        this.user = null;
        this.token = null;
        this.refreshToken = null;

        localStorage.removeItem('motivai_user');
        localStorage.removeItem('motivai_token');
        localStorage.removeItem('motivai_refresh_token');

        window.location.href = '/login';
    }

    isAuthenticated() {
        return this.user !== null && this.token !== null;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    hasFeature(feature) {
        if (!this.user) return false;
        const plan = CONFIG.SUBSCRIPTION_PLANS[this.user.subscription];
        return plan && CONFIG.FEATURES[feature];
    }

    canUseFeature(feature, usage = 0) {
        if (!this.user) return false;
        const plan = CONFIG.SUBSCRIPTION_PLANS[this.user.subscription];
        if (!plan) return false;

        const limit = plan.limits[feature];
        return limit === -1 || usage < limit;
    }

    async refreshTokens() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                localStorage.setItem('motivai_token', data.token);
                this.scheduleTokenRefresh();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }

    scheduleTokenRefresh() {
        // Rafraîchir le token toutes les 50 minutes (les tokens expirent généralement en 1h)
        setTimeout(() => {
            this.refreshTokens();
        }, 50 * 60 * 1000);
    }

    async updateProfile(updates) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                this.user = { ...this.user, ...updatedUser };
                localStorage.setItem('motivai_user', JSON.stringify(this.user));
                return { success: true, user: this.user };
            }
        } catch (error) {
            // Simulation pour la démo
            this.user = { ...this.user, ...updates };
            localStorage.setItem('motivai_user', JSON.stringify(this.user));
            return { success: true, user: this.user };
        }
    }
}

// Système de navigation avancé
class NavigationSystem {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/login': 'login.html',
            '/dashboard': 'dashboard.html',
            '/jobs': 'jobs.html',
            '/companies': 'companies.html',
            '/form': 'form.html',
            '/result': 'result.html',
            '/cv-builder': 'cv-builder.html',
            '/profile': 'profile.html',
            '/templates': 'templates.html',
            '/admin': 'admin-dashboard.html',
            '/ai-coach': 'ai-coach.html',
            '/interview-prep': 'interview-prep.html',
            '/salary-analyzer': 'salary-analyzer.html',
            '/career-path': 'career-path.html',
            '/networking': 'networking.html',
            '/skills-assessment': 'skills-assessment.html',
            '/market-insights': 'market-insights.html'
        };
        this.init();
    }

    init() {
        // Gérer les liens de navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                this.navigate(link.dataset.route);
            }
        });

        // Gérer le bouton retour du navigateur
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.loadPage(e.state.route, false);
            }
        });
    }

    navigate(route, addToHistory = true) {
        if (this.routes[route]) {
            this.loadPage(route, addToHistory);
        } else {
            console.error(`Route ${route} not found`);
        }
    }

    loadPage(route, addToHistory = true) {
        const page = this.routes[route];
        
        if (addToHistory) {
            history.pushState({ route }, '', route);
        }

        // Simulation du changement de page (dans une vraie SPA)
        window.location.href = page;
    }

    redirectTo(route) {
        this.navigate(route);
    }

    checkAuth() {
        if (!Auth.isAuthenticated() && !['/login', '/'].includes(window.location.pathname)) {
            this.navigate('/login');
        }
    }
}

// Système d'analytics et tracking
class AnalyticsSystem {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.init();
    }

    init() {
        // Tracker les vues de page
        this.trackPageView();
        
        // Tracker les clics
        document.addEventListener('click', (e) => {
            this.trackClick(e.target);
        });

        // Tracker le temps passé sur la page
        this.startTimeTracking();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            id: Date.now(),
            sessionId: this.sessionId,
            eventName,
            properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId: Auth.getUser()?.id
        };

        this.events.push(event);
        this.sendToAnalytics(event);
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        });
    }

    trackClick(element) {
        const properties = {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            text: element.textContent?.substring(0, 100)
        };

        this.trackEvent('click', properties);
    }

    startTimeTracking() {
        this.pageStartTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - this.pageStartTime;
            this.trackEvent('time_on_page', { duration: timeSpent });
        });
    }

    async sendToAnalytics(event) {
        try {
            // Envoyer à votre service d'analytics
            await fetch(`${CONFIG.API_BASE_URL}/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.log('Analytics event:', event); // Pour la démo
        }
    }
}

// Système de notifications en temps réel
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.socket = null;
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.connectWebSocket();
    }

    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }

    connectWebSocket() {
        if (!Auth.isAuthenticated()) return;

        try {
            this.socket = new WebSocket(`wss://api.motivai.com/ws?token=${Auth.getToken()}`);
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.show(data.message, data.type, data.duration);
            };

            this.socket.onclose = () => {
                // Reconnexion automatique
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        } catch (error) {
            console.log('WebSocket not available, using polling');
            this.startPolling();
        }
    }

    startPolling() {
        setInterval(async () => {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
                });
                const notifications = await response.json();
                notifications.forEach(notif => {
                    this.show(notif.message, notif.type);
                });
            } catch (error) {
                // Ignore polling errors
            }
        }, 30000); // Poll every 30 seconds
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <span style="margin-left: 10px; opacity: 0.7; font-size: 18px;">&times;</span>
            </div>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-dismiss
        const timeoutId = setTimeout(() => {
            this.dismiss(notification);
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.dismiss(notification);
        });

        this.notifications.push({ element: notification, timeoutId });
    }

    dismiss(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#00b894',
            error: '#d63031',
            warning: '#fdcb6e',
            info: '#74b9ff',
            default: '#2d3436'
        };
        return colors[type] || colors.default;
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }
}

// Initialisation des systèmes
const Auth = new AuthSystem();
const Navigation = new NavigationSystem();
const Analytics = new AnalyticsSystem();
const Notifications = new NotificationSystem();

// Exposer globalement pour compatibilité
window.CONFIG = CONFIG;
window.Auth = Auth;
window.Navigation = Navigation;
window.Analytics = Analytics;
window.Notifications = Notifications;

// Auto-vérification de l'authentification
document.addEventListener('DOMContentLoaded', () => {
    Navigation.checkAuth();
});