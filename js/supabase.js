const SUPABASE_URL = 'https://ijwuaztnzrptdoonoglq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_cagM3vIdKiqcNWo36AHSXg_54A9fTLX'

class SupabaseAuth {
    constructor() {
        this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    }

    async signInWithEmail(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    }

    async signInWithGoogle() {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/adm.html'
            }
        })
        return { data, error }
    }

    async signUp(email, password) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password
        })
        return { data, error }
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut()
        return { error }
    }

    async getSession() {
        const { data: { session }, error } = await this.supabase.auth.getSession()
        return { session, error }
    }

    async getUser() {
        const { data: { user }, error } = await this.supabase.auth.getUser()
        return { user, error }
    }

    onAuthStateChange(callback) {
        return this.supabase.auth.onAuthStateChange(callback)
    }
}

window.supabaseAuth = new SupabaseAuth()