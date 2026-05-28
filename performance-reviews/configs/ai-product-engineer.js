const aiProductEngineerConfig = {
    key: 'ai_product_engineer',
    title: 'AI product engineer',
    description: 'A builder-leaning engineer who ships AI-powered product. Strong on craft, agentic patterns, and the tooling mindset that ties the work together.',
    roleName: 'AI Product Engineer',

    levels: [
        { key: 'junior', name: 'Junior' },
        { key: 'mid',    name: 'Mid-Level' },
        { key: 'senior', name: 'Senior' }
    ],

    dimensions: [
        {
            key: 'productSense',
            name: 'Product Sense',
            description: 'Prioritization, outcome thinking, and the discipline to say no.',
            levelBehaviors: {
                junior: 'Builds what is asked. Limited grasp of trade-offs; rarely pushes back on scope.',
                mid: 'Weighs impact, effort, and risk. Can defend a "no" and shape a credible MVP.',
                senior: 'Drives prioritization with clear outcomes. Reframes scope and protects focus across the team.'
            }
        },
        {
            key: 'designLiteracy',
            name: 'Design Literacy',
            description: 'Component libraries, design systems, states, and accessibility for engineers.',
            levelBehaviors: {
                junior: 'Uses an existing component library. Misses some states, edge cases, or a11y basics.',
                mid: 'Treats consistency as a feature. Handles loading, error, empty, responsive, and a11y intentionally.',
                senior: 'Bridges design intent and shipped UI. Negotiates trade-offs around states, a11y, and performance with designers.'
            }
        },
        {
            key: 'softwareCraft',
            name: 'Software Craft',
            description: 'Quality, tests, debugging, Git/PR discipline, and tech-debt awareness.',
            levelBehaviors: {
                junior: 'Needs review to catch issues. Small PRs. Still learning trade-offs and Git workflows.',
                mid: 'Ships clean, tested code. Handles tricky merges. Names and contains tech debt as it appears.',
                senior: 'Sets the quality bar. Plans debt paydown. Picks trade-offs (perf, data, security, maintainability) deliberately.'
            }
        },
        {
            key: 'agenticAi',
            name: 'Agentic & AI Engineering',
            description: 'LLMs, agentic patterns, tool use, evals, guardrails — and their limits.',
            levelBehaviors: {
                junior: 'Has used LLMs in practice. Knows basic prompting and the major failure modes (hallucinations, cost, latency).',
                mid: 'Builds agentic workflows with tools and RAG. Uses evals and guardrails. Reasons about cost, latency, and privacy.',
                senior: 'Designs reliable AI features end-to-end. Mixes LLMs with classical search or heuristics where they fit. Has war stories about reliability.'
            }
        },
        {
            key: 'builderMindset',
            name: 'Builder & Automation',
            description: 'Tooling, automations, hobby projects, things shipped end-to-end.',
            levelBehaviors: {
                junior: 'Curious and tinkers. Has built small tools or hobby projects but few shipped automations.',
                mid: 'Builds tools that remove manual work for self and team. Brings concrete examples — scripts, integrations, dashboards.',
                senior: 'Multiplies team output through tooling. Spots automatable patterns early. Hobby and work projects feed each other.'
            }
        },
        {
            key: 'productionDiscipline',
            name: 'Production Discipline',
            description: 'Experiment vs. production: monitoring, fallback, cost, privacy, evals.',
            levelBehaviors: {
                junior: 'Distinguishes experiments from production, mostly with guidance. Limited monitoring or rollback experience.',
                mid: 'Adds tests, monitoring, and basic evals. Knows when something is not ready for production and says so.',
                senior: 'Designs for failure — evals, canaries, rollbacks, human-in-the-loop. Treats cost, privacy, and observability as features.'
            }
        },
        {
            key: 'ownership',
            name: 'Collaboration & Ownership',
            description: 'Stakeholder work, independence, moderation, and leadership potential.',
            levelBehaviors: {
                junior: 'Communicates blockers. Collaborates with PM and design but needs guidance on stakeholder framing.',
                mid: 'Owns features end-to-end across functions. Moderates technical decisions. Cuts own tasks and roadmap chunks.',
                senior: 'Builds consensus and defuses conflict. Mentors others. Steers technical decisions across the department.'
            }
        }
    ]
};
