import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, HeartPulse, Moon, Brain, Wind, Thermometer, Droplets, Satellite, Bell, RefreshCw, LayoutDashboard, TrendingUp, AlertTriangle, MessageCircle, Settings, ShieldCheck, Sparkles, Send, CheckCircle2, Menu } from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "https://astrahealth-ai-backend.onrender.com";
const nav = [{id:"dashboard",label:"Dashboard",icon:LayoutDashboard},{id:"trends",label:"Health Trends",icon:TrendingUp},{id:"alerts",label:"Alerts",icon:AlertTriangle},{id:"checkin",label:"Wellbeing Check-in",icon:MessageCircle},{id:"mission",label:"Mission Info",icon:Satellite}];

function Metric({Icon,label,value,unit,tone,status}) {
  return <article className={`metric ${tone}`}><div className="metric-icon"><Icon size={22}/></div><div><span className="metric-label">{label}</span><strong>{value ?? "--"}<small>{unit}</small></strong><p><i/> {status}</p></div></article>;
}
export default function App(){
  const [data,setData]=useState(null),[history,setHistory]=useState([]),[alerts,setAlerts]=useState([]),[checkins,setCheckins]=useState([]);
  const [error,setError]=useState(""),[loading,setLoading]=useState(true),[active,setActive]=useState("dashboard"),[menuOpen,setMenuOpen]=useState(false),[message,setMessage]=useState("");
  const [form,setForm]=useState({mood:"Good",stress:3,sleep_hours:7,note:""});
  async function load(){
    setLoading(true);setError("");
    try{
      const rs=await Promise.all(["dashboard","history","alerts","checkins"].map(x=>fetch(`${API}/api/${x}`)));
      if(rs.some(r=>!r.ok)) throw new Error("API request failed");
      const [d,h,a,c]=await Promise.all(rs.map(r=>r.json()));
      setData(d);setHistory(h.items||[]);setAlerts(a.items||[]);setCheckins(c.items||[]);
    }catch(e){setError("Cannot connect to backend. Keep FastAPI running at http://127.0.0.1:8000.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{load()},[]);
  async function acknowledge(id){
    try{await fetch(`${API}/api/alerts/${id}/acknowledge`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({acknowledged:true})});load();}
    catch{setError("Could not acknowledge alert.");}
  }
  async function submit(e){
    e.preventDefault();setMessage("");
    try{
      const r=await fetch(`${API}/api/checkin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,stress:Number(form.stress),sleep_hours:Number(form.sleep_hours)})});
      if(!r.ok)throw new Error("Could not save check-in");
      setMessage("Check-in saved (demo only).");setForm({mood:"Good",stress:3,sleep_hours:7,note:""});load();
    }catch(e){setMessage(e.message);}
  }
  const v=data?.vitals||{},env=data?.environment||{},open=alerts.filter(a=>!a.acknowledged).length;
  const go=id=>{setActive(id);setMenuOpen(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"});};
  return <div className="layout">
    <aside className={`sidebar ${menuOpen?"open":""}`}>
      <div className="brand"><div className="brand-icon"><Satellite/></div><div><b>ASTRAHEALTH <em>AI</em></b><small>MONITOR · UNDERSTAND · THRIVE</small></div></div>
      <div className="crew"><span>👩‍🚀</span><div><b>Commander</b><small>Expedition crew</small></div><i/></div>
      <p className="nav-label">MISSION CONTROL</p>
      {nav.map(n=><button key={n.id} className={`nav ${active===n.id?"active":""}`} onClick={()=>go(n.id)}><n.icon size={18}/>{n.label}{n.id==="alerts"&&open>0&&<b className="count">{open}</b>}</button>)}
      <p className="nav-label">PREFERENCES</p><button className="nav" onClick={()=>setMessage("Settings will be added in a future version.")}><Settings size={18}/>Settings</button>
      <div className="mission-card"><small>CURRENT EXPEDITION</small><b>MISSION DAY</b><strong>{data?.mission_day??"--"}</strong><span>● Systems connected</span></div>
      <footer>NASA SPACE APPS CHALLENGE<br/><small>CONCEPT PROTOTYPE · 2026</small></footer>
    </aside>
    {menuOpen&&<button className="scrim" onClick={()=>setMenuOpen(false)}/>}
    <main className="main" id="dashboard">
      <header className="topbar"><button className="hamb" onClick={()=>setMenuOpen(true)}><Menu/></button><div><small>ASTRAHEALTH AI / CREW MONITORING</small><h1>Mission control</h1></div><div className="top-actions"><span className="system">● ALL SYSTEMS NOMINAL</span><button className="refresh" onClick={load}><RefreshCw size={18}/></button><span className="user">👩‍🚀 <b>Commander</b></span></div></header>
      <section className="welcome"><div><small>CREW HEALTH OVERVIEW <b className="sim">SIMULATED DATA</b></small><h2>Good day, Commander.</h2><p>Your health at a glance. Stay informed, stay mission-ready.</p></div><div className="day">MISSION DAY <b>{data?.mission_day??"--"}</b></div></section>
      {error&&<div className="error">{error}</div>}{loading&&<p className="loading">Syncing onboard health telemetry…</p>}
      <section className="block"><div className="section-title"><h3><HeartPulse/> Physical health</h3><small>LATEST CREW READINGS</small></div><div className="metrics">
        <Metric Icon={HeartPulse} label="HEART RATE" value={v.heart_rate} unit=" BPM" tone="red" status="Within demo baseline"/>
        <Metric Icon={Activity} label="SpO₂" value={v.spo2} unit="%" tone="blue" status="Demo reading"/>
        <Metric Icon={Moon} label="SLEEP" value={v.sleep_hours} unit=" H" tone="purple" status="Last sleep period"/>
        <Metric Icon={Brain} label="STRESS" value={v.stress} unit=" / 10" tone="orange" status="Daily self-report"/>
      </div></section>
      <div className="grid">
        <section className="panel" id="trends"><div className="panel-head"><div><h3>Health trends</h3><p>Seven-day crew wellness overview</p></div><span className="tag">LAST 7 DAYS</span></div><div className="legend"><span>🔵 Heart rate</span><span>🟢 SpO₂</span><span>🟠 Stress</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#32b7ff" stopOpacity={.3}/><stop offset="100%" stopColor="#32b7ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#24415d"/><XAxis dataKey="day" stroke="#829db6"/><YAxis stroke="#829db6"/><Tooltip contentStyle={{background:"#0c2036",border:"1px solid #31516e",borderRadius:9,color:"#fff"}}/><Area type="monotone" dataKey="heart_rate" stroke="#32b7ff" fill="url(#fill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div></section>
        <section className="panel" id="mission"><div className="panel-head"><div><h3>Mission environment</h3><p>Cabin and radiation telemetry</p></div><Satellite color="#50d9d2"/></div><div className="space-scene"><span>🛰️</span><small>ORBITAL HABITAT · DEMO</small></div><div className="environment">
          <div><Wind/><small>CO₂</small><b>{env.co2_ppm??"--"} <i>ppm</i></b></div><div><Thermometer/><small>Temperature</small><b>{env.cabin_temperature_c??"--"}<i> °C</i></b></div><div><Droplets/><small>Humidity</small><b>{env.humidity_percent??"--"}<i>%</i></b></div><div><Activity/><small>Radiation</small><b>{env.radiation_msv??"--"}<i> mSv</i></b></div>
        </div></section>
      </div>
      <div className="lower">
        <section className="panel summary"><ShieldCheck/><div><small>HEALTH SUMMARY</small><h3>Current status</h3><p>Review readings alongside your personal baseline and mission protocols.</p><b>● Demo data available</b></div></section>
        <section className="panel alerts" id="alerts"><div className="panel-head"><div><h3><Bell/> Alert center</h3><p>Evidence and recommended next steps</p></div><span className="tag">{open} OPEN</span></div>{alerts.map(a=><div className="alert" key={a.id}><Bell/><div><b>{a.title}</b><p>{a.evidence}</p><small>{a.recommended_action}</small></div><button disabled={a.acknowledged} onClick={()=>acknowledge(a.id)}>{a.acknowledged?<CheckCircle2/>:"Acknowledge"}</button></div>)}</section>
        <section className="panel assistant"><Sparkles/><small>ASTRA AI COMPANION</small><h3>AI Health Assistant</h3><p>Your readings are ready to review. I can explain trends using available demo data.</p><button onClick={()=>setMessage("ASTRA AI uses simulated readings and baseline comparisons. It does not diagnose.")}>View assistant insight →</button>{message&&<small className="message">{message}</small>}</section>
      </div>
      <section className="panel checkin" id="checkin"><div className="panel-head"><div><h3><Brain/> Daily wellbeing check-in</h3><p>Record a quick mood and sleep update</p></div><span className="tag">CREW WELLBEING</span></div><form onSubmit={submit}>
        <label>Mood<select value={form.mood} onChange={e=>setForm({...form,mood:e.target.value})}><option>Great</option><option>Good</option><option>Okay</option><option>Low</option><option>Stressed</option></select></label>
        <label>Stress level · {form.stress}/10<input type="range" min="0" max="10" value={form.stress} onChange={e=>setForm({...form,stress:e.target.value})}/></label>
        <label>Sleep hours<input type="number" min="0" max="24" step=".1" value={form.sleep_hours} onChange={e=>setForm({...form,sleep_hours:e.target.value})}/></label>
        <label>Optional note<textarea rows="2" maxLength="500" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="How are you feeling today?"/></label>
        <button className="submit"><Send size={15}/> Save check-in</button>
      </form>{message&&<p className="message">{message}</p>}{checkins.length>0&&<small className="saved">Saved demo check-ins: {checkins.length}</small>}</section>
      <div className="foot">ASTRAHEALTH AI · INTELLIGENT ASTRONAUT HEALTH MONITORING <span>NASA SPACE APPS CHALLENGE · CONCEPT PROPOSAL</span></div>
    </main>
  </div>;
}
