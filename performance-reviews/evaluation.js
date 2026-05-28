/**
 * Evaluation.js - A reusable evaluation system library
 * Generates complete evaluation interfaces based on configuration
 */
class EvaluationSystem {
    constructor(config) {
        this.config = config;
        this.ratings = {};
        this.ratingsSet = {};
        this.notes = {};
        this.summary = '';
        this.personInfo = {
            name: '',
            level: ''
        };
        this.isInitializing = false;
        this.chart = null;

        this.config.dimensions.forEach(dimension => {
            this.ratings[dimension.key] = 1;
            this.ratingsSet[dimension.key] = false;
            this.notes[dimension.key] = '';
        });

        this.loadSavedData();
    }

    get storageKey()         { return `evaluation_${this.config.key}`; }
    get savedReviewsKey()    { return `evaluation_${this.config.key}_saved`; }

    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        container.innerHTML = this.generateHTML();
        this.initChart();
        this.setupEventListeners();

        this.updateUI();
        this.updateInfoUI();
        this.updateNotesUI();
        this.updateSummaryUI();

        // Deep link: /role/?review=<id> loads that saved review into the editor.
        const params = new URLSearchParams(window.location.search);
        const reviewId = params.get('review');
        if (reviewId) {
            this.loadReview(reviewId, true);
            history.replaceState(null, '', window.location.pathname);
        }
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
        return `<svg viewBox="0 0 100 120" class="${extraClass}" aria-hidden="true"><path fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" d="M 50 4 C 62 4 70 12 70 22 C 70 30 66 36 60 40 L 65 42 C 80 44 92 52 95 62 C 96 66 94 70 89 70 L 67 70 L 71 114 L 54 114 L 50 76 L 46 114 L 29 114 L 33 70 L 11 70 C 6 70 4 66 5 62 C 8 52 20 44 35 42 L 40 40 C 34 36 30 30 30 22 C 30 12 38 4 50 4 Z"/></svg>`;
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

                /* notes */
                .notes-label {
                    display: block;
                    font-size: .65rem;
                    letter-spacing: .18em;
                    text-transform: uppercase;
                    color: #4A3F33;
                    margin-bottom: .4rem;
                    font-weight: 600;
                }
                .notes-input {
                    display: block;
                    width: 100%;
                    background: #F2E9D2;
                    border: 1.25px solid #1B1714;
                    color: #1B1714;
                    font-family: 'Inter Tight', system-ui, sans-serif;
                    font-size: .9rem;
                    line-height: 1.5;
                    padding: .6rem .75rem;
                    border-radius: 0;
                    resize: vertical;
                    min-height: 4.5rem;
                    transition: box-shadow .12s ease, transform .12s ease;
                }
                .notes-input:focus {
                    outline: none;
                    box-shadow: 3px 3px 0 0 #B5481C;
                    transform: translate(-1px,-1px);
                }
                .notes-input::placeholder { color: #9C8E78; font-style: italic; }
                .summary-input { min-height: 7.5rem; font-size: .95rem; }

                /* save confirmation pill */
                .save-confirmation {
                    flex-basis: 100%;
                    margin-top: .15rem;
                    font-size: .85rem;
                    opacity: 0;
                    transform: translateY(-2px);
                    transition: opacity .2s ease, transform .2s ease;
                    pointer-events: none;
                }
                .save-confirmation.visible {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .save-confirmation a { text-decoration: underline; text-underline-offset: 2px; }

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
                .e-btn-sm {
                    display: inline-flex;
                    align-items: center;
                    gap: .3rem;
                    background: #FBF6E6;
                    color: #1B1714;
                    border: 1px solid #1B1714;
                    box-shadow: 2px 2px 0 0 #1B1714;
                    padding: .3rem .6rem;
                    font-weight: 600;
                    font-size: .72rem;
                    cursor: pointer;
                    border-radius: 0;
                    transition: transform .1s ease, box-shadow .1s ease;
                }
                .e-btn-sm:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 0 #1B1714; }
                .e-btn-sm:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 0 #1B1714; }
                .e-btn-sm.danger:hover { background: #B33A3A; color: #FBF6E6; }
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

            .overall-verdict {
                margin-top: 1.1rem;
                padding-top: 1rem;
                border-top: 1.5px solid currentColor;
            }
            .overall-verdict .verdict-eyebrow {
                font-size: .65rem;
                letter-spacing: .2em;
                text-transform: uppercase;
                opacity: .75;
                margin-bottom: .35rem;
            }
            .overall-verdict .verdict-label {
                font-family: 'Fraunces', serif;
                font-weight: 800;
                font-size: 1.55rem;
                line-height: 1.1;
                letter-spacing: -0.005em;
            }
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
                ${this.generateSummarySection()}
                ${this.generateOverallRatingCard()}
            </div>
        `;
    }

    generateSummarySection() {
        return `
            <div class="e-tile p-6">
                <div class="flex items-baseline justify-between mb-4">
                    <h2 class="font-display text-xl font-bold tracking-tight">Summary</h2>
                    <span class="text-[0.65rem] tracking-[0.18em] uppercase text-inkSoft">Overall narrative</span>
                </div>
                <textarea class="notes-input summary-input" id="summaryInput"
                          placeholder="A few sentences that pull the whole review together — strengths, growth edge, overall framing."
                          rows="6"></textarea>
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
                        <div class="dim-notes mt-5">
                            <label class="notes-label">Notes</label>
                            <textarea class="notes-input" data-dimension="${dimension.key}"
                                      placeholder="Examples, edge cases, follow-ups…" rows="3"></textarea>
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
                        <path fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" d="M 50 4 C 62 4 70 12 70 22 C 70 30 66 36 60 40 L 65 42 C 80 44 92 52 95 62 C 96 66 94 70 89 70 L 67 70 L 71 114 L 54 114 L 50 76 L 46 114 L 29 114 L 33 70 L 11 70 C 6 70 4 66 5 62 C 8 52 20 44 35 42 L 40 40 C 34 36 30 30 30 22 C 30 12 38 4 50 4 Z"/>
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
                <div class="overall-verdict" id="overallVerdict" style="display:none">
                    <div class="verdict-eyebrow">Verdict</div>
                    <div class="verdict-label" id="overallVerdictLabel"></div>
                </div>
                <div class="mt-6 flex gap-3 flex-wrap">
                    <button class="e-btn ghost" id="resetBtn">Reset</button>
                    <button class="e-btn" id="saveReviewBtn">
                        Save review
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>
                    </button>
                    <button class="e-btn ghost" id="exportPdfBtn">
                        Export PDF
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>
                    </button>
                    <button class="e-btn ghost" id="exportBtn">
                        Export JSON
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
                            color: INK,
                            // Wrap long dimension names onto multiple lines so they don't get clipped.
                            callback: (label) => {
                                const MAX = 14;
                                if (label.length <= MAX) return label;
                                const words = String(label).split(/\s+/);
                                const lines = [];
                                let cur = '';
                                for (const w of words) {
                                    const next = cur ? cur + ' ' + w : w;
                                    if (next.length > MAX && cur) {
                                        lines.push(cur);
                                        cur = w;
                                    } else {
                                        cur = next;
                                    }
                                }
                                if (cur) lines.push(cur);
                                return lines;
                            }
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

    showSaveConfirmation(verb = 'Saved') {
        const btn = document.getElementById('saveReviewBtn');
        if (!btn) return;
        let conf = document.getElementById('saveConfirmation');
        if (!conf) {
            conf = document.createElement('div');
            conf.id = 'saveConfirmation';
            conf.className = 'save-confirmation';
            btn.parentElement.appendChild(conf);
        }
        conf.innerHTML = `${verb} · <a href="../saved/" class="underline underline-offset-2" style="color:inherit">View dashboard →</a>`;
        conf.classList.add('visible');
        clearTimeout(this._saveConfTimer);
        this._saveConfTimer = setTimeout(() => conf.classList.remove('visible'), 5000);
    }

    updateNotesUI() {
        document.querySelectorAll('.notes-input[data-dimension]').forEach(ta => {
            const dim = ta.dataset.dimension;
            ta.value = this.notes[dim] || '';
        });
    }

    updateSummaryUI() {
        const el = document.getElementById('summaryInput');
        if (el) el.value = this.summary || '';
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

        // Export JSON
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Export PDF
        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportPDF();
        });

        // Notes (per-dimension)
        document.querySelectorAll('.notes-input[data-dimension]').forEach(ta => {
            ta.addEventListener('input', (e) => {
                const dim = e.currentTarget.dataset.dimension;
                this.notes[dim] = e.currentTarget.value;
                this.saveData();
            });
        });

        // Summary
        const summaryEl = document.getElementById('summaryInput');
        if (summaryEl) {
            summaryEl.addEventListener('input', (e) => {
                this.summary = e.currentTarget.value;
                this.saveData();
            });
        }

        // Save review (finalize snapshot)
        document.getElementById('saveReviewBtn').addEventListener('click', () => {
            this.saveReview();
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

    // Maps an average score to a hiring/performance band.
    // The two top tiers were anchored by the user; the lower three follow the same shape.
    getVerdict(avg) {
        if (avg >= 4.0) return { label: 'Outstanding candidate', cls: 'rating-purple', color: '#B5481C' };
        if (avg >= 3.5) return { label: 'High performer',        cls: 'rating-blue',   color: '#33446E' };
        if (avg >= 3.0) return { label: 'On the bar',            cls: 'rating-green',  color: '#4E6B3B' };
        if (avg >= 2.5) return { label: 'Below the bar',         cls: 'rating-orange', color: '#C2680F' };
        return            { label: 'Significant gaps',           cls: 'rating-red',    color: '#B33A3A' };
    }

    updateOverallRating() {
        const setKeys = Object.keys(this.ratingsSet).filter(k => this.ratingsSet[k]);
        const setRatings = setKeys.map(k => this.ratings[k]);

        const overallCard = document.querySelector('.overall-rating-card');
        const verdictEl   = document.getElementById('overallVerdict');
        const verdictLbl  = document.getElementById('overallVerdictLabel');

        overallCard.classList.remove('rating-red', 'rating-orange', 'rating-green', 'rating-blue', 'rating-purple');

        if (setRatings.length === 0) {
            document.getElementById('overallRating').textContent = '0.0';
            document.getElementById('totalScore').textContent = '0.0';
            if (verdictEl) verdictEl.style.display = 'none';
            return;
        }

        const sum = setRatings.reduce((a, b) => a + b, 0);
        const average = sum / setRatings.length;
        document.getElementById('overallRating').textContent = average.toFixed(1);
        document.getElementById('totalScore').textContent = sum.toFixed(1);

        const verdict = this.getVerdict(average);
        overallCard.classList.add(verdict.cls);

        if (verdictEl && verdictLbl) {
            verdictLbl.textContent = verdict.label;
            verdictEl.style.display = '';
            // Hint that the verdict is partial until all dimensions are rated.
            const total = this.config.dimensions.length;
            const eyebrow = verdictEl.querySelector('.verdict-eyebrow');
            if (eyebrow) eyebrow.textContent = setRatings.length < total
                ? `Verdict · partial (${setRatings.length}/${total})`
                : 'Verdict';
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
        const k = this.storageKey;
        const ratings      = localStorage.getItem(`${k}_ratings`);
        const info         = localStorage.getItem(`${k}_info`);
        const ratingsSet   = localStorage.getItem(`${k}_ratingsSet`);
        const notes        = localStorage.getItem(`${k}_notes`);
        const summary      = localStorage.getItem(`${k}_summary`);

        if (ratings)    this.ratings    = { ...this.ratings,    ...JSON.parse(ratings) };
        if (info)       this.personInfo = JSON.parse(info);
        if (ratingsSet) this.ratingsSet = { ...this.ratingsSet, ...JSON.parse(ratingsSet) };
        if (notes)      this.notes      = { ...this.notes,      ...JSON.parse(notes) };
        if (summary)    this.summary    = JSON.parse(summary);
    }

    saveData() {
        const k = this.storageKey;
        localStorage.setItem(`${k}_ratings`,    JSON.stringify(this.ratings));
        localStorage.setItem(`${k}_info`,       JSON.stringify(this.personInfo));
        localStorage.setItem(`${k}_ratingsSet`, JSON.stringify(this.ratingsSet));
        localStorage.setItem(`${k}_notes`,      JSON.stringify(this.notes));
        localStorage.setItem(`${k}_summary`,    JSON.stringify(this.summary));
    }

    resetAll() {
        Object.keys(this.ratings).forEach(key => {
            this.ratings[key] = 1;
            this.ratingsSet[key] = false;
            this.notes[key] = '';
        });
        this.summary = '';
        this.personInfo = { name: '', level: '' };

        const k = this.storageKey;
        localStorage.removeItem(`${k}_ratings`);
        localStorage.removeItem(`${k}_info`);
        localStorage.removeItem(`${k}_ratingsSet`);
        localStorage.removeItem(`${k}_notes`);
        localStorage.removeItem(`${k}_summary`);

        this.updateUI();
        this.updateInfoUI();
        this.updateNotesUI();
        this.updateSummaryUI();
        this.updateLevelHighlighting();

        this.chart.data.datasets[0].label = this.config.roleName;
        this.chart.data.datasets[0].data = Object.values(this.ratings);
        this.chart.update();
    }

    exportData() {
        const data = {
            config: { key: this.config.key, roleName: this.config.roleName },
            personInfo: this.personInfo,
            ratings: this.ratings,
            ratingsSet: this.ratingsSet,
            notes: this.notes,
            summary: this.summary || '',
            timestamp: new Date().toISOString()
        };
        const date = new Date().toISOString().slice(0, 10);
        this.downloadJSON(`${this.fileSlug()}_${this.personInfo.name || 'unnamed'}_${date}.json`, data);
    }

    // ───────────── Saved reviews (finalized snapshots) ─────────────

    fileSlug() {
        return this.config.roleName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }

    getSavedReviews() {
        try { return JSON.parse(localStorage.getItem(this.savedReviewsKey)) || []; }
        catch { return []; }
    }

    setSavedReviews(arr) {
        localStorage.setItem(this.savedReviewsKey, JSON.stringify(arr));
    }

    computeAverage() {
        const setKeys = Object.keys(this.ratingsSet).filter(k => this.ratingsSet[k]);
        if (!setKeys.length) return 0;
        return setKeys.reduce((a, k) => a + this.ratings[k], 0) / setKeys.length;
    }

    saveReview() {
        let name = this.personInfo.name?.trim();
        if (!name) {
            name = prompt('Name for this review?');
            if (!name) return;
            this.personInfo.name = name;
            this.saveData();
            this.updateInfoUI();
            this.chart.data.datasets[0].label = name;
            this.chart.update();
        }
        const setKeys = Object.keys(this.ratingsSet).filter(k => this.ratingsSet[k]);
        if (!setKeys.length) {
            if (!confirm('No ratings have been set yet. Save anyway?')) return;
        }

        const reviews = this.getSavedReviews();
        const normalized = name.trim().toLowerCase();
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        // Only treat a same-name review as the "current" one if it was saved within the last 30 days
        // (or today). Older reviews stay as separate historical entries instead of being overwritten.
        const recentIndex = reviews.findIndex(r => {
            if ((r.personInfo?.name || '').trim().toLowerCase() !== normalized) return false;
            const t = new Date(r.savedAt).getTime();
            return Number.isFinite(t) && (now - t) <= THIRTY_DAYS_MS;
        });

        const snapshot = {
            savedAt: new Date().toISOString(),
            personInfo: { ...this.personInfo },
            ratings: { ...this.ratings },
            ratingsSet: { ...this.ratingsSet },
            notes: { ...this.notes },
            summary: this.summary || '',
            average: this.computeAverage()
        };

        let verb = 'Saved';
        if (recentIndex !== -1) {
            const existing = reviews[recentIndex];
            const when = new Date(existing.savedAt);
            const whenStr = isNaN(when) ? 'earlier' : when.toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
            if (!confirm(`A review for "${name}" was saved ${whenStr}. Overwrite it?`)) return;
            // Keep the original id so existing exports/links remain stable; refresh everything else.
            reviews.splice(recentIndex, 1);
            reviews.unshift({ ...existing, ...snapshot });
            verb = 'Updated';
        } else {
            reviews.unshift({
                id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
                ...snapshot
            });
        }

        this.setSavedReviews(reviews);
        this.showSaveConfirmation(verb);
    }

    loadReview(id, silent = false) {
        const review = this.getSavedReviews().find(r => r.id === id);
        if (!review) return;
        if (!silent && !confirm('Load this review into the editor? Current in-progress data will be replaced.')) return;
        this.personInfo = { ...review.personInfo };
        this.ratings    = { ...this.ratings,    ...(review.ratings || {}) };
        this.ratingsSet = { ...this.ratingsSet, ...(review.ratingsSet || {}) };
        this.notes      = { ...this.notes,      ...(review.notes || {}) };
        this.summary    = review.summary || '';
        this.saveData();
        this.updateUI();
        this.updateInfoUI();
        this.updateNotesUI();
        this.updateSummaryUI();
        this.updateLevelHighlighting();
        this.chart.data.datasets[0].label = this.personInfo.name || this.config.roleName;
        this.chart.data.datasets[0].data = Object.values(this.ratings);
        this.chart.update();
    }

    downloadJSON(filename, obj) {
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ───────────── PDF one-pager ─────────────

    async exportPDF() {
        // html2pdf.bundle.min.js exposes both html2canvas and jspdf as globals; we use them
        // directly so we can force a single-page A4 output. html2pdf()'s built-in pipeline
        // paginates when the rasterized wrapper is even a fraction of a millimetre taller
        // than A4 (its `while (heightLeft >= 0)` check), which produced a near-empty page 2.
        if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert('PDF library failed to load. Check your connection and try again.');
            return;
        }

        const chartImg = this.chart.toBase64Image();
        const layout = this.generatePDFLayout(chartImg);

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed; left:-99999px; top:0; pointer-events:none;';
        wrapper.innerHTML = layout;
        document.body.appendChild(wrapper);

        try {
            if (document.fonts?.ready) { try { await document.fonts.ready; } catch {} }

            const canvas = await html2canvas(wrapper.firstElementChild, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F5ECD4',
                logging: false
            });

            // Fit the canvas into a single A4 page, preserving aspect ratio.
            const PAGE_W = 210, PAGE_H = 297;
            const aspect = canvas.width / canvas.height;
            let imgW = PAGE_W;
            let imgH = imgW / aspect;
            if (imgH > PAGE_H) {
                imgH = PAGE_H;
                imgW = imgH * aspect;
            }
            const x = (PAGE_W - imgW) / 2;

            const pdf = new jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', x, 0, imgW, imgH, '', 'FAST');

            const nameSlug = ((this.personInfo.name || 'unnamed').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')) || 'unnamed';
            const dateSlug = new Date().toISOString().slice(0, 10);
            pdf.save(`${this.fileSlug()}_${nameSlug}_${dateSlug}.pdf`);
        } catch (e) {
            console.error(e);
            alert('PDF export failed: ' + (e?.message || e));
        } finally {
            document.body.removeChild(wrapper);
        }
    }

    generatePDFLayout(chartImg) {
        const dims = this.config.dimensions;
        const setCount = Object.values(this.ratingsSet).filter(Boolean).length;
        const avg = this.computeAverage();
        const verdict = this.getVerdict(avg);

        const level = this.config.levels.find(l => l.key === this.personInfo.level);
        const levelName = level ? level.name : '—';
        const name = (this.personInfo.name || 'Untitled').trim();

        const nowFmt  = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
        const now = new Date();
        const today = nowFmt.format(now);
        const nowStamp = `${today}, ${timeFmt.format(now)}`;

        // 2-col grid for all dimensions except the last, which gets a full-width box at the bottom.
        const lastIndex = dims.length - 1;
        const gridDims  = dims.slice(0, lastIndex);
        const lastDim   = dims[lastIndex];
        const gridHTML  = gridDims.map((d, i) => this.renderPDFDimensionBox(d, i, false)).join('');
        const lastHTML  = lastDim ? this.renderPDFDimensionBox(lastDim, lastIndex, true) : '';

        const FONT_DISPLAY = `'Fraunces', Georgia, 'Times New Roman', serif`;
        const FONT_BODY    = `'Inter Tight', Helvetica, Arial, sans-serif`;

        const hasSummary = !!(this.summary && this.summary.trim());

        return `
<div style="
    width:210mm; min-height:297mm; padding:10mm 12mm 14mm;
    box-sizing:border-box; position:relative;
    font-family:${FONT_BODY}; color:#1B1714; background:#F5ECD4;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
">

    <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-bottom:4mm; border-bottom:1.5px solid #1B1714;">
        <div style="display:flex; align-items:center; gap:4mm;">
            <svg viewBox="0 0 100 120" style="width:8mm; height:10mm; color:#1B1714;"><path fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" d="M 50 4 C 62 4 70 12 70 22 C 70 30 66 36 60 40 L 65 42 C 80 44 92 52 95 62 C 96 66 94 70 89 70 L 67 70 L 71 114 L 54 114 L 50 76 L 46 114 L 29 114 L 33 70 L 11 70 C 6 70 4 66 5 62 C 8 52 20 44 35 42 L 40 40 C 34 36 30 30 30 22 C 30 12 38 4 50 4 Z"/></svg>
            <div>
                <div style="font-family:${FONT_DISPLAY}; font-weight:900; font-size:18pt; line-height:1; letter-spacing:-0.01em;">MeepleOS</div>
                <div style="font-size:7pt; letter-spacing:0.2em; text-transform:uppercase; color:#4A3F33; margin-top:1mm;">Performance review</div>
            </div>
        </div>
        <div style="text-align:right; font-size:8.5pt; color:#4A3F33; line-height:1.4;">
            <div style="font-weight:600; color:#1B1714;">${this.escapePDF(this.config.roleName)}</div>
            <div style="margin-top:1mm;">${today}</div>
        </div>
    </div>

    <div style="margin-top:4mm; display:flex; align-items:baseline; justify-content:space-between; gap:6mm;">
        <div style="min-width:0;">
            <div style="font-family:${FONT_DISPLAY}; font-weight:900; font-size:24pt; line-height:1; letter-spacing:-0.015em;">${this.escapePDF(name)}</div>
            <div style="font-size:9pt; color:#4A3F33; margin-top:1.5mm;">${this.escapePDF(levelName)} · ${this.escapePDF(this.config.roleName)}</div>
        </div>
        <div style="text-align:right; font-size:7pt; letter-spacing:0.18em; text-transform:uppercase; color:#4A3F33;">${setCount}/${dims.length} rated</div>
    </div>

    <div style="display:flex; gap:4mm; margin-top:4mm;">

        <div style="flex:1; min-width:0; display:flex; flex-direction:column; background:#FBF6E6; border:1.25px solid #1B1714; padding:4mm 5mm;">
            <div style="font-size:6.5pt; letter-spacing:0.2em; text-transform:uppercase; color:#4A3F33; margin-bottom:1.5mm;">Summary</div>
            ${hasSummary
                ? `<div style="font-size:8.5pt; line-height:1.45; color:#1B1714; white-space:pre-wrap; flex:1;">${this.escapePDF(this.summary.trim())}</div>`
                : `<div style="font-size:8.5pt; line-height:1.45; color:#9C8E78; font-style:italic; flex:1;">No summary added.</div>`
            }
        </div>

        <div style="width:64mm; flex:0 0 64mm; display:flex; flex-direction:column; gap:3mm;">

            <div style="display:flex; align-items:center; gap:3mm; padding:3mm 3.5mm; background:${verdict.color}; color:#FBF6E6; border:1.5px solid #1B1714;">
                <div style="font-family:${FONT_DISPLAY}; font-weight:900; font-size:26pt; line-height:1;">${avg.toFixed(1)}</div>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:6pt; letter-spacing:0.2em; text-transform:uppercase; opacity:0.85;">Verdict</div>
                    <div style="font-family:${FONT_DISPLAY}; font-weight:800; font-size:10.5pt; line-height:1.15; margin-top:0.8mm;">${verdict.label}</div>
                </div>
            </div>

            <div style="border:1.25px solid #1B1714; padding:2mm; background:#FBF6E6;">
                <div style="font-size:6pt; letter-spacing:0.2em; text-transform:uppercase; color:#4A3F33; margin-bottom:1mm;">Shape</div>
                <img src="${chartImg}" style="width:100%; height:auto; display:block;" />
            </div>

        </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:3mm; margin-top:4mm;">
        ${gridHTML}
    </div>

    ${lastHTML ? `<div style="margin-top:3mm;">${lastHTML}</div>` : ''}

    <div style="position:absolute; bottom:5mm; left:12mm; right:12mm; display:flex; justify-content:space-between; align-items:center; font-size:6.5pt; color:#4A3F33; border-top:1px solid #1B1714; padding-top:2mm;">
        <div>MeepleOS · Performance review</div>
        <div>Generated ${nowStamp}</div>
    </div>
</div>`;
    }

    renderPDFDimensionBox(dimension, index, fullWidth) {
        const num = String(index + 1).padStart(2, '0');
        const rating = this.ratings[dimension.key];
        const isSet = this.ratingsSet[dimension.key];
        const notes = (this.notes[dimension.key] || '').trim();
        const FONT_DISPLAY = `'Fraunces', Georgia, 'Times New Roman', serif`;
        const tierColor = this.getRatingColor(isSet ? rating : 0);

        return `
<div style="background:#FBF6E6; border:1.25px solid #1B1714; padding:2.8mm 3.5mm;">
    <div style="display:flex; align-items:baseline; gap:2mm;">
        <span style="font-family:${FONT_DISPLAY}; font-style:italic; font-weight:900; color:#7A6A55; font-size:8pt; width:5.5mm; flex:0 0 5.5mm;">${num}.</span>
        <span style="font-family:${FONT_DISPLAY}; font-weight:800; font-size:9.5pt; flex:1; min-width:0; line-height:1.15;">${this.escapePDF(dimension.name)}</span>
        <span style="display:inline-flex; align-items:center; gap:1mm; flex:0 0 auto;">
            ${this.renderPDFStars(isSet ? rating : 0)}
            <span style="font-family:${FONT_DISPLAY}; font-weight:900; font-size:9.5pt; min-width:4mm; text-align:right; color:${tierColor};">${isSet ? rating : '–'}</span>
        </span>
    </div>
    ${notes ? `<div style="font-size:7.5pt; color:#3D352C; line-height:1.38; margin-top:1.5mm; padding-left:7.5mm; white-space:pre-wrap;">${this.escapePDF(notes)}</div>` : ''}
</div>`;
    }

    getRatingColor(value) {
        // Per-rating accent matching the selected-rating chip palette elsewhere in the app.
        return ({ 1:'#B33A3A', 2:'#C2680F', 3:'#4E6B3B', 4:'#33446E', 5:'#B5481C' })[value] || '#B5A78A';
    }

    renderPDFStars(value, max = 5) {
        const color = this.getRatingColor(value);
        const STAR_PATH = 'M12 2 L14.85 8.9 L22.3 9.5 L16.6 14.5 L18.3 22 L12 18 L5.7 22 L7.4 14.5 L1.7 9.5 L9.15 8.9 Z';
        let out = '';
        for (let i = 1; i <= max; i++) {
            const filled = i <= value;
            out += `<svg viewBox="0 0 24 24" width="12" height="12" style="margin-right:1px; vertical-align:middle;"><path d="${STAR_PATH}" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
        }
        return out;
    }

    escapePDF(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
}

// Export for use
window.EvaluationSystem = EvaluationSystem; 