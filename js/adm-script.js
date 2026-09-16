// Supabase Configuration
const SUPABASE_URL = 'https://ijwuaztnzrptdoonoglq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_cagM3vIdKiqcNWo36AHSXg_54A9fTLX'

// Auth functions
async function signInWithEmail(email, password) {
    console.log('Login with:', email)
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (data.access_token) {
        localStorage.setItem('supabase_token', data.access_token)
        localStorage.setItem('supabase_user', JSON.stringify(data.user))
    }
    return { data, error: response.ok ? null : data }
}

async function signOut() {
    localStorage.removeItem('supabase_token')
    localStorage.removeItem('supabase_user')
    window.location.href = 'login.html'
}

async function checkAuth() {
    const token = localStorage.getItem('supabase_token')
    if (!token) {
        window.location.href = 'login.html'
        return false
    }
    return true
}

// Database Helper
async function dbQuery(endpoint, options = {}) {
    const token = localStorage.getItem('supabase_token') || SUPABASE_KEY
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            'Prefer': options.prefer || 'return=representation',
            ...options.headers
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error('DB Error:', error)
        throw new Error(error.message || 'Request failed')
    }
    
    const text = await response.text()
    return text ? JSON.parse(text) : []
}

// Properties CRUD
const propertiesAPI = {
    async getAll() {
        return dbQuery('properties?order=created_at.desc')
    },
    async getActive() {
        return dbQuery('properties?status=eq.ativo&order=created_at.desc')
    },
    async create(data) {
        return dbQuery('properties', {
            method: 'POST',
            body: JSON.stringify({ ...data, created_at: new Date().toISOString() })
        })
    },
    async update(id, data) {
        return dbQuery(`properties?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ ...data, updated_at: new Date().toISOString() })
        })
    },
    async delete(id) {
        return dbQuery(`properties?id=eq.${id}`, { method: 'DELETE' })
    }
}

// Profile CRUD
const profileAPI = {
    async get() {
        const data = await dbQuery('profile?limit=1')
        return data[0] || null
    },
    async update(data) {
        const existing = await this.get()
        if (existing) {
            return dbQuery(`profile?id=eq.${existing.id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            })
        } else {
            return dbQuery('profile', { method: 'POST', body: JSON.stringify(data) })
        }
    }
}

// Messages CRUD
const messagesAPI = {
    async getAll() {
        return dbQuery('messages?order=created_at.desc')
    },
    async create(data) {
        return dbQuery('messages', {
            method: 'POST',
            body: JSON.stringify({ ...data, created_at: new Date().toISOString() })
        })
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer')
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' }
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <p>${message}</p>
        <button class="close-toast"><i class="fas fa-times"></i></button>
    `
    
    toast.querySelector('.close-toast').onclick = () => toast.remove()
    container.appendChild(toast)
    setTimeout(() => toast.remove(), 5000)
}

// Format price
function formatPrice(price, transaction) {
    const val = parseFloat(price || 0)
    if (transaction === 'aluguel') return 'R$ ' + val.toLocaleString('pt-BR') + '/mês'
    return 'R$ ' + val.toLocaleString('pt-BR')
}

// Navigation
const navItems = document.querySelectorAll('.nav-item')
const adminSections = document.querySelectorAll('.admin-section')

navItems.forEach(item => {
    item.onclick = (e) => {
        e.preventDefault()
        const section = item.dataset.section
        
        navItems.forEach(n => n.classList.remove('active'))
        item.classList.add('active')
        
        adminSections.forEach(s => s.classList.remove('active'))
        document.getElementById(section).classList.add('active')
        
        if (section === 'dashboard') loadDashboard()
        if (section === 'perfil') loadProfile()
        if (section === 'imoveis') loadProperties()
        if (section === 'contato') loadMessages()
    }
})

// Dashboard
async function loadDashboard() {
    try {
        const properties = await propertiesAPI.getAll()
        const total = properties.length
        const venda = properties.filter(p => p.transaction === 'venda').length
        const aluguel = properties.filter(p => p.transaction === 'aluguel').length
        
        document.getElementById('totalImoveis').textContent = total
        document.getElementById('imoveisVenda').textContent = venda
        document.getElementById('imoveisAluguel').textContent = aluguel
        document.getElementById('totalVisualizacoes').textContent = Math.floor(Math.random() * 500) + 100
    } catch (err) {
        console.error('Dashboard error:', err)
    }
}

// Profile
async function loadProfile() {
    try {
        const profile = await profileAPI.get()
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
    } catch (err) {
        console.error('Profile error:', err)
    }
}

document.getElementById('profileForm').onsubmit = async (e) => {
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
        await profileAPI.update(profile)
        showToast('Perfil atualizado!', 'success')
    } catch (err) {
        showToast('Erro: ' + err.message, 'error')
    }
}

// Properties
let currentImages = []

async function loadProperties() {
    try {
        const properties = await propertiesAPI.getAll()
        const tbody = document.getElementById('propertiesTableBody')
        const search = document.getElementById('searchImoveis').value.toLowerCase()
        const tipo = document.getElementById('filterTipo').value
        const transacao = document.getElementById('filterTransacao').value
        
        let filtered = properties.filter(p => {
            const matchSearch = !search || (p.title || '').toLowerCase().includes(search) || (p.location || '').toLowerCase().includes(search)
            const matchTipo = !tipo || p.type === tipo
            const matchTransacao = !transacao || p.transaction === transacao
            return matchSearch && matchTipo && matchTransacao
        })
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum imóvel</td></tr>'
            return
        }
        
        tbody.innerHTML = filtered.map(p => `
            <tr>
                <td><img src="${(p.images && p.images[0]) || 'https://via.placeholder.com/60x45'}" class="property-img-thumb" onerror="this.src='https://via.placeholder.com/60x45'"></td>
                <td><strong>${p.title || ''}</strong><br><small>${p.location || ''}</small></td>
                <td>${p.type || ''}</td>
                <td><span class="status-badge" style="background:${p.transaction==='venda'?'rgba(46,204,113,0.1)':'rgba(52,152,219,0.1)};color:${p.transaction==='venda'?'#2ecc71':'#3498db'}">${p.transaction==='venda'?'Venda':'Aluguel'}</span></td>
                <td>${formatPrice(p.price, p.transaction)}</td>
                <td><span class="status-badge ${p.status}">${p.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="editProperty('${p.id}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn" onclick="toggleStatus('${p.id}')"><i class="fas fa-${p.status==='ativo'?'eye-slash':'eye'}"></i></button>
                        <button class="action-btn delete" onclick="confirmDelete('${p.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('')
    } catch (err) {
        console.error('Properties error:', err)
    }
}

document.getElementById('addPropertyBtn').onclick = () => openPropertyModal()
document.getElementById('searchImoveis').oninput = loadProperties
document.getElementById('filterTipo').onchange = loadProperties
document.getElementById('filterTransacao').onchange = loadProperties

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
    
    document.querySelectorAll('input[name="features"]').forEach(cb => {
        cb.checked = property && property.features && property.features.includes(cb.value)
    })
    
    renderImagePreviews()
    document.getElementById('propertyModal').classList.add('active')
}

async function editProperty(id) {
    const properties = await propertiesAPI.getAll()
    const property = properties.find(p => p.id === id)
    if (property) openPropertyModal(property)
}

function closePropertyModal() {
    document.getElementById('propertyModal').classList.remove('active')
    document.getElementById('propertyForm').reset()
    currentImages = []
    renderImagePreviews()
}

document.getElementById('closePropertyModal').onclick = closePropertyModal
document.getElementById('cancelProperty').onclick = closePropertyModal
document.querySelector('#propertyModal .modal-overlay').onclick = closePropertyModal

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
        btn.classList.add('active')
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active')
    }
})

// Image Upload
const uploadZone = document.getElementById('uploadZone')
const imageInput = document.getElementById('imageInput')
const imagePreviewGrid = document.getElementById('imagePreviewGrid')

uploadZone.onclick = () => imageInput.click()
uploadZone.ondragover = (e) => { e.preventDefault(); uploadZone.classList.add('dragover') }
uploadZone.ondragleave = () => uploadZone.classList.remove('dragover')
uploadZone.ondrop = (e) => { e.preventDefault(); uploadZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files) }
imageInput.onchange = (e) => handleFiles(e.target.files)

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader()
            reader.onload = (e) => {
                if (currentImages.length < 10) {
                    currentImages.push(e.target.result)
                    renderImagePreviews()
                }
            }
            reader.readAsDataURL(file)
        }
    })
}

document.getElementById('addImageUrl').onclick = () => {
    const url = document.getElementById('imageUrl').value
    if (url && currentImages.length < 10) {
        currentImages.push(url)
        document.getElementById('imageUrl').value = ''
        renderImagePreviews()
    }
}

function renderImagePreviews() {
    imagePreviewGrid.innerHTML = currentImages.map((img, i) => `
        <div class="image-preview-item">
            <img src="${img}" alt="Preview" onerror="this.src='https://via.placeholder.com/120'">
            <button type="button" class="remove-image" onclick="removeImage(${i})"><i class="fas fa-times"></i></button>
        </div>
    `).join('')
}

function removeImage(i) {
    currentImages.splice(i, 1)
    renderImagePreviews()
}

// Save Property
document.getElementById('propertyForm').onsubmit = async (e) => {
    e.preventDefault()
    
    const propertyId = document.getElementById('propertyId').value
    const features = []
    document.querySelectorAll('input[name="features"]:checked').forEach(cb => features.push(cb.value))
    
    const data = {
        title: document.getElementById('propertyTitle').value,
        type: document.getElementById('propertyType').value,
        transaction: document.getElementById('propertyTransaction').value,
        price: parseFloat(document.getElementById('propertyPrice').value.replace(/\./g, '').replace(',', '.')) || 0,
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
            await propertiesAPI.update(propertyId, data)
            showToast('Imóvel atualizado!', 'success')
        } else {
            await propertiesAPI.create(data)
            showToast('Imóvel criado!', 'success')
        }
        closePropertyModal()
        loadProperties()
        loadDashboard()
    } catch (err) {
        showToast('Erro: ' + err.message, 'error')
    }
}

// Toggle Status
async function toggleStatus(id) {
    const properties = await propertiesAPI.getAll()
    const property = properties.find(p => p.id === id)
    if (property) {
        const newStatus = property.status === 'ativo' ? 'inativo' : 'ativo'
        await propertiesAPI.update(id, { status: newStatus })
        loadProperties()
        showToast(`Imóvel ${newStatus === 'ativo' ? 'ativado' : 'desativado'}!`, 'success')
    }
}

// Delete
let deleteId = null
function confirmDelete(id) {
    deleteId = id
    document.getElementById('deleteModal').classList.add('active')
}

document.getElementById('cancelDelete').onclick = () => {
    document.getElementById('deleteModal').classList.remove('active')
    deleteId = null
}

document.getElementById('confirmDelete').onclick = async () => {
    if (deleteId) {
        await propertiesAPI.delete(deleteId)
        loadProperties()
        loadDashboard()
        showToast('Imóvel excluído!', 'success')
    }
    document.getElementById('deleteModal').classList.remove('active')
    deleteId = null
}
document.querySelector('#deleteModal .modal-overlay').onclick = () => {
    document.getElementById('deleteModal').classList.remove('active')
    deleteId = null
}

// Messages
async function loadMessages() {
    try {
        const messages = await messagesAPI.getAll()
        const container = document.getElementById('messageList')
        
        if (!messages || messages.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i><p>Nenhuma mensagem</p></div>'
            return
        }
        
        container.innerHTML = messages.map(m => `
            <div class="message-item">
                <div class="message-header"><strong>${m.nome}</strong><span>${new Date(m.created_at).toLocaleDateString('pt-BR')}</span></div>
                <div class="message-meta"><span>${m.email}</span><span>${m.telefone||''}</span></div>
                <p class="message-content">${m.mensagem}</p>
            </div>
        `).join('')
    } catch (err) {
        console.error('Messages error:', err)
    }
}

// Logout
document.getElementById('logoutBtn').onclick = signOut

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const isAuth = await checkAuth()
    if (!isAuth) return
    
    loadDashboard()
    loadProfile()
    console.log('Admin initialized')
})