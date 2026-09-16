// Supabase Auth Configuration
const SUPABASE_URL = 'https://ijwuaztnzrptdoonoglq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_cagM3vIdKiqcNWo36AHSXg_54A9fTLX'

class SupabaseClient {
    constructor() {
        this.url = SUPABASE_URL
        this.key = SUPABASE_KEY
    }

    async request(endpoint, options = {}) {
        const response = await fetch(`${this.url}/rest/v1/${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.key,
                'Authorization': `Bearer ${localStorage.getItem('supabase_token') || this.key}`,
                'Prefer': options.prefer || 'return=representation',
                ...options.headers
            }
        })
        
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Request failed')
        }
        
        return response.json()
    }

    // Properties
    async getProperties() {
        return this.request('properties?status=eq.ativo&order=created_at.desc')
    }

    async getAllProperties() {
        return this.request('properties?order=created_at.desc')
    }

    async createProperty(property) {
        return this.request('properties', {
            method: 'POST',
            body: JSON.stringify(property)
        })
    }

    async updateProperty(id, property) {
        return this.request(`properties?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(property)
        })
    }

    async deleteProperty(id) {
        return this.request(`properties?id=eq.${id}`, {
            method: 'DELETE'
        })
    }

    // Profile
    async getProfile() {
        const profiles = await this.request('profile?limit=1')
        return profiles[0] || null
    }

    async updateProfile(profile) {
        const existing = await this.getProfile()
        if (existing) {
            return this.request(`profile?id=eq.${existing.id}`, {
                method: 'PATCH',
                body: JSON.stringify(profile)
            })
        } else {
            return this.request('profile', {
                method: 'POST',
                body: JSON.stringify(profile)
            })
        }
    }

    // Messages
    async getMessages() {
        return this.request('messages?order=created_at.desc')
    }

    async createMessage(message) {
        return this.request('messages', {
            method: 'POST',
            body: JSON.stringify(message)
        })
    }
}

const supabase = new SupabaseClient()

// Auth functions
async function signInWithEmail(email, password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (data.access_token) {
        localStorage.setItem('supabase_token', data.access_token)
        localStorage.setItem('supabase_user', JSON.stringify(data.user))
    }
    
    return { data, error: response.ok ? null : data }
}

async function signInWithGoogle() {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/adm.html')}`, {
        method: 'GET',
        headers: {
            'apikey': SUPABASE_KEY
        }
    })
    
    const data = await response.json()
    return { data, error: response.ok ? null : data }
}

async function signUp(email, password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({ email, password })
    })
    
    return response.json()
}

async function signOut() {
    localStorage.removeItem('supabase_token')
    localStorage.removeItem('supabase_user')
    window.location.href = 'login.html'
}

async function getCurrentUser() {
    const token = localStorage.getItem('supabase_token')
    if (!token) return null
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`
        }
    })
    
    return response.ok ? response.json() : null
}

// Check auth on page load
async function checkAuth() {
    const token = localStorage.getItem('supabase_token')
    if (!token) {
        window.location.href = 'login.html'
        return false
    }
    return true
}

// DOM Elements
const navItems = document.querySelectorAll('.nav-item')
const adminSections = document.querySelectorAll('.admin-section')
const profileForm = document.getElementById('profileForm')
const propertyModal = document.getElementById('propertyModal')
const propertyForm = document.getElementById('propertyForm')
const deleteModal = document.getElementById('deleteModal')
const toastContainer = document.getElementById('toastContainer')
const uploadZone = document.getElementById('uploadZone')
const imageInput = document.getElementById('imageInput')
const imagePreviewGrid = document.getElementById('imagePreviewGrid')

let currentImages = []
let deletePropertyId = null

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault()
        const section = item.dataset.section
        
        navItems.forEach(n => n.classList.remove('active'))
        item.classList.add('active')
        
        adminSections.forEach(s => s.classList.remove('active'))
        document.getElementById(section).classList.add('active')
        
        if (section === 'dashboard') updateDashboard()
        if (section === 'perfil') loadProfile()
        if (section === 'imoveis') renderPropertiesTable()
        if (section === 'contato') renderMessages()
    })
})

// Dashboard
async function updateDashboard() {
    try {
        const properties = await supabase.getAllProperties()
        const total = properties.length
        const venda = properties.filter(p => p.transaction === 'venda').length
        const aluguel = properties.filter(p => p.transaction === 'aluguel').length
        
        document.getElementById('totalImoveis').textContent = total
        document.getElementById('imoveisVenda').textContent = venda
        document.getElementById('imoveisAluguel').textContent = aluguel
        document.getElementById('totalVisualizacoes').textContent = Math.floor(Math.random() * 500) + 100
    } catch (error) {
        console.error('Error loading dashboard:', error)
    }
}

// Profile
async function loadProfile() {
    try {
        const profile = await supabase.getProfile()
        if (profile) {
            document.getElementById('nome').value = profile.nome || ''
            document.getElementById('nomeEmpresa').value = profile.nome_empresa || ''
            document.getElementById('creci').value = profile.creci || ''
            document.getElementById('cnpj').value = profile.cnpj || ''
            document.getElementById('telefone').value = profile.telefone || ''
            document.getElementById('email').value = profile.email || ''
            document.getElementById('emailEmpresa').value = profile.email_empresa || ''
            document.getElementById('regiao').value = profile.regiao || ''
            document.getElementById('instagram').value = profile.instagram || ''
            document.getElementById('facebook').value = profile.facebook || ''
            document.getElementById('sobre').value = profile.sobre || ''
        }
    } catch (error) {
        console.error('Error loading profile:', error)
    }
}

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const profile = {
        nome: document.getElementById('nome').value,
        nome_empresa: document.getElementById('nomeEmpresa').value,
        creci: document.getElementById('creci').value,
        cnpj: document.getElementById('cnpj').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        email_empresa: document.getElementById('emailEmpresa').value,
        regiao: document.getElementById('regiao').value,
        instagram: document.getElementById('instagram').value,
        facebook: document.getElementById('facebook').value,
        sobre: document.getElementById('sobre').value
    }
    
    try {
        await supabase.updateProfile(profile)
        showToast('Perfil atualizado com sucesso!', 'success')
    } catch (error) {
        showToast('Erro ao salvar perfil: ' + error.message, 'error')
    }
})

// Properties Table
async function renderPropertiesTable() {
    try {
        const properties = await supabase.getAllProperties()
        const tbody = document.getElementById('propertiesTableBody')
        const searchTerm = document.getElementById('searchImoveis').value.toLowerCase()
        const filterTipo = document.getElementById('filterTipo').value
        const filterTransacao = document.getElementById('filterTransacao').value
        
        let filtered = properties.filter(p => {
            const matchesSearch = (p.title || '').toLowerCase().includes(searchTerm) || 
                                 (p.location || '').toLowerCase().includes(searchTerm)
            const matchesTipo = !filterTipo || p.type === filterTipo
            const matchesTransacao = !filterTransacao || p.transaction === filterTransacao
            
            return matchesSearch && matchesTipo && matchesTransacao
        })
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhum imóvel encontrado
                    </td>
                </tr>
            `
            return
        }
        
        tbody.innerHTML = filtered.map(property => `
            <tr>
                <td>
                    <img src="${(property.images && property.images[0]) || 'https://via.placeholder.com/60x45'}" 
                         alt="${property.title}" 
                         class="property-img-thumb"
                         onerror="this.src='https://via.placeholder.com/60x45'">
                </td>
                <td>
                    <strong>${property.title}</strong><br>
                    <small style="color: var(--text-muted)">${property.location || ''}</small>
                </td>
                <td class="type-badge">${property.type || ''}</td>
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
                        <button class="action-btn" onclick="editProperty('${property.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="toggleStatus('${property.id}')" title="${property.status === 'ativo' ? 'Desativar' : 'Ativar'}">
                            <i class="fas fa-${property.status === 'ativo' ? 'eye-slash' : 'eye'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="confirmDelete('${property.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('')
    } catch (error) {
        console.error('Error loading properties:', error)
    }
}

function formatPrice(price, transaction) {
    if (transaction === 'aluguel') {
        return 'R$ ' + parseFloat(price || 0).toLocaleString('pt-BR') + '/mês'
    }
    return 'R$ ' + parseFloat(price || 0).toLocaleString('pt-BR')
}

// Filter events
document.getElementById('searchImoveis').addEventListener('input', renderPropertiesTable)
document.getElementById('filterTipo').addEventListener('change', renderPropertiesTable)
document.getElementById('filterTransacao').addEventListener('change', renderPropertiesTable)

// Property Modal
document.getElementById('addPropertyBtn').addEventListener('click', () => {
    openPropertyModal()
})

function openPropertyModal(property = null) {
    currentImages = property ? (property.images || []) : []
    
    document.getElementById('modalTitle').textContent = property ? 'Editar Imóvel' : 'Novo Imóvel'
    document.getElementById('propertyId').value = property ? property.id : ''
    
    document.getElementById('propertyTitle').value = property ? property.title : ''
    document.getElementById('propertyType').value = property ? property.type : ''
    document.getElementById('propertyTransaction').value = property ? property.transaction : ''
    document.getElementById('propertyPrice').value = property ? property.price : ''
    document.getElementById('propertyLocation').value = property ? property.location : ''
    document.getElementById('propertyStatus').value = property ? property.status : 'ativo'
    
    document.getElementById('propertyBedrooms').value = property ? property.bedrooms : 0
    document.getElementById('propertyBathrooms').value = property ? property.bathrooms : 0
    document.getElementById('propertySuites').value = property ? property.suites : 0
    document.getElementById('propertyGarage').value = property ? property.garage : 0
    document.getElementById('propertyArea').value = property ? property.area : ''
    document.getElementById('propertyAreaTotal').value = property ? property.area_total : ''
    document.getElementById('propertyYear').value = property ? property.year : ''
    document.getElementById('propertyCondition').value = property ? property.condition : 'novo'
    document.getElementById('propertyDescription').value = property ? property.description : ''
    
    // Features
    document.querySelectorAll('input[name="features"]').forEach(checkbox => {
        checkbox.checked = property && property.features && property.features.includes(checkbox.value)
    })
    
    renderImagePreviews()
    propertyModal.classList.add('active')
}

async function editProperty(id) {
    try {
        const properties = await supabase.getAllProperties()
        const property = properties.find(p => p.id === id)
        if (property) {
            openPropertyModal(property)
        }
    } catch (error) {
        showToast('Erro ao carregar imóvel', 'error')
    }
}

document.getElementById('closePropertyModal').addEventListener('click', closePropertyModal)
document.getElementById('cancelProperty').addEventListener('click', closePropertyModal)
propertyModal.querySelector('.modal-overlay').addEventListener('click', closePropertyModal)

function closePropertyModal() {
    propertyModal.classList.remove('active')
    propertyForm.reset()
    currentImages = []
    renderImagePreviews()
}

// Form Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
        
        btn.classList.add('active')
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active')
    })
})

// Image Upload
uploadZone.addEventListener('click', () => imageInput.click())

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    uploadZone.classList.add('dragover')
})

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover')
})

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault()
    uploadZone.classList.remove('dragover')
    handleFiles(e.dataTransfer.files)
})

imageInput.addEventListener('change', (e) => {
    handleFiles(e.target.files)
})

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader()
            reader.onload = (e) => {
                if (currentImages.length < 10) {
                    currentImages.push(e.target.result)
                    renderImagePreviews()
                } else {
                    showToast('Máximo de 10 imagens permitidas', 'warning')
                }
            }
            reader.readAsDataURL(file)
        }
    })
}

document.getElementById('addImageUrl').addEventListener('click', () => {
    const url = document.getElementById('imageUrl').value
    if (url && currentImages.length < 10) {
        currentImages.push(url)
        document.getElementById('imageUrl').value = ''
        renderImagePreviews()
    }
})

function renderImagePreviews() {
    imagePreviewGrid.innerHTML = currentImages.map((img, index) => `
        <div class="image-preview-item">
            <img src="${img}" alt="Preview ${index + 1}" onerror="this.src='https://via.placeholder.com/120'">
            <button type="button" class="remove-image" onclick="removeImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('')
}

function removeImage(index) {
    currentImages.splice(index, 1)
    renderImagePreviews()
}

// Save Property
propertyForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const propertyId = document.getElementById('propertyId').value
    
    const features = []
    document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
        features.push(checkbox.value)
    })
    
    const propertyData = {
        title: document.getElementById('propertyTitle').value,
        type: document.getElementById('propertyType').value,
        transaction: document.getElementById('propertyTransaction').value,
        price: parseFloat(document.getElementById('propertyPrice').value.replace(/\./g, '').replace(',', '.')),
        location: document.getElementById('propertyLocation').value,
        status: document.getElementById('propertyStatus').value,
        bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
        bathrooms: parseInt(document.getElementById('propertyBathrooms').value) || 0,
        suites: parseInt(document.getElementById('propertySuites').value) || 0,
        garage: parseInt(document.getElementById('propertyGarage').value) || 0,
        area: parseInt(document.getElementById('propertyArea').value) || 0,
        area_total: parseInt(document.getElementById('propertyAreaTotal').value) || 0,
        year: parseInt(document.getElementById('propertyYear').value) || 0,
        condition: document.getElementById('propertyCondition').value,
        description: document.getElementById('propertyDescription').value,
        features: features,
        images: currentImages.length > 0 ? currentImages : ['https://via.placeholder.com/800x600']
    }
    
    try {
        if (propertyId) {
            await supabase.updateProperty(propertyId, propertyData)
            showToast('Imóvel atualizado com sucesso!', 'success')
        } else {
            await supabase.createProperty(propertyData)
            showToast('Imóvel criado com sucesso!', 'success')
        }
        
        closePropertyModal()
        renderPropertiesTable()
        updateDashboard()
    } catch (error) {
        showToast('Erro ao salvar imóvel: ' + error.message, 'error')
    }
})

// Toggle Status
async function toggleStatus(id) {
    try {
        const properties = await supabase.getAllProperties()
        const property = properties.find(p => p.id === id)
        if (property) {
            const newStatus = property.status === 'ativo' ? 'inativo' : 'ativo'
            await supabase.updateProperty(id, { status: newStatus })
            renderPropertiesTable()
            showToast(`Imóvel ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`, 'success')
        }
    } catch (error) {
        showToast('Erro ao alterar status', 'error')
    }
}

// Delete
function confirmDelete(id) {
    deletePropertyId = id
    deleteModal.classList.add('active')
}

document.getElementById('cancelDelete').addEventListener('click', () => {
    deleteModal.classList.remove('active')
    deletePropertyId = null
})

document.getElementById('confirmDelete').addEventListener('click', async () => {
    if (deletePropertyId) {
        try {
            await supabase.deleteProperty(deletePropertyId)
            renderPropertiesTable()
            updateDashboard()
            showToast('Imóvel excluído com sucesso!', 'success')
        } catch (error) {
            showToast('Erro ao excluir imóvel', 'error')
        }
    }
    deleteModal.classList.remove('active')
    deletePropertyId = null
})

deleteModal.querySelector('.modal-overlay').addEventListener('click', () => {
    deleteModal.classList.remove('active')
    deletePropertyId = null
})

// Messages
async function renderMessages() {
    try {
        const messages = await supabase.getMessages()
        const container = document.getElementById('messageList')
        
        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>Nenhuma mensagem recebida ainda</p>
                </div>
            `
            return
        }
        
        container.innerHTML = messages.map(msg => `
            <div class="message-item">
                <div class="message-header">
                    <strong>${msg.nome}</strong>
                    <span class="message-date">${new Date(msg.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="message-meta">
                    <span>${msg.email}</span>
                    <span>${msg.telefone || ''}</span>
                </div>
                <p class="message-content">${msg.mensagem}</p>
            </div>
        `).join('')
    } catch (error) {
        console.error('Error loading messages:', error)
    }
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle'
    }
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <p>${message}</p>
        <button class="close-toast"><i class="fas fa-times"></i></button>
    `
    
    toast.querySelector('.close-toast').addEventListener('click', () => {
        toast.remove()
    })
    
    toastContainer.appendChild(toast)
    
    setTimeout(() => {
        toast.remove()
    }, 5000)
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', signOut)

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) return
    
    updateDashboard()
    loadProfile()
})