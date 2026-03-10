// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Reveal animations on scroll
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -100px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Add staggered delays for grids
document.querySelectorAll('.skills-grid, .services-grid, .project-grid, .video-grid').forEach(grid => {
    const children = Array.from(grid.children);
    children.forEach((child, index) => {
        child.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Mobile menu functionality
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
    
    // Toggle between bars and times icon
    const icon = hamburger.querySelector('i');
    if (hamburger.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when a link is clicked
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');
        
        // Reset icon to bars
        const icon = hamburger.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Update active state
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Scroll to element
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Offset for navbar
                behavior: 'smooth'
            });
        }
    });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section, header');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerHTML;
        
        // Simulate sending
        btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        
        setTimeout(() => {
            btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
            btn.style.background = '#28a745';
            btn.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.4)';
            contactForm.reset();
            
            // Revert back
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.boxShadow = '';
            }, 3000);
        }, 1500);
    });
}

// ==========================================
// DYNAMIC VIDEO PORTFOLIO LOADING
// ==========================================

// Initialize global variable
let videoData = [];

// Load data from localStorage
function loadVideoData() {
    videoData = [];
    const savedData = localStorage.getItem('portfolioVideoData');
    if (savedData) {
        try {
            const adminVideos = JSON.parse(savedData);
            if (Array.isArray(adminVideos)) {
                videoData = adminVideos;
            }
        } catch (error) {
            console.error("Error parsing admin videos from localStorage:", error);
        }
    }
}

function renderVideoPortfolio() {
    // Load data right before rendering to ensure we have the latest
    loadVideoData();

    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = '';
    
    videoData.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card glass-card hover-glow reveal';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        const hasThumb = video.thumbnailUrl && video.thumbnailUrl.trim() !== '';
        const thumbContent = hasThumb 
            ? `<img src="${video.thumbnailUrl}" alt="${video.title}">`
            : '';
        const thumbClass = hasThumb ? 'video-thumbnail' : 'video-thumbnail placeholder-thumb';

        card.innerHTML = `
            <div class="${thumbClass}">
                ${thumbContent}
                <div class="play-btn"><i class="fas fa-play"></i></div>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <div class="video-platform">${video.platform}</div>
                <a href="${video.videoUrl}" class="watch-btn" target="_blank">
                    <i class="fas fa-external-link-alt"></i> Watch Full Video
                </a>
            </div>
        `;
        portfolioGrid.appendChild(card);
        
        // Re-attach intersection observer for dynamic items
        if (typeof revealObserver !== 'undefined') {
            revealObserver.observe(card);
        }
    });
}

// Initialize portfolio on load
document.addEventListener('DOMContentLoaded', () => {
    renderVideoPortfolio();

    // --- CONTACT FORM INTERCEPTION LOGIC ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const messageText = document.getElementById('message').value.trim();
            const submitBtn = document.getElementById('contact-submit-btn');
            const alertBox = document.getElementById('contact-alert');

            if (!name || !email || !messageText) return;

            // Create robust message object
            const newMessage = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                name: name,
                email: email,
                message: messageText
            };

            // Grab existing messages and append
            let existingData = localStorage.getItem('portfolioMessages');
            let messages = existingData ? JSON.parse(existingData) : [];
            messages.push(newMessage);
            localStorage.setItem('portfolioMessages', JSON.stringify(messages));

            // Provide user feedback
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Sent Successfully!</span> <i class="fas fa-check"></i>`;
            submitBtn.style.background = '#4CAF50';
            submitBtn.style.borderColor = '#4CAF50';
            
            contactForm.reset();

            setTimeout(() => {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
            }, 3000);
        });
    }
});

// Particles.js Initialization
if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: ["#00d2ff", "#a800ff"] },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: false },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "bubble" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8 },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}

// Parallax effect on mouse move
document.addEventListener('mousemove', (e) => {
    const layers = document.querySelectorAll('.parallax-layer');
    layers.forEach(layer => {
        const speed = layer.getAttribute('data-speed') || 0.05;
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        layer.style.transform = `translate(${x}px, ${y}px)`;
    });
});

