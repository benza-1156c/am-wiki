export function formatSkillHtml(html: any): string {
  if (!html) return ''
  let text = ''
  if (typeof html === 'string') {
    text = html
  } else if (typeof html === 'object') {
    text = Object.values(html).join('<br/><br/>')
  } else {
    text = String(html)
  }
  return text
    .replace(/<font color=['"]?([^'">]+)['"]?>/gi, '<span class="font-bold px-1.5 py-0.5 mx-0.5 rounded bg-white/10 text-shadow-sm inline-block" style="color: $1">')
    .replace(/<\/font>/gi, '</span>')
    .replace(/<u>(.*?)<\/u>/gi, '<span class="underline decoration-cyan-400 decoration-2 font-medium">$1</span>')
}

export function cleanHtml(raw: any): string {
  if (!raw) return ''
  let text = ''
  if (typeof raw === 'string') {
    text = raw
  } else if (typeof raw === 'object') {
    text = Object.values(raw).join(' • ')
  } else {
    text = String(raw)
  }
  return text.replace(/<[^>]*>/g, '').trim()
}

export function formatNumber(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0'
  const rounded = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return rounded.toLocaleString('en-US')
}

export function getSeriesName(code: string | undefined): string {
  if (!code) return 'Other'
  const map: Record<string, string> = {
    Fate: 'Fate',
    Ragnarok: 'Record of Ragnarok',
    JJK: 'Jujutsu Kaisen',
    NRT: 'Naruto',
    Wistoria: 'Wistoria: Wand and Sword',
    DGB: 'Dragon Ball',
    DBZ: 'Dragon Ball Z',
    OnePiece: 'One Piece',
    OP: 'One Piece',
    DMSlayer: 'Demon Slayer',
    DN: 'Death Note'
  }
  return map[code] || code
}

export function getRarityConfig(rarity: string | undefined) {
  const r = (rarity || '').toLowerCase()
  switch (r) {
    case 'secret':
      return {
        label: 'SECRET',
        border: 'border-fuchsia-500/70',
        bg: 'from-fuchsia-950/60 via-purple-950/40 to-slate-900/80',
        badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(217,70,239,0.35)]',
        accent: '#d946ef',
        text: 'text-fuchsia-400'
      }
    case 'mysterious':
      return {
        label: 'MYSTERIOUS',
        border: 'border-pink-500/70',
        bg: 'from-pink-950/60 via-rose-950/40 to-slate-900/80',
        badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.35)]',
        accent: '#f43f5e',
        text: 'text-pink-400'
      }
    case 'mythic':
      return {
        label: 'MYTHIC',
        border: 'border-red-500/70',
        bg: 'from-red-950/60 via-rose-950/40 to-slate-900/80',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(239,68,68,0.35)]',
        accent: '#ef4444',
        text: 'text-red-400'
      }
    case 'exclusive':
      return {
        label: 'EXCLUSIVE',
        border: 'border-orange-500/70',
        bg: 'from-orange-950/60 via-amber-950/40 to-slate-900/80',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(249,115,22,0.35)]',
        accent: '#f97316',
        text: 'text-orange-400'
      }
    case 'legendary':
      return {
        label: 'LEGENDARY',
        border: 'border-amber-500/70',
        bg: 'from-amber-950/60 via-yellow-950/40 to-slate-900/80',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.35)]',
        accent: '#f59e0b',
        text: 'text-amber-400'
      }
    case 'epic':
      return {
        label: 'EPIC',
        border: 'border-purple-500/70',
        bg: 'from-purple-950/60 via-violet-950/40 to-slate-900/80',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(168,85,247,0.35)]',
        accent: '#a855f7',
        text: 'text-purple-400'
      }
    case 'rare':
      return {
        label: 'RARE',
        border: 'border-blue-500/70',
        bg: 'from-blue-950/60 via-indigo-950/40 to-slate-900/80',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        glow: 'shadow-[0_0_20px_-3px_rgba(59,130,246,0.35)]',
        accent: '#3b82f6',
        text: 'text-blue-400'
      }
    default:
      return {
        label: rarity?.toUpperCase() || 'COMMON',
        border: 'border-slate-600/70',
        bg: 'from-slate-900/70 via-slate-800/40 to-slate-900/80',
        badge: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
        glow: 'shadow-[0_0_15px_-3px_rgba(100,116,139,0.2)]',
        accent: '#94a3b8',
        text: 'text-slate-400'
      }
  }
}

export function getRobloxImageUrl(icon: string | undefined): string | null {
  if (!icon) return null
  const match = icon.match(/rbxassetid:\/\/(\d+)/) || icon.match(/(\d{6,})/)
  if (match && match[1] && match[1] !== '0') {
    return `https://assetdelivery.roblox.com/v1/asset/?id=${match[1]}`
  }
  return null
}

export function getUnitIcon(name: string | undefined): string {
  const n = (name || '').toLowerCase()
  if (n.includes('saber') || n.includes('lancer') || n.includes('archer') || n.includes('zoro') || n.includes('kojiro')) {
    return 'i-lucide-swords'
  }
  if (n.includes('gojo') || n.includes('sukuna') || n.includes('yuta') || n.includes('choso')) {
    return 'i-lucide-sparkles'
  }
  if (n.includes('goku') || n.includes('vegeta') || n.includes('broly') || n.includes('yamcha')) {
    return 'i-lucide-zap'
  }
  if (n.includes('luffy') || n.includes('doflamingo') || n.includes('kizaru')) {
    return 'i-lucide-compass'
  }
  if (n.includes('tanjiro') || n.includes('nezuko') || n.includes('akaza') || n.includes('gyutaro')) {
    return 'i-lucide-flame'
  }
  if (n.includes('ryuk')) {
    return 'i-lucide-skull'
  }
  if (n.includes('buddha') || n.includes('qinshi')) {
    return 'i-lucide-crown'
  }
  if (n.includes('elfaria') || n.includes('will') || n.includes('colette')) {
    return 'i-lucide-wand'
  }
  return 'i-lucide-shield'
}

export function getElementConfig(element: string | undefined) {
  const e = (element || '').toLowerCase()
  switch (e) {
    case 'luminus':
    case 'luminous':
      return { uiIcon: 'i-lucide-sun', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-400/30', label: 'Luminus' }
    case 'flora':
    case 'nature':
      return { uiIcon: 'i-lucide-leaf', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-400/30', label: 'Flora' }
    case 'noctis':
    case 'abyss':
    case 'dark':
      return { uiIcon: 'i-lucide-moon', color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-400/30', label: 'Noctis' }
    case 'fire':
      return { uiIcon: 'i-lucide-flame', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-400/30', label: 'Fire' }
    case 'water':
      return { uiIcon: 'i-lucide-droplets', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-400/30', label: 'Water' }
    case 'wind':
      return { uiIcon: 'i-lucide-wind', color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-400/30', label: 'Wind' }
    case 'thunder':
      return { uiIcon: 'i-lucide-zap', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-400/30', label: 'Thunder' }
    case 'cosmic':
      return { uiIcon: 'i-lucide-sparkles', color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-400/30', label: 'Cosmic' }
    case 'moon':
      return { uiIcon: 'i-lucide-moon', color: 'text-purple-300', bg: 'bg-purple-500/15', border: 'border-purple-400/30', label: 'Moon' }
    case 'dimenion':
    case 'flux':
      return { uiIcon: 'i-lucide-orbit', color: 'text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-400/30', label: 'Dimension' }
    default:
      return { uiIcon: 'i-lucide-shield', color: 'text-slate-300', bg: 'bg-slate-700/20', border: 'border-slate-600/30', label: element || 'None' }
  }
}

