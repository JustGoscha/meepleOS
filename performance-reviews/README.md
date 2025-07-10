# 🎯 Performance Review System

A comprehensive, reusable evaluation system for different roles in your organization. Built with vanilla JavaScript, Tailwind CSS, and DaisyUI for maximum simplicity and customization.

## 🚀 Overview

This system provides a unified evaluation framework that can be easily configured for different roles:

- **Software Engineers** - Technical execution, system design, collaboration
- **Product Managers** - Strategy, user research, stakeholder management  
- **UX/UI Designers** - Visual design, user experience, prototyping

Each evaluation is tailored to the specific skills and expectations of the role, with level-specific guidance from junior to senior positions.

## ✨ Features

- 📊 **Interactive Radar Charts** - Real-time visualization of performance across all dimensions
- 🎯 **Level-Specific Guidance** - Detailed expectations for each skill level
- 💾 **Auto-Save** - Evaluations automatically saved locally as you work
- 📤 **Export Results** - Download comprehensive evaluation reports
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- ⚡ **Zero Build Process** - Pure vanilla JavaScript, no complex setup required

## 🏗️ Architecture

### Core Components

1. **`evaluation.js`** - The reusable evaluation library
2. **`configs/`** - Role-specific configuration files
3. **Individual HTML pages** - Simple pages that import the library and configuration

### Configuration Structure

Each role is defined by a configuration object with:

```javascript
const roleConfig = {
    key: 'unique_role_key',
    title: '🎯 Role Dimensions',
    description: 'Evaluate role across key dimensions',
    roleName: 'Role Name',
    
    levels: [
        { key: 'junior', name: 'Junior' },
        { key: 'mid', name: 'Mid-Level' },
        { key: 'senior', name: 'Senior' }
    ],
    
    dimensions: [
        {
            key: 'dimensionKey',
            name: 'Dimension Name',
            emoji: '⚙️',
            description: 'What this dimension measures',
            levelBehaviors: {
                junior: 'Expected behaviors for junior level',
                mid: 'Expected behaviors for mid level',
                senior: 'Expected behaviors for senior level'
            }
        }
        // ... more dimensions
    ]
};
```

## 🛠️ Getting Started

### Basic Usage

1. **Include Dependencies** in your HTML:
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- DaisyUI -->
<link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.19/dist/full.min.css" rel="stylesheet" />

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

2. **Include the Library and Configuration**:
```html
<script src="evaluation.js"></script>
<script src="configs/your-role-config.js"></script>
```

3. **Initialize the System**:
```html
<div id="evaluation-container"></div>

<script>
    const evaluation = new EvaluationSystem(yourRoleConfig);
    evaluation.init('evaluation-container');
</script>
```

### Creating a New Role Configuration

1. **Create a new configuration file** in `configs/`:

```javascript
// configs/data-scientist.js
const dataScientistConfig = {
    key: 'data_scientist',
    title: '📊 Data Science Dimensions',
    description: 'Evaluate data scientists across analytics and ML capabilities',
    roleName: 'Data Scientist',
    
    levels: [
        { key: 'junior', name: 'Junior DS' },
        { key: 'senior', name: 'Senior DS' },
        { key: 'lead', name: 'Lead DS' }
    ],
    
    dimensions: [
        {
            key: 'statisticalAnalysis',
            name: 'Statistical Analysis',
            emoji: '📈',
            description: 'Statistical modeling and analysis capabilities',
            levelBehaviors: {
                junior: 'Performs basic statistical analysis with guidance',
                senior: 'Designs and executes complex statistical models',
                lead: 'Defines analytical frameworks and methodologies'
            }
        },
        {
            key: 'machineLearning',
            name: 'Machine Learning',
            emoji: '🤖',
            description: 'ML model development and deployment',
            levelBehaviors: {
                junior: 'Implements standard ML algorithms',
                senior: 'Develops custom ML solutions and optimizes models',
                lead: 'Architects ML systems and mentors ML best practices'
            }
        }
        // ... more dimensions
    ]
};
```

2. **Create an HTML page** for the new role:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Scientist Evaluation</title>
    
    <!-- Include dependencies -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.19/dist/full.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
    <div id="evaluation-container"></div>

    <script src="../evaluation.js"></script>
    <script src="../configs/data-scientist.js"></script>
    
    <script>
        const evaluation = new EvaluationSystem(dataScientistConfig);
        evaluation.init('evaluation-container');
    </script>
</body>
</html>
```

## 📁 File Structure

```
performance-reviews/
├── index.html                    # Main hub page
├── evaluation.js                 # Core reusable library
├── configs/                      # Role configurations
│   ├── software-engineer.js
│   ├── product-manager.js
│   └── designer.js
├── software-engineers-new/       # New SE evaluation
│   └── index.html
├── product/                      # Product manager evaluation
│   └── index.html
├── design/                       # Designer evaluation
│   └── index.html
└── software-engineers/           # Original SE implementation
    ├── index.html
    ├── js/main.js
    └── img/
```

## 🎯 Evaluation Process

### Rating Scale

Each dimension uses a consistent 1-5 rating scale:

- **1 😰 Below Expectations** - Needs major support and improvement
- **2 😐 Slightly Below** - Needs some support to meet expectations  
- **3 😊 Meets Expectations** - Solid performance, sometimes exceeds
- **4 🌟 Often Exceeds** - Consistently performs above expectations
- **5 🚀 Greatly Exceeds** - Outstanding performance, sets the bar

### Level-Specific Behaviors

Each dimension includes specific behavioral expectations for each level:

- **Junior/Associate** - Learning fundamentals, needs guidance
- **Mid-Level** - Independent execution, growing influence
- **Senior/Lead** - Strategic thinking, mentoring others

## 💾 Data Storage

- **Local Storage** - All evaluations are saved automatically in the browser
- **Export Feature** - Download evaluations as JSON files for record-keeping
- **Privacy First** - No data is sent to external servers

## 🎨 Customization

### Styling

The system uses Tailwind CSS and DaisyUI. You can:

- Modify color schemes by changing the background gradients
- Customize the theme by changing the `data-theme` attribute
- Add custom CSS for specific styling needs

### Icons and Emojis

- Each dimension can have a custom emoji icon
- Level cards use color-coded styling (green/blue/purple)
- Easy to modify icons in the configuration files

## 🔧 API Reference

### EvaluationSystem Class

#### Constructor
```javascript
new EvaluationSystem(config)
```

#### Methods

- `init(containerId)` - Initialize the evaluation system in the specified container
- `updateUI()` - Refresh the user interface
- `resetAll()` - Reset all ratings and information
- `exportData()` - Export evaluation data as JSON

#### Events

The system automatically handles:
- Rating slider changes
- Level selection
- Person name input
- Reset and export actions

## 🤝 Contributing

To add new role configurations:

1. Create a new configuration file in `configs/`
2. Create an HTML page that uses the configuration
3. Add the new role to the main `index.html` hub
4. Test the evaluation flow thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](software-engineers/LICENSE) file for details.

## ☕ Support

If you find this useful, consider [buying me a coffee](https://coff.ee/justgoscha) to support continued development!

---

Built with ❤️ using vanilla JavaScript for maximum simplicity and minimal dependencies. 