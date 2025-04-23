// Initialize the data structure
let ratings = {
    technicalExecution: 0,
    systemDesign: 0,
    collaboration: 0,
    ownershipAccountability: 0,
    productBusinessUnderstanding: 0,
    growthMentorship: 0,
    impact: 0
};

// Load saved ratings from localStorage
const savedRatings = localStorage.getItem('techDimensionsRatings');
if (savedRatings) {
    ratings = JSON.parse(savedRatings);
    updateUI();
}

// Initialize the radar chart
const ctx = document.getElementById('radarChart').getContext('2d');
const radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: [
            'Technical Execution',
            'System Design',
            'Collaboration',
            'Ownership & Accountability',
            'Product & Business Understanding',
            'Growth + Mentorship',
            'Impact'
        ],
        datasets: [{
            label: 'Engineer Rating',
            data: Object.values(ratings),
            backgroundColor: 'rgba(147, 51, 234, 0.2)',
            borderColor: 'rgb(147, 51, 234)',
            pointBackgroundColor: 'rgb(147, 51, 234)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(147, 51, 234)'
        }]
    },
    options: {
        elements: {
            line: {
                borderWidth: 3
            }
        },
        scales: {
            r: {
                angleLines: {
                    display: true
                },
                suggestedMin: 0,
                suggestedMax: 5
            }
        }
    }
});

// Handle rating button clicks
document.querySelectorAll('.rating-button').forEach(button => {
    button.addEventListener('click', () => {
        const dimension = button.dataset.dimension;
        const value = parseInt(button.dataset.value);
        
        // Update ratings
        ratings[dimension] = value;
        
        // Save to localStorage
        localStorage.setItem('techDimensionsRatings', JSON.stringify(ratings));
        
        // Update UI
        updateUI();
        
        // Update chart
        radarChart.data.datasets[0].data = Object.values(ratings);
        radarChart.update();
    });
});

// Update UI to reflect current ratings
function updateUI() {
    for (const [dimension, value] of Object.entries(ratings)) {
        document.querySelectorAll(`[data-dimension="${dimension}"]`).forEach(button => {
            const buttonValue = parseInt(button.dataset.value);
            if (buttonValue === value) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

// Handle reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    // Reset ratings
    Object.keys(ratings).forEach(key => {
        ratings[key] = 0;
    });
    
    // Clear localStorage
    localStorage.removeItem('techDimensionsRatings');
    
    // Update UI
    updateUI();
    
    // Update chart
    radarChart.data.datasets[0].data = Object.values(ratings);
    radarChart.update();
});

// Handle export button
document.getElementById('exportBtn').addEventListener('click', () => {
    const canvas = document.getElementById('radarChart');
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'tech-dimensions-chart.png';
    link.href = image;
    link.click();
}); 