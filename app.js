// Global Configuration Context — Update with your current deployment endpoint id string
const CONFIG = {
    DATABASE_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwBogUFSRvMb7NQwnE-TLvrfjirNlItVzzvsyAp3u_oLz_qtFNFETGcIt-UIbVdUlX3/exec'
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    fetchRealtimeData();
    initLeadForm();
    initLightbox();
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

/* API Asynchronous Pipeline Engine Fetch Initialization */
async function fetchRealtimeData() {
    try {
        const response = await fetch(`${CONFIG.DATABASE_ENDPOINT}?action=getSiteData`);
        if (!response.ok) throw new Error('Data endpoint validation breakdown.');
        const data = await response.json();
        
        renderServices(data.services);
        renderAnnouncements(data.announcements);
        renderSchools(data.schools);
        renderDeadlines(data.deadlines);
        renderGallery(data.gallery);
    } catch (error) {
        console.error('Data pipeline exception context trace:', error);
    }
}

/* Service Presentation Framework Card Component Rendering */
function renderServices(services) {
    const container = document.getElementById('services-container');
    if (!container || !services || services.length === 0) return;
    container.innerHTML = '';
    
    services.forEach(item => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        // Structural validation checking for custom direct imagery links versus standard font icons
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
    
    container.innerHTML = items.map(item => {
        let imgHTML = item.imageurl ? `<img src="${item.imageurl}" class="dynamic-item-img" alt="">` : '';
        return `
            <div class="dynamic-item">
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
    
    container.innerHTML = schools.map(sch => {
        let imgHTML = sch.imageurl ? `<img src="${sch.imageurl}" class="dynamic-item-img" alt="">` : '';
        return `
            <div class="dynamic-item">
                ${imgHTML}
                <div class="dynamic-item-content">
                    <h4>${sch.name}</h4>
                    <p>Status: <strong>${sch.status}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}

/* Continuous Closing Deadlines Marquee Inline Loop Layout Parser */
function renderDeadlines(deadlines) {
    const ticker = document.getElementById('deadlines-ticker');
    if (!ticker || !deadlines || deadlines.length === 0) return;
    
    ticker.innerHTML = deadlines.map(d => {
        let imgHTML = d.imageurl ? `<img src="${d.imageurl}" class="ticker-thumb" alt=""> ` : '';
        return `<span>${imgHTML}<strong>${d.institution}</strong>: ${d.date}</span>`;
    }).join(' &nbsp;&nbsp;|&nbsp;&nbsp; ');
}

/* Core Media Image Gallery Layout Elements Generation */
function renderGallery(images) {
    const container = document.getElementById('gallery-container');
    if (!container || !images || images.length === 0) return;
    container.innerHTML = '';
    
    images.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Azz Hub Visual Asset">`;
        container.appendChild(item);
    });
}

/* Lightbox Dynamic Image Inspector System Module Setup */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    
    document.body.addEventListener('click', (e) => {
        // Universal click listener capturing any dynamic data image click across the layout sections
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

/* Dynamic Inquiries Request Form Submissions Pipeline */
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
                mode: 'no-cors', // Avoids cross-origin domain block checks seamlessly
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
