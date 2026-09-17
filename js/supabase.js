const SUPABASE_URL = 'https://ijwuaztnzrptdoonoglq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_cagM3vIdKiqcNWo36AHSXg_54A9fTLX'

class SupabaseAuth {
    constructor() {
        console.log('SupabaseAuth initializing...')
    }

    async signInWithEmail(email, password) {
        console.log('Attempting login with:', email)
        
        try {
            const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, password })
            })
            
            const data = await response.json()
            console.log('Login response:', data)
            
            if (data.access_token) {
                localStorage.setItem('supabase_token', data.access_token)
                localStorage.setItem('supabase_user', JSON.stringify(data.user))
                return { data, error: null }
            }
            
            return { data: null, error: { message: data.error_description || 'Login falhou' } }
        } catch (error) {
            console.error('Login error:', error)
            return { data: null, error }
        }
    }

    async signInWithGoogle() {
        const redirectUrl = encodeURIComponent(window.location.origin + '/adm')
        window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`
    }

    async signUp(email, password) {
        console.log('Attempting signup with:', email)
        
        try {
            const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, password })
            })
            
            const data = await response.json()
            console.log('Signup response:', data)
            
            return { data, error: response.ok ? null : { message: data.msg || 'Erro ao criar conta' } }
        } catch (error) {
            console.error('Signup error:', error)
            return { data: null, error }
        }
    }

    async signOut() {
        localStorage.removeItem('supabase_token')
        localStorage.removeItem('supabase_user')
    }

    async getSession() {
        const token = localStorage.getItem('supabase_token')
        return { session: token ? { access_token: token } : null, error: null }
    }
}

window.supabaseAuth = new SupabaseAuth()
console.log('SupabaseAuth ready')