export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

const jobs = [
  { title:'Frontend Engineer', company:'Razorpay', location:'Bangalore', type:'Full-time', salary:'₹18–28 LPA', skills:['React','TypeScript','GraphQL'], color:'#2563eb', posted:'2 days ago' },
  { title:'SDE Intern', company:'Swiggy', location:'Remote', type:'Internship', salary:'₹50K/month', skills:['Node.js','React','MongoDB'], color:'#f97316', posted:'1 day ago' },
  { title:'Backend Engineer', company:'Zepto', location:'Mumbai', type:'Full-time', salary:'₹15–22 LPA', skills:['Go','PostgreSQL','Kafka'], color:'#8b5cf6', posted:'3 days ago' },
  { title:'Full Stack Developer', company:'CRED', location:'Bangalore', type:'Full-time', salary:'₹20–35 LPA', skills:['React','Node.js','AWS'], color:'#6366f1', posted:'5 days ago' },
  { title:'iOS Developer', company:'Meesho', location:'Bangalore', type:'Full-time', salary:'₹16–24 LPA', skills:['Swift','Xcode','UIKit'], color:'#ec4899', posted:'1 week ago' },
  { title:'Data Engineer', company:'Groww', location:'Bangalore', type:'Full-time', salary:'₹18–26 LPA', skills:['Python','Spark','Airflow'], color:'#10b981', posted:'2 days ago' },
  { title:'DevOps Engineer', company:'PhonePe', location:'Bangalore', type:'Full-time', salary:'₹20–32 LPA', skills:['Kubernetes','Docker','AWS'], color:'#7c3aed', posted:'4 days ago' },
  { title:'Product Designer', company:'Freshworks', location:'Chennai', type:'Full-time', salary:'₹14–20 LPA', skills:['Figma','Design Systems','Prototyping'], color:'#06b6d4', posted:'6 days ago' },
  { title:'ML Engineer', company:'BrowserStack', location:'Mumbai', type:'Full-time', salary:'₹22–35 LPA', skills:['Python','PyTorch','MLOps'], color:'#f59e0b', posted:'3 days ago' },
  { title:'React Native Developer', company:'Postman', location:'Remote', type:'Full-time', salary:'₹16–26 LPA', skills:['React Native','JavaScript','REST APIs'], color:'#ef4444', posted:'1 week ago' },
  { title:'Site Reliability Engineer', company:'Chargebee', location:'Chennai', type:'Full-time', salary:'₹18–28 LPA', skills:['Linux','Terraform','GCP'], color:'#0891b2', posted:'2 days ago' },
  { title:'Backend Intern', company:'Hasura', location:'Remote', type:'Internship', salary:'₹40K/month', skills:['Go','GraphQL','PostgreSQL'], color:'#1e40af', posted:'5 days ago' },
]

export default function BrowseJobsPage() {
  return (
    <>
      <Navbar userRole={null} />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease forwards}
        .fade-up-1{animation:fadeUp .5s .1s ease both}
        .fade-up-2{animation:fadeUp .5s .2s ease both}
        .job-card{transition:border-color 200ms ease,transform 200ms ease,box-shadow 200ms ease}
        .job-card:hover{border-color:var(--accent-border)!important;transform:translateY(-2px)!important;box-shadow:var(--shadow-md)!important}
        .apply-btn{transition:background-color 150ms ease,color 150ms ease,border-color 150ms ease}
        .apply-btn:hover{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}
        .filter-btn{transition:background-color 150ms ease,border-color 150ms ease,color 150ms ease}
        .filter-btn:hover{border-color:var(--accent-border)!important;color:var(--accent)!important}
        .back-btn{transition:color 150ms ease,border-color 150ms ease}
        .back-btn:hover{color:var(--text-primary)!important;border-color:var(--border-strong)!important}
        @media(max-width:768px){.jobs-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Background glow */}
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-10%',right:'10%',width:500,height:500,background:'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)'}}/>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'2.5rem 2rem',position:'relative',zIndex:1}}>

        {/* Back button */}
        <Link href="/" style={{textDecoration:'none'}}>
          <button className="back-btn" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',background:'var(--surface-1)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text-secondary)',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',marginBottom:'2rem'}}>
            ← Back
          </button>
        </Link>

        {/* Header */}
        <div className="fade-up" style={{marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:999,padding:'5px 14px',fontSize:12,color:'var(--accent)',fontWeight:700,marginBottom:16}}>
            💼 {jobs.length} jobs available
          </div>
          <h1 style={{fontSize:'clamp(1.8rem,4vw,2.75rem)',fontWeight:900,color:'var(--text-primary)',letterSpacing:'-1.5px',marginBottom:10}}>
            Browse open positions
          </h1>
          <p style={{fontSize:14,color:'var(--text-secondary)',maxWidth:500,lineHeight:1.7}}>
            Sign up to get AI-matched to the best roles for your skills. The right job finds you.
          </p>
        </div>

        {/* Search + filters */}
        <div className="fade-up-1" style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
            <div style={{position:'relative',flex:1,minWidth:200}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-tertiary)',fontSize:14}}>🔍</span>
              <input placeholder="Search by role, skill, or company..." style={{paddingLeft:36,height:44}}/>
            </div>
            <Link href="/signup">
              <button style={{padding:'0 24px',height:44,background:'var(--accent)',border:'none',borderRadius:'var(--radius-sm)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',boxShadow:'0 4px 14px rgba(13,148,136,0.25)'}}>
                Get AI matches →
              </button>
            </Link>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {['All','Full-time','Internship','Remote','Bangalore','Mumbai','Chennai'].map((f,i)=>(
              <button key={f} className="filter-btn" style={{padding:'6px 14px',borderRadius:'var(--radius-full)',border:`1px solid ${i===0?'var(--accent)':'var(--border)'}`,background:i===0?'var(--accent)':'var(--surface-1)',color:i===0?'#fff':'var(--text-secondary)',fontSize:12,fontWeight:i===0?700:500,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* AI Match Banner */}
        <div className="fade-up-1" style={{background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:'var(--radius-lg)',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div style={{width:36,height:36,background:'var(--accent)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>✦</div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary)'}}>Sign up to unlock AI matching</div>
            <div style={{fontSize:12,color:'var(--text-secondary)'}}>Upload your resume and see which jobs match your skills — with % scores and reasons</div>
          </div>
          <Link href="/signup">
            <button style={{padding:'7px 16px',background:'var(--accent)',border:'none',borderRadius:'var(--radius-sm)',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Try for free</button>
          </Link>
        </div>

        {/* Jobs grid */}
        <div className="jobs-grid fade-up-2" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
          {jobs.map(job => (
            <div key={`${job.title}-${job.company}`} className="job-card" style={{background:'var(--surface-0)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.25rem',boxShadow:'var(--shadow-sm)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:'var(--radius-md)',background:`${job.color}20`,border:`1px solid ${job.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:job.color,fontSize:16}}>{job.company[0]}</div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span style={{background:'var(--surface-1)',color:'var(--text-secondary)',border:'1px solid var(--border)',borderRadius:'var(--radius-full)',fontSize:10,fontWeight:600,padding:'2px 8px',textTransform:'capitalize'}}>{job.type}</span>
                  <span style={{fontSize:10,color:'var(--text-tertiary)'}}>{job.posted}</span>
                </div>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary)',marginBottom:3,letterSpacing:'-.2px'}}>{job.title}</div>
              <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:10}}>{job.company} · 📍 {job.location}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:14}}>
                {job.skills.map(s=>(
                  <span key={s} style={{background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',color:'var(--accent)',borderRadius:'var(--radius-sm)',fontSize:11,padding:'3px 8px',fontWeight:500}}>{s}</span>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:14,fontWeight:700,color:'var(--accent)',letterSpacing:'-.3px'}}>{job.salary}</span>
                <Link href="/signup">
                  <button className="apply-btn" style={{padding:'7px 14px',background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:'var(--radius-sm)',color:'var(--accent)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    Apply →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{textAlign:'center',marginTop:'3rem',padding:'2.5rem',background:'var(--accent-subtle)',border:'1px solid var(--accent-border)',borderRadius:'var(--radius-xl)'}}>
          <div style={{fontSize:20,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-.5px',marginBottom:8}}>Get matched to the right job with AI</div>
          <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:'1.25rem'}}>Don't apply blindly. Sign up and let AI show you where you genuinely fit best.</div>
          <Link href="/signup">
            <button style={{padding:'11px 28px',background:'var(--accent)',border:'none',borderRadius:'var(--radius-md)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(13,148,136,0.25)'}}>
              Get AI matches →
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
