import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

const ADMIN_EMAIL    = process.env.REACT_APP_ADMIN_EMAIL    || 'admin@safeprayag.in';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'SafePrayag@Admin2025';
const API = process.env.REACT_APP_API_URL || 'https://safeprayag-ap.onrender.com';

const C = ['#FF3B5C','#7B2FBE','#F5A623','#00E676','#00B0FF','#FF6B9D','#C084FC','#34D399'];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontSize:12 }}>
      <div style={{ color:'var(--text-2)',marginBottom:3,fontSize:10,textTransform:'uppercase',letterSpacing:1 }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ color:p.color||'var(--text)',fontWeight:600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function Admin() {
  const [authed,   setAuthed]   = useState(() => sessionStorage.getItem('sp_admin') === '1');
  const [form,     setForm]     = useState({ email:'', password:'' });
  const [err,      setErr]      = useState('');
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState('overview');

  const login = e => {
    e.preventDefault();
    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('sp_admin','1');
      setAuthed(true); setErr('');
    } else {
      setErr('Invalid admin credentials');
    }
  };

  const logout = () => { sessionStorage.removeItem('sp_admin'); setAuthed(false); };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    // Fetch public stats (no auth needed for admin overview)
    fetch(`${API}/heatmap?limit=5000`)
      .then(r => r.json())
      .then(crimes => {
        // Build stats from heatmap data
        const byType = {};
        const bySev  = {};
        crimes.forEach(c => {
          byType[c.crime_type || 'Unknown'] = (byType[c.crime_type || 'Unknown'] || 0) + 1;
          bySev[c.severity   || 0]          = (bySev[c.severity   || 0]          || 0) + 1;
        });
        setData({
          total: crimes.length,
          byType: Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=>({name,count})),
          bySev:  Object.entries(bySev).sort((a,b)=>a[0]-b[0]).map(([severity,count])=>({severity:Number(severity),count})),
          highRisk: crimes.filter(c => c.severity >= 4).length,
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [authed]);

  // ── Login form ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'radial-gradient(ellipse at center, rgba(255,59,92,0.08), transparent 70%)',
        padding:'40px 20px',
      }}>
        <div style={{ width:'100%', maxWidth:400, animation:'fade-in 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{
              width:52,height:52,borderRadius:14,margin:'0 auto 14px',
              background:'linear-gradient(135deg,#FF3B5C,#7B2FBE)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
            }}>🔐</div>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:26,fontWeight:700 }}>
              SAFE<span style={{ color:'var(--red)' }}>PRAYAG</span>
            </h1>
            <p style={{ color:'var(--text-2)',fontSize:13,marginTop:5 }}>Admin Panel</p>
          </div>
          <div className="card">
            {err && <div className="alert alert-error" style={{ marginBottom:14 }}>⚠️ {err}</div>}
            <form onSubmit={login}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e=>setForm(f=>({...f,email:e.target.value}))} required
                  placeholder="admin@safeprayag.in" />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input className="form-input" type="password" value={form.password}
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))} required
                  placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ fontSize:15 }}>
                🔐 Admin Login
              </button>
            </form>
            <div style={{ textAlign:'center',marginTop:16,fontSize:12,color:'var(--text-muted)' }}>
              This is a restricted admin area. Unauthorised access is prohibited.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  const TABS = [
    { id:'overview', label:'📊 Overview' },
    { id:'crimes',   label:'🔍 Crime Data' },
    { id:'system',   label:'⚙️ System' },
  ];

  return (
    <main className="page-main">
      <div className="container">
        {/* Header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28,flexWrap:'wrap',gap:14 }}>
          <div>
            <h1 className="section-title">🔐 Admin Panel</h1>
            <div className="section-divider" />
            <p className="section-subtitle">SafePrayag system overview and management</p>
          </div>
          <div style={{ display:'flex',gap:10 }}>
            <a href="/" className="btn btn-outline btn-sm">← Back to App</a>
            <button onClick={logout} className="btn btn-sm" style={{ background:'var(--red)',color:'white',border:'none' }}>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,marginBottom:24,background:'var(--bg-card)',borderRadius:10,padding:4,border:'1px solid var(--border)',width:'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',
              fontFamily:'var(--font-cond)',fontSize:13,fontWeight:600,letterSpacing:.8,
              background: tab===t.id ? 'var(--red)' : 'transparent',
              color: tab===t.id ? 'white' : 'var(--text-2)',
              transition:'all .2s',
            }}>{t.label}</button>
          ))}
        </div>

        {loading && <div className="loading-center" style={{ minHeight:200 }}><div className="spinner"/><p>Loading admin data…</p></div>}

        {/* ── Overview Tab ── */}
        {!loading && tab === 'overview' && data && (
          <div style={{ animation:'fade-in 0.4s ease' }}>
            <div className="grid-4" style={{ marginBottom:24 }}>
              {[
                { label:'Total Crime Records', value:data.total?.toLocaleString(),       color:'red-accent',    icon:'📊' },
                { label:'High Risk Incidents', value:data.highRisk?.toLocaleString(),    color:'amber-accent',  icon:'⚠️' },
                { label:'Safe Routes',         value:'Active',                           color:'green-accent',  icon:'🗺️' },
                { label:'API Status',          value:'Online ✅',                        color:'violet-accent', icon:'🟢' },
              ].map(s => (
                <div key={s.label} className={`stat-card ${s.color}`}>
                  <div className="stat-number" style={{ fontSize:s.value.length > 6 ? 20 : 32 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-icon">{s.icon}</div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ marginBottom:24 }}>
              <div className="card">
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:18 }}>Crime by Type</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.byType} layout="vertical" barSize={14}>
                    <XAxis type="number" tick={{ fill:'var(--text-muted)',fontSize:10 }} axisLine={false}/>
                    <YAxis dataKey="name" type="category" tick={{ fill:'var(--text-2)',fontSize:10 }} width={100} axisLine={false}/>
                    <Tooltip content={<TT/>} cursor={{ fill:'rgba(255,255,255,0.03)' }}/>
                    <Bar dataKey="count" name="Count" radius={[0,4,4,0]}>
                      {data.byType?.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:18 }}>Severity Distribution</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.bySev} barSize={38}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="severity" tick={{ fill:'var(--text-muted)',fontSize:12 }} axisLine={false}/>
                    <YAxis tick={{ fill:'var(--text-muted)',fontSize:11 }} axisLine={false}/>
                    <Tooltip content={<TT/>} cursor={{ fill:'rgba(255,255,255,0.03)' }}/>
                    <Bar dataKey="count" name="Incidents" radius={[4,4,0,0]}>
                      {data.bySev?.map((_,i)=><Cell key={i} fill={C[i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── System Tab ── */}
        {tab === 'system' && (
          <div style={{ animation:'fade-in 0.4s ease' }}>
            <div className="grid-2">
              <div className="card">
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16 }}>⚙️ API Endpoints</div>
                {[
                  ['GET /health',          'Backend health check'],
                  ['POST /auth/signup',    'User registration'],
                  ['POST /auth/login',     'User authentication'],
                  ['POST /route/analyse',  'XGBoost route analysis'],
                  ['POST /sos/trigger',    'SOS + SMS alert'],
                  ['GET /stats/dashboard', 'Crime analytics'],
                  ['GET /stats/extra',     'Extended chart data'],
                  ['POST /incidents/report','Report + retrain model'],
                  ['GET /heatmap',         'Crime heatmap data'],
                  ['GET /police-stations', 'Nearest police stations'],
                ].map(([ep,desc]) => (
                  <div key={ep} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)',gap:10 }}>
                    <code style={{ fontFamily:'monospace',fontSize:12,color:'var(--red)',background:'rgba(255,59,92,0.08)',padding:'2px 7px',borderRadius:4 }}>{ep}</code>
                    <span style={{ fontSize:12,color:'var(--text-2)',textAlign:'right' }}>{desc}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:16 }}>🗄️ MongoDB Collections</div>
                {[
                  ['users',            'User accounts, guardian phones, activity counts'],
                  ['crimes',           '5000+ crime records from CSV + user reports'],
                  ['route_enquiries',  'Every route check with safety scores'],
                  ['sos_events',       'All SOS triggers with GPS and police data'],
                  ['location_updates', 'Live GPS pings during tracking'],
                ].map(([col,desc]) => (
                  <div key={col} style={{ marginBottom:14 }}>
                    <div style={{ fontFamily:'var(--font-cond)',fontWeight:700,fontSize:13,color:'var(--amber)',marginBottom:3 }}>📁 {col}</div>
                    <div style={{ fontSize:12,color:'var(--text-2)' }}>{desc}</div>
                  </div>
                ))}
                <div style={{ marginTop:20 }}>
                  <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:10 }}>🤖 ML Model</div>
                  {[
                    ['Algorithm', 'XGBoost Regressor'],
                    ['Features', 'Lat, Lon, Time, Age Group, Gender'],
                    ['Training', '5000 crime records (auto-retrains on new reports)'],
                    ['Output', 'Safety score 0–100 per location'],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex',gap:10,marginBottom:8 }}>
                      <span style={{ fontFamily:'var(--font-cond)',fontSize:11,letterSpacing:1,textTransform:'uppercase',color:'var(--text-muted)',minWidth:80 }}>{k}</span>
                      <span style={{ fontSize:12,color:'var(--text-2)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Crime Data Tab ── */}
        {tab === 'crimes' && (
          <div style={{ animation:'fade-in 0.4s ease' }} className="card">
            <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:12 }}>🔍 Crime Database Info</div>
            <div className="alert al-s" style={{ marginBottom:16 }}>
              View and manage full crime data at MongoDB Atlas → Browse Collections → safeprayag → crimes
            </div>
            {[
              ['Total Records', data?.total?.toLocaleString() || '…'],
              ['High Risk (Severity ≥ 4)', data?.highRisk?.toLocaleString() || '…'],
              ['Data Source', 'crime_data_latlong.csv (5000 records seeded at startup)'],
              ['New Reports', 'Added by users via Dashboard → Report Incident'],
              ['Auto-Retrain', 'Triggers when total records ≥ 100 after a new report'],
              ['Date Format', 'DD-MM-YYYY (used for monthly/day-wise trend charts)'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex',gap:16,padding:'10px 0',borderBottom:'1px solid var(--border)',flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-cond)',fontSize:12,letterSpacing:1,textTransform:'uppercase',color:'var(--text-muted)',minWidth:200 }}>{k}</span>
                <span style={{ fontSize:13,color:'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
