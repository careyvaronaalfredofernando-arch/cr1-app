import { useState, useRef, useEffect, useCallback } from "react";

// ─── PALETA CR1 ───────────────────────────────────────────────
const C = {
  red:    "#E8000A",
  redDim: "#7A0005",
  redGlow:"#FF2233",
  black:  "#080808",
  blackL: "#111116",
  blackM: "#1A1A20",
  blackH: "#252530",
  yellow: "#FFD600",
  yellowD:"#B89A00",
  yellowG:"#FFE55C",
  white:  "#F0F0F0",
  gray:   "#555560",
  grayL:  "#888898",
};

// ─── MÓDULOS ──────────────────────────────────────────────────
const WORKFLOWS = [
  { id:"youtube",   emoji:"▶",  label:"YouTube",    sub:"Guión · Título · SEO · Hashtags",      accent: C.red    },
  { id:"instagram", emoji:"◈",  label:"Instagram",  sub:"Caption · Reels · Stories · Tags",      accent:"#C8005A" },
  { id:"tiktok",    emoji:"◉",  label:"TikTok",     sub:"Script · Tendencias · Hooks virales",   accent:"#00C8B4" },
  { id:"document",  emoji:"◻",  label:"Documento",  sub:"Contrato · Propuesta · Reporte · Carta", accent: C.yellow },
  { id:"email",     emoji:"◎",  label:"Email",      sub:"Marketing · Profesional · Seguimiento", accent:"#FF6A00" },
  { id:"plan",      emoji:"◆",  label:"Estrategia", sub:"Plan · KPIs · Pasos · Metas",           accent:"#00D4AA" },
  { id:"content",   emoji:"✦",  label:"Contenido",  sub:"Blog · Copy · Ideas · Scripts",         accent:"#9B40FF" },
  { id:"brand",     emoji:"◐",  label:"Marca",      sub:"Nombre · Slogan · Identidad · Voz",     accent:"#FF8C00" },
];

// ─── SYSTEM PROMPTS (optimizados para rapidez y precisión) ────
const SYSTEM_PROMPTS = {
  youtube: `Eres CR1, experto en YouTube hispano. Responde SIEMPRE con estas secciones en orden, sin texto introductorio:

🎯 TÍTULOS (5 opciones con emojis, máx 60 chars)
📝 DESCRIPCIÓN SEO (300 palabras, keywords en negrita)
🎬 GUIÓN COMPLETO:
  [GANCHO 0-5s] - Frase que detiene el scroll
  [INTRO 5-30s] - Promesa del video
  [DESARROLLO] - Puntos clave con transiciones
  [CIERRE + CTA] - Suscribir, comentar, compartir
#️⃣ HASHTAGS (25 relevantes, de mayor a menor alcance)
🖼️ MINIATURA - Descripción visual detallada (texto, colores, emoción)
⏰ HORA ÓPTIMA de publicación

Sé específico, accionable, sin relleno.`,

  instagram: `Eres CR1, experto en Instagram hispano. Responde con:

📸 CAPTION PRINCIPAL (gancho en primera línea, 150 palabras)
🎬 VERSION REELS/STORIES (máx 3 líneas, directo)
💡 IDEAS VISUALES (qué grabar/fotografiar exactamente)
📣 CTA CLARO (pregunta o acción específica)
#️⃣ 30 HASHTAGS organizados: [Nicho] [Medio] [Masivo]
⏰ MEJOR HORA según nicho

Sin preambullo. Directo a las secciones.`,

  tiktok: `Eres CR1, experto en TikTok y contenido viral hispano. Responde con:

🔥 HOOK (primeros 3 segundos - texto exacto a decir en cámara)
📹 SCRIPT COMPLETO (con indicaciones de cortes y transiciones)
🎵 SONIDO/TREND recomendado
📲 TEXTO EN PANTALLA (overlays sugeridos)
🏷️ 20 HASHTAGS TikTok
⚡ TIPS DE VIRALIZACIÓN para este video

Lenguaje juvenil, energético, directo.`,

  document: `Eres CR1, especialista en documentos profesionales. Entrega el documento COMPLETO listo para usar:

- Sin explicaciones previas, empieza directo con el documento
- Usa markdown claro: # Títulos, ## Secciones, **negrita**, listas
- Incluye TODAS las cláusulas/secciones necesarias
- Al final: 3 TIPS para personalizar este documento

Calidad notarial/profesional.`,

  email: `Eres CR1, experto en copywriting y email marketing. Responde con:

📧 ASUNTO (3 versiones: con emoji / directo / urgencia)
✉️ EMAIL COMPLETO (listo para enviar)
📱 VERSIÓN CORTA MÓVIL
🔄 EMAIL DE SEGUIMIENTO (si no responden en 3 días)
📊 TIPS de tasa de apertura para este tipo de email

Tono humano, persuasivo, sin spam words.`,

  plan: `Eres CR1, consultor estratégico y coach de ejecución. Crea:

🎯 OBJETIVO CLARO (reformulado en 1 oración poderosa)
📊 DIAGNÓSTICO (dónde estás vs dónde quieres estar)
📋 PLAN DE 90 DÍAS (semana por semana, acciones concretas)
📈 KPIs (3-5 métricas para medir avance)
🛠️ RECURSOS (tiempo/dinero/personas necesarios)
⚠️ OBSTÁCULOS y cómo superarlos
⚡ ACCIÓN INMEDIATA (qué hacer HOY en los próximos 30 minutos)

Concreto, motivador, sin teoría innecesaria.`,

  content: `Eres CR1, director creativo de contenido digital hispano. Responde con:

✨ CONTENIDO COMPLETO (lo que se pidió, sin introducción)
🔄 2 VARIACIONES alternativas
📅 CALENDARIO SUGERIDO (cuándo y dónde publicar)
💡 3 IDEAS RELACIONADAS para próximos contenidos

Creativo, original, adaptado al mercado hispano.`,

  brand: `Eres CR1, experto en branding y estrategia de marca. Crea:

🏷️ NOMBRES (10 opciones con disponibilidad sugerida)
⚡ SLOGAN (5 versiones, de más formal a más creativo)
🎨 IDENTIDAD VISUAL (colores, tipografía, sensación)
🗣️ VOZ DE MARCA (tono, palabras clave, palabras a evitar)
👤 BUYER PERSONA (cliente ideal detallado)
📱 ESTRATEGIA DE PRESENCIA DIGITAL

Marca memorable, diferenciada, con propósito.`,
};

const QUICK_PROMPTS = {
  youtube:   ["Video motivacional para emprendedores jóvenes", "Review iPhone vs Android 2025", "Cómo ganar dinero con IA desde cero"],
  instagram: ["Lanzamiento de mi nuevo servicio/producto", "Post motivacional para emprendedores", "Behind the scenes de mi trabajo"],
  tiktok:    ["Video viral sobre productividad en 60s", "Trend con tip de finanzas personales", "Day in my life como emprendedor"],
  document:  ["Contrato de servicios freelance completo", "Propuesta comercial para cliente corporativo", "Plan de negocio de una página"],
  email:     ["Presentación fría a cliente potencial", "Oferta especial con urgencia real", "Recuperar cliente inactivo"],
  plan:      ["Lanzar mi negocio digital en 90 días", "Conseguir mis primeros 1000 seguidores", "Organizar mi semana para máxima productividad"],
  content:   ["Serie educativa de 7 posts sobre mi expertise", "Guía definitiva en formato carrusel", "Historia de transformación de cliente"],
  brand:     ["Marca personal para coach de negocios", "Startup de tecnología para jóvenes", "Tienda de ropa streetwear latina"],
};

// ─── LOGO CR1 TRICOLOR ────────────────────────────────────────
function LogoCR1({ size = 32 }) {
  return (
    <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: size, letterSpacing: -1, lineHeight: 1 }}>
      <span style={{ color: C.red,    textShadow: `0 0 12px ${C.redGlow}` }}>C</span>
      <span style={{ color: C.blackH, textShadow: "0 0 8px #000", WebkitTextStroke: `0.5px ${C.gray}` }}>R</span>
      <span style={{ color: C.yellow, textShadow: `0 0 12px ${C.yellowG}` }}>1</span>
    </span>
  );
}

// ─── RENDER MARKDOWN ──────────────────────────────────────────
function renderMD(text) {
  return text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/^### (.+)$/gm,"<h3>$1</h3>")
    .replace(/^## (.+)$/gm,"<h2>$1</h2>")
    .replace(/^# (.+)$/gm,"<h1>$1</h1>")
    .replace(/^(\d+)\. (.+)$/gm,'<div class="li"><span class="n">$1.</span><span>$2</span></div>')
    .replace(/^[-•] (.+)$/gm,'<div class="li"><span class="b">▸</span><span>$1</span></div>')
    .replace(/\n\n/g,"<br/><br/>")
    .replace(/\n/g,"<br/>");
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────
export default function CR1App() {
  const [phase, setPhase]               = useState("home");
  const [activeWF, setActiveWF]         = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [stream, setStream]             = useState("");
  const [copied, setCopied]             = useState(null);
  const [inputH, setInputH]             = useState(44);
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);
  const taRef      = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, stream]);

  const autoResize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "44px";
    const h = Math.min(el.scrollHeight, 120);
    el.style.height = h + "px";
    setInputH(h);
  }, []);

  const selectWF = (wf) => {
    setActiveWF(wf);
    setPhase("chat");
    setMessages([{ role:"assistant", content:`Sistema **${wf.label}** activado.\n\n${wf.sub}.\n\nDescribe exactamente qué necesitas — lo entrego completo y listo. 🔥` }]);
    setInput("");
    setTimeout(() => { inputRef.current?.focus(); }, 150);
  };

  const send = async () => {
    const txt = input.trim();
    if (!txt || loading) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "44px";
    setInputH(44);
    setLoading(true);
    setStream("");

    const newMsgs = [...messages, { role:"user", content: txt }];
    setMessages(newMsgs);

    const apiMsgs = newMsgs.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPTS[activeWF.id],
          messages: apiMsgs,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const full = (data.content || []).map(b => b.text || "").join("");

      // smooth type-in
      let i = 0;
      const tick = () => {
        if (i < full.length) {
          i = Math.min(i + 6, full.length);
          setStream(full.slice(0, i));
          requestAnimationFrame(tick);
        } else {
          setStream("");
          setMessages(prev => [...prev, { role:"assistant", content: full }]);
          setLoading(false);
        }
      };
      requestAnimationFrame(tick);
    } catch(e) {
      setMessages(prev => [...prev, { role:"assistant", content:`❌ **Error:** ${e.message || "Intenta de nuevo."}` }]);
      setLoading(false);
    }
  };

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const goHome = () => { setPhase("home"); setActiveWF(null); setMessages([]); setStream(""); };

  // ── CSS ──────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; -webkit-tap-highlight-color: transparent; }
    body { background: ${C.black}; }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-track { background:${C.black}; }
    ::-webkit-scrollbar-thumb { background:${C.redDim}; border-radius:2px; }

    /* ── GRID NEON ── */
    .cr1-grid {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background-image:
        linear-gradient(rgba(232,0,10,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,0,10,0.04) 1px, transparent 1px);
      background-size:28px 28px;
    }
    .cr1-vignette {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%);
    }

    /* ── CARDS ── */
    .wf-card {
      background: linear-gradient(145deg, ${C.blackL}, ${C.blackM});
      border:1px solid ${C.blackH};
      border-radius:10px; padding:14px 12px;
      cursor:pointer; position:relative; overflow:hidden;
      transition: border-color 0.2s, transform 0.15s;
      -webkit-user-select:none; user-select:none;
    }
    .wf-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, var(--ac), transparent);
    }
    .wf-card:active { transform:scale(0.95); border-color: var(--ac); }

    /* ── MESSAGES ── */
    .msg-u {
      background: linear-gradient(135deg,#1C0004,#150008);
      border:1px solid ${C.redDim};
      border-radius:14px 14px 3px 14px;
      padding:11px 14px; margin-left:28px;
      font-size:13px; line-height:1.55; color:#F0D0D4;
    }
    .msg-a {
      background: linear-gradient(135deg,${C.blackL},#13130F);
      border:1px solid #2A2A18;
      border-radius:14px 14px 14px 3px;
      padding:13px 15px; margin-right:28px;
      font-size:13px; line-height:1.75; color:#E8E8D8;
    }
    .msg-a h1 { font-size:14px; color:${C.yellow}; margin:12px 0 5px; font-family:'Orbitron',monospace; font-weight:700; }
    .msg-a h2 { font-size:13px; color:${C.yellow}; margin:10px 0 4px; font-weight:700; }
    .msg-a h3 { font-size:12px; color:${C.yellowD}; margin:8px 0 3px; }
    .msg-a strong { color:${C.yellowG}; }
    .msg-a em { color:#C0C0A0; font-style:normal; }
    .msg-a .li { display:flex; gap:7px; margin:3px 0; align-items:flex-start; }
    .msg-a .n  { color:${C.red}; font-weight:700; min-width:22px; font-size:12px; }
    .msg-a .b  { color:${C.red}; min-width:16px; font-size:11px; margin-top:2px; }

    /* ── INPUT ── */
    .cr1-input {
      flex:1; background:${C.blackL};
      border:1.5px solid #2A2A20;
      border-radius:10px; color:${C.white};
      padding:10px 13px; font-size:14px;
      font-family:'Share Tech Mono', monospace;
      outline:none; resize:none; line-height:1.4;
      transition: border-color 0.2s;
    }
    .cr1-input:focus { border-color:${C.red}; }
    .cr1-input::placeholder { color:#3A3A30; }

    /* ── SEND ── */
    .cr1-send {
      width:44px; height:44px; border-radius:10px; border:none;
      background: linear-gradient(135deg,${C.red},${C.redDim});
      color:#fff; font-size:20px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition: transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 0 12px ${C.redDim};
      flex-shrink:0;
    }
    .cr1-send:active:not(:disabled) { transform:scale(0.9); }
    .cr1-send:disabled { opacity:0.35; box-shadow:none; }

    /* ── QUICK ── */
    .q-btn {
      background:${C.blackM}; border:1px solid #2A2A20;
      border-radius:8px; color:${C.grayL};
      padding:7px 11px; font-size:11px;
      cursor:pointer; white-space:nowrap;
      font-family:'Share Tech Mono',monospace;
      transition: all 0.15s; flex-shrink:0;
    }
    .q-btn:active { background:${C.blackH}; color:${C.yellow}; border-color:${C.yellowD}; }

    /* ── COPY ── */
    .cp-btn {
      background:transparent; border:1px solid #2A2A20;
      border-radius:6px; color:${C.gray};
      padding:3px 9px; font-size:10px;
      cursor:pointer; font-family:'Share Tech Mono',monospace;
      transition: all 0.15s;
    }
    .cp-btn.done { border-color:${C.yellowD}; color:${C.yellow}; }
    .cp-btn:active { background:${C.blackH}; }

    /* ── BACK ── */
    .back-btn {
      background:transparent; border:1px solid ${C.blackH};
      border-radius:8px; color:${C.gray};
      padding:6px 10px; cursor:pointer;
      font-size:15px; line-height:1;
      transition: border-color 0.15s, color 0.15s;
    }
    .back-btn:active { border-color:${C.red}; color:${C.red}; }

    /* ── ANIMATIONS ── */
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
    @keyframes blink  { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scanH  { 0%{top:-4px} 100%{top:100%} }
    @keyframes glowR  { 0%,100%{box-shadow:0 0 8px ${C.redDim}} 50%{box-shadow:0 0 18px ${C.red}} }

    .pulse { animation: pulse 1.6s ease-in-out infinite; }
    .blink { animation: blink 0.9s step-end infinite; }
    .fade-up { animation: fadeUp 0.28s ease-out; }
    .glow-r { animation: glowR 2s ease-in-out infinite; }

    /* ── SCANLINE MOVING ── */
    .scanline-move {
      position:fixed; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, rgba(232,0,10,0.15), transparent);
      pointer-events:none; z-index:1;
      animation: scanH 6s linear infinite;
    }

    /* ── DOT GRID STATUS ── */
    .status-dot {
      width:7px; height:7px; border-radius:50%;
      background:${C.yellow}; box-shadow:0 0 8px ${C.yellowG};
    }

    /* ── BORDER GLOW CARD HOVER ── */
    .wf-card:hover { border-color: var(--ac); }
  `;

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily:"'Share Tech Mono', monospace",
      background: C.black,
      minHeight:"100vh", color: C.white,
      display:"flex", flexDirection:"column",
      maxWidth:480, margin:"0 auto",
      position:"relative", overflow:"hidden",
      height:"100dvh",
    }}>
      <style>{css}</style>
      <div className="cr1-grid"/>
      <div className="cr1-vignette"/>
      <div className="scanline-move"/>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header style={{
        position:"relative", zIndex:20,
        padding:"12px 16px",
        borderBottom:`1px solid ${C.blackH}`,
        background:"rgba(8,8,8,0.96)",
        backdropFilter:"blur(12px)",
        display:"flex", alignItems:"center", gap:12,
        flexShrink:0,
      }}>
        {phase === "chat" && (
          <button className="back-btn" onClick={goHome}>←</button>
        )}

        <div style={{ flex:1, display:"flex", alignItems:"center", gap:10 }}>
          <LogoCR1 size={phase==="home" ? 26 : 22} />
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color: C.gray, marginTop:1 }}>
              {phase==="home"
                ? "ASISTENTE · AUTOMATIZADO · v2.0"
                : (activeWF?.sub || "").toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {loading && (
            <span style={{ fontSize:9, color: C.red, letterSpacing:1 }} className="pulse">PROC</span>
          )}
          <div className="status-dot pulse"/>
        </div>
      </header>

      {/* ══ HOME ═════════════════════════════════════════════════ */}
      {phase === "home" && (
        <div style={{ flex:1, overflowY:"auto", padding:"20px 16px 24px", position:"relative", zIndex:1 }}>

          {/* Hero */}
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <LogoCR1 size={52}/>
            <div style={{
              fontSize:10, letterSpacing:4, color: C.gray,
              marginTop:8, marginBottom:4,
            }}>SISTEMA DE AUTOMATIZACIÓN INTELIGENTE</div>
            <div style={{
              fontSize:11, color: C.redDim, letterSpacing:2,
            }}>SELECCIONA · DESCRIBE · OBTÉN</div>
          </div>

          {/* Red accent line */}
          <div style={{
            height:1, marginBottom:20,
            background:`linear-gradient(90deg, transparent, ${C.red}, ${C.yellow}, transparent)`,
          }}/>

          {/* Módulos grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
            {WORKFLOWS.map(wf => (
              <div
                key={wf.id}
                className="wf-card"
                style={{ "--ac": wf.accent }}
                onClick={() => selectWF(wf)}
              >
                <div style={{ fontSize:22, marginBottom:7, filter:`drop-shadow(0 0 6px ${wf.accent})` }}>
                  {wf.emoji}
                </div>
                <div style={{
                  fontFamily:"'Orbitron',monospace",
                  fontSize:10, fontWeight:700,
                  color: wf.accent, letterSpacing:1, marginBottom:4,
                }}>{wf.label}</div>
                <div style={{ fontSize:9.5, color: C.gray, lineHeight:1.5 }}>{wf.sub}</div>
                <div style={{
                  position:"absolute", bottom:8, right:10,
                  fontSize:9, color: wf.accent, opacity:0.5, letterSpacing:1,
                }}>›</div>
              </div>
            ))}
          </div>

          {/* Capacidades */}
          <div style={{
            marginTop:20, padding:"14px 16px",
            background:`linear-gradient(135deg,${C.blackL},${C.blackM})`,
            border:`1px solid ${C.blackH}`,
            borderRadius:10,
            borderLeft:`3px solid ${C.red}`,
          }}>
            <div style={{
              fontSize:9, letterSpacing:3, color: C.red,
              marginBottom:10, fontFamily:"'Orbitron',monospace",
            }}>CAPACIDADES</div>
            {[
              ["▶", "Genera contenido completo listo para publicar"],
              ["▶", "YouTube · Instagram · TikTok optimizado"],
              ["▶", "Documentos, contratos y propuestas"],
              ["▶", "Emails de marketing y seguimiento"],
              ["▶", "Planes estratégicos con KPIs"],
              ["▶", "Branding y creación de marca"],
              ["▶", "Memoria de conversación en sesión"],
            ].map(([ic,txt],i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                <span style={{ color: C.yellow, fontSize:9, marginTop:1 }}>{ic}</span>
                <span style={{ fontSize:11, color: C.grayL }}>{txt}</span>
              </div>
            ))}
          </div>

          {/* Bottom branding */}
          <div style={{ textAlign:"center", marginTop:18 }}>
            <span style={{ fontSize:9, color:"#2A2A20", letterSpacing:3 }}>
              POWERED BY CLAUDE · CR1 SYSTEM
            </span>
          </div>
        </div>
      )}

      {/* ══ CHAT ═════════════════════════════════════════════════ */}
      {phase === "chat" && (
        <>
          {/* Module header strip */}
          <div style={{
            padding:"7px 16px",
            background:`linear-gradient(90deg, ${C.blackL}, ${C.blackM})`,
            borderBottom:`1px solid ${C.blackH}`,
            display:"flex", alignItems:"center", gap:8,
            flexShrink:0, position:"relative", zIndex:5,
          }}>
            <span style={{ fontSize:16, filter:`drop-shadow(0 0 5px ${activeWF?.accent})` }}>
              {activeWF?.emoji}
            </span>
            <span style={{
              fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700,
              color: activeWF?.accent, letterSpacing:2,
            }}>{activeWF?.label}</span>
            <div style={{ flex:1 }}/>
            <span style={{ fontSize:9, color: C.gray }}>CR1 ACTIVO</span>
          </div>

          {/* Messages */}
          <div style={{
            flex:1, overflowY:"auto", padding:"14px 14px 8px",
            display:"flex", flexDirection:"column", gap:13,
            position:"relative", zIndex:1,
          }}>
            {messages.map((msg,i) => (
              <div key={i} className="fade-up">
                {msg.role === "user" ? (
                  <div>
                    <div style={{ fontSize:8.5, color:"#3A1018", textAlign:"right", marginBottom:4, letterSpacing:1 }}>TÚ</div>
                    <div className="msg-u">{msg.content}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      fontSize:8.5, marginBottom:5, letterSpacing:1,
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                    }}>
                      <span style={{ color: activeWF?.accent, opacity:0.8 }}>
                        ◉ CR1 · {activeWF?.label.toUpperCase()}
                      </span>
                      <button
                        className={`cp-btn${copied===i?" done":""}`}
                        onClick={() => copy(msg.content, i)}
                      >
                        {copied===i ? "✓ COPIADO" : "COPIAR"}
                      </button>
                    </div>
                    <div className="msg-a" dangerouslySetInnerHTML={{ __html: renderMD(msg.content) }}/>
                  </div>
                )}
              </div>
            ))}

            {/* Stream */}
            {stream && (
              <div className="fade-up">
                <div style={{ fontSize:8.5, color: activeWF?.accent, opacity:0.7, marginBottom:5, letterSpacing:1 }}>
                  ◉ CR1 · {activeWF?.label.toUpperCase()}
                </div>
                <div className="msg-a">
                  <div dangerouslySetInnerHTML={{ __html: renderMD(stream) }}/>
                  <span className="blink" style={{ color: C.yellow }}>▋</span>
                </div>
              </div>
            )}

            {/* Loading dots */}
            {loading && !stream && (
              <div style={{ display:"flex", gap:5, padding:"6px 0", alignItems:"center" }}>
                <span style={{ fontSize:9, color: C.gray, letterSpacing:1 }}>PROCESANDO</span>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width:5, height:5, borderRadius:"50%",
                    background: activeWF?.accent || C.red,
                    animation:`pulse 0.9s ease-in-out ${j*0.2}s infinite`,
                  }}/>
                ))}
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{
              padding:"6px 14px 8px", flexShrink:0,
              borderTop:`1px solid ${C.blackH}`,
              position:"relative", zIndex:5,
            }}>
              <div style={{ fontSize:8, color:"#2A2A20", letterSpacing:2, marginBottom:5 }}>
                INICIO RÁPIDO
              </div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
                {(QUICK_PROMPTS[activeWF?.id]||[]).map((q,i) => (
                  <button key={i} className="q-btn" onClick={() => setInput(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div style={{
            padding:"10px 14px 14px",
            background:"rgba(8,8,8,0.97)",
            borderTop:`1px solid ${C.blackH}`,
            position:"relative", zIndex:20,
            display:"flex", gap:8, alignItems:"flex-end",
            flexShrink:0,
          }}>
            <textarea
              ref={el => { inputRef.current = el; taRef.current = el; }}
              className="cr1-input"
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={`¿Qué creo para ${activeWF?.label}?`}
              rows={1}
              style={{ height: inputH }}
            />
            <button
              className="cr1-send glow-r"
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ height: Math.max(inputH, 44) }}
            >
              ↑
            </button>
          </div>
        </>
      )}
    </div>
  );
}
