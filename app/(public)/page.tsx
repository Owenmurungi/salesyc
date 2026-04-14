export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#fff' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '0.5px solid #e5e5e5',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          Botika<span style={{ color: '#1D9E75' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="#pricing" style={{
            padding: '7px 14px', borderRadius: 8, border: '0.5px solid #ddd',
            fontSize: 13, color: '#555', textDecoration: 'none',
          }}>Pricing</a>
          <a href="/login" style={{
            padding: '7px 14px', borderRadius: 8, border: '0.5px solid #ddd',
            fontSize: 13, color: '#555', textDecoration: 'none',
          }}>Sign in</a>
          <a href="/signup" style={{
            padding: '7px 16px', borderRadius: 8,
            background: '#1D9E75', color: '#fff',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '64px 24px 56px', textAlign: 'center', borderBottom: '0.5px solid #e5e5e5' }}>
        <div style={{
          display: 'inline-block', background: '#E1F5EE', color: '#0F6E56',
          fontSize: 11, fontWeight: 600, padding: '4px 12px',
          borderRadius: 20, marginBottom: 18,
        }}>
          WhatsApp AI for Ugandan businesses
        </div>

        <h1 style={{
          fontSize: 36, fontWeight: 800, lineHeight: 1.25,
          color: '#1a1a1a', maxWidth: 520, margin: '0 auto 16px',
        }}>
          Your shop keeps selling while you sleep
        </h1>

        <p style={{
          fontSize: 16, color: '#666', maxWidth: 400,
          margin: '0 auto 32px', lineHeight: 1.6,
        }}>
          An AI bot that takes orders, answers customers, and sends product
          photos — all on WhatsApp, 24/7.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <a href="/signup" style={{
            padding: '12px 26px', background: '#1D9E75', color: '#fff',
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>Start free trial</a>
          <a href="#how" style={{
            padding: '12px 26px', border: '0.5px solid #ddd',
            borderRadius: 8, fontSize: 14, color: '#555', textDecoration: 'none',
          }}>See how it works</a>
        </div>

        {/* Chat preview */}
        <div style={{
          maxWidth: 320, margin: '0 auto',
          background: '#f9f9f7', borderRadius: 14,
          border: '0.5px solid #e5e5e5', padding: '16px', textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginBottom: 12 }}>
            Live demo
          </div>
          {[
            { from: 'customer', text: 'Do you have iPhone 15 128GB?' },
            { from: 'bot',      text: 'Yes! iPhone 15 128GB in stock — UGX 3,200,000. Want to order? 📱' },
            { from: 'customer', text: 'Yes, deliver to Ntinda' },
            { from: 'bot',      text: 'Order confirmed! Send UGX 3,200,000 to MTN 0771234567. Delivery today.' },
          ].map((msg, i) => (
            <div key={i} style={{
              marginBottom: 8, display: 'flex',
              justifyContent: msg.from === 'customer' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                padding: '8px 12px', borderRadius: 10, maxWidth: '85%',
                fontSize: 13, lineHeight: 1.4,
                background: msg.from === 'customer' ? '#E1F5EE' : '#fff',
                color: msg.from === 'customer' ? '#085041' : '#1a1a1a',
                border: msg.from === 'bot' ? '0.5px solid #e5e5e5' : 'none',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '48px 24px', borderBottom: '0.5px solid #e5e5e5' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Everything your shop needs</div>
          <div style={{ fontSize: 14, color: '#888' }}>Built for phone and electronics shops in Uganda</div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14, maxWidth: 700, margin: '0 auto',
        }}>
          {[
            { icon: '🕐', title: '24/7 replies', desc: 'Never miss a customer message at night or weekends' },
            { icon: '📦', title: 'Takes orders', desc: 'Collects item, quantity, and delivery address' },
            { icon: '📸', title: 'Sends images', desc: 'Product photos delivered automatically on WhatsApp' },
            { icon: '📊', title: 'Dashboard', desc: 'See all orders and update your catalog easily' },
          ].map(f => (
            <div key={f.title} style={{
              background: '#fff', border: '0.5px solid #e5e5e5',
              borderRadius: 10, padding: '20px 16px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '48px 24px', background: '#f9f9f7', borderBottom: '0.5px solid #e5e5e5' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Set up in one day</div>
          <div style={{ fontSize: 14, color: '#888' }}>No tech skills needed</div>
        </div>
        <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { n: '1', title: 'Sign up and add your products', desc: 'Enter your phones, prices, and upload photos' },
            { n: '2', title: 'Connect your WhatsApp number', desc: 'We link the bot to your business number' },
            { n: '3', title: 'Go live and watch orders come in', desc: 'Customers chat normally, bot handles everything' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 15,
                background: '#1D9E75', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '48px 24px', borderBottom: '0.5px solid #e5e5e5' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Simple monthly plans</div>
          <div style={{ fontSize: 14, color: '#888' }}>14-day free trial · Cancel anytime</div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14, maxWidth: 640, margin: '0 auto',
        }}>
          {[
            {
              name: 'Starter', price: '80,000', featured: false,
              features: ['AI order taking', 'Product catalog + images', 'Orders dashboard', '200 chats/mo'],
            },
            {
              name: 'Standard', price: '150,000', featured: true,
              features: ['Everything in Starter', 'MoMo payment prompts', 'Order status updates', 'Unlimited chats'],
            },
            {
              name: 'Premium', price: '250,000', featured: false,
              features: ['Everything in Standard', 'Multiple staff numbers', 'Sales analytics', 'Priority support'],
            },
          ].map(plan => (
            <div key={plan.name} style={{
              background: '#fff',
              border: plan.featured ? '2px solid #1D9E75' : '0.5px solid #e5e5e5',
              borderRadius: 10, padding: '22px 18px',
            }}>
              {plan.featured && (
                <div style={{
                  background: '#E1F5EE', color: '#0F6E56',
                  fontSize: 10, fontWeight: 700, padding: '2px 10px',
                  borderRadius: 10, display: 'inline-block', marginBottom: 10,
                }}>Most popular</div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{plan.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                UGX {plan.price}
                <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 18px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 12, color: '#555', padding: '3px 0', display: 'flex', gap: 6 }}>
                    <span style={{ color: '#1D9E75' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{
                display: 'block', textAlign: 'center', padding: '9px',
                borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
                background: plan.featured ? '#1D9E75' : 'transparent',
                color: plan.featured ? '#fff' : '#555',
                border: plan.featured ? 'none' : '0.5px solid #ddd',
              }}>Get started</a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
          Ready to never miss a sale?
        </div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>
          Join phone shops already using Botika in Kampala
        </div>
        <a href="/signup" style={{
          display: 'inline-block', padding: '13px 32px',
          background: '#1D9E75', color: '#fff',
          borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none',
        }}>Start your free trial</a>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '18px 24px', borderTop: '0.5px solid #e5e5e5',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: 12, color: '#aaa' }}>© 2026 Botika</div>
        <div style={{ display: 'flex', gap: 18 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
