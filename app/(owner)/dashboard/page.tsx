'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  customer_phone: string
  customer_name: string | null
  product_name: string
  quantity: number
  delivery_address: string | null
  status: 'pending' | 'confirmed' | 'delivered'
  created_at: string
}

interface Business {
  id: string
  shop_name: string
  bot_active: boolean
  plan: string
}

const STATUS_COLORS: Record<string, string> = {
  pending:   '#BA7517',
  confirmed: '#1D9E75',
  delivered: '#888',
}

const STATUS_BG: Record<string, string> = {
  pending:   '#FAEEDA',
  confirmed: '#E1F5EE',
  delivered: '#F1EFE8',
}

export default function DashboardPage() {
  const router = useRouter()
  const [orders, setOrders]       = useState<Order[]>([])
  const [business, setBusiness]   = useState<Business | null>(null)
  const [loading, setLoading]     = useState(true)
  const [toggling, setToggling]   = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [{ data: biz }, ordersRes] = await Promise.all([
      supabase.from('businesses').select('*').eq('user_id', user.id).single(),
      fetch('/api/orders').then(r => r.json()),
    ])

    setBusiness(biz)
    setOrders(Array.isArray(ordersRes) ? ordersRes : [])
    setLoading(false)
  }

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o))
  }

  async function toggleBot() {
    if (!business) return
    setToggling(true)
    await supabase
      .from('businesses')
      .update({ bot_active: !business.bot_active })
      .eq('id', business.id)
    setBusiness(prev => prev ? { ...prev, bot_active: !prev.bot_active } : prev)
    setToggling(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const weekAgo    = new Date(); weekAgo.setDate(weekAgo.getDate()-7)

  const todayOrders  = orders.filter(o => new Date(o.created_at) >= todayStart).length
  const weekOrders   = orders.filter(o => new Date(o.created_at) >= weekAgo).length
  const pendingCount = orders.filter(o => o.status === 'pending').length

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'system-ui', fontSize:14, color:'#888' }}>
      Loading dashboard...
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'system-ui, sans-serif', background:'#f9f9f7' }}>

      {/* Sidebar */}
      <aside style={{
        width: 200, background:'#0d1117', padding:'20px 0',
        display:'flex', flexDirection:'column',
      }}>
        <div style={{ padding:'0 16px 20px', borderBottom:'0.5px solid #1a2030' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#1D9E75' }}>BOTIKA</div>
          <div style={{ fontSize:11, color:'#5a6070', marginTop:2 }}>{business?.shop_name}</div>
        </div>

        {[
          { label:'Orders',    href:'/dashboard', active: true  },
          { label:'Catalog',   href:'/catalog',   active: false },
          { label:'Analytics', href:'/analytics', active: false },
        ].map(nav => (
          <a key={nav.label} href={nav.href} style={{
            display:'block', padding:'10px 16px', fontSize:13,
            color: nav.active ? '#fff' : '#5a6070',
            background: nav.active ? '#1D9E75' : 'transparent',
            textDecoration:'none', fontWeight: nav.active ? 600 : 400,
          }}>
            {nav.label}
          </a>
        ))}

        {/* Bot toggle */}
        <div style={{ margin:'auto 16px 20px', marginTop:'auto' }}>
          <div style={{ fontSize:11, color:'#5a6070', marginBottom:8 }}>Bot status</div>
          <button onClick={toggleBot} disabled={toggling} style={{
            display:'flex', alignItems:'center', gap:8,
            background:'transparent', border:'0.5px solid #2a3040',
            borderRadius:8, padding:'8px 12px', cursor:'pointer', width:'100%',
          }}>
            <div style={{
              width:32, height:18, borderRadius:9,
              background: business?.bot_active ? '#1D9E75' : '#2a3040',
              position:'relative', transition:'background 0.2s',
            }}>
              <div style={{
                position:'absolute', top:2,
                left: business?.bot_active ? 16 : 2,
                width:14, height:14, borderRadius:7,
                background:'#fff', transition:'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize:12, color: business?.bot_active ? '#1D9E75' : '#5a6070' }}>
              {business?.bot_active ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <button onClick={signOut} style={{
          margin:'0 16px 16px', padding:'8px',
          background:'transparent', border:'0.5px solid #2a3040',
          borderRadius:8, color:'#5a6070', fontSize:12, cursor:'pointer',
        }}>
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:'24px 28px', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Orders</h1>
            <div style={{ fontSize:13, color:'#888', marginTop:2 }}>
              {business?.plan.charAt(0).toUpperCase() + (business?.plan.slice(1) ?? '')} plan
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Orders today',    value: todayOrders  },
            { label:'Orders this week',value: weekOrders   },
            { label:'Pending',         value: pendingCount },
          ].map(stat => (
            <div key={stat.label} style={{
              background:'#fff', border:'0.5px solid #e5e5e5',
              borderRadius:10, padding:'16px',
            }}>
              <div style={{ fontSize:11, color:'#888', marginBottom:6 }}>{stat.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#1a1a1a' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div style={{ background:'#fff', border:'0.5px solid #e5e5e5', borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'0.5px solid #e5e5e5' }}>
            <span style={{ fontSize:14, fontWeight:600 }}>All orders</span>
          </div>

          {orders.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'#888', fontSize:14 }}>
              No orders yet — your bot is ready and waiting!
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f9f9f7' }}>
                  {['Customer','Product','Qty','Address','Status','Time','Action'].map(h => (
                    <th key={h} style={{
                      padding:'10px 12px', textAlign:'left',
                      fontSize:11, fontWeight:600, color:'#888',
                      borderBottom:'0.5px solid #e5e5e5',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} style={{ background: i%2===0 ? '#fff' : '#fafaf8' }}>
                    <td style={{ padding:'10px 12px', color:'#1a1a1a' }}>
                      {order.customer_name || order.customer_phone}
                    </td>
                    <td style={{ padding:'10px 12px' }}>{order.product_name}</td>
                    <td style={{ padding:'10px 12px' }}>{order.quantity}</td>
                    <td style={{ padding:'10px 12px', color:'#666' }}>{order.delivery_address || '—'}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{
                        background: STATUS_BG[order.status],
                        color: STATUS_COLORS[order.status],
                        padding:'3px 10px', borderRadius:20,
                        fontSize:11, fontWeight:600,
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', color:'#888', fontSize:12 }}>
                      {new Date(order.created_at).toLocaleDateString('en-UG', {
                        day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
                      })}
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      {order.status === 'pending' && (
                        <button onClick={() => updateStatus(order.id, 'confirmed')} style={{
                          padding:'4px 10px', background:'#E1F5EE', color:'#1D9E75',
                          border:'0.5px solid #9FE1CB', borderRadius:6, fontSize:11,
                          cursor:'pointer', fontWeight:600,
                        }}>Confirm</button>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => updateStatus(order.id, 'delivered')} style={{
                          padding:'4px 10px', background:'#F1EFE8', color:'#888',
                          border:'0.5px solid #ddd', borderRadius:6, fontSize:11,
                          cursor:'pointer', fontWeight:600,
                        }}>Delivered</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
