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

// Handle slider changes
document.querySelectorAll('.rating-slider').forEach(slider => {
    slider.addEventListener('input', () => {
        const dimension = slider.dataset.dimension;
        const value = parseFloat(slider.value) / 2; // Convert 0-10 to 0-5
        
        // Update ratings
        ratings[dimension] = value;
        
        // Update the displayed value
        const valueDisplay = slider.nextElementSibling;
        valueDisplay.textContent = value.toFixed(1);
        
        // Save to localStorage
        localStorage.setItem('techDimensionsRatings', JSON.stringify(ratings));
        
        // Update chart
        radarChart.data.datasets[0].data = Object.values(ratings);
        radarChart.update();
        
        // Update overall rating
        updateOverallRating();
    });
});

// Update UI to reflect current ratings
function updateUI() {
    for (const [dimension, value] of Object.entries(ratings)) {
        const slider = document.querySelector(`[data-dimension="${dimension}"]`);
        const valueDisplay = slider.nextElementSibling;
        
        // Set slider value (multiply by 2 to convert 0-5 to 0-10)
        slider.value = value * 2;
        valueDisplay.textContent = value.toFixed(1);
    }
    updateOverallRating();
}

// Calculate and update overall rating
function updateOverallRating() {
    const values = Object.values(ratings);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    document.getElementById('overallRating').textContent = average.toFixed(1);
    document.getElementById('totalScore').textContent = sum.toFixed(1);
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

// Handle accordion toggle
function toggleAccordion(dimensionId) {
    const content = document.getElementById(dimensionId);
    const arrow = content.previousElementSibling.querySelector('span');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        arrow.textContent = '▲';
    } else {
        content.classList.add('hidden');
        arrow.textContent = '▼';
    }
} 