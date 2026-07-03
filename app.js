const CONFIG = {
    DATABASE_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwBogUFSRvMb7NQwnE-TLvrfjirNlItVzzvsyAp3u_oLz_qtFNFETGcIt-UIbVdUlX3/exec',
    CACHE_KEY: 'azz_hub_local_database_cache',
    CACHE_EXPIRY: 10 * 60 * 1000 // 10 minutes cache expiration check
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLeadForm();
    initLightbox();
    loadSiteDataPipeline(); // Runs the lightning-fast loader
    initManualTickerControls(); // Initializes manual marquee slider interaction
});

/* Mobile Menu System Controller */
function initNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

/* Data Pipeline Controller supporting Cache-First Architecture */
function loadSiteDataPipeline() {
    const cachedData = localStorage.getItem(CONFIG.CACHE_KEY);
    const cachedTime = localStorage.getItem(CONFIG.CACHE_KEY + '_time');
    const now = Date.now();

    if (cachedData && cachedTime && (now - cachedTime < CONFIG.CACHE_EXPIRY)) {
        const parsedData = JSON.parse(cachedData);
        renderAllComponents(parsedData);
        
        // Quietly fetch data in the background to check for adjustments
        fetchRealtimeDataSilently();
    } else {
        fetchRealtimeDataWithUIUpdate();
    }
}

/* Normal load when cache is empty */
async function fetchRealtimeDataWithUIUpdate() {
    try {
        const response = await fetch(CONFIG.DATABASE_ENDPOINT);
        if (!response.ok) throw new Error('Data transmission breakdown.');
        const data = await response.json();
        
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CONFIG.CACHE_KEY + '_time', Date.now().toString());
        
        renderAllComponents(data);
    } catch (error) {
        console.error('Data pipeline exception:', error);
        removeLoadingSkeletons();
    }
}

/* Background synchronization check */
async function fetchRealtimeDataSilently() {
    try {
        const response = await fetch(CONFIG.DATABASE_ENDPOINT);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CONFIG.CACHE_KEY + '_time', Date.now().toString());
            renderAllComponents(data); 
        }
    } catch (e) {
        console.log('Silent sync skipped. Using active cache layer safely.');
    }
}

/* Renders all layout components */
function renderAllComponents(data) {
    renderServices(data.services);
    renderAnnouncements(data.announcements);
    renderSchools(data.schools);
    renderDeadlines(data.deadlines);
    renderGallery(data.gallery);
}

/* Service Presentation Framework Card Component Rendering */
function renderServices(services) {
    const container = document.getElementById('services-container');
    if (!container || !services || services.length === 0) return;
    container.innerHTML = '';
    
    services.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        let imageHTML = item.imageurl ? `<img src="${item.imageurl}" class="service-card-img" alt="${item.title}">` : '';
        let iconHTML = (!item.imageurl && item.icon) ? `<div class="service-icon"><i class="${item.icon}"></i></div>` : '';
        
        card.innerHTML = `
            ${imageHTML}
            ${iconHTML}
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        container.appendChild(card);
    });
}

/* Live News/Announcements Element Card Array Generation */
function renderAnnouncements(items) {
    const container = document.getElementById('announcements-list');
    if (!container || !items || items.length === 0) return;
    
    container.innerHTML = items.map((item, index) => {
        let imgHTML = item.imageurl ? `<img src="${item.imageurl}" class="dynamic-item-img" alt="">` : '';
        return `
            <div class="dynamic-item" style="animation-delay: ${index * 0.15}s">
                ${imgHTML}
                <div class="dynamic-item-content">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                </div>
            </div>
        `;
    }).join('');
}

/* Academic Admissions System Processing Rows Loop Rendering */
function renderSchools(schools) {
    const container = document.getElementById('schools-list');
    if (!container || !schools || schools.length === 0) return;
    
    container.innerHTML = schools.map((sch, index) => {
        let imgHTML = sch.imageurl ? `<img src="${sch.imageurl}" class="dynamic-item-img" alt="">` : '';
        return `
            <div class="dynamic-item" style="animation-delay: ${index * 0.12}s">
                ${imgHTML}
                <div class="dynamic-item-content">
                    <h4>${sch.name}</h4>
                    <p>Status: <strong>${sch.status}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}

/* Infinite Marquee Loop Parser */
function renderDeadlines(deadlines) {
    const ticker = document.getElementById('deadlines-ticker');
    if (!ticker || !deadlines || deadlines.length === 0) return;
    
    const tickerItemsHTML = deadlines.map(d => {
        let imgHTML = d.imageurl ? `<img src="${d.imageurl}" class="ticker-thumb" alt="">` : '<i class="fas fa-university" style="color:#0066FF;"></i>';
        return `
            <div class="marquee-item">
                ${imgHTML}
                <span><strong>${d.institution}</strong></span>
                <span class="ticker-date">${d.date}</span>
            </div>
        `;
    }).join('');

    // Multiplying structural items sets an infinite horizon loop without showing empty page gaps
    ticker.innerHTML = tickerItemsHTML + tickerItemsHTML + tickerItemsHTML + tickerItemsHTML;
}

/* Core Media Image Gallery Layout Elements Generation */
function renderGallery(images) {
    const container = document.getElementById('gallery-container');
    if (!container || !images || images.length === 0) return;
    container.innerHTML = '';
    
    images.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Azz Hub Visual Asset" loading="lazy">`;
        container.appendChild(item);
    });
}

function removeLoadingSkeletons() {
    ['services-container', 'schools-list', 'announcements-list', 'gallery-container'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<p class="error-text">Failed to sync live data rows.</p>`;
    });
}

/* Lightbox System Controller */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && !e.target.classList.contains('site-logo') && !e.target.classList.contains('ticker-thumb')) {
            lightbox.style.display = 'flex';
            lightbox.setAttribute('aria-hidden', 'false');
            lbImg.src = e.target.src;
        }
    });
    
    const closeAction = () => { lightbox.style.display = 'none'; };
    closeBtn?.addEventListener('click', closeAction);
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeAction(); });
}

/* Lead Submission Form Handler */
function initLeadForm() {
    const form = document.getElementById('lead-form');
    const feedback = document.getElementById('form-feedback');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        feedback.className = 'form-feedback';
        feedback.textContent = 'Transmitting securely...';
        
        const payload = {
            action: 'submitLead',
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            service: document.getElementById('service-type').value,
            message: document.getElementById('customer-message').value
        };
        
        try {
            await fetch(CONFIG.DATABASE_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            feedback.className = 'form-feedback success';
            feedback.textContent = 'Inquiry logged successfully!';
            form.reset();
        } catch (error) {
            feedback.className = 'form-feedback error';
            feedback.textContent = 'Submission error. Please contact us via WhatsApp.';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

/* Interactive Manual Mouse Drag and Touch Swipe Marquee Controls Engine */
function initManualTickerControls() {
    const container = document.querySelector('.marquee-container');
    const content = document.querySelector('.marquee-content');
    if (!container || !content) return;

    let isDown = false;
    let startX;
    let currentTranslation = 0;

    function getMatrixXTransform() {
        const style = window.getComputedStyle(content);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41;
    }

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('is-dragging');
        startX = e.pageX - container.offsetLeft;
        currentTranslation = getMatrixXTransform();
        
        content.style.transform = `translateX(${currentTranslation}px)`;
        content.style.animation = 'none';
    });

    const stopDragging = () => {
        if (!isDown) return;
        isDown = false;
        container.classList.remove('is-dragging');
        content.style.transform = '';
        content.style.animation = '';
    };

    container.addEventListener('mouseleave', stopDragging);
    container.addEventListener('mouseup', stopDragging);

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; 
        content.style.transform = `translateX(${currentTranslation + walk}px)`;
    });

    /* Touch support mechanics for smartphones */
    container.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - container.offsetLeft;
        currentTranslation = getMatrixXTransform();
        content.style.transform = `translateX(${currentTranslation}px)`;
        content.style.animation = 'none';
    });

    container.addEventListener('touchend', stopDragging);

    container.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        content.style.transform = `translateX(${currentTranslation + walk}px)`;
    });
}
