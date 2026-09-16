// Storage Keys
const STORAGE_KEYS = {
    PROFILE: 'elbarbero_profile',
    PROPERTIES: 'elbarbero_properties',
    MESSAGES: 'elbarbero_messages'
};

// Default Properties (fallback)
const defaultProperties = [
    {
        id: 1,
        title: 'Apartamento Moderno em Santana',
        type: 'apartamento',
        transaction: 'venda',
        price: 450000,
        location: 'Santana, São Paulo',
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        description: 'Lindíssimo apartamento com acabamento premium, ubicado en el corazón de Santana. Cocina moderna, sala amplia y vista panorámica de la ciudad.'
    },
    {
        id: 2,
        title: 'Casa Geminada no Jaraguá',
        type: 'casa',
        transaction: 'venda',
        price: 680000,
        location: 'Jaraguá, São Paulo',
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        description: 'Casa geminada en barrio tranquilo y residencial. Jardín privado, acabados modernos y excelente iluminación natural.'
    },
    {
        id: 3,
        title: 'Sala Comercial em Santana',
        type: 'comercial',
        transaction: 'aluguel',
        price: 2800,
        location: 'Santana, São Paulo',
        bedrooms: 0,
        bathrooms: 1,
        area: 45,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        description: 'Sala comercial en punto privilegiado en el centro de Santana. Ideal para oficina o tienda. Alta circulación de personas.'
    }
];

// Default Profile
const defaultProfile = {
    nome: 'Edison Luis Barbero',
    nomeEmpresa: 'E.L Barbero Gestão e Administração de Imóveis',
    creci: '161611',
    telefone: '(11) 98805-1435',
    email: 'elbarberoimoveis@gmail.com',
    regiao: 'Zona Norte - São Paulo'
};

// Initialize data
function initializeSiteData() {
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(defaultProperties));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    }
}

// Get properties from localStorage
function getProperties() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
        if (stored) {
            const props = JSON.parse(stored);
            return props.filter(p => p.status === 'ativo');
        }
    } catch (e) {
        console.error('Error loading properties:', e);
    }
    return defaultProperties;
}

// Get profile from localStorage
function getProfile() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading profile:', e);
    }
    return defaultProfile;
}

// Global properties variable
let properties = getProperties();

// DOM Elements
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const propertiesGrid = document.getElementById('propertiesGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('propertyModal');
const contactForm = document.getElementById('contactForm');

// Custom Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor && cursorFollower) {
        cursor.style.left = e.clientX - 6 + 'px';
        cursor.style.top = e.clientY - 6 + 'px';
        cursorFollower.style.left = e.clientX - 20 + 'px';
        cursorFollower.style.top = e.clientY - 20 + 'px';
    }
});

document.querySelectorAll('a, button, .property-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.add('hover');
        if (cursorFollower) cursorFollower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.remove('hover');
        if (cursorFollower) cursorFollower.classList.remove('hover');
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile Menu
if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Format Price
function formatPrice(price, transaction) {
    if (transaction === 'aluguel') {
        return 'R$ ' + price.toLocaleString('pt-BR') + '/mês';
    }
    return 'R$ ' + price.toLocaleString('pt-BR');
}

// Render Properties
function renderProperties(filter = 'todos') {
    properties = getProperties();
    
    if (!propertiesGrid) return;
    
    propertiesGrid.innerHTML = '';
    
    const filtered = filter === 'todos' 
        ? properties 
        : properties.filter(p => p.type === filter || p.transaction === filter);
    
    if (filtered.length === 0) {
        propertiesGrid.innerHTML = `
            <div class="no-properties">
                <i class="fas fa-home"></i>
                <p>Nenhum imóvel encontrado</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach((property, index) => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        const imageUrl = property.images && property.images[0] 
            ? property.images[0] 
            : property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
        
        card.innerHTML = `
            <div class="property-image">
                <img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'">
                <span class="property-badge ${property.transaction}">${property.transaction === 'venda' ? 'Venda' : 'Aluguel'}</span>
                <button class="property-favorite"><i class="far fa-heart"></i></button>
            </div>
            <div class="property-content">
                <div class="property-price">${formatPrice(property.price, property.transaction)}</div>
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.location}</span>
                </div>
                <div class="property-features">
                    ${property.bedrooms > 0 ? `
                    <div class="property-feature">
                        <i class="fas fa-bed"></i>
                        <span>${property.bedrooms} ${property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
                    </div>
                    ` : ''}
                    ${property.bathrooms > 0 ? `
                    <div class="property-feature">
                        <i class="fas fa-bath"></i>
                        <span>${property.bathrooms} ${property.bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
                    </div>
                    ` : ''}
                    <div class="property-feature">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${property.area}m²</span>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(property));
        propertiesGrid.appendChild(card);
    });
    
    // Animate cards
    setTimeout(() => {
        document.querySelectorAll('.property-card').forEach((card, i) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }, 100);
}

// Filter Properties
if (filterBtns) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProperties(btn.dataset.filter);
        });
    });
}

// Modal Functions
function openModal(property) {
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    const imageUrl = property.images && property.images[0] 
        ? property.images[0] 
        : property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
    
    modalBody.innerHTML = `
        <img src="${imageUrl}" alt="${property.title}" class="modal-image" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'">
        <div class="modal-details">
            <div class="modal-header">
                <div>
                    <div class="modal-price">${formatPrice(property.price, property.transaction)}</div>
                    <span class="modal-badge property-badge ${property.transaction}">${property.transaction === 'venda' ? 'Venda' : 'Aluguel'}</span>
                </div>
            </div>
            <h3 class="modal-title">${property.title}</h3>
            <div class="modal-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${property.location}</span>
            </div>
            <p class="modal-description">${property.description || 'Descrição não disponível.'}</p>
            <div class="modal-features">
                ${property.bedrooms > 0 ? `
                <div class="modal-feature">
                    <i class="fas fa-bed"></i>
                    <span>${property.bedrooms} Quartos</span>
                </div>
                ` : ''}
                ${property.bathrooms > 0 ? `
                <div class="modal-feature">
                    <i class="fas fa-bath"></i>
                    <span>${property.bathrooms} Banheiros</span>
                </div>
                ` : ''}
                <div class="modal-feature">
                    <i class="fas fa-ruler-combined"></i>
                    <span>${property.area}m²</span>
                </div>
            </div>
            <div class="modal-actions">
                <a href="https://wa.me/5511988051435?text=Olá, tenho interesse no imóvel: ${encodeURIComponent(property.title)}" target="_blank" class="btn-primary">
                    <i class="fab fa-whatsapp"></i>
                    <span>Falar no WhatsApp</span>
                </a>
                <button class="btn-secondary modal-close-btn">Fechar</button>
            </div>
        </div>
    `;
    
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

if (modal) {
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

// Form Submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const tipo = document.getElementById('tipo').value;
        const mensagem = document.getElementById('mensagem').value;
        
        const text = `Olá, me chamo ${nome}. Tenho interesse em: ${tipo}. ${mensagem}`;
        const waUrl = `https://wa.me/5511988051435?text=${encodeURIComponent(text)}`;
        
        window.open(waUrl, '_blank');
    });
}

// GSAP Animations
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animations
    const heroTl = gsap.timeline();

    if (document.querySelector('.hero-tag')) {
        heroTl
            .to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to('.title-line', { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.4')
            .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
            .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.scroll-indicator', { opacity: 1, duration: 1, delay: 0.5 });
    }

    // Number Counter Animation
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.dataset.count);
        gsap.to(stat, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            scrollTrigger: { trigger: stat, start: 'top 80%' }
        });
    });

    // About Section Animations
    gsap.to('.about-content .section-tag', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.about', start: 'top 70%' }
    });

    gsap.to('.about-content .section-title', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.about', start: 'top 70%' }
    });

    gsap.to('.about-intro, .about-text', {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
        scrollTrigger: { trigger: '.about', start: 'top 60%' }
    });

    gsap.to('.about-features', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.about-features', start: 'top 80%' }
    });

    gsap.to('.about-contact', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.about-contact', start: 'top 80%' }
    });

    // Properties Section Animations
    gsap.to('.properties-header .section-tag', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.properties', start: 'top 70%' }
    });

    gsap.to('.properties-header .section-title, .section-subtitle', {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
        scrollTrigger: { trigger: '.properties', start: 'top 60%' }
    });

    gsap.to('.filter-btn', {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: '.filter-bar', start: 'top 80%' }
    });

    gsap.to('.properties-cta', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.properties-cta', start: 'top 90%' }
    });

    // Contact Section Animations
    gsap.to('.contact-info .section-tag, .contact-info .section-title', {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
        scrollTrigger: { trigger: '.contact', start: 'top 70%' }
    });

    gsap.to('.contact-text', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.contact', start: 'top 60%' }
    });

    gsap.to('.contact-method', {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.15,
        scrollTrigger: { trigger: '.contact-methods', start: 'top 80%' }
    });

    gsap.to('.contact-social', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.contact-social', start: 'top 90%' }
    });

    gsap.to('.contact-form-wrapper', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.contact-form-wrapper', start: 'top 70%' }
    });
}

// Image hover effect for about section
const aboutImage = document.querySelector('.about-image');
if (aboutImage) {
    aboutImage.addEventListener('mousemove', (e) => {
        const rect = aboutImage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(aboutImage, { rotationY: x * 10, rotationX: -y * 10, duration: 0.5, ease: 'power2.out' });
        }
    });
    
    aboutImage.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(aboutImage, { rotationY: 0, rotationX: 0, duration: 0.5, ease: 'power2.out' });
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target && typeof gsap !== 'undefined') {
            gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 80 }, ease: 'power3.inOut' });
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeSiteData();
    renderProperties();
});

// Favorite button toggle
document.addEventListener('click', (e) => {
    if (e.target.closest('.property-favorite')) {
        const btn = e.target.closest('.property-favorite');
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#c9a96e';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
        }
    }
});

// Add CSS for no-properties state
const style = document.createElement('style');
style.textContent = `
    .no-properties {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: var(--text-muted);
    }
    .no-properties i {
        font-size: 3rem;
        margin-bottom: 15px;
        opacity: 0.3;
    }
`;
document.head.appendChild(style);