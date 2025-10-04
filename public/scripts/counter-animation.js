// Counter animation for stats
function animateCounter(element, target, duration = 2500) {
    let current = 0;
    const increment = target / (duration / 16);
    const isPercentage = element.textContent.includes('%');
    const hasPlus = element.textContent.includes('+');
    const hasSlash = element.textContent.includes('/');
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (target >= 1000) {
            displayValue = (current / 1000).toFixed(1) + 'K';
        }
        
        if (isPercentage) {
            element.textContent = Math.floor(current) + '%';
        } else if (hasSlash) {
            element.textContent = '24/7';
            clearInterval(timer);
        } else if (hasPlus) {
            element.textContent = displayValue + '+';
        } else {
            element.textContent = displayValue;
        }
    }, 16);
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const statNumber = entry.target.querySelector('.stat-number');
            const text = statNumber.textContent;
            
            if (text.includes('10K')) {
                animateCounter(statNumber, 10000);
            } else if (text.includes('5K')) {
                animateCounter(statNumber, 5000);
            } else if (text.includes('98')) {
                animateCounter(statNumber, 98);
            } else if (text.includes('24/7')) {
                // Keep 24/7 as is
                statNumber.textContent = '24/7';
            }
        }
    });
}, { threshold: 0.5 });

// Apply observers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Animate stats on scroll
    document.querySelectorAll('.stat-item').forEach(stat => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(40px)';
        stat.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(stat);
        statsObserver.observe(stat);
    });
});
