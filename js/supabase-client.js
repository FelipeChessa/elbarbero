import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://ijwuaztnzrptdoonoglq.supabase.co'
const supabasePublishableKey = 'sb_publishable_cagM3vIdKiqcNWo36AHSXg_54A9fTLX'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/adm.html'
    }
  })
  return { data, error }
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}