const productManagerConfig = {
    key: 'product_manager',
    title: '🎯 Product Dimensions',
    description: 'Evaluate product managers across key product leadership dimensions',
    roleName: 'Product Manager',
    
    levels: [
        {
            key: 'associate',
            name: 'Associate PM'
        },
        {
            key: 'pm',
            name: 'Product Manager'
        },
        {
            key: 'senior',
            name: 'Senior PM'
        }
    ],
    
    dimensions: [
        {
            key: 'productStrategy',
            name: 'Product Strategy',
            emoji: '🎯',
            description: 'Strategic thinking and product vision capabilities',
            levelBehaviors: {
                associate: 'Executes on defined product initiatives. Limited strategic input.',
                pm: 'Develops feature strategies. Balances competing priorities effectively.',
                senior: 'Sets product vision and long-term strategy. Influences company direction.'
            }
        },
        {
            key: 'userResearch',
            name: 'User Research & Insights',
            emoji: '🔍',
            description: 'Understanding users and translating insights into products',
            levelBehaviors: {
                associate: 'Conducts basic user interviews. Relies on existing research.',
                pm: 'Designs and conducts comprehensive user research. Synthesizes insights.',
                senior: 'Leads research strategy. Builds deep user empathy across organization.'
            }
        },
        {
            key: 'dataAnalysis',
            name: 'Data Analysis & Metrics',
            emoji: '📊',
            description: 'Using data to drive product decisions and measure success',
            levelBehaviors: {
                associate: 'Tracks basic metrics. Needs guidance on data interpretation.',
                pm: 'Defines and analyzes key metrics. Makes data-driven decisions.',
                senior: 'Creates measurement frameworks. Influences metrics strategy.'
            }
        },
        {
            key: 'stakeholderManagement',
            name: 'Stakeholder Management',
            emoji: '🤝',
            description: 'Managing relationships and communication across teams',
            levelBehaviors: {
                associate: 'Communicates with immediate team. Basic stakeholder updates.',
                pm: 'Manages multiple stakeholders effectively. Builds strong relationships.',
                senior: 'Influences senior leadership. Navigates complex organizational dynamics.'
            }
        },
        {
            key: 'technicalCollaboration',
            name: 'Technical Collaboration',
            emoji: '⚙️',
            description: 'Working effectively with engineering teams',
            levelBehaviors: {
                associate: 'Basic technical understanding. Relies on engineers for guidance.',
                pm: 'Good technical fluency. Collaborates effectively with engineering.',
                senior: 'Deep technical understanding. Guides technical decisions and trade-offs.'
            }
        },
        {
            key: 'executionDelivery',
            name: 'Execution & Delivery',
            emoji: '🚀',
            description: 'Getting products built and shipped successfully',
            levelBehaviors: {
                associate: 'Manages small features. Needs support with complex projects.',
                pm: 'Delivers major features end-to-end. Handles scope and timeline effectively.',
                senior: 'Leads complex multi-team initiatives. Optimizes delivery processes.'
            }
        },
        {
            key: 'marketBusiness',
            name: 'Market & Business Acumen',
            emoji: '💼',
            description: 'Understanding market dynamics and business impact',
            levelBehaviors: {
                associate: 'Basic understanding of business goals. Limited market awareness.',
                pm: 'Strong business sense. Understands competitive landscape.',
                senior: 'Deep market expertise. Drives business strategy and growth.'
            }
        }
    ]
}; 