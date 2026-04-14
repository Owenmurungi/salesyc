'use client'

import { useEffect, useState } from 'react'

interface Stats {
  activeClients: number
  trialClients: number
  messagesToday: number
  ordersThisWeek: number
  mrr: number
}

interface Client {
  id: string
  shop_name: string
  whatsapp_number: string
  plan: string
  bot_active: boolean
  trial_ends_at: string
  created_at: string
  users: { full_name: string; email: string; phone: string }
}

const PLAN_COLORS: Record<string, string> = {
  starter: '#185FA5', standard: '#1D9E75', premium: '#534AB7',
}
const PLAN_BG: Record<string, string> = {
  starter: '#E6F1FB', standard: '#E1F5EE', premium: '#EEEDFE',
}

export default function AdminPage() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/clients').then(r => r.json()),
    ]).then(([s, c]) => {
      setStats(s)
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }, [])

  async function updateClient(id: string, changes: any) {
    await fetch(`/api/admin/clients`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, ...changes }),
    })
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c))
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'system-ui', fontSize:14, color:'#888' }}>
      Loading admin dashboard...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', fontFamily:'system-ui, sans-serif', background:'#f9f9f7' }}>

      {/* Top bar */}
      <div style={{
        background:'#0d1117', padding:'14px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <span style={{ fontSize:16, fontWeight:700, color:'#1D9E75' }}>BOTIKA</span>
          <span style={{ fontSize:12, color:'#5a6070', marginLeft:12 }}>Admin dashboard</span>
        </div>
        <span style={{
          background:'#FAECE7', color:'#993C1D',
          fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:10,
        }}>Super Admin</span>
      </div>

      <div style={{ padding:'24px 28px' }}>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {[
            { label:'Active clients',    value: stats?.activeClients ?? 0,  color:'#1D9E75', bg:'#E1F5EE' },
            { label:'Trial accounts',    value: stats?.trialClients ?? 0,   color:'#BA7517', bg:'#FAEEDA' },
            { label:'Messages today',    value: stats?.messagesToday ?? 0,  color:'#185FA5', bg:'#E6F1FB' },
            { label:'MRR',               value: `UGX ${((stats?.mrr ?? 0)/1000).toFixed(0)}k`, color:'#3B6D11', bg:'#EAF3DE' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border:`0.5px solid ${s.color}`,
              borderRadius:10, padding:'16px',
            }}>
              <div style={{ fontSize:11, color: s.color, fontWeight:600, marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Clients table */}
        <div style={{ background:'#fff', border:'0.5px solid #e5e5e5', borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'0.5px solid #e5e5e5', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, fontWeight:600 }}>All client accounts</span>
            <span style={{ fontSize:12, color:'#888' }}>{clients.length} total</span>
          </div>

          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f9f9f7' }}>
                {['Shop','Owner','WhatsApp','Plan','Messages','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{
                    padding:'10px 12px', textAlign:'left',
                    fontSize:11, fontWeight:600, color:'#888',
                    borderBottom:'0.5px solid #e5e5e5',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr key={client.id} style={{ background: i%2===0 ? '#fff' : '#fafaf8' }}>
                  <td style={{ padding:'10px 12px', fontWeight:600 }}>{client.shop_name}</td>
                  <td style={{ padding:'10px 12px', color:'#666' }}>{client.users?.full_name}</td>
                  <td style={{ padding:'10px 12px', color:'#888', fontSize:12 }}>{client.whatsapp_number}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{
                      background: PLAN_BG[client.plan],
                      color: PLAN_COLORS[client.plan],
                      padding:'2px 10px', borderRadius:10,
                      fontSize:11, fontWeight:600,
                    }}>
                      {client.plan}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px', color:'#888' }}>—</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{
                      background: client.bot_active ? '#E1F5EE' : '#F1EFE8',
                      color: client.bot_active ? '#1D9E75' : '#888',
                      padding:'2px 10px', borderRadius:10,
                      fontSize:11, fontWeight:600,
                    }}>
                      {client.bot_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px', color:'#888', fontSize:12 }}>
                    {new Date(client.created_at).toLocaleDateString('en-UG', {
                      day:'numeric', month:'short', year:'numeric'
                    })}
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      {/* Plan change */}
                      <select
                        value={client.plan}
                        onChange={e => updateClient(client.id, { plan: e.target.value })}
                        style={{
                          fontSize:11, padding:'3px 6px',
                          border:'0.5px solid #ddd', borderRadius:5,
                          background:'#fff', cursor:'pointer',
                        }}
                      >
                        <option value="starter">Starter</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                      {/* Toggle active */}
                      <button
                        onClick={() => updateClient(client.id, { bot_active: !client.bot_active })}
                        style={{
                          fontSize:11, padding:'3px 8px',
                          background: client.bot_active ? '#FAECE7' : '#E1F5EE',
                          color: client.bot_active ? '#993C1D' : '#1D9E75',
                          border:`0.5px solid ${client.bot_active ? '#F0997B' : '#9FE1CB'}`,
                          borderRadius:5, cursor:'pointer', fontWeight:600,
                        }}
                      >
                        {client.bot_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
