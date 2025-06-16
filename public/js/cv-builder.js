// Fonctionnalités avancées pour le CV Builder

// Gestion des sections du CV
class CVBuilder {
    constructor() {
        this.sections = {
            personalInfo: {},
            experiences: [],
            education: [],
            skills: [],
            languages: [],
            projects: [],
            certifications: []
        };
        this.currentTemplate = 'modern';
        this.completionPercentage = 0;
        this.init();
    }

    init() {
        // Charger les données sauvegardées si elles existent
        this.loadSavedData();
        
        // Initialiser les écouteurs d'événements
        this.initEventListeners();
        
        // Mettre à jour l'aperçu
        this.updatePreview();
        
        // Calculer le pourcentage de complétion
        this.calculateCompletion();
    }

    loadSavedData() {
        const savedCV = localStorage.getItem('motivai_cv_data');
        if (savedCV) {
            try {
                const data = JSON.parse(savedCV);
                this.sections = data.sections || this.sections;
                this.currentTemplate = data.template || 'modern';
                
                // Pré-remplir les champs du formulaire
                this.populateFormFields();
            } catch (error) {
                console.error('Erreur lors du chargement des données du CV:', error);
            }
        }
    }

    populateFormFields() {
        // Informations personnelles
        const personalInfo = this.sections.personalInfo;
        if (personalInfo) {
            document.getElementById('firstName')?.value = personalInfo.firstName || '';
            document.getElementById('lastName')?.value = personalInfo.lastName || '';
            document.getElementById('jobTitle')?.value = personalInfo.jobTitle || '';
            document.getElementById('email')?.value = personalInfo.email || '';
            document.getElementById('phone')?.value = personalInfo.phone || '';
            document.getElementById('location')?.value = personalInfo.location || '';
            document.getElementById('linkedin')?.value = personalInfo.linkedin || '';
            document.getElementById('summary')?.value = personalInfo.summary || '';
        }

        // Expériences
        this.renderExperiencesList();
        
        // Compétences
        this.renderSkillsList();
        
        // Langues
        this.renderLanguagesList();
    }

    renderExperiencesList() {
        const container = document.getElementById('experienceList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.sections.experiences.forEach((exp, index) => {
            const expElement = document.createElement('div');
            expElement.className = 'bg-gray-50 rounded-lg p-4 cursor-move mb-4';
            expElement.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="font-semibold">${exp.position}</div>
                        <div class="text-accent">${exp.company}</div>
                        <div class="text-sm text-gray-500">${exp.startDate} - ${exp.endDate || 'Présent'} • ${exp.location}</div>
                        <ul class="mt-2 text-sm space-y-1">
                            ${exp.description.split('\n').map(item => `
                                <li class="flex items-start">
                                    <span class="text-gray-400 mr-2">•</span>
                                    ${item}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-gray-400 hover:text-accent transition" onclick="cvBuilder.editExperience(${index})">
                            <span class="material-icons text-sm">edit</span>
                        </button>
                        <button class="text-gray-400 hover:text-error transition" onclick="cvBuilder.removeExperience(${index})">
                            <span class="material-icons text-sm">close</span>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(expElement);
        });
    }

    renderSkillsList() {
        const container = document.getElementById('skillsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Regrouper les compétences par catégorie
        const skillsByCategory = {};
        this.sections.skills.forEach(skill => {
            if (!skillsByCategory[skill.category]) {
                skillsByCategory[skill.category] = [];
            }
            skillsByCategory[skill.category].push(skill);
        });
        
        // Afficher les compétences par catégorie
        Object.entries(skillsByCategory).forEach(([category, skills]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'mb-4';
            categoryElement.innerHTML = `
                <div class="text-sm font-medium mb-2">${category}</div>
                <div class="flex flex-wrap gap-2">
                    ${skills.map(skill => `
                        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center group">
                            ${skill.name}
                            <button class="ml-1 opacity-0 group-hover:opacity-100 transition" onclick="cvBuilder.removeSkill('${skill.name}')">
                                <span class="material-icons text-xs">close</span>
                            </button>
                        </span>
                    `).join('')}
                </div>
            `;
            container.appendChild(categoryElement);
        });
    }

    renderLanguagesList() {
        const container = document.getElementById('languagesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.sections.languages.forEach((lang, index) => {
            const langElement = document.createElement('div');
            langElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2';
            langElement.innerHTML = `
                <div>
                    <span class="font-medium">${lang.language}</span>
                    <span class="text-sm text-gray-500 ml-2">${lang.level}</span>
                </div>
                <div class="flex space-x-2">
                    <button class="text-gray-400 hover:text-accent transition" onclick="cvBuilder.editLanguage(${index})">
                        <span class="material-icons text-sm">edit</span>
                    </button>
                    <button class="text-gray-400 hover:text-error transition" onclick="cvBuilder.removeLanguage(${index})">
                        <span class="material-icons text-sm">close</span>
                    </button>
                </div>
            `;
            container.appendChild(langElement);
        });
    }

    initEventListeners() {
        // Écouteurs pour les formulaires
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('change', () => {
                this.saveData();
                this.updatePreview();
                this.calculateCompletion();
            });
        });
        
        // Écouteur pour le changement de template
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.getAttribute('data-template');
                if (template) {
                    this.changeTemplate(template);
                }
            });
        });
        
        // Écouteur pour l'ajout d'expérience
        document.getElementById('addExperience')?.addEventListener('click', () => {
            this.showExperienceModal();
        });
        
        // Écouteur pour l'ajout de compétence
        document.getElementById('addSkill')?.addEventListener('click', () => {
            this.showSkillModal();
        });
        
        // Écouteur pour l'ajout de langue
        document.getElementById('addLanguage')?.addEventListener('click', () => {
            this.showLanguageModal();
        });
        
        // Écouteur pour la sauvegarde du CV
        document.getElementById('saveCV')?.addEventListener('click', () => {
            this.saveCV();
        });
        
        // Écouteur pour le téléchargement du CV
        document.getElementById('downloadCV')?.addEventListener('click', () => {
            this.downloadCV();
        });
    }

    saveData() {
        // Récupérer les informations personnelles
        const personalInfo = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            jobTitle: document.getElementById('jobTitle')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            location: document.getElementById('location')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            summary: document.getElementById('summary')?.value || ''
        };
        
        this.sections.personalInfo = personalInfo;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('motivai_cv_data', JSON.stringify({
            sections: this.sections,
            template: this.currentTemplate
        }));
    }

    updatePreview() {
        const previewContainer = document.getElementById('cvPreview');
        if (!previewContainer) return;
        
        // Mettre à jour l'aperçu en fonction du template sélectionné
        switch (this.currentTemplate) {
            case 'modern':
                this.renderModernTemplate(previewContainer);
                break;
            case 'classic':
                this.renderClassicTemplate(previewContainer);
                break;
            case 'creative':
                this.renderCreativeTemplate(previewContainer);
                break;
            case 'minimal':
                this.renderMinimalTemplate(previewContainer);
                break;
            default:
                this.renderModernTemplate(previewContainer);
        }
    }

    renderModernTemplate(container) {
        const { personalInfo, experiences, skills, languages } = this.sections;
        
        container.innerHTML = `
            <!-- CV Preview Header -->
            <div class="flex items-start justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">${personalInfo.firstName || 'Prénom'} ${personalInfo.lastName || 'Nom'}</h1>
                    <p class="text-xl text-accent mt-1">${personalInfo.jobTitle || 'Titre professionnel'}</p>
                </div>
                <div class="text-right text-sm text-gray-600 space-y-1">
                    <p>${personalInfo.email ? `📧 ${personalInfo.email}` : ''}</p>
                    <p>${personalInfo.phone ? `📱 ${personalInfo.phone}` : ''}</p>
                    <p>${personalInfo.location ? `📍 ${personalInfo.location}` : ''}</p>
                    <p>${personalInfo.linkedin ? `💼 ${personalInfo.linkedin}` : ''}</p>
                </div>
            </div>

            <!-- Summary -->
            ${personalInfo.summary ? `
            <div class="mb-6">
                <div class="border-b-2 border-accent pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide">Résumé</h2>
                </div>
                <p class="text-gray-700">
                    ${personalInfo.summary}
                </p>
            </div>
            ` : ''}

            <!-- Experience -->
            <div class="mb-6">
                <div class="border-b-2 border-accent pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide">Expériences</h2>
                </div>
                ${experiences.length > 0 ? experiences.map(exp => `
                <div class="mb-4">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-bold">${exp.position}</h3>
                        <span class="text-sm text-gray-600">${exp.startDate} - ${exp.endDate || 'Présent'}</span>
                    </div>
                    <p class="text-accent font-medium">${exp.company} • ${exp.location}</p>
                    <ul class="mt-2 text-sm space-y-1">
                        ${exp.description.split('\n').map(item => `<li>• ${item}</li>`).join('')}
                    </ul>
                </div>
                `).join('') : '<p class="text-gray-500 italic">Aucune expérience ajoutée</p>'}
            </div>

            <!-- Skills -->
            <div>
                <div class="border-b-2 border-accent pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide">Compétences</h2>
                </div>
                <div class="space-y-2">
                    ${Object.entries(skills.reduce((acc, skill) => {
                        if (!acc[skill.category]) acc[skill.category] = [];
                        acc[skill.category].push(skill.name);
                        return acc;
                    }, {})).map(([category, skillNames]) => `
                    <div>
                        <span class="font-medium">${category}:</span>
                        <span class="text-gray-700"> ${skillNames.join(', ')}</span>
                    </div>
                    `).join('') || '<p class="text-gray-500 italic">Aucune compétence ajoutée</p>'}
                </div>
            </div>

            <!-- Languages -->
            ${languages.length > 0 ? `
            <div class="mt-6">
                <div class="border-b-2 border-accent pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide">Langues</h2>
                </div>
                <div class="flex flex-wrap gap-4">
                    ${languages.map(lang => `
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">${lang.language}:</span>
                        <span class="text-gray-700">${lang.level}</span>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }

    renderClassicTemplate(container) {
        const { personalInfo, experiences, skills, languages } = this.sections;
        
        container.innerHTML = `
            <!-- CV Preview Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">${personalInfo.firstName || 'Prénom'} ${personalInfo.lastName || 'Nom'}</h1>
                <p class="text-xl text-gray-700 mt-1">${personalInfo.jobTitle || 'Titre professionnel'}</p>
                <div class="flex justify-center items-center space-x-4 mt-2 text-sm text-gray-600">
                    <p>${personalInfo.email || ''}</p>
                    <span>•</span>
                    <p>${personalInfo.phone || ''}</p>
                    <span>•</span>
                    <p>${personalInfo.location || ''}</p>
                </div>
            </div>

            <!-- Summary -->
            ${personalInfo.summary ? `
            <div class="mb-6">
                <div class="border-b border-gray-300 pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900">Résumé professionnel</h2>
                </div>
                <p class="text-gray-700">
                    ${personalInfo.summary}
                </p>
            </div>
            ` : ''}

            <!-- Experience -->
            <div class="mb-6">
                <div class="border-b border-gray-300 pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900">Expériences professionnelles</h2>
                </div>
                ${experiences.length > 0 ? experiences.map(exp => `
                <div class="mb-4">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-bold">${exp.position}</h3>
                        <span class="text-sm text-gray-600">${exp.startDate} - ${exp.endDate || 'Présent'}</span>
                    </div>
                    <p class="font-medium">${exp.company}, ${exp.location}</p>
                    <ul class="mt-2 text-sm space-y-1">
                        ${exp.description.split('\n').map(item => `<li>• ${item}</li>`).join('')}
                    </ul>
                </div>
                `).join('') : '<p class="text-gray-500 italic">Aucune expérience ajoutée</p>'}
            </div>

            <!-- Skills -->
            <div>
                <div class="border-b border-gray-300 pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900">Compétences</h2>
                </div>
                <div class="space-y-2">
                    ${Object.entries(skills.reduce((acc, skill) => {
                        if (!acc[skill.category]) acc[skill.category] = [];
                        acc[skill.category].push(skill.name);
                        return acc;
                    }, {})).map(([category, skillNames]) => `
                    <div>
                        <span class="font-medium">${category}:</span>
                        <span class="text-gray-700"> ${skillNames.join(', ')}</span>
                    </div>
                    `).join('') || '<p class="text-gray-500 italic">Aucune compétence ajoutée</p>'}
                </div>
            </div>

            <!-- Languages -->
            ${languages.length > 0 ? `
            <div class="mt-6">
                <div class="border-b border-gray-300 pb-2 mb-3">
                    <h2 class="text-lg font-bold text-gray-900">Langues</h2>
                </div>
                <div class="flex flex-wrap gap-4">
                    ${languages.map(lang => `
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">${lang.language}:</span>
                        <span class="text-gray-700">${lang.level}</span>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }

    renderCreativeTemplate(container) {
        const { personalInfo, experiences, skills, languages } = this.sections;
        
        container.innerHTML = `
            <!-- CV Preview Header -->
            <div class="bg-gradient-to-r from-accent to-accent-dark text-white p-8 rounded-t-lg mb-8">
                <h1 class="text-3xl font-bold">${personalInfo.firstName || 'Prénom'} ${personalInfo.lastName || 'Nom'}</h1>
                <p class="text-xl opacity-90 mt-1">${personalInfo.jobTitle || 'Titre professionnel'}</p>
                <div class="flex flex-wrap gap-4 mt-4 text-sm">
                    <div class="flex items-center">
                        <span class="material-icons mr-1 text-sm">email</span>
                        <span>${personalInfo.email || ''}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="material-icons mr-1 text-sm">phone</span>
                        <span>${personalInfo.phone || ''}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="material-icons mr-1 text-sm">location_on</span>
                        <span>${personalInfo.location || ''}</span>
                    </div>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="flex flex-col md:flex-row gap-8">
                <!-- Left Column -->
                <div class="md:w-1/3 space-y-6">
                    <!-- Summary -->
                    ${personalInfo.summary ? `
                    <div>
                        <h2 class="text-lg font-bold text-accent mb-3">À propos de moi</h2>
                        <p class="text-gray-700">
                            ${personalInfo.summary}
                        </p>
                    </div>
                    ` : ''}

                    <!-- Skills -->
                    <div>
                        <h2 class="text-lg font-bold text-accent mb-3">Compétences</h2>
                        <div class="space-y-3">
                            ${Object.entries(skills.reduce((acc, skill) => {
                                if (!acc[skill.category]) acc[skill.category] = [];
                                acc[skill.category].push(skill.name);
                                return acc;
                            }, {})).map(([category, skillNames]) => `
                            <div>
                                <h3 class="font-medium text-gray-800">${category}</h3>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    ${skillNames.map(name => `
                                    <span class="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs">${name}</span>
                                    `).join('')}
                                </div>
                            </div>
                            `).join('') || '<p class="text-gray-500 italic">Aucune compétence ajoutée</p>'}
                        </div>
                    </div>

                    <!-- Languages -->
                    ${languages.length > 0 ? `
                    <div>
                        <h2 class="text-lg font-bold text-accent mb-3">Langues</h2>
                        <div class="space-y-2">
                            ${languages.map(lang => `
                            <div class="flex justify-between items-center">
                                <span class="font-medium">${lang.language}</span>
                                <span class="text-sm text-gray-600">${lang.level}</span>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Right Column -->
                <div class="md:w-2/3">
                    <!-- Experience -->
                    <div>
                        <h2 class="text-lg font-bold text-accent mb-4">Expériences professionnelles</h2>
                        ${experiences.length > 0 ? experiences.map(exp => `
                        <div class="mb-6 relative pl-6 border-l-2 border-accent">
                            <div class="absolute left-[-8px] top-0 w-4 h-4 bg-accent rounded-full"></div>
                            <div class="mb-2">
                                <h3 class="font-bold text-gray-900">${exp.position}</h3>
                                <p class="text-accent">${exp.company} • ${exp.location}</p>
                                <p class="text-sm text-gray-600">${exp.startDate} - ${exp.endDate || 'Présent'}</p>
                            </div>
                            <ul class="mt-2 text-sm space-y-1 text-gray-700">
                                ${exp.description.split('\n').map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                        `).join('') : '<p class="text-gray-500 italic">Aucune expérience ajoutée</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    renderMinimalTemplate(container) {
        const { personalInfo, experiences, skills, languages } = this.sections;
        
        container.innerHTML = `
            <!-- CV Preview Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">${personalInfo.firstName || 'Prénom'} ${personalInfo.lastName || 'Nom'}</h1>
                <p class="text-xl text-gray-600 mt-1">${personalInfo.jobTitle || 'Titre professionnel'}</p>
                <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span>${personalInfo.email || ''}</span>
                    <span>${personalInfo.phone || ''}</span>
                    <span>${personalInfo.location || ''}</span>
                </div>
            </div>

            <!-- Summary -->
            ${personalInfo.summary ? `
            <div class="mb-8">
                <p class="text-gray-700 leading-relaxed">
                    ${personalInfo.summary}
                </p>
            </div>
            ` : ''}

            <!-- Experience -->
            <div class="mb-8">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Expérience</h2>
                ${experiences.length > 0 ? experiences.map(exp => `
                <div class="mb-6">
                    <div class="flex justify-between items-baseline mb-1">
                        <h3 class="font-bold text-gray-800">${exp.position}</h3>
                        <span class="text-sm text-gray-500">${exp.startDate} - ${exp.endDate || 'Présent'}</span>
                    </div>
                    <p class="text-gray-600 mb-2">${exp.company}, ${exp.location}</p>
                    <ul class="text-sm space-y-1 text-gray-700">
                        ${exp.description.split('\n').map(item => `<li>- ${item}</li>`).join('')}
                    </ul>
                </div>
                `).join('') : '<p class="text-gray-500 italic">Aucune expérience ajoutée</p>'}
            </div>

            <!-- Skills -->
            <div class="mb-8">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Compétences</h2>
                <div class="flex flex-wrap gap-2">
                    ${skills.map(skill => `
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">${skill.name}</span>
                    `).join('') || '<p class="text-gray-500 italic">Aucune compétence ajoutée</p>'}
                </div>
            </div>

            <!-- Languages -->
            ${languages.length > 0 ? `
            <div>
                <h2 class="text-lg font-bold text-gray-900 mb-4">Langues</h2>
                <div class="flex flex-wrap gap-4">
                    ${languages.map(lang => `
                    <div>
                        <span class="font-medium">${lang.language}:</span>
                        <span class="text-gray-600 ml-1">${lang.level}</span>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }

    calculateCompletion() {
        let total = 0;
        let completed = 0;
        
        // Informations personnelles (8 champs)
        const personalInfoFields = ['firstName', 'lastName', 'jobTitle', 'email', 'phone', 'location', 'linkedin', 'summary'];
        total += personalInfoFields.length;
        personalInfoFields.forEach(field => {
            if (this.sections.personalInfo[field]) completed++;
        });
        
        // Expériences (au moins 1)
        total += 1;
        if (this.sections.experiences.length > 0) completed += 1;
        
        // Compétences (au moins 3)
        total += 1;
        if (this.sections.skills.length >= 3) completed += 1;
        
        // Langues (au moins 1)
        total += 1;
        if (this.sections.languages.length > 0) completed += 1;
        
        // Calculer le pourcentage
        this.completionPercentage = Math.round((completed / total) * 100);
        
        // Mettre à jour l'interface
        this.updateCompletionUI();
    }

    updateCompletionUI() {
        // Mettre à jour le cercle de progression
        const progressCircle = document.querySelector('.progress-ring-circle');
        if (progressCircle) {
            const radius = progressCircle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (this.completionPercentage / 100) * circumference;
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Mettre à jour le texte de pourcentage
        const percentageText = document.querySelector('.progress-percentage');
        if (percentageText) {
            percentageText.textContent = `${this.completionPercentage}%`;
        }
        
        // Mettre à jour les indicateurs de section
        this.updateSectionIndicators();
    }

    updateSectionIndicators() {
        // Informations personnelles
        this.updateSectionIndicator('personalInfo', 
            Object.values(this.sections.personalInfo).some(val => val));
        
        // Expériences
        this.updateSectionIndicator('experiences', 
            this.sections.experiences.length > 0);
        
        // Compétences
        this.updateSectionIndicator('skills', 
            this.sections.skills.length >= 3);
        
        // Langues
        this.updateSectionIndicator('languages', 
            this.sections.languages.length > 0);
    }

    updateSectionIndicator(section, isCompleted) {
        const indicator = document.querySelector(`.section-indicator[data-section="${section}"]`);
        if (!indicator) return;
        
        const icon = indicator.querySelector('.material-icons');
        const percentage = indicator.querySelector('.percentage');
        
        if (isCompleted) {
            icon.textContent = 'check_circle';
            icon.classList.remove('text-gray-300');
            icon.classList.add('text-success');
            percentage.textContent = '100%';
            percentage.classList.remove('text-gray-400');
            percentage.classList.add('text-success');
        } else {
            icon.textContent = 'radio_button_unchecked';
            icon.classList.remove('text-success');
            icon.classList.add('text-gray-300');
            percentage.textContent = '0%';
            percentage.classList.remove('text-success');
            percentage.classList.add('text-gray-400');
        }
    }

    changeTemplate(template) {
        this.currentTemplate = template;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('border-accent');
            card.classList.add('border-transparent');
            
            if (card.getAttribute('data-template') === template) {
                card.classList.remove('border-transparent');
                card.classList.add('border-accent');
            }
        });
        
        // Mettre à jour l'aperçu
        this.updatePreview();
        
        // Sauvegarder la préférence
        this.saveData();
    }

    showExperienceModal(index = -1) {
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        
        const isEdit = index >= 0;
        const experience = isEdit ? this.sections.experiences[index] : {
            position: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-primary">${isEdit ? 'Modifier' : 'Ajouter'} une expérience</h3>
                    <button class="text-gray-400 hover:text-primary transition" id="closeExperienceModal">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                
                <form id="experienceForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                        <input type="text" id="expPosition" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${experience.position}" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input type="text" id="expCompany" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${experience.company}" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                        <input type="text" id="expLocation" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${experience.location}" required>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input type="text" id="expStartDate" placeholder="Mois Année" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${experience.startDate}" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                            <input type="text" id="expEndDate" placeholder="Mois Année ou Présent" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${experience.endDate}">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="expDescription" rows="4" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent resize-none" placeholder="Décrivez vos responsabilités et réalisations (une par ligne)">${experience.description}</textarea>
                        <p class="text-xs text-gray-500 mt-1">Séparez chaque point par un retour à la ligne</p>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancelExperienceBtn" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                        <button type="submit" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition">Sauvegarder</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la fermeture du modal
        document.getElementById('closeExperienceModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelExperienceBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Gérer la soumission du formulaire
        document.getElementById('experienceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newExperience = {
                position: document.getElementById('expPosition').value,
                company: document.getElementById('expCompany').value,
                location: document.getElementById('expLocation').value,
                startDate: document.getElementById('expStartDate').value,
                endDate: document.getElementById('expEndDate').value,
                description: document.getElementById('expDescription').value
            };
            
            if (isEdit) {
                // Modifier l'expérience existante
                this.sections.experiences[index] = newExperience;
            } else {
                // Ajouter une nouvelle expérience
                this.sections.experiences.push(newExperience);
            }
            
            // Mettre à jour l'interface
            this.renderExperiencesList();
            this.updatePreview();
            this.calculateCompletion();
            this.saveData();
            
            // Fermer le modal
            document.body.removeChild(modal);
        });
    }

    editExperience(index) {
        this.showExperienceModal(index);
    }

    removeExperience(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
            this.sections.experiences.splice(index, 1);
            this.renderExperiencesList();
            this.updatePreview();
            this.calculateCompletion();
            this.saveData();
        }
    }

    showSkillModal() {
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-lg w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-primary">Ajouter une compétence</h3>
                    <button class="text-gray-400 hover:text-primary transition" id="closeSkillModal">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                
                <form id="skillForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la compétence</label>
                        <input type="text" id="skillName" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select id="skillCategory" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required>
                            <option value="Langages & Frameworks">Langages & Frameworks</option>
                            <option value="Outils & Technologies">Outils & Technologies</option>
                            <option value="Soft Skills">Soft Skills</option>
                            <option value="Autres">Autres</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancelSkillBtn" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                        <button type="submit" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition">Ajouter</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la fermeture du modal
        document.getElementById('closeSkillModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelSkillBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Gérer la soumission du formulaire
        document.getElementById('skillForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newSkill = {
                name: document.getElementById('skillName').value,
                category: document.getElementById('skillCategory').value
            };
            
            // Ajouter la compétence
            this.sections.skills.push(newSkill);
            
            // Mettre à jour l'interface
            this.renderSkillsList();
            this.updatePreview();
            this.calculateCompletion();
            this.saveData();
            
            // Fermer le modal
            document.body.removeChild(modal);
        });
    }

    removeSkill(skillName) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
            this.sections.skills = this.sections.skills.filter(skill => skill.name !== skillName);
            this.renderSkillsList();
            this.updatePreview();
            this.calculateCompletion();
            this.saveData();
        }
    }

    showLanguageModal(index = -1) {
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        
        const isEdit = index >= 0;
        const language = isEdit ? this.sections.languages[index] : {
            language: '',
            level: ''
        };
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-lg w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-primary">${isEdit ? 'Modifier' : 'Ajouter'} une langue</h3>
                    <button class="text-gray-400 hover:text-primary transition" id="closeLanguageModal">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                
                <form id="languageForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                        <input type="text" id="languageName" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" value="${language.language}" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                        <select id="languageLevel" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required>
                            <option value="Langue maternelle" ${language.level === 'Langue maternelle' ? 'selected' : ''}>Langue maternelle</option>
                            <option value="Bilingue" ${language.level === 'Bilingue' ? 'selected' : ''}>Bilingue</option>
                            <option value="Courant" ${language.level === 'Courant' ? 'selected' : ''}>Courant</option>
                            <option value="Intermédiaire" ${language.level === 'Intermédiaire' ? 'selected' : ''}>Intermédiaire</option>
                            <option value="Débutant" ${language.level === 'Débutant' ? 'selected' : ''}>Débutant</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancelLanguageBtn" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                        <button type="submit" class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition">Sauvegarder</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la fermeture du modal
        document.getElementById('closeLanguageModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelLanguageBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Gérer la soumission du formulaire
        document.getElementById('languageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newLanguage = {
                language: document.getElementById('languageName').value,
                level: document.getElementById('languageLevel').value
            };
            
            if (isEdit) {
                // Modifier la langue existante
                this.sections.languages[index] = newLanguage;
            } else {
                // Ajouter une nouvelle langue
                this.sections.languages.push(newLanguage);
            }
            
            // Mettre à jour l'interface
            this.renderLanguagesList();
            this.updatePreview();
            this.calculateCompletion();
            this.saveData();
            
            // Fermer le modal
            document.body.removeChild(modal);
        });
    }

    editLanguage(index) {
        this.showLanguageModal(index);
    }

    removeLanguage(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette langue ?')) {
            this.sections.languages.splice(index, 1);
            this.renderLanguagesList();
            this.updatePreview();
            this.calculateCompletion();
            this.saveData();
        }
    }

    saveCV() {
        // Sauvegarder dans localStorage
        this.saveData();
        
        // Afficher un message de confirmation
        alert('CV sauvegardé avec succès !');
    }

    downloadCV() {
        // Dans une application réelle, on utiliserait une bibliothèque comme jsPDF
        // Pour l'instant, on utilise l'impression du navigateur
        window.print();
    }

    // Méthode pour améliorer le CV avec l'IA
    improveWithAI() {
        // Simuler une amélioration IA
        alert('Amélioration du CV avec l\'IA en cours...');
        
        // Dans une application réelle, on enverrait les données à une API d'IA
        setTimeout(() => {
            // Simuler des améliorations
            if (this.sections.personalInfo.summary) {
                this.sections.personalInfo.summary = `Développeur passionné avec ${this.sections.experiences.length} ans d'expérience dans la création d'applications web innovantes. Expert en ${this.sections.skills.filter(s => s.category === 'Langages & Frameworks').map(s => s.name).join(', ')}. Je recherche des défis techniques stimulants dans une équipe collaborative.`;
            }
            
            // Mettre à jour l'interface
            this.populateFormFields();
            this.updatePreview();
            this.saveData();
            
            alert('Votre CV a été amélioré avec succès !');
        }, 2000);
    }
}

// Initialiser le CV Builder
const cvBuilder = new CVBuilder();

// Exposer l'instance globalement
window.cvBuilder = cvBuilder;