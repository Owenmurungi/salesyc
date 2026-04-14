'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    shop_name: '',
    whatsapp_number: '',
    plan: 'starter',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name }
      }
    })

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    // 2. Create business record
    const { error: bizError } = await supabase
      .from('businesses')
      .insert({
        user_id: authData.user.id,
        shop_name: form.shop_name,
        whatsapp_number: form.whatsapp_number,
        plan: form.plan,
      })

    if (bizError) {
      setError(bizError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '0.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600 as const,
    color: '#555',
    display: 'block' as const,
    marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9f9f7',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        border: '0.5px solid #e5e5e5',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            Botika<span style={{ color: '#1D9E75' }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Start your 14-day free trial
          </div>
        </div>

        <form onSubmit={handleSignup}>
          {/* Owner name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Your name</label>
            <input style={inputStyle} type="text" placeholder="John Mukasa"
              value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@shop.com"
              value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="At least 8 characters"
              value={form.password} onChange={e => update('password', e.target.value)} required />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f0f0ee', margin: '16px 0' }} />

          {/* Shop name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Shop name</label>
            <input style={inputStyle} type="text" placeholder="Kira Phone World"
              value={form.shop_name} onChange={e => update('shop_name', e.target.value)} required />
          </div>

          {/* WhatsApp number */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Business WhatsApp number</label>
            <input style={inputStyle} type="text" placeholder="+256772123456"
              value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} required />
          </div>

          {/* Plan */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Plan</label>
            <select
              value={form.plan}
              onChange={e => update('plan', e.target.value)}
              style={{ ...inputStyle, background: '#fff' }}
            >
              <option value="starter">Starter — UGX 80,000/mo</option>
              <option value="standard">Standard — UGX 150,000/mo</option>
              <option value="premium">Premium — UGX 250,000/mo</option>
            </select>
          </div>

          {error && (
            <div style={{
              background: '#FAECE7', border: '0.5px solid #F0997B',
              borderRadius: 6, padding: '8px 12px',
              fontSize: 13, color: '#993C1D', marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '10px',
            background: loading ? '#9FE1CB' : '#1D9E75',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Creating account...' : 'Start free trial'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
