export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

const companies = [
  { name:'Razorpay', industry:'Fintech', location:'Bangalore', size:'1,000–5,000', jobs:4, color:'#2563eb', desc:'India\'s leading payment gateway, building financial infrastructure for businesses.' },
  { name:'Swiggy', industry:'Food Tech', location:'Bangalore', size:'5,000–10,000', jobs:7, color:'#f97316', desc:'India\'s on-demand delivery platform serving millions of orders daily.' },
  { name:'Zepto', industry:'Quick Commerce', location:'Mumbai', size:'1,000–5,000', jobs:3, color:'#8b5cf6', desc:'10-minute grocery delivery startup disrupting the quick commerce space.' },
  { name:'CRED', industry:'Fintech', location:'Bangalore', size:'500–1,000', jobs:5, color:'#6366f1', desc:'Members-only credit card bill payment platform with exclusive rewards.' },
  { name:'Meesho', industry:'E-Commerce', location:'Bangalore', size:'5,000–10,000', jobs:6, color:'#ec4899', desc:'Social commerce platform empowering millions of small businesses across India.' },
  { name:'Groww', industry:'Fintech', location:'Bangalore', size:'1,000–5,000', jobs:4, color:'#10b981', desc:'India\'s largest investment platform for stocks, mutual funds and more.' },
  { name:'PhonePe', industry:'Payments', location:'Bangalore', size:'5,000+', jobs:8, color:'#7c3aed', desc:'UPI-based payments app serving 500M+ registered users across India.' },
  { name:'BrowserStack', industry:'Dev Tools', location:'Mumbai', size:'1,000–5,000', jobs:3, color:'#f59e0b', desc:'Cloud-based testing platform used by developers at 50,000+ companies.' },
  { name:'Postman', industry:'Dev Tools', location:'Bangalore', size:'500–1,000', jobs:2, color:'#ef4444', desc:'API development platform used by 30M+ developers worldwide.' },
  { name:'Freshworks', industry:'SaaS', location:'Chennai', size:'5,000+', jobs:9, color:'#06b6d4', desc:'Global SaaS company building CRM, ITSM and customer support tools.' },
  { name:'Chargebee', industry:'SaaS', location:'Chennai', size:'500–1,000', jobs:3, color:'#818cf8', desc:'Subscription billing and revenue management for SaaS companies globally.' },
  { name:'Hasura', industry:'Dev Tools', location:'Bangalore', size:'100–500', jobs:2, color:'#1e40af', desc:'Instant GraphQL APIs on your data. Open-source and loved by developers.' },
]

export default function CompaniesPage() {
  return (
    <>
      <Navbar userRole={null} />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease forwards}
        .fade-up-1{animation:fadeUp .5s .1s ease both}
        .fade-up-2{animation:fadeUp .5s .2s ease both}
        .company-card{transition:border-color 200ms ease,transform 200ms ease,box-shadow 200ms ease}
        .company-card:hover{border-color:var(--accent-border)!important;transform:translateY(-3px)!important;box-shadow:var(--shadow-md)!important}
        .filter-btn{transition:background-color 150ms ease,border-color 150ms ease,color 150ms ease}
        .filter-btn:hover{border-color:var(--accent-border)!important;color:var(--accent)!important}
        .view-btn{transition:background-color 150ms ease,border-color 150ms ease,color 150ms ease}
        .view-btn:hover{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}
        .back-btn{transition:color 150ms ease,border-color 150ms ease}
        .back-btn:hover{color:var(--text-primary)!important;border-color:var(--border-strong)!important}
        @media(max-width:768px){.companies-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:480px){.companies-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Background glow */}
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-10%',left:'20%',width:500,height:500,background:'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)'}}/>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'2.5rem 2rem',position:'relative',zIndex:1}}>

        {/* Back button */}
        <Link href="/" style={{textDecoration:'none'}}>
          <button className="back-btn" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',background:'var(--surface-1)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text-secondary)',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',marginBottom:'2rem'}}>
            ← Back
          </button>
        </Link>

        {/* Header */}
        <div className="fade-up" style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:999,padding:'5px 14px',fontSize:12,color:'var(--accent)',fontWeight:700,marginBottom:16}}>
            🏢 Companies on HireWise
          </div>
          <h1 style={{fontSize:'clamp(1.8rem,4vw,2.75rem)',fontWeight:900,color:'var(--text-primary)',letterSpacing:'-1.5px',marginBottom:10}}>
            Companies hiring right now
          </h1>
          <p style={{fontSize:14,color:'var(--text-secondary)',maxWidth:500,margin:'0 auto',lineHeight:1.7}}>
            These companies are actively looking for talent on HireWise. Sign up to see open roles and apply directly.
          </p>
        </div>

        {/* Industry filters */}
        <div className="fade-up-1" style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:'2.5rem'}}>
          {['All','Fintech','Dev Tools','SaaS','E-Commerce','Food Tech','Payments'].map((ind, i) => (
            <button key={ind} className="filter-btn" style={{padding:'7px 16px',borderRadius:'var(--radius-full)',border:`1px solid ${i===0?'var(--accent)':'var(--border)'}`,background:i===0?'var(--accent)':'var(--surface-1)',color:i===0?'#fff':'var(--text-secondary)',fontSize:13,fontWeight:i===0?700:500,cursor:'pointer',fontFamily:'inherit'}}>
              {ind}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="companies-grid fade-up-2" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {companies.map(co => (
            <div key={co.name} className="company-card" style={{background:'var(--surface-0)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.5rem',boxShadow:'var(--shadow-sm)'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                <div style={{width:48,height:48,borderRadius:'var(--radius-md)',background:`${co.color}20`,border:`1px solid ${co.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:co.color,fontSize:18}}>
                  {co.name[0]}
                </div>
                <div style={{background:'var(--success-subtle)',color:'var(--success)',border:'1px solid var(--success-border)',borderRadius:'var(--radius-full)',fontSize:11,fontWeight:700,padding:'3px 10px'}}>
                  {co.jobs} open roles
                </div>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:'var(--text-primary)',marginBottom:4,letterSpacing:'-.2px'}}>{co.name}</div>
              <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
                <span style={{fontSize:11,color:'var(--accent)',background:'var(--accent-subtle)',borderRadius:'var(--radius-sm)',padding:'2px 8px',fontWeight:600,border:'1px solid var(--accent-border)'}}>{co.industry}</span>
                <span style={{fontSize:11,color:'var(--text-secondary)'}}>📍 {co.location}</span>
              </div>
              <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:14}}>{co.desc}</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:11,color:'var(--text-tertiary)'}}>👥 {co.size} employees</span>
                <Link href="/signup">
                  <button className="view-btn" style={{padding:'6px 14px',background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:'var(--radius-sm)',color:'var(--accent)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    View roles →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{textAlign:'center',marginTop:'3rem',padding:'2.5rem',background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:'var(--radius-xl)'}}>
          <div style={{fontSize:20,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-.5px',marginBottom:8}}>Your company not listed?</div>
          <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:'1.25rem'}}>Sign up as a company and start finding the right talent with AI matching.</div>
          <Link href="/signup?role=company">
            <button style={{padding:'11px 28px',background:'var(--accent)',border:'none',borderRadius:'var(--radius-md)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(13,148,136,0.25)'}}>
              Add your company →
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
