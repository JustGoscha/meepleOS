const designerConfig = {
    key: 'designer',
    title: '🎨 Design Dimensions',
    description: 'Evaluate UX/UI designers across key design and user experience dimensions',
    roleName: 'Designer',
    
    levels: [
        {
            key: 'junior',
            name: 'Junior Designer'
        },
        {
            key: 'mid',
            name: 'Mid-Level Designer'
        },
        {
            key: 'senior',
            name: 'Senior Designer'
        }
    ],
    
    dimensions: [
        {
            key: 'visualDesign',
            name: 'Visual Design',
            emoji: '🎨',
            description: 'Creating beautiful, on-brand, and accessible visual interfaces',
            levelBehaviors: {
                junior: 'Creates basic UI following design systems. Needs guidance on complex layouts.',
                mid: 'Produces polished, consistent designs. Adapts design systems effectively.',
                senior: 'Creates innovative visual solutions. Evolves and defines design systems.'
            }
        },
        {
            key: 'userExperience',
            name: 'User Experience',
            emoji: '👤',
            description: 'Designing intuitive and user-centered experiences',
            levelBehaviors: {
                junior: 'Follows UX patterns and guidelines. Basic user journey understanding.',
                mid: 'Designs comprehensive user flows. Considers edge cases and accessibility.',
                senior: 'Architects complex user experiences. Anticipates user needs and behaviors.'
            }
        },
        {
            key: 'researchInsights',
            name: 'Research & Insights',
            emoji: '🔍',
            description: 'Conducting and applying user research to inform design decisions',
            levelBehaviors: {
                junior: 'Participates in research. Applies basic user feedback to designs.',
                mid: 'Conducts usability tests and interviews. Synthesizes research into actionable insights.',
                senior: 'Leads research strategy. Builds deep user empathy across the organization.'
            }
        },
        {
            key: 'prototypingIteration',
            name: 'Prototyping & Iteration',
            emoji: '⚡',
            description: 'Rapid prototyping and iterative design processes',
            levelBehaviors: {
                junior: 'Creates basic prototypes. Iterates based on direct feedback.',
                mid: 'Builds interactive prototypes. Validates concepts through testing.',
                senior: 'Masters advanced prototyping. Leads design sprints and validation processes.'
            }
        },
        {
            key: 'collaboration',
            name: 'Cross-team Collaboration',
            emoji: '🤝',
            description: 'Working effectively with product, engineering, and other teams',
            levelBehaviors: {
                junior: 'Communicates design decisions clearly. Responds well to feedback.',
                mid: 'Facilitates design discussions. Builds strong working relationships.',
                senior: 'Influences product direction. Mentors others and builds design culture.'
            }
        },
        {
            key: 'designSystems',
            name: 'Design Systems & Tools',
            emoji: '🛠️',
            description: 'Building and maintaining design systems and mastering design tools',
            levelBehaviors: {
                junior: 'Uses design tools effectively. Follows existing design systems.',
                mid: 'Contributes to design systems. Masters advanced tool features.',
                senior: 'Architects scalable design systems. Drives tool adoption and best practices.'
            }
        },
        {
            key: 'businessImpact',
            name: 'Business Impact',
            emoji: '📈',
            description: 'Understanding and contributing to business goals through design',
            levelBehaviors: {
                junior: 'Understands basic project goals. Focuses on design execution.',
                mid: 'Connects design decisions to business metrics. Balances user and business needs.',
                senior: 'Drives design strategy aligned with business objectives. Measures and communicates design impact.'
            }
        }
    ]
}; 