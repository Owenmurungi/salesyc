'use client'

import { useEffect, useState, useRef } from 'react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description: string | null
  image_url: string | null
  active: boolean
}

const emptyForm = { name:'', price:'', stock:'', description:'', image_url:'', active: true }

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [form, setForm]         = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, price: String(p.price),
      stock: String(p.stock), description: p.description ?? '',
      image_url: p.image_url ?? '', active: p.active,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(prev => ({ ...prev, image_url: data.url }))
    setUploading(false)
  }

  async function saveProduct() {
    setSaving(true)
    const body = {
      name: form.name,
      price: parseInt(form.price),
      stock: parseInt(form.stock || '0'),
      description: form.description,
      image_url: form.image_url,
      active: form.active,
    }

    if (editId) {
      await fetch(`/api/products/${editId}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/products', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body),
      })
    }

    await loadProducts()
    setShowForm(false)
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method:'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ active: !p.active }),
    })
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x))
  }

  const inputStyle = {
    width:'100%', padding:'8px 10px',
    border:'0.5px solid #ddd', borderRadius:7,
    fontSize:13, outline:'none', boxSizing:'border-box' as const,
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'system-ui, sans-serif', background:'#f9f9f7' }}>

      {/* Sidebar */}
      <aside style={{ width:200, background:'#0d1117', padding:'20px 0' }}>
        <div style={{ padding:'0 16px 20px', borderBottom:'0.5px solid #1a2030' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#1D9E75' }}>BOTIKA</div>
        </div>
        {[
          { label:'Orders',    href:'/dashboard' },
          { label:'Catalog',   href:'/catalog'   },
          { label:'Analytics', href:'/analytics' },
        ].map(nav => (
          <a key={nav.label} href={nav.href} style={{
            display:'block', padding:'10px 16px', fontSize:13,
            color: nav.href === '/catalog' ? '#fff' : '#5a6070',
            background: nav.href === '/catalog' ? '#1D9E75' : 'transparent',
            textDecoration:'none',
          }}>{nav.label}</a>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:'24px 28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Catalog</h1>
          <button onClick={openAdd} style={{
            padding:'9px 18px', background:'#1D9E75', color:'#fff',
            border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer',
          }}>
            + Add product
          </button>
        </div>

        {loading ? (
          <div style={{ color:'#888', fontSize:14 }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{
            background:'#fff', border:'0.5px solid #e5e5e5', borderRadius:10,
            padding:40, textAlign:'center', color:'#888', fontSize:14,
          }}>
            No products yet — add your first product to get started.
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
            {products.map(product => (
              <div key={product.id} style={{
                background:'#fff',
                border: product.stock === 0 ? '0.5px solid #F0997B' : '0.5px solid #e5e5e5',
                borderRadius:10, overflow:'hidden',
              }}>
                {/* Product image */}
                <div style={{
                  height:140, background:'#f0f0ee',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  overflow:'hidden',
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <div style={{ color:'#ccc', fontSize:12 }}>No image</div>
                  )}
                </div>

                <div style={{ padding:'12px 14px' }}>
                  {/* Status badge */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{
                      fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10,
                      background: product.active ? '#E1F5EE' : '#FAECE7',
                      color: product.active ? '#1D9E75' : '#993C1D',
                    }}>
                      {product.stock === 0 ? 'Out of stock' : product.active ? 'Active' : 'Hidden'}
                    </span>
                    <button onClick={() => toggleActive(product)} style={{
                      fontSize:10, color:'#888', background:'none',
                      border:'none', cursor:'pointer',
                    }}>
                      {product.active ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div style={{ fontSize:13, fontWeight:600, marginBottom:3, lineHeight:1.3 }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1D9E75', marginBottom:2 }}>
                    UGX {product.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize:11, color:'#888', marginBottom:12 }}>
                    {product.stock} in stock
                  </div>

                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => openEdit(product)} style={{
                      flex:1, padding:'6px', background:'#f5f5f3',
                      border:'0.5px solid #ddd', borderRadius:6,
                      fontSize:12, cursor:'pointer', fontWeight:500,
                    }}>Edit</button>
                    <button onClick={() => deleteProduct(product.id)} style={{
                      flex:1, padding:'6px', background:'#FAECE7',
                      border:'0.5px solid #F0997B', borderRadius:6,
                      fontSize:12, cursor:'pointer', color:'#993C1D', fontWeight:500,
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:50,
        }}>
          <div style={{
            background:'#fff', borderRadius:12,
            padding:'28px 28px', width:'100%', maxWidth:440,
            maxHeight:'90vh', overflowY:'auto',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>
                {editId ? 'Edit product' : 'Add product'}
              </div>
              <button onClick={() => setShowForm(false)} style={{
                background:'none', border:'none', fontSize:18,
                cursor:'pointer', color:'#888',
              }}>×</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>
                  Product name
                </label>
                <input style={inputStyle} value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  placeholder="e.g. Samsung A55 256GB" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>
                    Price (UGX)
                  </label>
                  <input style={inputStyle} type="number" value={form.price}
                    onChange={e => setForm(p => ({...p, price: e.target.value}))}
                    placeholder="1850000" />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>
                    Stock
                  </label>
                  <input style={inputStyle} type="number" value={form.stock}
                    onChange={e => setForm(p => ({...p, stock: e.target.value}))}
                    placeholder="10" />
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>
                  Description (for AI context)
                </label>
                <textarea style={{ ...inputStyle, height:70, resize:'vertical' }}
                  value={form.description}
                  onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  placeholder="Colour, storage, specs..." />
              </div>

              {/* Image upload */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4 }}>
                  Product image
                </label>
                {form.image_url ? (
                  <div style={{ position:'relative', marginBottom:8 }}>
                    <img src={form.image_url} alt="preview"
                      style={{ width:'100%', height:120, objectFit:'cover', borderRadius:6 }} />
                    <button onClick={() => setForm(p => ({...p, image_url:''}))} style={{
                      position:'absolute', top:6, right:6,
                      background:'rgba(0,0,0,0.5)', color:'#fff',
                      border:'none', borderRadius:4, padding:'2px 8px',
                      cursor:'pointer', fontSize:12,
                    }}>Remove</button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border:'0.5px dashed #ccc', borderRadius:7,
                      padding:'20px', textAlign:'center',
                      cursor:'pointer', color:'#888', fontSize:13,
                      background: uploading ? '#f9f9f7' : '#fff',
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </div>
                )}
                <input
                  ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type="checkbox" id="active" checked={form.active}
                  onChange={e => setForm(p => ({...p, active: e.target.checked}))} />
                <label htmlFor="active" style={{ fontSize:13, cursor:'pointer' }}>
                  Active (visible to bot)
                </label>
              </div>

              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button onClick={() => setShowForm(false)} style={{
                  flex:1, padding:'9px', background:'#f5f5f3',
                  border:'0.5px solid #ddd', borderRadius:8,
                  fontSize:13, cursor:'pointer',
                }}>Cancel</button>
                <button onClick={saveProduct} disabled={saving} style={{
                  flex:2, padding:'9px', background: saving ? '#9FE1CB' : '#1D9E75',
                  color:'#fff', border:'none', borderRadius:8,
                  fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer',
                }}>
                  {saving ? 'Saving...' : editId ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
