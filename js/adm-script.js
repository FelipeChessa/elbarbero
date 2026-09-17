const SUPABASE_KEY = 'sb_publishable_cagM3vIdKiqcNWo36AHSXg_54A9fTLX'

let isInitialized = false

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
    window.location.href = '/login'
}

async function verifyToken() {
    const token = localStorage.getItem('supabase_token')
    if (!token) return false
    
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`
            }
        })
        
        if (!response.ok) {
            localStorage.removeItem('supabase_token')
            localStorage.removeItem('supabase_user')
            return false
        }
        
        const user = await response.json()
        localStorage.setItem('supabase_user', JSON.stringify(user))
        return true
    } catch (err) {
        console.error('Token verification failed:', err)
        localStorage.removeItem('supabase_token')
        localStorage.removeItem('supabase_user')
        return false
    }
}

async function checkAuth() {
    const token = localStorage.getItem('supabase_token')
    if (!token) {
        window.location.href = '/login'
        return false
    }
    
    const isValid = await verifyToken()
    if (!isValid) {
        window.location.href = '/login'
        return false
    }
    
    return true
}

async function dbQuery(endpoint, options = {}) {
    const token = localStorage.getItem('supabase_token')
    if (!token) {
        throw new Error('Not authenticated')
    }
    
    const url = endpoint.includes('?') 
        ? `${SUPABASE_URL}/rest/v1/${endpoint}` 
        : `${SUPABASE_URL}/rest/v1/${endpoint}`
    
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': options.prefer || 'return=representation'
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error('DB Error:', error)
        
        // Check if JWT expired
        if (error.message === 'JWT expired' || error.code === 'PGRST301') {
            console.log('Token expired, redirecting to login...')
            localStorage.removeItem('supabase_token')
            localStorage.removeItem('supabase_user')
            window.location.href = '/login'
            throw new Error('Session expired')
        }
        
        throw new Error(error.message || error.error_description || `Request failed: ${response.status}`)
    }
    
    const text = await response.text()
    return text ? JSON.parse(text) : []
}

const propertiesAPI = {
    async getAll() {
        return dbQuery('properties?select=*&order=created_at.desc')
    },
    async getActive() {
        return dbQuery('properties?select=*&status=eq.ativo&order=created_at.desc')
    },
    async create(data) {
        return dbQuery('properties', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },
    async update(id, data) {
        return dbQuery(`properties?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
    },
    async delete(id) {
        return dbQuery(`properties?id=eq.${id}`, { method: 'DELETE' })
    }
}

const profileAPI = {
    async get() {
        const data = await dbQuery('profile?select=*&limit=1')
        return data && data.length > 0 ? data[0] : null
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

const messagesAPI = {
    async getAll() {
        return dbQuery('messages?select=*&order=created_at.desc')
    },
    async markAsRead(id) {
        return dbQuery(`messages?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ lido: true })
        })
    },
    async delete(id) {
        return dbQuery(`messages?id=eq.${id}`, { method: 'DELETE' })
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer')
    if (!container) return
    
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' }
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.success}"></i>
        <p>${message}</p>
        <button class="close-toast"><i class="fas fa-times"></i></button>
    `
    
    const closeBtn = toast.querySelector('.close-toast')
    if (closeBtn) {
        closeBtn.onclick = () => toast.remove()
    }
    container.appendChild(toast)
    setTimeout(() => toast.remove(), 5000)
}

function formatPrice(price, transaction) {
    const val = parseFloat(price || 0)
    if (transaction === 'aluguel') return 'R$ ' + val.toLocaleString('pt-BR') + '/mês'
    return 'R$ ' + val.toLocaleString('pt-BR')
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item')
    const adminSections = document.querySelectorAll('.admin-section')
    
    console.log('Initializing navigation:', navItems.length, 'items,', adminSections.length, 'sections')
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            const section = item.dataset.section
            console.log('Nav clicked:', section)
            
            navItems.forEach(n => n.classList.remove('active'))
            item.classList.add('active')
            
            adminSections.forEach(s => s.classList.remove('active'))
            const targetSection = document.getElementById(section)
            if (targetSection) {
                targetSection.classList.add('active')
                console.log('Section activated:', section)
            } else {
                console.error('Section not found:', section)
            }
            
            if (section === 'dashboard') loadDashboard()
            if (section === 'perfil') loadProfile()
            if (section === 'imoveis') loadProperties()
            if (section === 'contato') loadMessages()
        })
    })
}

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
        showToast('Erro ao carregar dashboard: ' + err.message, 'error')
    }
}

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
        showToast('Erro ao carregar perfil: ' + err.message, 'error')
    }
}

function initProfileForm() {
    const profileForm = document.getElementById('profileForm')
    if (!profileForm) return
    
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
            await profileAPI.update(profile)
            showToast('Perfil atualizado com sucesso!', 'success')
        } catch (err) {
            showToast('Erro ao atualizar perfil: ' + err.message, 'error')
        }
    })
}

let currentImages = []

async function loadProperties() {
    try {
        const properties = await propertiesAPI.getAll()
        const tbody = document.getElementById('propertiesTableBody')
        const search = document.getElementById('searchImoveis')?.value?.toLowerCase() || ''
        const tipo = document.getElementById('filterTipo')?.value || ''
        const transacao = document.getElementById('filterTransacao')?.value || ''
        
        let filtered = properties.filter(p => {
            const matchSearch = !search || (p.title || '').toLowerCase().includes(search) || (p.location || '').toLowerCase().includes(search)
            const matchTipo = !tipo || p.type === tipo
            const matchTransacao = !transacao || p.transaction === transacao
            return matchSearch && matchTipo && matchTransacao
        })
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum imóvel encontrado</td></tr>'
            return
        }
        
        tbody.innerHTML = filtered.map(p => {
            const imgUrl = (p.images && p.images[0]) || 'https://via.placeholder.com/60x45'
            const transactionClass = p.transaction === 'venda' ? 'rgba(46,204,113,0.1)' : 'rgba(52,152,219,0.1)'
            const transactionColor = p.transaction === 'venda' ? '#2ecc71' : '#3498db'
            const transactionLabel = p.transaction === 'venda' ? 'Venda' : 'Aluguel'
            const statusClass = p.status || 'ativo'
            const statusLabel = statusClass === 'ativo' ? 'Ativo' : statusClass === 'inativo' ? 'Inativo' : 'Vendido'
            
            return `
                <tr>
                    <td><img src="${imgUrl}" class="property-img-thumb" onerror="this.src='https://via.placeholder.com/60x45'"></td>
                    <td><strong>${p.title || ''}</strong><br><small>${p.location || ''}</small></td>
                    <td>${p.type || ''}</td>
                    <td><span class="status-badge" style="background:${transactionClass};color:${transactionColor}">${transactionLabel}</span></td>
                    <td>${formatPrice(p.price, p.transaction)}</td>
                    <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn" onclick="editProperty('${p.id}')"><i class="fas fa-edit"></i></button>
                            <button class="action-btn" onclick="toggleStatus('${p.id}')"><i class="fas fa-${p.status==='ativo'?'eye-slash':'eye'}"></i></button>
                            <button class="action-btn delete" onclick="confirmDelete('${p.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `
        }).join('')
    } catch (err) {
        console.error('Properties error:', err)
        showToast('Erro ao carregar imóveis: ' + err.message, 'error')
    }
}

async function editProperty(id) {
    try {
        const properties = await propertiesAPI.getAll()
        const property = properties.find(p => p.id === id)
        if (property) openPropertyModal(property)
    } catch (err) {
        showToast('Erro ao buscar imóvel: ' + err.message, 'error')
    }
}

function openPropertyModal(property = null) {
    currentImages = property ? (property.images || []) : []
    
    document.getElementById('modalTitle').textContent = property ? 'Editar Imóvel' : 'Novo Imóvel'
    document.getElementById('propertyId').value = property ? property.id : ''
    
    document.getElementById('propertyTitle').value = property ? property.title || '' : ''
    document.getElementById('propertyType').value = property ? property.type || '' : ''
    document.getElementById('propertyTransaction').value = property ? property.transaction || '' : ''
    document.getElementById('propertyPrice').value = property ? property.price || '' : ''
    document.getElementById('propertyLocation').value = property ? property.location || '' : ''
    document.getElementById('propertyStatus').value = property ? property.status || 'ativo' : 'ativo'
    document.getElementById('propertyBedrooms').value = property ? property.bedrooms || 0 : 0
    document.getElementById('propertyBathrooms').value = property ? property.bathrooms || 0 : 0
    document.getElementById('propertySuites').value = property ? property.suites || 0 : 0
    document.getElementById('propertyGarage').value = property ? property.garage || 0 : 0
    document.getElementById('propertyArea').value = property ? property.area || '' : ''
    document.getElementById('propertyAreaTotal').value = property ? property.area_total || '' : ''
    document.getElementById('propertyYear').value = property ? property.year || '' : ''
    document.getElementById('propertyCondition').value = property ? property.condition || 'novo' : 'novo'
    document.getElementById('propertyDescription').value = property ? property.description || '' : ''
    
    document.querySelectorAll('input[name="features"]').forEach(cb => {
        cb.checked = property && property.features && property.features.includes(cb.value)
    })
    
    renderImagePreviews()
    document.getElementById('propertyModal').classList.add('active')
}

function closePropertyModal() {
    document.getElementById('propertyModal').classList.remove('active')
    document.getElementById('propertyForm').reset()
    currentImages = []
    renderImagePreviews()
}

function initPropertiesModal() {
    const addBtn = document.getElementById('addPropertyBtn')
    if (addBtn) {
        addBtn.addEventListener('click', () => openPropertyModal())
    }
    
    const searchInput = document.getElementById('searchImoveis')
    if (searchInput) {
        searchInput.addEventListener('input', loadProperties)
    }
    
    const filterTipo = document.getElementById('filterTipo')
    if (filterTipo) {
        filterTipo.addEventListener('change', loadProperties)
    }
    
    const filterTransacao = document.getElementById('filterTransacao')
    if (filterTransacao) {
        filterTransacao.addEventListener('change', loadProperties)
    }
    
    const closeBtn = document.getElementById('closePropertyModal')
    if (closeBtn) {
        closeBtn.addEventListener('click', closePropertyModal)
    }
    
    const cancelBtn = document.getElementById('cancelProperty')
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePropertyModal)
    }
    
    const overlay = document.querySelector('#propertyModal .modal-overlay')
    if (overlay) {
        overlay.addEventListener('click', closePropertyModal)
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
            btn.classList.add('active')
            const tabContent = document.getElementById('tab-' + btn.dataset.tab)
            if (tabContent) {
                tabContent.classList.add('active')
            }
        })
    })
    
    initImageUpload()
    initPropertyForm()
}

function initImageUpload() {
    const uploadZone = document.getElementById('uploadZone')
    const imageInput = document.getElementById('imageInput')
    
    if (!uploadZone || !imageInput) return
    
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
    
    const addUrlBtn = document.getElementById('addImageUrl')
    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', () => {
            const urlInput = document.getElementById('imageUrl')
            if (urlInput && urlInput.value && currentImages.length < 10) {
                currentImages.push(urlInput.value)
                urlInput.value = ''
                renderImagePreviews()
            }
        })
    }
}

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

function renderImagePreviews() {
    const grid = document.getElementById('imagePreviewGrid')
    if (!grid) return
    
    grid.innerHTML = currentImages.map((img, i) => `
        <div class="image-preview-item">
            <img src="${img}" alt="Preview" onerror="this.src='https://via.placeholder.com/120'">
            <button type="button" class="remove-image" onclick="removeImage(${i})"><i class="fas fa-times"></i></button>
        </div>
    `).join('')
}

window.removeImage = function(i) {
    currentImages.splice(i, 1)
    renderImagePreviews()
}

function initPropertyForm() {
    const form = document.getElementById('propertyForm')
    if (!form) return
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const propertyId = document.getElementById('propertyId').value
        const features = []
        document.querySelectorAll('input[name="features"]:checked').forEach(cb => features.push(cb.value))
        
        const priceStr = document.getElementById('propertyPrice').value || '0'
        const priceNum = parseFloat(priceStr.replace(/\./g, '').replace(',', '.')) || 0
        
        const data = {
            title: document.getElementById('propertyTitle').value,
            type: document.getElementById('propertyType').value,
            transaction: document.getElementById('propertyTransaction').value,
            price: priceNum,
            location: document.getElementById('propertyLocation').value,
            status: document.getElementById('propertyStatus').value,
            bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
            bathrooms: parseInt(document.getElementById('propertyBathrooms').value) || 0,
            suites: parseInt(document.getElementById('propertySuites').value) || 0,
            garage: parseInt(document.getElementById('propertyGarage').value) || 0,
            area: parseInt(document.getElementById('propertyArea').value) || 0,
            area_total: parseInt(document.getElementById('propertyAreaTotal').value) || 0,
            year: parseInt(document.getElementById('propertyYear').value) || null,
            condition: document.getElementById('propertyCondition').value,
            description: document.getElementById('propertyDescription').value,
            features: features,
            images: currentImages.length > 0 ? currentImages : ['https://via.placeholder.com/800x600']
        }
        
        try {
            if (propertyId) {
                await propertiesAPI.update(propertyId, data)
                showToast('Imóvel atualizado com sucesso!', 'success')
            } else {
                await propertiesAPI.create(data)
                showToast('Imóvel criado com sucesso!', 'success')
            }
            closePropertyModal()
            loadProperties()
            loadDashboard()
        } catch (err) {
            showToast('Erro ao salvar imóvel: ' + err.message, 'error')
        }
    })
}

async function toggleStatus(id) {
    try {
        const properties = await propertiesAPI.getAll()
        const property = properties.find(p => p.id === id)
        if (property) {
            const newStatus = property.status === 'ativo' ? 'inativo' : 'ativo'
            await propertiesAPI.update(id, { status: newStatus })
            loadProperties()
            showToast(`Imóvel ${newStatus === 'ativo' ? 'ativado' : 'desativado'}!`, 'success')
        }
    } catch (err) {
        showToast('Erro ao alterar status: ' + err.message, 'error')
    }
}

let deleteId = null

function confirmDelete(id) {
    deleteId = id
    document.getElementById('deleteModal').classList.add('active')
}

function initDeleteModal() {
    const cancelBtn = document.getElementById('cancelDelete')
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('deleteModal').classList.remove('active')
            deleteId = null
        })
    }
    
    const confirmBtn = document.getElementById('confirmDelete')
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (deleteId) {
                try {
                    await propertiesAPI.delete(deleteId)
                    loadProperties()
                    loadDashboard()
                    showToast('Imóvel excluído com sucesso!', 'success')
                } catch (err) {
                    showToast('Erro ao excluir: ' + err.message, 'error')
                }
            }
            document.getElementById('deleteModal').classList.remove('active')
            deleteId = null
        })
    }
    
    const overlay = document.querySelector('#deleteModal .modal-overlay')
    if (overlay) {
        overlay.addEventListener('click', () => {
            document.getElementById('deleteModal').classList.remove('active')
            deleteId = null
        })
    }
}

async function loadMessages() {
    try {
        const messages = await messagesAPI.getAll()
        const container = document.getElementById('messageList')
        
        if (!messages || messages.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i><p>Nenhuma mensagem recebida</p></div>'
            return
        }
        
        container.innerHTML = messages.map(m => `
            <div class="message-item ${m.lido ? 'read' : 'unread'}">
                <div class="message-header"><strong>${m.nome}</strong><span>${new Date(m.created_at).toLocaleDateString('pt-BR')}</span></div>
                <div class="message-meta"><span>${m.email}</span><span>${m.telefone || ''}</span></div>
                <p class="message-content">${m.mensagem}</p>
            </div>
        `).join('')
    } catch (err) {
        console.error('Messages error:', err)
        showToast('Erro ao carregar mensagens: ' + err.message, 'error')
    }
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', signOut)
    }
}

window.editProperty = editProperty
window.toggleStatus = toggleStatus
window.confirmDelete = confirmDelete

async function init() {
    console.log('Initializing admin panel...')
    
    try {
        const isAuth = await checkAuth()
        if (!isAuth) {
            console.log('Not authenticated, redirecting...')
            return
        }
    } catch (err) {
        console.error('Auth check failed:', err)
        window.location.href = '/login'
        return
    }
    
    initNavigation()
    initPropertiesModal()
    initDeleteModal()
    initProfileForm()
    initLogout()
    
    loadDashboard()
    loadProfile()
    
    isInitialized = true
    console.log('Admin panel initialized successfully')
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
