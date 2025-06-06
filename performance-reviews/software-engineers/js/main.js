// Initialize the data structure
let ratings = {
    technicalExecution: 1,
    systemDesign: 1,
    collaboration: 1,
    ownershipAccountability: 1,
    productBusinessUnderstanding: 1,
    growthMentorship: 1,
    impact: 1
};

let engineerInfo = {
    name: '',
    level: ''
};

// Track which ratings have been actually set by the user (vs default)
let ratingsSet = {
    technicalExecution: false,
    systemDesign: false,
    collaboration: false,
    ownershipAccountability: false,
    productBusinessUnderstanding: false,
    growthMentorship: false,
    impact: false
};

// Load saved data from localStorage
const savedRatings = localStorage.getItem('techDimensionsRatings');
const savedInfo = localStorage.getItem('techDimensionsInfo');
const savedRatingsSet = localStorage.getItem('techDimensionsRatingsSet');

if (savedRatings) {
    ratings = JSON.parse(savedRatings);
}

if (savedInfo) {
    engineerInfo = JSON.parse(savedInfo);
    updateInfoUI();
}

if (savedRatingsSet) {
    ratingsSet = JSON.parse(savedRatingsSet);
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
            label: engineerInfo.name || 'Engineer Rating',
            data: Object.values(ratings),
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
        elements: {
            line: {
                borderWidth: 3
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 5,
                angleLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                pointLabels: {
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: 5,
                    stepSize: 1,
                    showLabelBackdrop: false,
                    font: {
                        size: 10
                    },
                    callback: function(value) {
                        return value;
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
});

// Update selected rating indicators
function updateSelectedRatingIndicators() {
    Object.keys(ratings).forEach(dimension => {
        const indicator = document.querySelector(`.selected-rating[data-dimension="${dimension}"]`);
        if (indicator) {
            if (ratingsSet[dimension]) {
                indicator.textContent = ratings[dimension];
                indicator.style.display = 'inline-flex';
                
                // Remove existing rating classes
                indicator.classList.remove('rating-1', 'rating-2', 'rating-3', 'rating-4', 'rating-5');
                
                // Add appropriate rating class based on value
                indicator.classList.add(`rating-${ratings[dimension]}`);
            } else {
                indicator.style.display = 'none';
            }
        }
    });
}

// Handle engineer info changes
document.getElementById('engineerName').addEventListener('input', (e) => {
    engineerInfo.name = e.target.value;
    localStorage.setItem('techDimensionsInfo', JSON.stringify(engineerInfo));
    
    // Update chart label
    radarChart.data.datasets[0].label = engineerInfo.name || 'Engineer Rating';
    radarChart.update();
});

// Handle level toggle button clicks
document.querySelectorAll('.level-toggle').forEach(button => {
    button.addEventListener('click', (e) => {
        const selectedLevel = e.currentTarget.dataset.level;
        
        // Remove active class from all buttons
        document.querySelectorAll('.level-toggle').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        e.currentTarget.classList.add('active');
        
        // Update engineer info
        engineerInfo.level = selectedLevel;
        localStorage.setItem('techDimensionsInfo', JSON.stringify(engineerInfo));
        updateLevelHighlighting();
    });
});

// Handle slider changes
document.querySelectorAll('.range').forEach(slider => {
    slider.addEventListener('input', () => {
        const dimension = slider.dataset.dimension;
        const value = parseInt(slider.value);
        
        // Update ratings
        ratings[dimension] = value;
        ratingsSet[dimension] = true;
        
        // Update rating label highlighting
        updateRatingLabels(slider, value);
        
        // Update selected rating indicators
        updateSelectedRatingIndicators();
        
        // Save to localStorage
        localStorage.setItem('techDimensionsRatings', JSON.stringify(ratings));
        localStorage.setItem('techDimensionsRatingsSet', JSON.stringify(ratingsSet));
        
        // Update chart
        radarChart.data.datasets[0].data = Object.values(ratings);
        radarChart.update();
        
        // Update overall rating
        updateOverallRating();
    });
});

// Update rating labels highlighting
function updateRatingLabels(slider, value) {
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

// Update UI to reflect current ratings
function updateUI() {
    for (const [dimension, value] of Object.entries(ratings)) {
        const slider = document.querySelector(`[data-dimension="${dimension}"]`);
        if (slider) {
            slider.value = value;
            updateRatingLabels(slider, value);
        }
    }
    updateSelectedRatingIndicators();
    updateOverallRating();
}

// Update info UI
function updateInfoUI() {
    document.getElementById('engineerName').value = engineerInfo.name || '';
    
    // Update level toggle buttons
    document.querySelectorAll('.level-toggle').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === engineerInfo.level) {
            btn.classList.add('active');
        }
    });
    
    updateLevelHighlighting();
}

// Update level card highlighting based on selected level
function updateLevelHighlighting() {
    const selectedLevel = engineerInfo.level;
    const allLevelCards = document.querySelectorAll('.level-card');
    
    allLevelCards.forEach(card => {
        card.classList.remove('highlighted');
        
        if (selectedLevel) {
            if ((selectedLevel === 'junior' && card.classList.contains('junior-level')) ||
                (selectedLevel === 'mid' && card.classList.contains('mid-level')) ||
                (selectedLevel === 'senior' && card.classList.contains('senior-level'))) {
                card.classList.add('highlighted');
            }
        }
    });
}

// Calculate and update overall rating
function updateOverallRating() {
    const setRatings = Object.keys(ratingsSet).filter(key => ratingsSet[key]).map(key => ratings[key]);
    const overallCard = document.querySelector('.overall-rating-card');
    
    if (setRatings.length === 0) {
        document.getElementById('overallRating').textContent = '0.0';
        document.getElementById('totalScore').textContent = '0.0';
        
        // Remove all rating classes
        overallCard.classList.remove('rating-red', 'rating-orange', 'rating-green', 'rating-blue', 'rating-purple');
        return;
    }
    
    const sum = setRatings.reduce((a, b) => a + b, 0);
    const average = sum / setRatings.length;
    
    document.getElementById('overallRating').textContent = average.toFixed(1);
    document.getElementById('totalScore').textContent = sum.toFixed(1);
    
    // Remove existing rating classes
    overallCard.classList.remove('rating-red', 'rating-orange', 'rating-green', 'rating-blue', 'rating-purple');
    
    // Apply color class based on average rating
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

// Handle reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    // Show confirmation dialog
    if (confirm('Are you sure you want to reset all ratings and information? This cannot be undone.')) {
        // Reset ratings
        Object.keys(ratings).forEach(key => {
            ratings[key] = 1;
            ratingsSet[key] = false;
        });
        
        // Reset engineer info
        engineerInfo = { name: '', level: '' };
        
        // Clear localStorage
        localStorage.removeItem('techDimensionsRatings');
        localStorage.removeItem('techDimensionsInfo');
        localStorage.removeItem('techDimensionsRatingsSet');
        
        // Update UI
        updateUI();
        updateInfoUI();
        updateLevelHighlighting();
        
        // Update chart
        radarChart.data.datasets[0].label = 'Engineer Rating';
        radarChart.data.datasets[0].data = Object.values(ratings);
        radarChart.update();
    }
});

// Handle export button
document.getElementById('exportBtn').addEventListener('click', () => {
    createTradingCardExport();
});

// Helper function for rounded rectangles (fallback for older browsers)
function roundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Helper function to draw SVG icons on canvas
function drawSVGIcon(ctx, level, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24); // Scale from 24x24 viewBox to desired size
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3; // Increased line width for better visibility
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    switch (level) {
        case 'junior':
            // Simplified plant/growth icon - stem and leaves
            ctx.beginPath();
            // Main stem
            ctx.moveTo(12, 20);
            ctx.lineTo(12, 8);
            ctx.stroke();
            
            // Base line
            ctx.beginPath();
            ctx.moveTo(8, 20);
            ctx.lineTo(16, 20);
            ctx.stroke();
            
            // Left leaf
            ctx.beginPath();
            ctx.moveTo(12, 12);
            ctx.quadraticCurveTo(8, 10, 6, 8);
            ctx.stroke();
            
            // Right leaf
            ctx.beginPath();
            ctx.moveTo(12, 10);
            ctx.quadraticCurveTo(16, 8, 18, 6);
            ctx.stroke();
            
            // Small leaves
            ctx.beginPath();
            ctx.moveTo(12, 14);
            ctx.quadraticCurveTo(10, 13, 9, 12);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(12, 16);
            ctx.quadraticCurveTo(14, 15, 15, 14);
            ctx.stroke();
            break;
            
        case 'mid':
            // Simplified rocket icon
            ctx.beginPath();
            // Rocket body
            ctx.moveTo(12, 2);
            ctx.lineTo(10, 12);
            ctx.lineTo(14, 12);
            ctx.closePath();
            ctx.fill();
            
            // Rocket fins
            ctx.beginPath();
            ctx.moveTo(10, 12);
            ctx.lineTo(8, 16);
            ctx.lineTo(10, 14);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(14, 12);
            ctx.lineTo(16, 16);
            ctx.lineTo(14, 14);
            ctx.closePath();
            ctx.fill();
            
            // Flame
            ctx.beginPath();
            ctx.moveTo(10, 12);
            ctx.lineTo(12, 20);
            ctx.lineTo(14, 12);
            ctx.stroke();
            break;
            
        case 'senior':
            // Star icon - filled
            const points = [
                [12, 2], [15.09, 8.26], [22, 9.27], [17, 14.14], 
                [18.18, 21.02], [12, 17.77], [5.82, 21.02], 
                [7, 14.14], [2, 9.27], [8.91, 8.26]
            ];
            
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

// Create a beautiful trading card-style export
function createTradingCardExport() {
    // Create a new canvas for the trading card (16:9 ratio)
    const cardCanvas = document.createElement('canvas');
    const cardCtx = cardCanvas.getContext('2d');
    
    // Set canvas size (9:16 ratio, 4K resolution)
    const cardWidth = 2160;
    const cardHeight = 3840;
    cardCanvas.width = cardWidth;
    cardCanvas.height = cardHeight;
    
    // Clear canvas first
    cardCtx.clearRect(0, 0, cardWidth, cardHeight);
    
    // Create gradient background
    const gradient = cardCtx.createLinearGradient(0, 0, cardWidth, cardHeight);
    gradient.addColorStop(0, '#8B5CF6'); // Purple
    gradient.addColorStop(0.5, '#3B82F6'); // Blue
    gradient.addColorStop(1, '#1E40AF'); // Dark blue
    
    cardCtx.fillStyle = gradient;
    cardCtx.fillRect(0, 0, cardWidth, cardHeight);
    
    // Add subtle pattern overlay
    cardCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < cardWidth; i += 120) {
        for (let j = 0; j < cardHeight; j += 120) {
            if ((i + j) % 240 === 0) {
                cardCtx.fillRect(i, j, 60, 60);
            }
        }
    }
    
    // Add main content area with rounded corners
    const contentX = 120;
    const contentY = 120;
    const contentWidth = cardWidth - 240;
    const contentHeight = cardHeight - 240;
    
    cardCtx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    cardCtx.beginPath();
    roundRect(cardCtx, contentX, contentY, contentWidth, contentHeight, 20);
    cardCtx.fill();
    
    // Add border glow
    cardCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    cardCtx.lineWidth = 3;
    cardCtx.beginPath();
    roundRect(cardCtx, contentX, contentY, contentWidth, contentHeight, 20);
    cardCtx.stroke();
    
    // Engineer name (prominent at top)
    const engineerName = engineerInfo.name || 'Engineer';
    cardCtx.fillStyle = '#1F2937';
    cardCtx.font = 'bold 144px system-ui, -apple-system, sans-serif';
    cardCtx.textAlign = 'center';
    cardCtx.fillText(engineerName, cardWidth / 2, 280);
    
    // Level badge
    if (engineerInfo.level) {
        const levelText = engineerInfo.level.charAt(0).toUpperCase() + engineerInfo.level.slice(1) + ' Engineer';
        const levelColors = {
            junior: '#22C55E',
            mid: '#3B82F6',
            senior: '#9333EA'
        };
        
        // Level background - make it wider to accommodate icon
        const badgeWidth = 680;
        const badgeHeight = 120;
        const badgeX = cardWidth / 2 - badgeWidth / 2;
        const badgeY = 340;
        
        cardCtx.fillStyle = levelColors[engineerInfo.level] || '#6B7280';
        cardCtx.beginPath();
        roundRect(cardCtx, badgeX, badgeY, badgeWidth, badgeHeight, 60);
        cardCtx.fill();
        
        // Draw SVG icon on the left side of the badge
        const iconSize = 80;
        const iconX = badgeX + 80;
        const iconY = badgeY + (badgeHeight - iconSize) / 2;
        
        // Debug: Add a background circle to verify positioning
        cardCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        cardCtx.beginPath();
        cardCtx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, 2 * Math.PI);
        cardCtx.fill();
        
        drawSVGIcon(cardCtx, engineerInfo.level, iconX, iconY, iconSize, 'white');
        
        // Level text - positioned to the right of the icon
        cardCtx.fillStyle = 'white';
        cardCtx.font = 'bold 64px system-ui, -apple-system, sans-serif';
        cardCtx.textAlign = 'center';
        cardCtx.fillText(levelText, cardWidth / 2 + 40, 420); // Offset slightly to account for icon
    }
    
    // Get the radar chart image - make it much taller to take up most of the page
    const radarCanvas = document.getElementById('radarChart');
    const chartSize = 1800; // Much larger chart
    const chartX = (cardWidth - chartSize) / 2;
    const chartY = 520;
    
    // Draw the radar chart
    cardCtx.drawImage(radarCanvas, chartX, chartY, chartSize, chartSize);
    
    // Overall rating section at bottom
    const setRatings = Object.keys(ratingsSet).filter(key => ratingsSet[key]).map(key => ratings[key]);
    let overallRating = '0.0';
    let totalScore = '0.0';
    
    if (setRatings.length > 0) {
        const sum = setRatings.reduce((a, b) => a + b, 0);
        const average = sum / setRatings.length;
        overallRating = average.toFixed(1);
        totalScore = sum.toFixed(1);
    }
    
    // Stats section - side by side design with modern cards
    const statsY = chartY + chartSize + 100;
    const cardSpacing = 80;
    const statCardWidth = (contentWidth - 120 - cardSpacing) / 2; // Account for margins
    const statCardHeight = 400; // Taller, more square
    
    // Left card - Overall Rating
    const leftCardX = contentX + 60;
    
    // Create gradient for overall rating card
    const overallGradient = cardCtx.createLinearGradient(leftCardX, statsY, leftCardX + statCardWidth, statsY + statCardHeight);
    overallGradient.addColorStop(0, 'rgba(147, 51, 234, 0.15)');
    overallGradient.addColorStop(1, 'rgba(147, 51, 234, 0.05)');
    
    cardCtx.fillStyle = overallGradient;
    cardCtx.beginPath();
    roundRect(cardCtx, leftCardX, statsY, statCardWidth, statCardHeight, 40);
    cardCtx.fill();
    
    // Overall rating card border
    cardCtx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
    cardCtx.lineWidth = 4;
    cardCtx.beginPath();
    roundRect(cardCtx, leftCardX, statsY, statCardWidth, statCardHeight, 40);
    cardCtx.stroke();
    
    // Overall rating icon and text with better spacing
    cardCtx.fillStyle = '#9333EA';
    cardCtx.font = 'bold 80px system-ui, -apple-system, sans-serif';
    cardCtx.textAlign = 'center';
    cardCtx.fillText('⭐', leftCardX + statCardWidth / 2, statsY + 100);
    
    cardCtx.fillStyle = '#1F2937';
    cardCtx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    cardCtx.fillText('Overall Rating', leftCardX + statCardWidth / 2, statsY + 180);
    
    cardCtx.font = 'bold 140px system-ui, -apple-system, sans-serif';
    cardCtx.fillStyle = '#9333EA';
    cardCtx.fillText(`${overallRating}`, leftCardX + statCardWidth / 2, statsY + 320);
    
    // Right card - Total Score
    const rightCardX = leftCardX + statCardWidth + cardSpacing;
    
    // Create gradient for total score card
    const totalGradient = cardCtx.createLinearGradient(rightCardX, statsY, rightCardX + statCardWidth, statsY + statCardHeight);
    totalGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    totalGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    
    cardCtx.fillStyle = totalGradient;
    cardCtx.beginPath();
    roundRect(cardCtx, rightCardX, statsY, statCardWidth, statCardHeight, 40);
    cardCtx.fill();
    
    // Total score card border
    cardCtx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    cardCtx.lineWidth = 4;
    cardCtx.beginPath();
    roundRect(cardCtx, rightCardX, statsY, statCardWidth, statCardHeight, 40);
    cardCtx.stroke();
    
    // Total score icon and text with better spacing
    cardCtx.fillStyle = '#3B82F6';
    cardCtx.font = 'bold 80px system-ui, -apple-system, sans-serif';
    cardCtx.textAlign = 'center';
    cardCtx.fillText('🎯', rightCardX + statCardWidth / 2, statsY + 100);
    
    cardCtx.fillStyle = '#1F2937';
    cardCtx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    cardCtx.fillText('Total Score', rightCardX + statCardWidth / 2, statsY + 180);
    
    cardCtx.font = 'bold 140px system-ui, -apple-system, sans-serif';
    cardCtx.fillStyle = '#3B82F6';
    cardCtx.fillText(`${totalScore}`, rightCardX + statCardWidth / 2, statsY + 320);
    
    // Add "Tech Dimensions" watermark
    cardCtx.fillStyle = 'rgba(107, 114, 128, 0.6)';
    cardCtx.font = '48px system-ui, -apple-system, sans-serif';
    cardCtx.textAlign = 'center';
    cardCtx.fillText('🎯 Tech Dimensions', cardWidth / 2, cardHeight - 80);
    
    // Download the image
    const link = document.createElement('a');
    const name = engineerInfo.name ? engineerInfo.name.replace(/\s+/g, '-') : 'engineer';
    const date = new Date().toISOString().split('T')[0];
    link.download = `tech-dimensions-card-${name}-${date}.png`;
    link.href = cardCanvas.toDataURL('image/png');
    link.click();
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    updateInfoUI();
});

// Add click handlers for rating labels (alternative way to set ratings)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('rating-label')) {
        const value = parseInt(e.target.dataset.value);
        const labelsContainer = e.target.parentElement;
        const slider = labelsContainer.previousElementSibling;
        const dimension = slider.dataset.dimension;
        
        // Update slider and rating
        slider.value = value;
        ratings[dimension] = value;
        ratingsSet[dimension] = true;
        
        // Update UI
        updateRatingLabels(slider, value);
        updateSelectedRatingIndicators();
        localStorage.setItem('techDimensionsRatings', JSON.stringify(ratings));
        localStorage.setItem('techDimensionsRatingsSet', JSON.stringify(ratingsSet));
        
        // Update chart
        radarChart.data.datasets[0].data = Object.values(ratings);
        radarChart.update();
        
        // Update overall rating
        updateOverallRating();
    }
});

 