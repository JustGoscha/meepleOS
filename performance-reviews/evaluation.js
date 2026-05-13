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
            <div class="max-w-7xl mx-auto px-6 py-10">
                ${this.generateHeader()}
                ${this.generatePersonInfo()}
                <div class="grid lg:grid-cols-5 gap-6 mt-6">
                    <div class="lg:col-span-3">${this.generateRatingsSection()}</div>
                    <div class="lg:col-span-2">${this.generateChartsSection()}</div>
                </div>
            </div>
        `;
    }

    // Strip the leading emoji from config strings so the new design isn't fighting old icons.
    stripLeadingEmoji(s) {
        if (!s) return s;
        return s.replace(/^[\p{Extended_Pictographic}‍️\s]+/u, '').trim();
    }

    meepleSVG(extraClass = '') {
        return `<svg viewBox="0 0 100 120" class="${extraClass}" aria-hidden="true"><path fill="currentColor" d="M 50 4 C 41 4 34 11 34 20 C 34 26 37 31 42 33 L 34 35 C 22 38 12 48 8 56 C 6 60 8 64 14 64 L 38 64 L 32 116 L 46 116 L 50 80 L 54 116 L 68 116 L 62 64 L 86 64 C 92 64 94 60 92 56 C 88 48 78 38 66 35 L 58 33 C 63 31 66 26 66 20 C 66 11 59 4 50 4 Z"/></svg>`;
    }

    generateCSS() {
        return `
            <style>
                /* —— MeepleOS paper theme —— */
                .e-stamp {
                    display: inline-block;
                    border: 1.5px solid currentColor;
                    padding: .15rem .55rem;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                    font-size: .65rem;
                    font-weight: 700;
                    transform: rotate(-2deg);
                }
                .e-tile {
                    background: #FBF6E6;
                    border: 1.5px solid #1B1714;
                    box-shadow: 6px 6px 0 0 #1B1714;
                }
                .e-tile-flat {
                    background: #FBF6E6;
                    border: 1.5px solid #1B1714;
                }
                .e-display { font-family: 'Fraunces', Georgia, serif; }

                .dim-num {
                    font-family: 'Fraunces', serif;
                    font-style: italic;
                    font-weight: 900;
                    color: #4A3F33;
                    font-size: 1.05rem;
                    min-width: 1.6rem;
                    text-align: right;
                    display: inline-block;
                }
                .dim-title {
                    font-family: 'Fraunces', serif;
                    font-weight: 800;
                    font-size: 1.05rem;
                    letter-spacing: -0.005em;
                }

                /* collapse override */
                .collapse { overflow: visible; }
                .dimension-card {
                    background: #FBF6E6;
                    border: 1.5px solid #1B1714;
                    box-shadow: 4px 4px 0 0 #1B1714;
                    transition: box-shadow .15s ease, transform .15s ease;
                }
                .dimension-card:hover { box-shadow: 6px 6px 0 0 #1B1714; transform: translate(-1px,-1px); }
                .dimension-card .collapse-title:after {
                    color: #1B1714 !important;
                }

                /* rating scale */
                .rating-labels {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.4rem;
                    margin-top: 1rem;
                }
                .rating-label {
                    text-align: center;
                    font-size: .72rem;
                    font-weight: 500;
                    padding: .55rem .35rem;
                    border: 1.25px solid #1B1714;
                    background: #FBF6E6;
                    color: #1B1714;
                    cursor: pointer;
                    line-height: 1.2;
                    transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
                }
                .rating-label:hover { transform: translate(-1px,-1px); box-shadow: 2px 2px 0 0 #1B1714; }
                .rating-label .num {
                    display: block;
                    font-family: 'Fraunces', serif;
                    font-weight: 900;
                    font-size: 1.05rem;
                    margin-bottom: .15rem;
                }
                .rating-label.active { background: #1B1714; color: #FBF6E6; }

                /* slider */
                input[type=range].range {
                    --range-shdw: #1B1714;
                    height: 1.75rem;
                    accent-color: #B5481C;
                }

                /* level toggle (Junior / Mid / Senior buttons) */
                .level-toggle {
                    background: #FBF6E6 !important;
                    border: 1.5px solid #1B1714 !important;
                    color: #1B1714 !important;
                    border-radius: 0 !important;
                    font-weight: 600 !important;
                    text-transform: none !important;
                    letter-spacing: 0 !important;
                    box-shadow: none !important;
                    min-height: 2.75rem;
                    transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
                }
                .level-toggle:hover { background: #F2E9D2 !important; }
                .level-toggle + .level-toggle { border-left: none !important; }
                .level-toggle.active {
                    background: #1B1714 !important;
                    color: #FBF6E6 !important;
                }

                ${this.generateLevelCardCSS()}
                ${this.generateSelectedRatingCSS()}
                ${this.generateOverallRatingCSS()}

                /* per-level cards inside a dimension */
                .level-card {
                    background: #FBF6E6;
                    border: 1.5px solid #1B1714;
                    border-radius: 0 !important;
                    padding: .85rem 1rem .85rem 1.5rem !important;
                    position: relative;
                    opacity: .55;
                    transition: opacity .15s ease, transform .15s ease, box-shadow .15s ease;
                }
                .level-card::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 8px;
                    background: var(--stripe, #4E6B3B);
                }
                .level-card.highlighted {
                    opacity: 1;
                    transform: translate(-2px,-2px);
                    box-shadow: 4px 4px 0 0 #1B1714;
                }
                .level-card .level-name {
                    font-family: 'Fraunces', serif;
                    font-weight: 800;
                    font-size: 1rem;
                    margin-bottom: .15rem;
                    color: #1B1714;
                    display: flex;
                    align-items: center;
                    gap: .5rem;
                }
                .level-card .level-name .meeple-ico {
                    width: 1em; height: 1.2em;
                    color: var(--stripe);
                    flex: 0 0 auto;
                }
                .level-card .level-text {
                    color: #4A3F33;
                    font-size: .9rem;
                    line-height: 1.45;
                }

                /* name input — rulebook field */
                .typeform-input {
                    background: transparent;
                    border: none;
                    border-bottom: 2.5px solid #1B1714;
                    border-radius: 0;
                    font-family: 'Fraunces', serif;
                    font-size: 1.65rem;
                    font-weight: 800;
                    padding: .35rem 0;
                    color: #1B1714;
                    width: 100%;
                    transition: border-color .15s ease;
                }
                .typeform-input:focus {
                    outline: none;
                    border-bottom-color: #B5481C;
                }
                .typeform-input::placeholder {
                    color: #9C8E78;
                    font-weight: 500;
                    font-style: italic;
                }

                /* buttons */
                .e-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: .4rem;
                    background: #1B1714;
                    color: #FBF6E6;
                    border: 1.5px solid #1B1714;
                    box-shadow: 3px 3px 0 0 #1B1714;
                    border-radius: 0;
                    padding: .55rem 1rem;
                    font-weight: 600;
                    font-size: .85rem;
                    cursor: pointer;
                    transition: transform .12s ease, box-shadow .12s ease;
                }
                .e-btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 0 #1B1714; }
                .e-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 0 #1B1714; }
                .e-btn.ghost {
                    background: #FBF6E6;
                    color: #1B1714;
                }
            </style>
        `;
    }

    // Map each level key to a paper-palette accent (moss → mustard → ember = growth → mastery).
    getLevelAccent(index) {
        const palette = ['#4E6B3B', '#C99A2E', '#B5481C'];
        return palette[index % palette.length];
    }

    generateLevelCardCSS() {
        return this.config.levels.map((level, index) => {
            const accent = this.getLevelAccent(index);
            return `.level-card.${level.key}-level { --stripe: ${accent}; }`;
        }).join('\n');
    }

    generateSelectedRatingCSS() {
        return `
            .selected-rating {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 1.85rem;
                height: 1.85rem;
                background: #1B1714;
                color: #FBF6E6;
                font-family: 'Fraunces', serif;
                font-weight: 900;
                font-size: .95rem;
                margin-right: .35rem;
                border: 1.5px solid #1B1714;
            }
            .selected-rating.rating-1 { background: #B33A3A; }
            .selected-rating.rating-2 { background: #C2680F; }
            .selected-rating.rating-3 { background: #4E6B3B; }
            .selected-rating.rating-4 { background: #33446E; }
            .selected-rating.rating-5 { background: #B5481C; }
        `;
    }

    generateOverallRatingCSS() {
        return `
            .overall-rating-card {
                background: #FBF6E6;
                border: 1.5px solid #1B1714;
                box-shadow: 6px 6px 0 0 #1B1714;
                color: #1B1714;
                transition: background .25s ease, color .25s ease;
            }
            .overall-rating-card .overall-num {
                font-family: 'Fraunces', serif;
                font-weight: 900;
                font-size: 2.75rem;
                line-height: 1;
            }
            .overall-rating-card .overall-sub {
                font-size: .7rem;
                letter-spacing: .18em;
                text-transform: uppercase;
                opacity: .75;
                margin-top: .35rem;
            }
            .overall-rating-card.rating-red    { background: #B33A3A; color: #FBF6E6; }
            .overall-rating-card.rating-orange { background: #C2680F; color: #FBF6E6; }
            .overall-rating-card.rating-green  { background: #4E6B3B; color: #FBF6E6; }
            .overall-rating-card.rating-blue   { background: #33446E; color: #FBF6E6; }
            .overall-rating-card.rating-purple { background: #B5481C; color: #FBF6E6; }
        `;
    }

    generateHeader() {
        const title = this.stripLeadingEmoji(this.config.title) || this.config.roleName;
        const desc  = this.stripLeadingEmoji(this.config.description) || '';
        return `
            <div class="mb-8">
                <div class="text-xs tracking-[0.2em] uppercase text-inkSoft mb-3 flex items-center gap-2">
                    <span class="inline-block w-6 h-px bg-ink"></span>
                    <span>MeepleOS · Performance review</span>
                </div>
                <h1 class="font-display font-black text-4xl md:text-5xl tracking-tight leading-[0.95]">
                    ${this.config.roleName}<span class="text-ember">.</span>
                </h1>
                <p class="mt-4 text-inkSoft text-base md:text-lg max-w-2xl leading-relaxed">
                    ${desc || title}
                </p>
            </div>
        `;
    }

    generatePersonInfo() {
        return `
            <div class="e-tile p-6">
                <div class="flex items-baseline justify-between mb-5">
                    <h2 class="font-display text-xl font-bold tracking-tight">Player</h2>
                    <span class="text-[0.65rem] tracking-[0.18em] uppercase text-inkSoft">Setup</span>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-[0.7rem] tracking-[0.16em] uppercase text-inkSoft mb-2">Name</label>
                        <input type="text" id="personName"
                               placeholder="${this.config.roleName.toLowerCase()}'s name…"
                               class="typeform-input" />
                    </div>
                    <div>
                        <label class="block text-[0.7rem] tracking-[0.16em] uppercase text-inkSoft mb-2">Level</label>
                        <div class="join w-full" id="levelButtonGroup">
                            ${this.config.levels.map(level => `
                                <button type="button" class="join-item btn flex-1 level-toggle" data-level="${level.key}">
                                    <span>${level.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateRatingsSection() {
        return `
            <div class="space-y-4">
                ${this.config.dimensions.map((dimension, i) => this.generateDimensionCard(dimension, i)).join('')}
                ${this.generateOverallRatingCard()}
            </div>
        `;
    }

    generateDimensionCard(dimension, index) {
        const num = String(index + 1).padStart(2, '0');
        return `
            <div class="dimension-card">
                <div class="collapse collapse-arrow">
                    <input type="checkbox" class="peer" />
                    <div class="collapse-title flex items-center gap-3 py-3 pr-12">
                        <span class="selected-rating" data-dimension="${dimension.key}" style="display: none;">0</span>
                        <span class="dim-num">${num}.</span>
                        <span class="dim-title">${dimension.name}</span>
                    </div>
                    <div class="collapse-content">
                        ${dimension.description ? `<p class="text-sm text-inkSoft mb-5 italic">${dimension.description}</p>` : ''}
                        <div class="grid grid-cols-1 gap-2.5 mb-5">
                            ${this.config.levels.map((level, i) => this.generateLevelCard(level, dimension.levelBehaviors[level.key], i)).join('')}
                        </div>
                        <div>
                            <input type="range" min="1" max="5" step="1" value="1"
                                   class="range range-primary" data-dimension="${dimension.key}" />
                            <div class="rating-labels">
                                <div class="rating-label" data-value="1"><span class="num">1</span>Below</div>
                                <div class="rating-label" data-value="2"><span class="num">2</span>Almost</div>
                                <div class="rating-label" data-value="3"><span class="num">3</span>Meets</div>
                                <div class="rating-label" data-value="4"><span class="num">4</span>Exceeds</div>
                                <div class="rating-label" data-value="5"><span class="num">5</span>Outstanding</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateLevelCard(level, behavior, index) {
        // Three meeple sizes — small/medium/tall — for junior → senior progression.
        const sizes = ['0.75em', '1em', '1.25em'];
        const meepleH = sizes[index % sizes.length];
        return `
            <div class="level-card ${level.key}-level">
                <div class="level-name">
                    <svg viewBox="0 0 100 120" class="meeple-ico" style="height:${meepleH}" aria-hidden="true">
                        <path fill="currentColor" d="M 50 4 C 41 4 34 11 34 20 C 34 26 37 31 42 33 L 34 35 C 22 38 12 48 8 56 C 6 60 8 64 14 64 L 38 64 L 32 116 L 46 116 L 50 80 L 54 116 L 68 116 L 62 64 L 86 64 C 92 64 94 60 92 56 C 88 48 78 38 66 35 L 58 33 C 63 31 66 26 66 20 C 66 11 59 4 50 4 Z"/>
                    </svg>
                    <span>${level.name}</span>
                </div>
                <p class="level-text">${behavior}</p>
            </div>
        `;
    }

    generateOverallRatingCard() {
        return `
            <div class="overall-rating-card p-6">
                <div class="flex items-baseline justify-between mb-4">
                    <h3 class="font-display text-xl font-bold tracking-tight">Score</h3>
                    <span class="text-[0.65rem] tracking-[0.18em] uppercase opacity-75">Running total</span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="overall-num" id="overallRating">0.0</div>
                        <div class="overall-sub">Average</div>
                    </div>
                    <div>
                        <div class="overall-num" id="totalScore">0.0</div>
                        <div class="overall-sub">Total</div>
                    </div>
                </div>
                <div class="mt-6 flex gap-3">
                    <button class="e-btn ghost" id="resetBtn">Reset</button>
                    <button class="e-btn" id="exportBtn">
                        Export
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    </button>
                </div>
            </div>
        `;
    }

    generateChartsSection() {
        return `
            <div class="lg:sticky lg:top-6 space-y-4">
                <div class="e-tile p-5">
                    <div class="flex items-baseline justify-between mb-4">
                        <h3 class="font-display text-lg font-bold tracking-tight">Shape of the review</h3>
                        <span class="text-[0.65rem] tracking-[0.18em] uppercase text-inkSoft">Radar</span>
                    </div>
                    <div class="relative h-80">
                        <canvas id="radarChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    initChart() {
        const ctx = document.getElementById('radarChart').getContext('2d');
        const INK = '#1B1714';
        const EMBER = '#B5481C';
        const PAPER_LIGHT = '#FBF6E6';
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.config.dimensions.map(d => d.name),
                datasets: [{
                    label: this.personInfo.name || `${this.config.roleName}`,
                    data: Object.values(this.ratings),
                    backgroundColor: 'rgba(181, 72, 28, 0.18)',
                    borderColor: EMBER,
                    pointBackgroundColor: EMBER,
                    pointBorderColor: PAPER_LIGHT,
                    pointHoverBackgroundColor: PAPER_LIGHT,
                    pointHoverBorderColor: EMBER,
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                elements: { line: { borderWidth: 2.5 } },
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 5,
                        angleLines: { display: true, color: 'rgba(27, 23, 20, 0.18)' },
                        grid: { color: 'rgba(27, 23, 20, 0.14)' },
                        pointLabels: {
                            font: { size: 12, family: 'Fraunces, serif', weight: '700' },
                            color: INK
                        },
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 5,
                            stepSize: 1,
                            showLabelBackdrop: false,
                            color: 'rgba(74, 63, 51, 0.7)',
                            font: { size: 10, family: 'Inter Tight, sans-serif' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            color: INK,
                            font: { size: 13, family: 'Inter Tight, sans-serif', weight: '600' }
                        }
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
                const slider = e.currentTarget.closest('.rating-labels').previousElementSibling;
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
                slider.style.background = `linear-gradient(to right, #B5481C 0%, #B5481C ${percentage}%, #E7DBB7 ${percentage}%, #E7DBB7 100%)`;
                
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