// Admin Data Storage (localStorage for demo)
const STORAGE_KEYS = {
    PROFILE: 'elbarbero_profile',
    PROPERTIES: 'elbarbero_properties',
    MESSAGES: 'elbarbero_messages'
};

// Default Profile Data
const defaultProfile = {
    nome: 'Edison Luis Barbero',
    nomeEmpresa: 'E.L Barbero Gestão e Administração de Imóveis',
    creci: '161611',
    cnpj: '57.367.564/0001-84',
    telefone: '(11) 98805-1435',
    email: 'elbarberoimoveis@gmail.com',
    emailEmpresa: 'elbarberoimoveis@gmail.com',
    regiao: 'Zona Norte - São Paulo',
    instagram: '',
    facebook: '',
    sobre: 'Mais de 15 anos dedicando-se ao mercado imobiliário da Zona Norte de São Paulo. Especializado em gestão completa de imóveis, vendas e locações.'
};

// Default Properties
const defaultProperties = [
    {
        id: 1,
        title: 'Apartamento Moderno em Santana',
        type: 'apartamento',
        transaction: 'venda',
        price: 450000,
        location: 'Santana, São Paulo',
        status: 'ativo',
        bedrooms: 2,
        bathrooms: 1,
        suites: 0,
        garage: 1,
        area: 65,
        areaTotal: 0,
        year: 2018,
        condition: 'novo',
        description: 'Lindíssimo apartamento com acabamento premium, localizado no coração de Santana. Cozinha moderna, sala ampla e vista panorâmica da cidade.',
        features: ['elevador', 'portaria24h', 'varanda'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80']
    },
    {
        id: 2,
        title: 'Casa Geminada no Jaraguá',
        type: 'casa',
        transaction: 'venda',
        price: 680000,
        location: 'Jaraguá, São Paulo',
        status: 'ativo',
        bedrooms: 3,
        bathrooms: 2,
        suites: 1,
        garage: 2,
        area: 180,
        areaTotal: 250,
        year: 2015,
        condition: 'usado',
        description: 'Casa geminada em bairro tranquilo e residencial. Jardim privativo, acabamento moderno e excelente iluminação natural.',
        features: ['churrasqueira', 'areaVerde', 'garage'],
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']
    },
    {
        id: 3,
        title: 'Sala Comercial em Santana',
        type: 'comercial',
        transaction: 'aluguel',
        price: 2800,
        location: 'Santana, São Paulo',
        status: 'ativo',
        bedrooms: 0,
        bathrooms: 1,
        suites: 0,
        garage: 0,
        area: 45,
        areaTotal: 0,
        year: 2020,
        condition: 'novo',
        description: 'Sala comercial em ponto privilegiado no centro de Santana. Ideal para escritório ou loja. Alta circulação de pessoas.',
        features: ['elevador'],
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80']
    }
];

// Initialize data if not exists
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(defaultProperties));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
}

// Get data from localStorage
function getProfile() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
}

function getProperties() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPERTIES));
}

function getMessages() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES));
}

// Save data to localStorage
function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    showToast('Perfil atualizado com sucesso!', 'success');
}

function saveProperties(properties) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
}

function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const adminSections = document.querySelectorAll('.admin-section');
const profileForm = document.getElementById('profileForm');
const propertyModal = document.getElementById('propertyModal');
const propertyForm = document.getElementById('propertyForm');
const deleteModal = document.getElementById('deleteModal');
const toastContainer = document.getElementById('toastContainer');
const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const imagePreviewGrid = document.getElementById('imagePreviewGrid');

let currentImages = [];
let deletePropertyId = null;

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        adminSections.forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        if (section === 'dashboard') updateDashboard();
        if (section === 'perfil') loadProfile();
        if (section === 'imoveis') renderPropertiesTable();
        if (section === 'contato') renderMessages();
    });
});

// Dashboard
function updateDashboard() {
    const properties = getProperties();
    const total = properties.length;
    const venda = properties.filter(p => p.transaction === 'venda').length;
    const aluguel = properties.filter(p => p.transaction === 'aluguel').length;
    
    document.getElementById('totalImoveis').textContent = total;
    document.getElementById('imoveisVenda').textContent = venda;
    document.getElementById('imoveisAluguel').textContent = aluguel;
    document.getElementById('totalVisualizacoes').textContent = Math.floor(Math.random() * 500) + 100;
}

// Profile
function loadProfile() {
    const profile = getProfile();
    
    document.getElementById('nome').value = profile.nome;
    document.getElementById('nomeEmpresa').value = profile.nomeEmpresa;
    document.getElementById('creci').value = profile.creci;
    document.getElementById('cnpj').value = profile.cnpj;
    document.getElementById('telefone').value = profile.telefone;
    document.getElementById('email').value = profile.email;
    document.getElementById('emailEmpresa').value = profile.emailEmpresa;
    document.getElementById('regiao').value = profile.regiao;
    document.getElementById('instagram').value = profile.instagram;
    document.getElementById('facebook').value = profile.facebook;
    document.getElementById('sobre').value = profile.sobre;
}

profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const profile = {
        nome: document.getElementById('nome').value,
        nomeEmpresa: document.getElementById('nomeEmpresa').value,
        creci: document.getElementById('creci').value,
        cnpj: document.getElementById('cnpj').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        emailEmpresa: document.getElementById('emailEmpresa').value,
        regiao: document.getElementById('regiao').value,
        instagram: document.getElementById('instagram').value,
        facebook: document.getElementById('facebook').value,
        sobre: document.getElementById('sobre').value
    };
    
    saveProfile(profile);
});

// Properties Table
function renderPropertiesTable() {
    const properties = getProperties();
    const tbody = document.getElementById('propertiesTableBody');
    const searchTerm = document.getElementById('searchImoveis').value.toLowerCase();
    const filterTipo = document.getElementById('filterTipo').value;
    const filterTransacao = document.getElementById('filterTransacao').value;
    
    let filtered = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm) || 
                             p.location.toLowerCase().includes(searchTerm);
        const matchesTipo = !filterTipo || p.type === filterTipo;
        const matchesTransacao = !filterTransacao || p.transaction === filterTransacao;
        
        return matchesSearch && matchesTipo && matchesTransacao;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Nenhum imóvel encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(property => `
        <tr>
            <td>
                <img src="${property.images[0] || 'https://via.placeholder.com/60x45'}" 
                     alt="${property.title}" 
                     class="property-img-thumb"
                     onerror="this.src='https://via.placeholder.com/60x45'">
            </td>
            <td>
                <strong>${property.title}</strong><br>
                <small style="color: var(--text-muted)">${property.location}</small>
            </td>
            <td class="type-badge">${property.type}</td>
            <td>
                <span class="status-badge" style="background: ${property.transaction === 'venda' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(52, 152, 219, 0.1)'}; 
                      color: ${property.transaction === 'venda' ? '#2ecc71' : '#3498db'}">
                    ${property.transaction === 'venda' ? 'Venda' : 'Aluguel'}
                </span>
            </td>
            <td>${formatPrice(property.price, property.transaction)}</td>
            <td>
                <span class="status-badge ${property.status}">${property.status}</span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="editProperty(${property.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="toggleStatus(${property.id})" title="${property.status === 'ativo' ? 'Desativar' : 'Ativar'}">
                        <i class="fas fa-${property.status === 'ativo' ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDelete(${property.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatPrice(price, transaction) {
    if (transaction === 'aluguel') {
        return 'R$ ' + price.toLocaleString('pt-BR') + '/mês';
    }
    return 'R$ ' + price.toLocaleString('pt-BR');
}

// Filter events
document.getElementById('searchImoveis').addEventListener('input', renderPropertiesTable);
document.getElementById('filterTipo').addEventListener('change', renderPropertiesTable);
document.getElementById('filterTransacao').addEventListener('change', renderPropertiesTable);

// Property Modal
document.getElementById('addPropertyBtn').addEventListener('click', () => {
    openPropertyModal();
});

function openPropertyModal(property = null) {
    currentImages = property ? [...property.images] : [];
    
    document.getElementById('modalTitle').textContent = property ? 'Editar Imóvel' : 'Novo Imóvel';
    document.getElementById('propertyId').value = property ? property.id : '';
    
    document.getElementById('propertyTitle').value = property ? property.title : '';
    document.getElementById('propertyType').value = property ? property.type : '';
    document.getElementById('propertyTransaction').value = property ? property.transaction : '';
    document.getElementById('propertyPrice').value = property ? property.price : '';
    document.getElementById('propertyLocation').value = property ? property.location : '';
    document.getElementById('propertyStatus').value = property ? property.status : 'ativo';
    
    document.getElementById('propertyBedrooms').value = property ? property.bedrooms : 0;
    document.getElementById('propertyBathrooms').value = property ? property.bathrooms : 0;
    document.getElementById('propertySuites').value = property ? property.suites : 0;
    document.getElementById('propertyGarage').value = property ? property.garage : 0;
    document.getElementById('propertyArea').value = property ? property.area : '';
    document.getElementById('propertyAreaTotal').value = property ? property.areaTotal : '';
    document.getElementById('propertyYear').value = property ? property.year : '';
    document.getElementById('propertyCondition').value = property ? property.condition : 'novo';
    document.getElementById('propertyDescription').value = property ? property.description : '';
    
    // Features
    document.querySelectorAll('input[name="features"]').forEach(checkbox => {
        checkbox.checked = property && property.features && property.features.includes(checkbox.value);
    });
    
    renderImagePreviews();
    propertyModal.classList.add('active');
}

function editProperty(id) {
    const properties = getProperties();
    const property = properties.find(p => p.id === id);
    if (property) {
        openPropertyModal(property);
    }
}

document.getElementById('closePropertyModal').addEventListener('click', closePropertyModal);
document.getElementById('cancelProperty').addEventListener('click', closePropertyModal);
propertyModal.querySelector('.modal-overlay').addEventListener('click', closePropertyModal);

function closePropertyModal() {
    propertyModal.classList.remove('active');
    propertyForm.reset();
    currentImages = [];
    renderImagePreviews();
}

// Form Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// Image Upload
uploadZone.addEventListener('click', () => imageInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

imageInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (currentImages.length < 10) {
                    currentImages.push(e.target.result);
                    renderImagePreviews();
                } else {
                    showToast('Máximo de 10 imagens permitidas', 'warning');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

document.getElementById('addImageUrl').addEventListener('click', () => {
    const url = document.getElementById('imageUrl').value;
    if (url && currentImages.length < 10) {
        currentImages.push(url);
        document.getElementById('imageUrl').value = '';
        renderImagePreviews();
    }
});

function renderImagePreviews() {
    imagePreviewGrid.innerHTML = currentImages.map((img, index) => `
        <div class="image-preview-item">
            <img src="${img}" alt="Preview ${index + 1}" onerror="this.src='https://via.placeholder.com/120'">
            <button type="button" class="remove-image" onclick="removeImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeImage(index) {
    currentImages.splice(index, 1);
    renderImagePreviews();
}

// Save Property
propertyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const properties = getProperties();
    const propertyId = document.getElementById('propertyId').value;
    
    const features = [];
    document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
        features.push(checkbox.value);
    });
    
    const propertyData = {
        id: propertyId ? parseInt(propertyId) : Date.now(),
        title: document.getElementById('propertyTitle').value,
        type: document.getElementById('propertyType').value,
        transaction: document.getElementById('propertyTransaction').value,
        price: parseFloat(document.getElementById('propertyPrice').value.replace(/\./g, '').replace(',', '.')),
        location: document.getElementById('propertyLocation').value,
        status: document.getElementById('propertyStatus').value,
        bedrooms: parseInt(document.getElementById('propertyBedrooms').value),
        bathrooms: parseInt(document.getElementById('propertyBathrooms').value),
        suites: parseInt(document.getElementById('propertySuites').value),
        garage: parseInt(document.getElementById('propertyGarage').value),
        area: parseInt(document.getElementById('propertyArea').value),
        areaTotal: parseInt(document.getElementById('propertyAreaTotal').value) || 0,
        year: parseInt(document.getElementById('propertyYear').value) || 0,
        condition: document.getElementById('propertyCondition').value,
        description: document.getElementById('propertyDescription').value,
        features: features,
        images: currentImages.length > 0 ? currentImages : ['https://via.placeholder.com/800x600']
    };
    
    if (propertyId) {
        const index = properties.findIndex(p => p.id === parseInt(propertyId));
        if (index !== -1) {
            properties[index] = propertyData;
        }
        showToast('Imóvel atualizado com sucesso!', 'success');
    } else {
        properties.push(propertyData);
        showToast('Imóvel criado com sucesso!', 'success');
    }
    
    saveProperties(properties);
    closePropertyModal();
    renderPropertiesTable();
    updateDashboard();
});

// Toggle Status
function toggleStatus(id) {
    const properties = getProperties();
    const property = properties.find(p => p.id === id);
    if (property) {
        property.status = property.status === 'ativo' ? 'inativo' : 'ativo';
        saveProperties(properties);
        renderPropertiesTable();
        showToast(`Imóvel ${property.status === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    }
}

// Delete
function confirmDelete(id) {
    deletePropertyId = id;
    deleteModal.classList.add('active');
}

document.getElementById('cancelDelete').addEventListener('click', () => {
    deleteModal.classList.remove('active');
    deletePropertyId = null;
});

document.getElementById('confirmDelete').addEventListener('click', () => {
    if (deletePropertyId) {
        const properties = getProperties();
        const filtered = properties.filter(p => p.id !== deletePropertyId);
        saveProperties(filtered);
        renderPropertiesTable();
        updateDashboard();
        showToast('Imóvel excluído com sucesso!', 'success');
    }
    deleteModal.classList.remove('active');
    deletePropertyId = null;
});

deleteModal.querySelector('.modal-overlay').addEventListener('click', () => {
    deleteModal.classList.remove('active');
    deletePropertyId = null;
});

// Messages
function renderMessages() {
    const messages = getMessages();
    const container = document.getElementById('messageList');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope-open"></i>
                <p>Nenhuma mensagem recebida ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="message-item">
            <div class="message-header">
                <strong>${msg.nome}</strong>
                <span class="message-date">${msg.data}</span>
            </div>
            <div class="message-meta">
                <span>${msg.email}</span>
                <span>${msg.telefone}</span>
            </div>
            <p class="message-content">${msg.mensagem}</p>
        </div>
    `).join('');
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <p>${message}</p>
        <button class="close-toast"><i class="fas fa-times"></i></button>
    `;
    
    toast.querySelector('.close-toast').addEventListener('click', () => {
        toast.remove();
    });
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // In future, this will handle Google logout
    window.location.href = '../index.html';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    updateDashboard();
    loadProfile();
});