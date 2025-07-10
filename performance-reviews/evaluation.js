/**
 * Evaluation.js - A reusable evaluation system library
 * Generates complete evaluation interfaces based on configuration
 */
class EvaluationSystem {
    constructor(config) {
        this.config = config;
        this.ratings = {};
        this.ratingsSet = {};
        this.personInfo = {
            name: '',
            level: ''
        };
        this.isInitializing = false;
        this.chart = null;
        
        // Initialize ratings structure
        this.config.dimensions.forEach(dimension => {
            this.ratings[dimension.key] = 1;
            this.ratingsSet[dimension.key] = false;
        });
        
        // Load saved data
        this.loadSavedData();
    }

    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        
        // Generate and insert HTML
        container.innerHTML = this.generateHTML();
        
        // Initialize chart
        this.initChart();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI with saved data
        this.updateUI();
        this.updateInfoUI();
    }

    generateHTML() {
        return `
            ${this.generateCSS()}
            <div class="container mx-auto px-3 py-4">
                ${this.generateHeader()}
                ${this.generatePersonInfo()}
                <div class="grid lg:grid-cols-2 gap-4">
                    ${this.generateRatingsSection()}
                    ${this.generateChartsSection()}
                </div>
            </div>
        `;
    }

    generateCSS() {
        return `
            <style>
                .collapse { overflow: visible; }
                .rating-card { transition: all 0.3s ease; }
                .rating-card:hover { transform: translateY(-2px); }
                .rating-labels {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .rating-label {
                    text-align: center;
                    font-size: 0.75rem;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    background: rgba(0,0,0,0.05);
                }
                .rating-label.active {
                    background: rgba(147, 51, 234, 0.2);
                    color: rgb(147, 51, 234);
                    font-weight: 600;
                }
                .level-card {
                    transition: all 0.3s ease;
                    opacity: 0.6;
                }
                .level-card.highlighted {
                    opacity: 1;
                    transform: scale(1.02);
                    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                ${this.generateLevelCardCSS()}
                ${this.generateLevelToggleCSS()}
                ${this.generateSelectedRatingCSS()}
                ${this.generateOverallRatingCSS()}
                .typeform-input {
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid #e5e7eb;
                    border-radius: 0;
                    font-size: 2rem;
                    font-weight: 700;
                    padding: 0.5rem 0;
                    transition: all 0.3s ease;
                    color: #1f2937;
                }
                .typeform-input:focus {
                    outline: none;
                    border-bottom-color: rgb(147, 51, 234);
                    box-shadow: 0 3px 0 0 rgba(147, 51, 234, 0.1);
                }
                .typeform-input::placeholder {
                    color: #9ca3af;
                    font-weight: 400;
                }
            </style>
        `;
    }

    generateLevelCardCSS() {
        return this.config.levels.map((level, index) => {
            const colors = ['green', 'blue', 'purple'];
            const color = colors[index % colors.length];
            return `.level-card.highlighted.${level.key}-level {
                border-color: rgb(${this.getColorRGB(color)});
                box-shadow: 0 8px 25px -5px rgba(${this.getColorRGB(color)}, 0.3);
            }`;
        }).join('\n');
    }

    generateLevelToggleCSS() {
        return this.config.levels.map((level, index) => {
            const colors = ['green', 'blue', 'purple'];
            const color = colors[index % colors.length];
            const rgb = this.getColorRGB(color);
            return `
                .${level.key}-toggle {
                    background: linear-gradient(135deg, rgba(${rgb}, 0.1), rgba(${rgb}, 0.05));
                    border-color: rgba(${rgb}, 0.2);
                }
                .${level.key}-toggle.active {
                    background: linear-gradient(135deg, rgb(${rgb}), rgb(${this.getDarkerColorRGB(color)}));
                    color: white;
                    border-color: rgb(${rgb});
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(${rgb}, 0.4);
                }
                .${level.key}-toggle.active img {
                    filter: brightness(0) invert(1);
                }
            `;
        }).join('\n');
    }

    generateSelectedRatingCSS() {
        return `
            .selected-rating {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206));
                color: white;
                font-weight: bold;
                font-size: 0.875rem;
                margin-right: 0.5rem;
                box-shadow: 0 0 20px rgba(147, 51, 234, 0.6);
            }
            .selected-rating.rating-1 { background: linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38)); }
            .selected-rating.rating-2 { background: linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12)); }
            .selected-rating.rating-3 { background: linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74)); }
            .selected-rating.rating-4 { background: linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235)); }
            .selected-rating.rating-5 { background: linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206)); }
        `;
    }

    generateOverallRatingCSS() {
        return `
            .overall-rating-card {
                transition: all 0.5s ease;
                cursor: pointer;
            }
            .overall-rating-card.rating-red {
                background: linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38)) !important;
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
            }
            .overall-rating-card.rating-orange {
                background: linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12)) !important;
                box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
            }
            .overall-rating-card.rating-green {
                background: linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74)) !important;
                box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
            }
            .overall-rating-card.rating-blue {
                background: linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235)) !important;
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
            }
            .overall-rating-card.rating-purple {
                background: linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206)) !important;
                box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4);
            }
        `;
    }

    getColorRGB(color) {
        const colors = {
            green: '34, 197, 94',
            blue: '59, 130, 246',
            purple: '147, 51, 234'
        };
        return colors[color] || '147, 51, 234';
    }

    getDarkerColorRGB(color) {
        const colors = {
            green: '22, 163, 74',
            blue: '37, 99, 235',
            purple: '126, 34, 206'
        };
        return colors[color] || '126, 34, 206';
    }

    generateHeader() {
        return `
            <div class="text-center mb-4">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    ${this.config.title}
                </h1>
                <p class="text-base text-gray-600">${this.config.description}</p>
            </div>
        `;
    }

    generatePersonInfo() {
        return `
            <div class="card bg-base-100 shadow-lg mb-4">
                <div class="card-body p-4">
                    <h2 class="card-title text-lg mb-3">👤 ${this.config.roleName} Information</h2>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <input type="text" id="personName" placeholder="Enter the ${this.config.roleName.toLowerCase()}'s name..."  class="typeform-input w-full" />
                        </div>
                        <div class="form-control">
                            <label class="label py-1">
                                <span class="label-text font-medium">Evaluation Level</span>
                            </label>
                            <div class="join w-full" id="levelButtonGroup">
                                ${this.config.levels.map(level => `
                                    <button type="button" class="join-item btn flex-1 level-toggle ${level.key}-toggle" data-level="${level.key}">
                                        <span class="font-semibold">${level.name}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateRatingsSection() {
        return `
            <div class="space-y-3">
                ${this.config.dimensions.map(dimension => this.generateDimensionCard(dimension)).join('')}
                ${this.generateOverallRatingCard()}
            </div>
        `;
    }

    generateDimensionCard(dimension) {
        return `
            <div class="card bg-base-100 shadow-lg rating-card">
                <div class="card-body p-3">
                    <div class="collapse collapse-arrow">
                        <input type="checkbox" class="peer" />
                        <div class="collapse-title text-lg font-medium flex items-center gap-2 py-2">
                            <span class="selected-rating" data-dimension="${dimension.key}" style="display: none;">0</span>
                            <span class="text-xl">${dimension.emoji}</span>
                            <span>${dimension.name}</span>
                        </div>
                        <div class="collapse-content">
                            ${dimension.description ? `<p class="text-sm text-gray-600 mb-4">${dimension.description}</p>` : ''}
                            <div class="grid grid-cols-1 gap-3 mb-4">
                                ${this.config.levels.map((level, index) => this.generateLevelCard(level, dimension.levelBehaviors[level.key], index)).join('')}
                            </div>
                            <div class="form-control">
                                <input type="range" min="1" max="5" step="1" value="1" 
                                       class="range range-primary" data-dimension="${dimension.key}" />
                                <div class="rating-labels">
                                    <div class="rating-label" data-value="1">1<br>😰<br>Below Expectations</div>
                                    <div class="rating-label" data-value="2">2<br>😐<br>Slightly Below</div>
                                    <div class="rating-label" data-value="3">3<br>😊<br>Meets Expectations</div>
                                    <div class="rating-label" data-value="4">4<br>🌟<br>Often Exceeds</div>
                                    <div class="rating-label" data-value="5">5<br>🚀<br>Greatly Exceeds</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateLevelCard(level, behavior, index) {
        const colors = ['green', 'blue', 'purple'];
        const color = colors[index % colors.length];
        return `
            <div class="level-card ${level.key}-level card bg-${color}-50 border border-${color}-200 p-3">
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 text-${color}-600 mt-0.5 flex-shrink-0">
                        ${this.getLevelIcon(level.key)}
                    </div>
                    <div>
                        <h4 class="font-semibold text-${color}-800 mb-1">${level.name}</h4>
                        <p class="text-sm text-${color}-700">${behavior}</p>
                    </div>
                </div>
            </div>
        `;
    }

    getLevelIcon(levelKey) {
        // Simple icon representation - you can customize this or use actual SVGs
        const icons = {
            junior: '🌱',
            mid: '🚀', 
            senior: '⭐'
        };
        return icons[levelKey] || '📊';
    }

    generateOverallRatingCard() {
        return `
            <div class="card bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg overall-rating-card">
                <div class="card-body p-4">
                    <h3 class="card-title text-lg mb-2">🎯 Overall Rating</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold" id="overallRating">0.0</div>
                            <div class="text-sm opacity-90">Average</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold" id="totalScore">0.0</div>
                            <div class="text-sm opacity-90">Total</div>
                        </div>
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button class="btn btn-sm" id="resetBtn">🔄 Reset</button>
                        <button class="btn btn-sm" id="exportBtn">📤 Export</button>
                    </div>
                </div>
            </div>
        `;
    }

    generateChartsSection() {
        return `
            <div class="space-y-4">
                <div class="card bg-base-100 shadow-lg">
                    <div class="card-body p-4">
                        <h3 class="card-title text-lg mb-4">📊 Evaluation Chart</h3>
                        <div class="relative h-80">
                            <canvas id="radarChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initChart() {
        const ctx = document.getElementById('radarChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.config.dimensions.map(d => d.name),
                datasets: [{
                    label: this.personInfo.name || `${this.config.roleName} Rating`,
                    data: Object.values(this.ratings),
                    backgroundColor: 'rgba(147, 51, 234, 0.2)',
                    borderColor: 'rgb(147, 51, 234)',
                    pointBackgroundColor: 'rgb(147, 51, 234)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(147, 51, 234)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                elements: { line: { borderWidth: 3 } },
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 5,
                        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        pointLabels: { font: { size: 12 } },
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 5,
                            stepSize: 1,
                            showLabelBackdrop: false,
                            font: { size: 10 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, font: { size: 14 } }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Person name input
        document.getElementById('personName').addEventListener('input', (e) => {
            this.personInfo.name = e.target.value;
            this.saveData();
            this.chart.data.datasets[0].label = this.personInfo.name || `${this.config.roleName} Rating`;
            this.chart.update();
        });

        // Level toggle buttons
        document.querySelectorAll('.level-toggle').forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedLevel = e.currentTarget.dataset.level;
                
                document.querySelectorAll('.level-toggle').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                e.currentTarget.classList.add('active');
                this.personInfo.level = selectedLevel;
                this.saveData();
                this.updateLevelHighlighting();
            });
        });

        // Rating sliders
        document.querySelectorAll('.range').forEach(slider => {
            slider.addEventListener('input', () => {
                if (this.isInitializing) return;
                
                const dimension = slider.dataset.dimension;
                const value = parseInt(slider.value);
                
                this.ratings[dimension] = value;
                this.ratingsSet[dimension] = true;
                
                this.updateRatingLabels(slider, value);
                this.updateSelectedRatingIndicators();
                this.saveData();
                
                this.chart.data.datasets[0].data = Object.values(this.ratings);
                this.chart.update();
                this.updateOverallRating();
            });
        });

        // Rating labels
        document.querySelectorAll('.rating-label').forEach(label => {
            label.addEventListener('click', (e) => {
                const value = parseInt(e.currentTarget.dataset.value);
                const slider = e.currentTarget.closest('.form-control').querySelector('.range');
                const dimension = slider.dataset.dimension;
                
                slider.value = value;
                this.ratings[dimension] = value;
                this.ratingsSet[dimension] = true;
                
                this.updateRatingLabels(slider, value);
                this.updateSelectedRatingIndicators();
                this.saveData();
                
                this.chart.data.datasets[0].data = Object.values(this.ratings);
                this.chart.update();
                this.updateOverallRating();
            });
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all ratings and information? This cannot be undone.')) {
                this.resetAll();
            }
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
    }

    updateRatingLabels(slider, value) {
        const labelsContainer = slider.nextElementSibling;
        const labels = labelsContainer.querySelectorAll('.rating-label');
        
        labels.forEach((label) => {
            const labelValue = parseInt(label.dataset.value);
            if (labelValue === value) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }

    updateSelectedRatingIndicators() {
        Object.keys(this.ratings).forEach(dimension => {
            const indicator = document.querySelector(`.selected-rating[data-dimension="${dimension}"]`);
            if (indicator) {
                if (this.ratingsSet[dimension]) {
                    indicator.textContent = this.ratings[dimension];
                    indicator.style.display = 'inline-flex';
                    indicator.classList.remove('rating-1', 'rating-2', 'rating-3', 'rating-4', 'rating-5');
                    indicator.classList.add(`rating-${this.ratings[dimension]}`);
                } else {
                    indicator.style.display = 'none';
                }
            }
        });
    }

    updateLevelHighlighting() {
        const selectedLevel = this.personInfo.level;
        const allLevelCards = document.querySelectorAll('.level-card');
        
        allLevelCards.forEach(card => {
            card.classList.remove('highlighted');
            
            if (selectedLevel && card.classList.contains(`${selectedLevel}-level`)) {
                card.classList.add('highlighted');
            }
        });
    }

    updateOverallRating() {
        const setRatings = Object.keys(this.ratingsSet)
            .filter(key => this.ratingsSet[key])
            .map(key => this.ratings[key]);
        
        const overallCard = document.querySelector('.overall-rating-card');
        
        if (setRatings.length === 0) {
            document.getElementById('overallRating').textContent = '0.0';
            document.getElementById('totalScore').textContent = '0.0';
            overallCard.classList.remove('rating-red', 'rating-orange', 'rating-green', 'rating-blue', 'rating-purple');
            return;
        }
        
        const sum = setRatings.reduce((a, b) => a + b, 0);
        const average = sum / setRatings.length;
        
        document.getElementById('overallRating').textContent = average.toFixed(1);
        document.getElementById('totalScore').textContent = sum.toFixed(1);
        
        overallCard.classList.remove('rating-red', 'rating-orange', 'rating-green', 'rating-blue', 'rating-purple');
        
        if (average < 2.5) {
            overallCard.classList.add('rating-red');
        } else if (average < 2.9) {
            overallCard.classList.add('rating-orange');
        } else if (average < 3.3) {
            overallCard.classList.add('rating-green');
        } else if (average < 3.6) {
            overallCard.classList.add('rating-blue');
        } else {
            overallCard.classList.add('rating-purple');
        }
    }

    updateUI() {
        this.isInitializing = true;
        
        for (const [dimension, value] of Object.entries(this.ratings)) {
            const slider = document.querySelector(`input[data-dimension="${dimension}"]`);
            
            if (slider) {
                slider.value = value;
                slider.setAttribute('value', value);
                
                const inputEvent = new Event('input', { bubbles: true });
                slider.dispatchEvent(inputEvent);
                
                const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.background = `linear-gradient(to right, hsl(var(--p)) 0%, hsl(var(--p)) ${percentage}%, hsl(var(--b3)) ${percentage}%, hsl(var(--b3)) 100%)`;
                
                if (this.ratingsSet[dimension]) {
                    this.updateRatingLabels(slider, value);
                } else {
                    const labelsContainer = slider.nextElementSibling;
                    const labels = labelsContainer.querySelectorAll('.rating-label');
                    labels.forEach(label => label.classList.remove('active'));
                }
            }
        }
        
        this.updateSelectedRatingIndicators();
        this.updateOverallRating();
        this.isInitializing = false;
    }

    updateInfoUI() {
        document.getElementById('personName').value = this.personInfo.name || '';
        
        document.querySelectorAll('.level-toggle').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === this.personInfo.level) {
                btn.classList.add('active');
            }
        });
        
        this.updateLevelHighlighting();
    }

    loadSavedData() {
        const storageKey = `evaluation_${this.config.key}`;
        const savedRatings = localStorage.getItem(`${storageKey}_ratings`);
        const savedInfo = localStorage.getItem(`${storageKey}_info`);
        const savedRatingsSet = localStorage.getItem(`${storageKey}_ratingsSet`);

        if (savedRatings) {
            this.ratings = { ...this.ratings, ...JSON.parse(savedRatings) };
        }

        if (savedInfo) {
            this.personInfo = JSON.parse(savedInfo);
        }

        if (savedRatingsSet) {
            this.ratingsSet = { ...this.ratingsSet, ...JSON.parse(savedRatingsSet) };
        }
    }

    saveData() {
        const storageKey = `evaluation_${this.config.key}`;
        localStorage.setItem(`${storageKey}_ratings`, JSON.stringify(this.ratings));
        localStorage.setItem(`${storageKey}_info`, JSON.stringify(this.personInfo));
        localStorage.setItem(`${storageKey}_ratingsSet`, JSON.stringify(this.ratingsSet));
    }

    resetAll() {
        // Reset ratings
        Object.keys(this.ratings).forEach(key => {
            this.ratings[key] = 1;
            this.ratingsSet[key] = false;
        });
        
        // Reset person info
        this.personInfo = { name: '', level: '' };
        
        // Clear localStorage
        const storageKey = `evaluation_${this.config.key}`;
        localStorage.removeItem(`${storageKey}_ratings`);
        localStorage.removeItem(`${storageKey}_info`);
        localStorage.removeItem(`${storageKey}_ratingsSet`);
        
        // Update UI
        this.updateUI();
        this.updateInfoUI();
        this.updateLevelHighlighting();
        
        // Update chart
        this.chart.data.datasets[0].label = `${this.config.roleName} Rating`;
        this.chart.data.datasets[0].data = Object.values(this.ratings);
        this.chart.update();
    }

    exportData() {
        // Simple JSON export - you can extend this to create fancy graphics
        const exportData = {
            config: this.config,
            personInfo: this.personInfo,
            ratings: this.ratings,
            ratingsSet: this.ratingsSet,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.config.roleName.toLowerCase()}_evaluation_${this.personInfo.name || 'unnamed'}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Export for use
window.EvaluationSystem = EvaluationSystem; 