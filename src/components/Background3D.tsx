import { useEffect, useRef, useState } from 'react'

/* ─────────── Background Images for each stage ─────────── */
const bgImages = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1627645835237-0743e52b991f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
]

/* ─────────── Types ─────────── */
interface V3 { x: number; y: number; z: number; size?: number; color?: string }
interface Mote { x: number; y: number; z: number; vx: number; vy: number; vz: number; s: number; a: number; life: number; maxLife: number; hue: number; trail: { x: number; y: number }[] }

export function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)
  const filterRef = useRef<SVGFEDisplacementMapElement>(null)
  const [stage, setStage] = useState(0)
  const [prev, setPrev] = useState(0)
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const sr = useRef({ cur: 0, prv: 0, p: 1.0 })

  useEffect(() => { sr.current.cur = stage; sr.current.prv = prev; sr.current.p = 0 }, [stage, prev])

  useEffect(() => {
    const iv = setInterval(() => { setStage(s => { setPrev(s); return (s + 1) % 6 }) }, 12000)
    const mm = (e: MouseEvent) => { mouse.current.tx = (e.clientX / innerWidth) * 2 - 1; mouse.current.ty = (e.clientY / innerHeight) * 2 - 1 }
    addEventListener('mousemove', mm)
    return () => { clearInterval(iv); removeEventListener('mousemove', mm) }
  }, [])

  /* ═══════════════ MAIN ANIMATION EFFECT ═══════════════ */
  useEffect(() => {
    const cv = canvasRef.current, bv = bloomRef.current
    if (!cv || !bv) return
    const ctx = cv.getContext('2d')!, bctx = bv.getContext('2d')!
    let raf = 0, W = cv.width = bv.width = innerWidth, H = cv.height = bv.height = innerHeight, t = 0
    const resize = () => { W = cv.width = bv.width = innerWidth; H = cv.height = bv.height = innerHeight }
    addEventListener('resize', resize)

    /* ── Quality tiers ── */
    const mobile = W < 640
    const tablet = W < 1024 && !mobile
    const nDust = mobile ? 60 : tablet ? 120 : 200
    const nBokeh = mobile ? 10 : tablet ? 18 : 28
    const nBrain = mobile ? 200 : tablet ? 450 : 750
    const nEdge = mobile ? 250 : tablet ? 600 : 1100

    /* ── Camera ── */
    const cam = { x: 0, y: 0, z: 520, rx: 0, ry: 0, fov: 460, zoom: 1.0 }

    /* ── 3D Projection ── */
    const proj = (p: V3): { x: number; y: number; s: number; d: number; clip: boolean } => {
      let cx = p.x - cam.x, cy = p.y - cam.y, cz = p.z - cam.z
      const cY = Math.cos(cam.ry), sY = Math.sin(cam.ry)
      let rx = cx * cY - cz * sY, rz = cx * sY + cz * cY
      const cX = Math.cos(cam.rx), sX = Math.sin(cam.rx)
      let ry = cy * cX - rz * sX, fz = cy * sX + rz * cX
      // Liquid-glass swirl warp during transitions
      const prog = sr.current.p
      if (prog < 1) {
        const w = Math.sin(prog * Math.PI)
        if (w > 0.001) {
          const dist = Math.sqrt(rx * rx + ry * ry)
          const swirl = w * Math.max(0, 1 - dist / 550) * 2.2
          const cs = Math.cos(swirl), ss = Math.sin(swirl)
          const tx = rx * cs - ry * ss; ry = rx * ss + ry * cs; rx = tx
        }
      }
      const rs = Math.min(W, H) / 900
      const den = cam.zoom * cam.fov * rs + fz
      if (den <= 30) return { x: 0, y: 0, s: 0, d: 0, clip: true }
      const sc = (cam.zoom * cam.fov * rs) / den
      return { x: W / 2 + rx * sc * rs, y: H / 2 + ry * sc * rs, s: sc * rs, d: Math.max(0.02, Math.min(1, (1050 - fz) / 1250)), clip: false }
    }

    /* ── Glow helper ── */
    const glow = (x: number, y: number, r: number, color: string, alpha: number) => {
      if (r < 0.5) return
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, color.replace(/[\d.]+\)$/, `${alpha})`))
      g.addColorStop(0.4, color.replace(/[\d.]+\)$/, `${alpha * 0.3})`))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    /* ── Ambient particles ── */
    const dust: { x: number; y: number; z: number; s: number; sp: number; hue: number }[] = []
    for (let i = 0; i < nDust; i++) dust.push({ x: (Math.random() - .5) * 1600, y: (Math.random() - .5) * 1100, z: (Math.random() - .5) * 1000, s: Math.random() * 2.2 + .4, sp: Math.random() * .4 + .1, hue: Math.random() > .6 ? 185 : 217 })
    const bokeh: { x: number; y: number; z: number; s: number; a: number; sp: number; ps: number }[] = []
    for (let i = 0; i < nBokeh; i++) bokeh.push({ x: (Math.random() - .5) * 1400, y: (Math.random() - .5) * 900, z: (Math.random() - .5) * 700, s: Math.random() * 55 + 18, a: Math.random() * .08 + .02, sp: Math.random() * .18 + .04, ps: Math.random() * .02 + .004 })
    const energy: Mote[] = []

    /* ═══════════ GEOMETRY BUILDERS ═══════════ */

    // Stage 0: Cinema Camera
    const camBody: V3[] = []
    // Main body box
    const bx = [-95, 95], by = [-65, 65], bz = [-130, -30]
    for (const x of bx) for (const y of by) for (const z of bz) camBody.push({ x, y, z })
    // Lens barrel rings
    const lensRings: { z: number; r: number; w: number }[] = []
    for (let i = 0; i < 9; i++) lensRings.push({ z: -30 + i * 14, r: 52 - i * 1.8, w: i === 0 || i === 8 ? 2.5 : i % 2 === 0 ? 1.8 : 1.0 })

    // Stage 1: Editing workspace
    const tlPanels = [
      { cx: 0, cy: 110, cz: 15, w: 620, h: 130, label: 'TIMELINE — MULTI-TRACK NLE' },
      { cx: -220, cy: -90, cz: -25, w: 200, h: 140, label: 'PREVIEW MONITOR' },
      { cx: 220, cy: -90, cz: -25, w: 200, h: 140, label: 'COLOR GRADE / SCOPES' },
      { cx: 0, cy: -90, cz: -55, w: 160, h: 100, label: 'MOTION GRAPHICS' },
    ]

    // Stage 2: Vector design
    const splines: V3[][] = []
    for (let c = 0; c < 4; c++) { const pts: V3[] = []; const rr = 200 + c * 40; for (let i = 0; i <= 30; i++) { const th = (i / 30) * Math.PI * 2; pts.push({ x: Math.cos(th) * rr, y: Math.sin(th * 2.3) * (120 + c * 15) * .5, z: Math.sin(th) * (110 + c * 20) }) } splines.push(pts) }

    // Stage 3: IDE terminal
    const codeText = [
      'import { GrowthEngine } from "@flash/core"',
      'const pipeline = new AutomationPipeline()',
      'await pipeline.connect({ api: "v3", region: "us-east" })',
      'const analytics = await GA4.getMetrics()',
      'funnel.optimize({ target: "conversion", budget: 50000 })',
      'const agent = new AIAgent({ model: "gemini-2.5" })',
      'await agent.execute(campaignStrategy)',
      'dashboard.render({ realTime: true, kpis: metrics })',
      'export async function scaleRevenue(plan: GrowthPlan) {',
      '  const forecast = await predictiveModel.run(plan)',
      '  await deployAutomation(forecast.optimal)',
      '  return { roi: forecast.roi, timeline: plan.weeks }',
      '}',
      'server.listen(5000, () => console.log("⚡ Live"))',
    ]

    // Stage 4: Neural brain
    const brainPts: V3[] = []
    for (let i = 0; i < nBrain; i++) {
      const left = Math.random() > .5
      const th = Math.acos(Math.random() * 2 - 1), phi = Math.random() * Math.PI * 2
      let bx2 = 130 * Math.sin(th) * Math.cos(phi), by2 = 100 * Math.cos(th), bz2 = 90 * Math.sin(th) * Math.sin(phi)
      const fold = 1 + Math.sin(phi * 8) * Math.cos(th * 8) * .12
      bx2 *= fold; by2 *= fold; bz2 *= fold
      bx2 += left ? -20 : 20
      if (Math.random() > .85) { bx2 = (Math.random() - .5) * 30; by2 = 65 + Math.random() * 60; bz2 = -25 - Math.random() * 30 }
      brainPts.push({ x: bx2, y: by2 - 15, z: bz2, size: Math.random() * 2.5 + .8, color: left ? 'cyan' : 'violet' })
    }
    const brainEdges: [number, number][] = []
    let ec = 0
    for (let i = 0; i < brainPts.length && ec < nEdge; i++) {
      for (let j = i + 1; j < brainPts.length && ec < nEdge; j++) {
        const dx = brainPts[i].x - brainPts[j].x, dy = brainPts[i].y - brainPts[j].y, dz = brainPts[i].z - brainPts[j].z
        if (dx * dx + dy * dy + dz * dz < 2200) { brainEdges.push([i, j]); ec++ }
      }
    }

    // Stage 5: Growth dashboards
    const dashPanels = [
      { cx: 0, cy: 80, cz: 25, w: 280, h: 150, label: 'REVENUE GROWTH CURVE', hue: 185 },
      { cx: -250, cy: -55, cz: -15, w: 195, h: 130, label: 'KPI EFFICIENCY', hue: 217 },
      { cx: 250, cy: -55, cz: -15, w: 195, h: 130, label: 'CONVERSION FUNNEL', hue: 271 },
    ]

    /* ═══════════ RENDERING FUNCTIONS ═══════════ */

    const drawAtmosphere = () => {
      // Volumetric spotlight cone
      const spot = ctx.createRadialGradient(W / 2, H * .35, 0, W / 2, H * .5, W * .7)
      spot.addColorStop(0, 'rgba(0,60,180,.14)')
      spot.addColorStop(.35, 'rgba(0,120,255,.05)')
      spot.addColorStop(.65, 'rgba(80,0,200,.02)')
      spot.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H)

      // Horizontal light band
      const band = ctx.createLinearGradient(0, H * .4, 0, H * .6)
      band.addColorStop(0, 'rgba(0,80,255,0)')
      band.addColorStop(.5, 'rgba(0,80,255,.03)')
      band.addColorStop(1, 'rgba(0,80,255,0)')
      ctx.fillStyle = band; ctx.fillRect(0, 0, W, H)

      // Ambient dust
      dust.forEach(d => {
        d.z -= d.sp; if (d.z < -500) { d.z = 700; d.x = (Math.random() - .5) * 1600; d.y = (Math.random() - .5) * 1100 }
        const p = proj(d)
        if (!p.clip) {
          const r = Math.max(.3, d.s * p.s)
          const a = p.d * .65
          glow(p.x, p.y, r * 3, `hsla(${d.hue},100%,70%,1)`, a * .3)
          ctx.fillStyle = `hsla(${d.hue},100%,80%,${a})`
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill()
        }
      })

      // Soft bokeh orbs
      bokeh.forEach(b => {
        b.y -= b.sp; if (b.y < -500) { b.y = 600; b.x = (Math.random() - .5) * 1400 }
        const p = proj({ x: b.x, y: b.y, z: b.z })
        if (!p.clip) {
          const r = Math.max(1, b.s * p.s * (1 + Math.sin(t * b.ps) * .1))
          glow(p.x, p.y, r, 'hsla(200,100%,65%,1)', b.a * p.d)
        }
      })

      // Volumetric light rays from center
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 6; i++) {
        const angle = t * .08 + (i / 6) * Math.PI * 2
        const len = Math.min(W, H) * .45
        const x1 = W / 2 + Math.cos(angle) * 30, y1 = H / 2 + Math.sin(angle) * 30
        const x2 = W / 2 + Math.cos(angle) * len, y2 = H / 2 + Math.sin(angle) * len
        const g = ctx.createLinearGradient(x1, y1, x2, y2)
        g.addColorStop(0, `rgba(0,100,255,${.03 + Math.sin(t + i) * .01})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.strokeStyle = g; ctx.lineWidth = 1.5 + Math.sin(t * .5 + i) * .5
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      }
      ctx.restore()
    }

    /* ── Stage 0: Cinema Camera ── */
    const drawCamera = (op: number, br: number) => {
      // Camera body - wireframe with filled faces
      const verts = [
        { x: -95 * br, y: -65 * br, z: -130 }, { x: 95 * br, y: -65 * br, z: -130 },
        { x: 95 * br, y: 65 * br, z: -130 }, { x: -95 * br, y: 65 * br, z: -130 },
        { x: -95 * br, y: -65 * br, z: -30 }, { x: 95 * br, y: -65 * br, z: -30 },
        { x: 95 * br, y: 65 * br, z: -30 }, { x: -95 * br, y: 65 * br, z: -30 },
      ]
      const pv = verts.map(v => proj(v))
      if (pv.some(p => p.clip)) return

      // Fill body faces with dark glass
      const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]]
      faces.forEach(f => {
        ctx.fillStyle = `rgba(8,12,22,${op * .7})`
        ctx.beginPath()
        f.forEach((vi, i) => { if (i === 0) ctx.moveTo(pv[vi].x, pv[vi].y); else ctx.lineTo(pv[vi].x, pv[vi].y) })
        ctx.closePath(); ctx.fill()
        ctx.strokeStyle = `rgba(0,100,255,${op * .2 * pv[f[0]].d})`; ctx.lineWidth = 1; ctx.stroke()
      })

      // Brushed metal edge highlights
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
      ctx.strokeStyle = `rgba(80,120,180,${op * .4})`; ctx.lineWidth = 1.5
      edges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(pv[a].x, pv[a].y); ctx.lineTo(pv[b].x, pv[b].y); ctx.stroke() })

      // Lens barrel rings
      lensRings.forEach((ring, ri) => {
        const isCyan = ri % 2 === 0
        ctx.strokeStyle = isCyan ? `hsla(185,100%,55%,${op * .7})` : `rgba(25,35,55,${op * .85})`
        ctx.lineWidth = ring.w
        ctx.beginPath()
        for (let i = 0; i <= 48; i++) {
          const th = (i / 48) * Math.PI * 2
          const p = proj({ x: Math.cos(th) * ring.r * br, y: Math.sin(th) * ring.r * br, z: ring.z })
          if (!p.clip) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y) }
        }
        ctx.stroke()

        // Glow behind cyan rings
        if (isCyan) {
          const cp = proj({ x: 0, y: 0, z: ring.z })
          if (!cp.clip) glow(cp.x, cp.y, ring.r * cp.s * 1.3, 'hsla(185,100%,60%,1)', op * .12)
        }

        // Knurled grip ribs
        if (ri < lensRings.length - 1) {
          const nr = lensRings[ri + 1]
          ctx.strokeStyle = `rgba(0,80,200,${op * .08})`; ctx.lineWidth = .7
          for (let i = 0; i < 16; i++) {
            const th = (i / 16) * Math.PI * 2
            const p1 = proj({ x: Math.cos(th) * ring.r * br, y: Math.sin(th) * ring.r * br, z: ring.z })
            const p2 = proj({ x: Math.cos(th) * nr.r * br, y: Math.sin(th) * nr.r * br, z: nr.z })
            if (!p1.clip && !p2.clip) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke() }
          }
        }
      })

      // Aperture blades inside front lens
      const ap = proj({ x: 0, y: 0, z: lensRings[lensRings.length - 1].z })
      if (!ap.clip) {
        const ar = 18 * ap.s
        ctx.strokeStyle = `rgba(0,180,255,${op * .5})`; ctx.lineWidth = 1.2
        for (let i = 0; i < 7; i++) {
          const a1 = (i / 7) * Math.PI * 2 + t * .3
          const a2 = ((i + 1) / 7) * Math.PI * 2 + t * .3
          ctx.beginPath()
          ctx.moveTo(ap.x + Math.cos(a1) * ar, ap.y + Math.sin(a1) * ar)
          ctx.lineTo(ap.x + Math.cos(a2) * ar, ap.y + Math.sin(a2) * ar)
          ctx.stroke()
        }
      }

      // Central lens specular flare
      const lp = proj({ x: 0, y: 0, z: 0 })
      if (!lp.clip) {
        const r = 48 * lp.s
        const mx = mouse.current.x * r * .15, my = mouse.current.y * r * .15
        glow(lp.x + mx, lp.y + my, r, 'hsla(200,100%,90%,1)', op * .5)
        glow(lp.x, lp.y, r * .6, 'hsla(185,100%,60%,1)', op * .35)
        glow(lp.x - mx * .5, lp.y - my * .5, r * .3, 'hsla(270,80%,70%,1)', op * .2)
      }

      // Volumetric light beams from lens
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + t * .15
        const p1 = proj({ x: Math.cos(a) * 12, y: Math.sin(a) * 12, z: 60 })
        const p2 = proj({ x: Math.cos(a) * 6, y: Math.sin(a) * 6, z: 380 })
        if (!p1.clip && !p2.clip) {
          ctx.strokeStyle = `rgba(0,120,255,${op * .12})`; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke()
        }
      }
      ctx.restore()

      // HUD overlays
      const hudItems = [
        { pt: { x: -120, y: -80, z: -50 }, txt: 'REC', rec: true },
        { pt: { x: 120, y: -80, z: -50 }, txt: `${String(Math.floor(t) % 60).padStart(2, '0')}:${String(Math.floor(t * 24) % 24).padStart(2, '0')}` },
        { pt: { x: -120, y: 80, z: -50 }, txt: 'ARRI ALEXA  RAW  4K  60FPS' },
        { pt: { x: 120, y: 80, z: -50 }, txt: 'ISO 800  T/1.3  5600K' },
      ]
      ctx.font = '9px monospace'; ctx.textAlign = 'left'
      hudItems.forEach(h => {
        const p = proj(h.pt)
        if (!p.clip) {
          if (h.rec) {
            const blink = Math.floor(t * 2) % 2 === 0
            ctx.fillStyle = blink ? `rgba(255,50,50,${op})` : `rgba(255,50,50,${op * .3})`
            ctx.beginPath(); ctx.arc(p.x - 12, p.y - 3, 3.5, 0, Math.PI * 2); ctx.fill()
            if (blink) glow(p.x - 12, p.y - 3, 12, 'rgba(255,50,50,1)', op * .4)
          }
          ctx.fillStyle = h.rec ? `rgba(255,80,80,${op * .9 * p.d})` : `rgba(255,255,255,${op * .55 * p.d})`
          ctx.fillText(h.txt, p.x, p.y)
        }
      })
    }

    /* ── Stage 1: Video Editing Timeline ── */
    const drawTimeline = (op: number) => {
      const drawPanel = (panel: typeof tlPanels[0]) => {
        const p = proj({ x: panel.cx, y: panel.cy, z: panel.cz })
        if (p.clip) return null
        const sw = panel.w * p.s, sh = panel.h * p.s, px = p.x - sw / 2, py = p.y - sh / 2

        // Glass panel
        ctx.fillStyle = `rgba(5,8,18,${op * .75})`; ctx.fillRect(px, py, sw, sh)
        // Top bar
        ctx.fillStyle = `rgba(255,255,255,${op * .04})`; ctx.fillRect(px, py, sw, 16 * p.s)
        // Border glow
        ctx.strokeStyle = `rgba(0,100,255,${op * .3 * p.d})`; ctx.lineWidth = 1; ctx.strokeRect(px, py, sw, sh)
        // Label
        ctx.fillStyle = `rgba(255,255,255,${op * .6 * p.d})`; ctx.font = `${Math.max(7, 8 * p.s)}px monospace`; ctx.textAlign = 'left'
        ctx.fillText(panel.label, px + 8 * p.s, py + 11 * p.s)
        // Specular sweep
        const sweep = (t * 120) % (sw * 3) - sw
        const lg = ctx.createLinearGradient(px + sweep, py, px + sweep + 40 * p.s, py)
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, `rgba(255,255,255,${op * .06 * p.d})`); lg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = lg; ctx.fillRect(px, py, sw, sh)
        return { px, py, sw, sh, s: p.s, d: p.d }
      }

      // Main timeline
      const tp = drawPanel(tlPanels[0])
      if (tp) {
        const tH = 22 * tp.s
        for (let tr = 0; tr < 4; tr++) {
          const ty = tp.py + 22 * tp.s + tr * (tH + 4 * tp.s)
          // Track separator
          ctx.strokeStyle = `rgba(255,255,255,${op * .04})`; ctx.beginPath(); ctx.moveTo(tp.px, ty); ctx.lineTo(tp.px + tp.sw, ty); ctx.stroke()
          // Clips
          const clips = tr === 0 ? [[15, 90, 217], [115, 200, 185], [340, 150, 200]]
            : tr === 1 ? [[40, 240, 271], [300, 120, 217]]
            : tr === 2 ? [[25, 160, 38], [200, 130, 185], [360, 170, 217]]
            : [[60, 180, 271], [260, 200, 185]]
          clips.forEach(([cx, cw, hue]) => {
            const x = tp.px + cx * tp.s, w = cw * tp.s
            ctx.fillStyle = `hsla(${hue},80%,50%,${op * .25})`; ctx.fillRect(x, ty + 2 * tp.s, w, tH - 4 * tp.s)
            ctx.strokeStyle = `hsla(${hue},80%,60%,${op * .15})`; ctx.strokeRect(x, ty + 2 * tp.s, w, tH - 4 * tp.s)
            // Waveform
            ctx.strokeStyle = `rgba(255,255,255,${op * .2})`; ctx.lineWidth = .7; ctx.beginPath()
            for (let wx = 3; wx < cw - 3; wx += 3) {
              const h = Math.sin(wx * .12 + t * 3) * Math.cos(wx * .04) * .6 * (tH - 6 * tp.s)
              ctx.moveTo(x + wx * tp.s, ty + tH / 2 - Math.abs(h) / 2)
              ctx.lineTo(x + wx * tp.s, ty + tH / 2 + Math.abs(h) / 2)
            }; ctx.stroke()
          })
        }
        // Playhead
        const phx = tp.px + ((t * 40) % (tlPanels[0].w - 30) + 15) * tp.s
        ctx.strokeStyle = `rgba(255,60,60,${op})`; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(phx, tp.py + 16 * tp.s); ctx.lineTo(phx, tp.py + tp.sh); ctx.stroke()
        glow(phx, tp.py + tp.sh / 2, 25 * tp.s, 'rgba(255,60,60,1)', op * .15)
        // Playhead diamond
        ctx.fillStyle = `rgba(255,60,60,${op})`; ctx.beginPath()
        ctx.moveTo(phx - 4 * tp.s, tp.py + 16 * tp.s); ctx.lineTo(phx + 4 * tp.s, tp.py + 16 * tp.s); ctx.lineTo(phx, tp.py + 21 * tp.s)
        ctx.closePath(); ctx.fill()
      }

      // Preview monitor
      const pp = drawPanel(tlPanels[1])
      if (pp) {
        // Scenic wireframe
        ctx.strokeStyle = `rgba(0,200,255,${op * .35})`; ctx.lineWidth = 1
        const cx2 = pp.px + pp.sw / 2, cy2 = pp.py + pp.sh / 2 + 12 * pp.s
        ctx.beginPath(); ctx.arc(cx2, cy2 - 15 * pp.s, 16 * pp.s, 0, Math.PI * 2); ctx.stroke()
        // Mountains
        ctx.strokeStyle = `rgba(255,255,255,${op * .4})`; ctx.beginPath()
        ctx.moveTo(pp.px + 8 * pp.s, pp.py + pp.sh - 8 * pp.s)
        ctx.lineTo(pp.px + pp.sw * .35, cy2); ctx.lineTo(pp.px + pp.sw * .55, pp.py + pp.sh - 8 * pp.s)
        ctx.lineTo(pp.px + pp.sw * .75, cy2 + 8 * pp.s); ctx.lineTo(pp.px + pp.sw - 8 * pp.s, pp.py + pp.sh - 8 * pp.s)
        ctx.stroke()
      }

      // Color/scopes panel
      const sp = drawPanel(tlPanels[2])
      if (sp) {
        const scx = sp.px + sp.sw / 2, scy = sp.py + sp.sh / 2 + 10 * sp.s, sr2 = 28 * sp.s
        ctx.strokeStyle = `rgba(138,43,226,${op * .25})`; ctx.beginPath(); ctx.arc(scx, scy, sr2, 0, Math.PI * 2); ctx.arc(scx, scy, sr2 * .55, 0, Math.PI * 2); ctx.stroke()
        ctx.strokeStyle = `rgba(0,120,255,${op * .35})`; ctx.beginPath()
        for (let i = 0; i < 360; i += 5) { const th = (i / 180) * Math.PI; const len = sr2 * (.4 + Math.sin(th * 6 + t * 4) * Math.cos(th * 2.5) * .5); ctx.moveTo(scx + Math.cos(th) * sr2 * .15, scy + Math.sin(th) * sr2 * .15); ctx.lineTo(scx + Math.cos(th) * len, scy + Math.sin(th) * len) }
        ctx.stroke()
      }

      // Motion graphics panel
      drawPanel(tlPanels[3])
    }

    /* ── Stage 2: Vector Graphics ── */
    const drawVectors = (op: number) => {
      // Perspective grid
      ctx.strokeStyle = `rgba(0,80,200,${op * .07})`; ctx.lineWidth = .8
      for (let z = -200; z <= 200; z += 40) { const p1 = proj({ x: -380, y: 120, z }), p2 = proj({ x: 380, y: 120, z }); if (!p1.clip && !p2.clip) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke() } }
      for (let x = -380; x <= 380; x += 80) { const p1 = proj({ x, y: 120, z: -200 }), p2 = proj({ x, y: 120, z: 200 }); if (!p1.clip && !p2.clip) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke() } }

      // Animated spline curves with glow
      const hues = [185, 271, 38, 200]
      splines.forEach((path, idx) => {
        const animPath = path.map((pt, i) => {
          const ph = i * .25 + t * 1.4 + idx * .8
          return { x: pt.x + Math.sin(ph) * 18, y: pt.y + Math.cos(ph * .7) * 14, z: pt.z + Math.cos(ph * 1.1) * 22 }
        })
        const pp = animPath.map(p => proj(p))

        // Glow pass
        ctx.save(); ctx.globalCompositeOperation = 'lighter'
        ctx.strokeStyle = `hsla(${hues[idx]},100%,60%,${op * .15})`; ctx.lineWidth = 6
        ctx.beginPath(); let started = false
        pp.forEach(p => { if (!p.clip) { if (!started) { ctx.moveTo(p.x, p.y); started = true } else ctx.lineTo(p.x, p.y) } })
        ctx.stroke(); ctx.restore()

        // Main line
        ctx.strokeStyle = `hsla(${hues[idx]},100%,65%,${op * .8})`; ctx.lineWidth = 2
        ctx.beginPath(); started = false
        pp.forEach(p => { if (!p.clip) { if (!started) { ctx.moveTo(p.x, p.y); started = true } else ctx.lineTo(p.x, p.y) } })
        ctx.stroke()

        // Anchor points with handles
        pp.forEach((p, i) => {
          if (i % 5 === 0 && !p.clip) {
            ctx.fillStyle = `rgba(255,255,255,${op * .95})`; ctx.fillRect(p.x - 3.5 * p.s, p.y - 3.5 * p.s, 7 * p.s, 7 * p.s)
            ctx.strokeStyle = `hsla(${hues[idx]},100%,60%,${op * .8})`; ctx.lineWidth = 1; ctx.strokeRect(p.x - 3.5 * p.s, p.y - 3.5 * p.s, 7 * p.s, 7 * p.s)
            glow(p.x, p.y, 8 * p.s, `hsla(${hues[idx]},100%,60%,1)`, op * .3)
            // Handles
            const ph = i * .35 + t * 1.8
            const hx = Math.sin(ph) * 40, hy = Math.cos(ph) * 30
            const h1 = proj({ x: animPath[i].x - hx, y: animPath[i].y - hy, z: animPath[i].z })
            const h2 = proj({ x: animPath[i].x + hx, y: animPath[i].y + hy, z: animPath[i].z })
            ctx.strokeStyle = `rgba(255,255,255,${op * .2})`; ctx.lineWidth = .7
            if (!h1.clip) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(h1.x, h1.y); ctx.stroke(); ctx.fillStyle = `hsla(185,100%,65%,${op * .8})`; ctx.beginPath(); ctx.arc(h1.x, h1.y, 3 * p.s, 0, Math.PI * 2); ctx.fill() }
            if (!h2.clip) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(h2.x, h2.y); ctx.stroke(); ctx.fillStyle = `hsla(185,100%,65%,${op * .8})`; ctx.beginPath(); ctx.arc(h2.x, h2.y, 3 * p.s, 0, Math.PI * 2); ctx.fill() }
          }
        })
      })

      // Rotating wireframe shapes
      const drawWireShape = (cx: number, cy: number, cz: number, size: number, hue: number, speed: number) => {
        const a = t * speed
        const verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([vx,vy,vz]) => {
          const rx = vx * Math.cos(a) - vz * Math.sin(a), rz = vx * Math.sin(a) + vz * Math.cos(a)
          const ry2 = vy * Math.cos(a * .7) - rz * Math.sin(a * .7), rz2 = vy * Math.sin(a * .7) + rz * Math.cos(a * .7)
          return proj({ x: cx + rx * size, y: cy + ry2 * size, z: cz + rz2 * size })
        })
        ctx.strokeStyle = `hsla(${hue},80%,60%,${op * .45})`; ctx.lineWidth = 1
        const edges2 = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
        edges2.forEach(([a2,b2]) => { if (!verts[a2].clip && !verts[b2].clip) { ctx.beginPath(); ctx.moveTo(verts[a2].x, verts[a2].y); ctx.lineTo(verts[b2].x, verts[b2].y); ctx.stroke() } })
      }
      drawWireShape(-240, -60, -30, 30, 38, .8)
      drawWireShape(260, -40, 20, 22, 185, .6)
    }

    /* ── Stage 3: Terminal / IDE ── */
    const drawTerminal = (op: number) => {
      const p = proj({ x: 0, y: 0, z: 0 })
      if (p.clip) return
      const sw = 560 * p.s, sh = 340 * p.s, px = p.x - sw / 2, py = p.y - sh / 2

      // Screen glass
      ctx.fillStyle = `rgba(4,6,14,${op * .82})`; ctx.fillRect(px, py, sw, sh)
      ctx.strokeStyle = `rgba(138,43,226,${op * .3 * p.d})`; ctx.lineWidth = 1; ctx.strokeRect(px, py, sw, sh)
      // Screen edge glow
      glow(p.x, p.y, Math.max(sw, sh) * .6, 'rgba(138,43,226,1)', op * .04)

      // Title bar
      ctx.fillStyle = `rgba(255,255,255,${op * .04})`; ctx.fillRect(px, py, sw, 20 * p.s)
      const dots = ['#EF4444', '#F59E0B', '#10B981']
      dots.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(px + (12 + i * 14) * p.s, py + 10 * p.s, 3.5 * p.s, 0, Math.PI * 2); ctx.fill() })
      ctx.fillStyle = `rgba(255,255,255,${op * .65})`; ctx.font = `${Math.max(7, 8 * p.s)}px monospace`; ctx.textAlign = 'left'
      ctx.fillText('flash-growth // automation-engine.ts', px + 62 * p.s, py + 13 * p.s)

      // Scrolling code
      const fs = Math.max(8, 11 * p.s)
      ctx.font = `${fs}px monospace`
      const startLine = Math.floor(t * 1.5) % codeText.length
      for (let i = 0; i < 12; i++) {
        const li = (startLine + i) % codeText.length
        const ly = py + 38 * p.s + i * (fs + 5 * p.s)
        if (ly > py + sh - 10 * p.s) break
        const line = codeText[li]
        // Syntax coloring
        if (line.match(/import|const|await|export|async|function|return/)) ctx.fillStyle = `hsla(185,100%,65%,${op * .9})`
        else if (line.match(/\/\/|console/)) ctx.fillStyle = `rgba(255,255,255,${op * .3})`
        else if (line.match(/['"]/)) ctx.fillStyle = `hsla(38,100%,60%,${op * .85})`
        else ctx.fillStyle = `rgba(255,255,255,${op * .7})`
        ctx.fillText(line, px + 18 * p.s, ly)
      }

      // CRT scanlines
      ctx.fillStyle = `rgba(255,255,255,${op * .015})`
      for (let sy = py + 20 * p.s; sy < py + sh; sy += 3 * p.s) ctx.fillRect(px, sy, sw, 1 * p.s)

      // Server & database nodes
      const nodes = [
        { pt: { x: -300, y: -70, z: 40 }, label: 'render-server', hue: 217 },
        { pt: { x: 300, y: -70, z: 40 }, label: 'postgres-db', hue: 185 },
        { pt: { x: -300, y: 80, z: 60 }, label: 'redis-cache', hue: 271 },
        { pt: { x: 300, y: 80, z: 60 }, label: 'cdn-edge', hue: 38 },
      ]
      nodes.forEach(n => {
        const np = proj(n.pt)
        if (np.clip) return
        const nw = 40 * np.s, nh = 50 * np.s
        ctx.fillStyle = `rgba(5,8,16,${op * .7})`; ctx.fillRect(np.x - nw / 2, np.y - nh / 2, nw, nh)
        ctx.strokeStyle = `hsla(${n.hue},80%,55%,${op * .35})`; ctx.lineWidth = 1; ctx.strokeRect(np.x - nw / 2, np.y - nh / 2, nw, nh)
        glow(np.x, np.y, 25 * np.s, `hsla(${n.hue},100%,60%,1)`, op * .1)
        // Blinking status dot
        ctx.fillStyle = Math.floor(t * 3 + n.hue) % 3 === 0 ? `hsla(${n.hue},100%,65%,${op})` : `rgba(255,255,255,${op * .2})`
        ctx.beginPath(); ctx.arc(np.x - nw / 2 + 8 * np.s, np.y - nh / 2 + 8 * np.s, 2.5 * np.s, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(255,255,255,${op * .5})`; ctx.font = `${Math.max(6, 7 * np.s)}px monospace`
        ctx.fillText(n.label, np.x - nw / 2, np.y - nh / 2 - 5 * np.s)

        // Connection lines to center terminal with sliding packets
        ctx.strokeStyle = `hsla(${n.hue},60%,50%,${op * .12})`; ctx.lineWidth = 1
        const ex = n.pt.x > 0 ? np.x - nw / 2 : np.x + nw / 2
        const targetX = n.pt.x > 0 ? px + sw : px
        ctx.beginPath(); ctx.moveTo(ex, np.y); ctx.lineTo(targetX, p.y); ctx.stroke()
        // Packet dot
        const pct = (t * .4 + n.hue * .01) % 1
        const dx = ex + (targetX - ex) * pct, dy = np.y + (p.y - np.y) * pct
        ctx.fillStyle = `hsla(${n.hue},100%,65%,${op})`; ctx.beginPath(); ctx.arc(dx, dy, 3 * np.s, 0, Math.PI * 2); ctx.fill()
        glow(dx, dy, 10 * np.s, `hsla(${n.hue},100%,60%,1)`, op * .25)
      })
    }

    /* ── Stage 4: Neural Brain ── */
    const drawBrain = (op: number, pulse: number) => {
      const ay = t * .3, ax = Math.sin(t * .15) * .12
      const rotated = brainPts.map(n => {
        let rx = n.x * Math.cos(ay) - n.z * Math.sin(ay), rz = n.x * Math.sin(ay) + n.z * Math.cos(ay)
        let ry = n.y * Math.cos(ax) - rz * Math.sin(ax); rz = n.y * Math.sin(ax) + rz * Math.cos(ax)
        return { x: rx * pulse, y: ry * pulse, z: rz * pulse, color: n.color, size: n.size || 2 }
      })
      const pp = rotated.map(n => ({ ...proj(n), color: n.color, size: n.size }))

      // Synapse edges (back-to-front depth coloring)
      ctx.lineWidth = .6
      brainEdges.forEach(([a, b]) => {
        const p1 = pp[a], p2 = pp[b]
        if (!p1.clip && !p2.clip) {
          const avgD = (p1.d + p2.d) / 2
          const hue = p1.color === 'cyan' ? 185 : 271
          ctx.strokeStyle = `hsla(${hue},100%,60%,${op * avgD * .25})`
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke()
        }
      })

      // Nodes with volumetric glow
      const sorted = pp.map((p2, i) => ({ ...p2, i })).sort((a, b) => a.d - b.d)
      sorted.forEach(p2 => {
        if (!p2.clip) {
          const r = Math.max(.3, (p2.size || 2) * p2.s * 1.5)
          const hue = p2.color === 'cyan' ? 185 : 271
          glow(p2.x, p2.y, r * 2.5, `hsla(${hue},100%,70%,1)`, op * p2.d * .4)
          ctx.fillStyle = `hsla(${hue},100%,85%,${op * p2.d})`
          ctx.beginPath(); ctx.arc(p2.x, p2.y, r, 0, Math.PI * 2); ctx.fill()
        }
      })

      // Electric impulses
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 25; i++) {
        const ei = Math.floor((t * 6 + i * 19.7) % brainEdges.length)
        const [a, b] = brainEdges[ei]
        const p1 = pp[a], p2 = pp[b]
        if (!p1.clip && !p2.clip) {
          const flow = (t * 2 + i * .15) % 1
          const fx = p1.x + (p2.x - p1.x) * flow, fy = p1.y + (p2.y - p1.y) * flow
          glow(fx, fy, 8 * p1.s, 'hsla(185,100%,90%,1)', op * .5)
          ctx.fillStyle = `rgba(255,255,255,${op * .9})`; ctx.beginPath(); ctx.arc(fx, fy, Math.max(.3, 2 * p1.s), 0, Math.PI * 2); ctx.fill()
        }
      }
      ctx.restore()

      // Brain core glow
      const cp = proj({ x: 0, y: -15, z: 0 })
      if (!cp.clip) glow(cp.x, cp.y, 100 * cp.s, 'hsla(200,100%,50%,1)', op * .08)
    }

    /* ── Stage 5: Growth Analytics ── */
    const drawDashboard = (op: number) => {
      dashPanels.forEach((panel, idx) => {
        const pp = proj({ x: panel.cx, y: panel.cy + Math.sin(t * 1.3 + idx * 1.2) * 8, z: panel.cz })
        if (pp.clip) return
        const sw = panel.w * pp.s, sh = panel.h * pp.s, px = pp.x - sw / 2, py = pp.y - sh / 2

        ctx.fillStyle = `rgba(5,8,18,${op * .75})`; ctx.fillRect(px, py, sw, sh)
        ctx.strokeStyle = `hsla(${panel.hue},80%,55%,${op * .3 * pp.d})`; ctx.lineWidth = 1; ctx.strokeRect(px, py, sw, sh)
        glow(pp.x, pp.y, Math.max(sw, sh) * .4, `hsla(${panel.hue},100%,50%,1)`, op * .06)
        ctx.fillStyle = `rgba(255,255,255,${op * .5 * pp.d})`; ctx.font = `${Math.max(6, 8 * pp.s)}px monospace`; ctx.textAlign = 'left'
        ctx.fillText(panel.label, px + 8 * pp.s, py + 12 * pp.s)

        if (idx === 0) {
          // Growth curve
          ctx.save(); ctx.globalCompositeOperation = 'lighter'
          ctx.strokeStyle = `hsla(185,100%,60%,${op * .3})`; ctx.lineWidth = 6
          ctx.beginPath()
          for (let x = 10; x < panel.w - 10; x += 6) { const r = x / (panel.w - 20); const y = panel.h - 18 - Math.pow(r, 2.5) * (panel.h - 35); if (x === 10) ctx.moveTo(px + x * pp.s, py + y * pp.s); else ctx.lineTo(px + x * pp.s, py + y * pp.s) }
          ctx.stroke(); ctx.restore()
          // Main line
          ctx.strokeStyle = `hsla(185,100%,60%,${op * .85})`; ctx.lineWidth = 2
          ctx.beginPath()
          for (let x = 10; x < panel.w - 10; x += 6) { const r = x / (panel.w - 20); const y = panel.h - 18 - Math.pow(r, 2.5) * (panel.h - 35); if (x === 10) ctx.moveTo(px + x * pp.s, py + y * pp.s); else ctx.lineTo(px + x * pp.s, py + y * pp.s) }
          ctx.stroke()
          // Area fill
          ctx.fillStyle = `hsla(185,100%,50%,${op * .08})`; ctx.beginPath()
          ctx.moveTo(px + 10 * pp.s, py + sh - 18 * pp.s)
          for (let x = 10; x < panel.w - 10; x += 6) { const r = x / (panel.w - 20); const y = panel.h - 18 - Math.pow(r, 2.5) * (panel.h - 35); ctx.lineTo(px + x * pp.s, py + y * pp.s) }
          ctx.lineTo(px + (panel.w - 10) * pp.s, py + sh - 18 * pp.s); ctx.closePath(); ctx.fill()
        }
        if (idx === 1) {
          // Bar chart
          for (let b = 0; b < 6; b++) {
            const bh = (20 + b * 14 + Math.sin(t + b) * 5) * pp.s, bw = 18 * pp.s
            const bx = px + (16 + b * 28) * pp.s, by2 = py + sh - 12 * pp.s - bh
            ctx.fillStyle = `hsla(217,80%,55%,${op * .4})`; ctx.fillRect(bx, by2, bw, bh)
            ctx.strokeStyle = `rgba(255,255,255,${op * .15})`; ctx.strokeRect(bx, by2, bw, bh)
            glow(bx + bw / 2, by2, 10 * pp.s, 'hsla(217,100%,60%,1)', op * .08)
          }
        }
        if (idx === 2) {
          // Funnel rings
          const rings = [{ ry2: 25, r: 45 }, { ry2: 48, r: 32 }, { ry2: 71, r: 20 }, { ry2: 94, r: 9 }]
          ctx.strokeStyle = `hsla(271,80%,60%,${op * .5})`; ctx.lineWidth = 1.2
          rings.forEach(ring => { ctx.beginPath(); ctx.ellipse(px + sw / 2, py + ring.ry2 * pp.s, ring.r * pp.s, 5 * pp.s, 0, 0, Math.PI * 2); ctx.stroke() })
          // Connector lines
          ctx.strokeStyle = `rgba(255,255,255,${op * .12})`
          ctx.beginPath(); ctx.moveTo(px + sw / 2 - rings[0].r * pp.s, py + rings[0].ry2 * pp.s); ctx.lineTo(px + sw / 2 - rings[3].r * pp.s, py + rings[3].ry2 * pp.s)
          ctx.moveTo(px + sw / 2 + rings[0].r * pp.s, py + rings[0].ry2 * pp.s); ctx.lineTo(px + sw / 2 + rings[3].r * pp.s, py + rings[3].ry2 * pp.s); ctx.stroke()
          // Dripping particles
          for (let i = 0; i < 5; i++) {
            const dy = (t * 40 + i * 25) % (rings[3].ry2 - rings[0].ry2)
            const ratio = dy / (rings[3].ry2 - rings[0].ry2)
            const cr = rings[0].r * (1 - ratio) + rings[3].r * ratio
            const cx2 = px + sw / 2 + (Math.random() - .5) * cr * pp.s * .5
            const cy2 = py + (rings[0].ry2 + dy) * pp.s
            ctx.fillStyle = `hsla(271,80%,70%,${op * (1 - ratio) * .6})`; ctx.beginPath(); ctx.arc(cx2, cy2, 2 * pp.s, 0, Math.PI * 2); ctx.fill()
          }
        }
      })

      // KPI labels
      const kpis = [
        { text: '+452% ROI', pos: { x: -200, y: 110, z: -5 } },
        { text: 'ROAS 6.2X', pos: { x: 200, y: 110, z: -5 } },
        { text: '$2.4M ARR', pos: { x: 0, y: -120, z: -10 } },
      ]
      kpis.forEach(k => {
        const kp = proj(k.pos)
        if (!kp.clip) {
          const fs2 = Math.max(10, 16 * kp.s)
          ctx.font = `bold ${fs2}px "Sora", sans-serif`; ctx.textAlign = 'center'
          // Glow behind text
          glow(kp.x, kp.y, fs2 * 2, 'hsla(185,100%,50%,1)', op * .15 * kp.d)
          ctx.fillStyle = `hsla(185,100%,70%,${op * kp.d})`; ctx.fillText(k.text, kp.x, kp.y)
        }
      })
    }

    /* ── Vortex loop transition ── */
    const drawVortex = (prog: number) => {
      const cp = proj({ x: 0, y: 0, z: -10 })
      if (cp.clip) return
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 80; i++) {
        const a = t * 7 + (i / 80) * Math.PI * 20
        const maxR = Math.min(W, H) * .42
        const r = maxR * (1 - prog) * (1 - i / 80)
        const vx = cp.x + Math.cos(a) * r, vy = cp.y + Math.sin(a) * r
        const size = Math.max(.3, 5 * prog * (1 - i / 80))
        glow(vx, vy, size * 3, 'hsla(185,100%,65%,1)', prog * (1 - i / 80) * .4)
        ctx.fillStyle = `hsla(200,100%,70%,${prog * (1 - i / 80) * .8})`
        ctx.beginPath(); ctx.arc(vx, vy, size, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
    }

    /* ── Energy ribbons ── */
    const spawnEnergy = (hue: number) => {
      for (let i = 0; i < (mobile ? 20 : 50); i++) {
        const th = Math.random() * Math.PI * 2, r = 200 + Math.random() * 180
        energy.push({ x: Math.cos(th) * r, y: Math.sin(th) * r, z: (Math.random() - .5) * 400, vx: (Math.random() - .5) * 9, vy: (Math.random() - .5) * 9, vz: (Math.random() - .5) * 12, s: Math.random() * 2 + .5, a: 1, life: 0, maxLife: 50 + Math.random() * 30, hue, trail: [] })
      }
    }
    const drawEnergy = () => {
      for (let i = energy.length - 1; i >= 0; i--) {
        const m = energy[i]
        m.life++; if (m.life >= m.maxLife) { energy.splice(i, 1); continue }
        const ang = t * .05; const rx = m.x * Math.cos(ang) - m.z * Math.sin(ang); m.z = m.x * Math.sin(ang) + m.z * Math.cos(ang); m.x = rx + m.vx; m.y += m.vy
        const p = proj(m)
        if (!p.clip) m.trail.push({ x: p.x, y: p.y }); if (m.trail.length > 10) m.trail.shift()
        if (m.trail.length >= 2) {
          const fade = 1 - m.life / m.maxLife
          ctx.strokeStyle = `hsla(${m.hue},100%,65%,${m.a * fade * .5})`; ctx.lineWidth = m.s * 1.5
          ctx.beginPath(); ctx.moveTo(m.trail[0].x, m.trail[0].y)
          m.trail.forEach(tp => ctx.lineTo(tp.x, tp.y)); ctx.stroke()
          // Glow on head
          const head = m.trail[m.trail.length - 1]
          glow(head.x, head.y, 6, `hsla(${m.hue},100%,70%,1)`, fade * .3)
        }
      }
    }

    /* ═══════════ MAIN LOOP ═══════════ */
    let lastStage = 0

    const render = () => {
      // Full clear for clean compositing
      ctx.fillStyle = 'rgba(3,3,5,1)'; ctx.fillRect(0, 0, W, H)
      t += .016

      // Mouse interpolation
      const m = mouse.current; m.x += (m.tx - m.x) * .06; m.y += (m.ty - m.y) * .06
      // Camera
      const prog = sr.current.p
      cam.zoom += ((prog < 1 ? 1.2 : 1) - cam.zoom) * .04
      cam.ry = t * .035 + m.x * .1
      cam.rx = -.03 + m.y * .07

      // Advance transition
      if (sr.current.p < 1) { sr.current.p += .012; if (sr.current.p >= 1) sr.current.p = 1 }

      // Trigger energy ribbons on stage change
      const cs = sr.current.cur
      if (lastStage !== cs) { spawnEnergy([185, 217, 271, 38, 200, 185][cs % 6]); lastStage = cs }

      // Draw atmosphere
      drawAtmosphere()

      // Breathing values
      const breath = 1 + Math.sin(t * .55) * .015
      const brainPulse = 1 + Math.sin(t * 1.5) * .04

      // Vortex for 5→0 loop
      const ps = sr.current.prv
      if (ps === 5 && cs === 0 && prog < 1) drawVortex(prog)

      // Stage draw helper
      const drawS = (idx: number, o: number) => {
        if (idx === 0) drawCamera(o, breath)
        if (idx === 1) drawTimeline(o)
        if (idx === 2) drawVectors(o)
        if (idx === 3) drawTerminal(o)
        if (idx === 4) drawBrain(o, brainPulse)
        if (idx === 5) drawDashboard(o)
      }

      // Crossfade
      if (prog < 1) {
        drawS(ps, 1 - prog)
        drawS(cs, prog)
        if (filterRef.current) filterRef.current.setAttribute('scale', String(Math.sin(prog * Math.PI) * 70))
      } else {
        drawS(cs, 1)
        if (filterRef.current) filterRef.current.setAttribute('scale', '0')
      }

      // Energy ribbons
      drawEnergy()

      // Bloom pass: copy bright areas to bloom canvas with blur
      bctx.clearRect(0, 0, W, H)
      bctx.filter = `blur(${mobile ? 12 : 20}px)`
      bctx.globalCompositeOperation = 'lighter'
      bctx.drawImage(cv, 0, 0)
      bctx.filter = 'none'

      raf = requestAnimationFrame(render)
    }

    render()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [stage, prev])

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Background images with blend */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, filter: 'url(#glass-warp)', backgroundColor: '#030305' }}>
        {bgImages.map((src, i) => {
          const show = stage === i || prev === i
          return show && (
            <img key={src} src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: stage === i ? .28 : 0, mixBlendMode: 'screen', transition: 'opacity 1s cubic-bezier(.4,0,.2,1)' }} />
          )
        })}
      </div>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(3,3,5,.02) 15%, rgba(3,3,5,.6) 55%, rgba(3,3,5,1) 100%)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Main canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 2 }} />

      {/* Bloom overlay canvas */}
      <canvas ref={bloomRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 3, opacity: .35, mixBlendMode: 'screen', pointerEvents: 'none' }} />

      {/* SVG displacement filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glass-warp">
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4" result="noise" />
            <feDisplacementMap ref={filterRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Stage indicator */}
      <div style={{ position: 'absolute', bottom: 24, left: 24, display: 'flex', flexDirection: 'column', gap: 6, fontFamily: '"Sora", sans-serif', fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase', zIndex: 10 }}>
        <span style={{ fontWeight: 800, color: '#0066FF' }}>FLASH GROWTH — DIGITAL ECOSYSTEM</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {['CINEMATOGRAPHY', 'POST-PRODUCTION', 'CREATIVE DESIGN', 'ENGINEERING', 'AI AUTOMATION', 'GROWTH ANALYTICS'].map((name, i) => (
            <span key={name} style={{ color: stage === i ? '#fff' : 'rgba(255,255,255,.3)', fontWeight: stage === i ? 800 : 400, transition: 'color .4s' }}>
              {i + 1}. {name}{i < 5 ? ' →' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
