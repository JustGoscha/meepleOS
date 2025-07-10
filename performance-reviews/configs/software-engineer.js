const softwareEngineerConfig = {
    key: 'software_engineer',
    title: '🎯 Tech Dimensions',
    description: 'Evaluate technical engineers across 7 key dimensions',
    roleName: 'Software Engineer',
    
    levels: [
        {
            key: 'junior',
            name: 'Junior'
        },
        {
            key: 'mid',
            name: 'Mid-Level'
        },
        {
            key: 'senior',
            name: 'Senior'
        }
    ],
    
    dimensions: [
        {
            key: 'technicalExecution',
            name: 'Technical Execution',
            emoji: '⚙️',
            description: 'Code quality, testing, and technical implementation',
            levelBehaviors: {
                junior: 'Needs code review to catch issues. Focuses on local scope.',
                mid: 'Writes clean, efficient code with few bugs. Thinks about edge cases.',
                senior: 'Writes resilient, extensible code. Refactors systems proactively.'
            }
        },
        {
            key: 'systemDesign',
            name: 'System Design',
            emoji: '🏗️',
            description: 'Architecture and design thinking capabilities',
            levelBehaviors: {
                junior: 'Can follow a design and build components.',
                mid: 'Designs new features within existing systems. Understands trade-offs.',
                senior: 'Designs systems from scratch. Balances long-term needs.'
            }
        },
        {
            key: 'collaboration',
            name: 'Collaboration',
            emoji: '🤝',
            description: 'Communication and teamwork skills',
            levelBehaviors: {
                junior: 'Communicates basic blockers, asks for help.',
                mid: 'Gives thoughtful code reviews. Communicates clearly.',
                senior: 'Builds consensus, defuses conflict, improves team dynamics.'
            }
        },
        {
            key: 'ownershipAccountability',
            name: 'Ownership & Accountability',
            emoji: '🎯',
            description: 'Taking responsibility and following through',
            levelBehaviors: {
                junior: 'Owns small tasks. May need reminders to follow up.',
                mid: 'Owns features end-to-end. Takes responsibility for quality.',
                senior: 'Owns complex systems. Makes hard calls, handles ambiguity.'
            }
        },
        {
            key: 'productBusinessUnderstanding',
            name: 'Product & Business Understanding',
            emoji: '💼',
            description: 'Alignment with business goals',
            levelBehaviors: {
                junior: 'Focuses on building what\'s asked. Limited product context.',
                mid: 'Understands user needs. Suggests small UX improvements.',
                senior: 'Anticipates product risks. Balances technical and business goals.'
            }
        },
        {
            key: 'growthMentorship',
            name: 'Growth + Mentorship',
            emoji: '🌱',
            description: 'Learning mindset and helping others grow',
            levelBehaviors: {
                junior: 'Learns from others, receives feedback well.',
                mid: 'Shares knowledge. Mentors juniors informally.',
                senior: 'Coaches others consistently. Creates learning opportunities.'
            }
        },
        {
            key: 'impact',
            name: 'Impact',
            emoji: '💥',
            description: 'Influence and contribution to team/organization success',
            levelBehaviors: {
                junior: 'Completes defined tasks reliably. Limited wider impact.',
                mid: 'Unblocks teammates. Improves team performance or process.',
                senior: 'Multiplies team output. Influences roadmaps and strategy.'
            }
        }
    ]
}; 