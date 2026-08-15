const CONFIG = {
    DATABASE_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwBogUFSRvMb7NQwnE-TLvrfjirNlItVzzvsyAp3u_oLz_qtFNFETGcIt-UIbVdUlX3/exec',
    CACHE_KEY: 'azz_hub_local_database_cache',
    CACHE_EXPIRY: 10 * 60 * 1000 // 10 minutes cache lifespan
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLeadForm();
    initLightbox();
    loadSiteDataPipeline(); 
    initManualTickerControls();
});

/* Mobile Menu Toggle Handler */
function initNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

/* Stale-While-Revalidate Engine */
function loadSiteDataPipeline() {
    const cachedData = localStorage.getItem(CONFIG.CACHE_KEY);
    const cachedTime = localStorage.getItem(CONFIG.CACHE_KEY + '_time');
    const now = Date.now();

    if (cachedData && cachedTime && (now - cachedTime < CONFIG.CACHE_EXPIRY)) {
        // Render instantly from local persistent storage (0ms wait time)
        renderAllComponents(JSON.parse(cachedData));
        fetchRealtimeDataSilently();
    } else {
        fetchRealtimeDataWithUIUpdate();
    }
}

async function fetchRealtimeDataWithUIUpdate() {
    try {
        const response = await fetch(CONFIG.DATABASE_ENDPOINT);
        if (!response.ok) throw new Error('Data pipeline network response error.');
        const data = await response.json();
        
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CONFIG.CACHE_KEY + '_time', Date.now().toString());
        
        renderAllComponents(data);
    } catch (error) {
        console.error('Data pipeline error:', error);
        removeLoadingSkeletons();
    }
}

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
        // Fail silently; cache continues handling display smoothly
    }
}

function renderAllComponents(data) {
    if (!data) return;
    renderServices(data.services);
    renderAnnouncements(data.announcements);
    renderSchools(data.schools);
    renderDeadlines(data.deadlines);
    renderGallery(data.gallery);
}

/* Render Services with Lazy Loading Images */
function renderServices(services) {
    const container = document.getElementById('services-container');
    if (!container || !services || services.length === 0) return;
    container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    services.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        let imageHTML = item.imageurl ? `<img src="${item.imageurl}" class="service-card-img" alt="${item.title}" loading="lazy">` : '';
        let iconHTML = (!item.imageurl && item.icon) ? `<div class="service-icon"><i class="${item.icon}"></i></div>` : '';
        
        card.innerHTML = `
            ${imageHTML}
            ${iconHTML}
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function renderAnnouncements(items) {
    const container = document.getElementById('announcements-list');
    if (!container || !items || items.length === 0) return;
    
    container.innerHTML = items.map((item, index) => {
        let imgHTML = item.imageurl ? `<img src="${item.imageurl}" class="dynamic-item-img" alt="" loading="lazy">` : '';
        return `
            <div class="dynamic-item" style="animation-delay: ${index * 0.1}s">
                ${imgHTML}
                <div class="dynamic-item-content">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderSchools(schools) {
    const container = document.getElementById('schools-list');
    if (!container || !schools || schools.length === 0) return;
    
    container.innerHTML = schools.map((sch, index) => {
        let imgHTML = sch.imageurl ? `<img src="${sch.imageurl}" class="dynamic-item-img" alt="" loading="lazy">` : '';
        return `
            <div class="dynamic-item" style="animation-delay: ${index * 0.1}s">
                ${imgHTML}
                <div class="dynamic-item-content">
                    <h4>${sch.name}</h4>
                    <p>Status: <strong>${sch.status}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}

function renderDeadlines(deadlines) {
    const ticker = document.getElementById('deadlines-ticker');
    if (!ticker || !deadlines || deadlines.length === 0) return;
    
    const tickerItemsHTML = deadlines.map(d => {
        let imgHTML = d.imageurl ? `<img src="${d.imageurl}" class="ticker-thumb" alt="" loading="lazy">` : '<i class="fas fa-university" style="color:#0066FF;"></i>';
        return `
            <div class="marquee-item">
                ${imgHTML}
                <span><strong>${d.institution}</strong></span>
                <span class="ticker-date">${d.date}</span>
            </div>
        `;
    }).join('');

    ticker.innerHTML = tickerItemsHTML + tickerItemsHTML + tickerItemsHTML;
}

function renderGallery(images) {
    const container = document.getElementById('gallery-container');
    if (!container || !images || images.length === 0) return;
    container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    images.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Azz Hub Media Asset" loading="lazy">`;
        fragment.appendChild(item);
    });
    container.appendChild(fragment);
}

function removeLoadingSkeletons() {
    ['services-container', 'schools-list', 'announcements-list', 'gallery-container'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<p style="color:#64748B;">Live synchronization unavailable at the moment.</p>`;
    });
}

/* Lightbox Framework */
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

/* Lead Submission Form */
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

/* Touch & Drag Marquee Slider Controls */
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
