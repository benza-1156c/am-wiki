export function formatSkillHtml(html: any): string {
  if (!html) return "";
  let text = "";
  if (typeof html === "string") {
    text = html;
  } else if (typeof html === "object") {
    text = Object.values(html).join("<br/><br/>");
  } else {
    text = String(html);
  }
  return text
    .replace(
      /<font\s+(?:color|สี)=['"]?([^'">]+)['"]?>/gi,
      '<span class="font-bold px-1.5 py-0.5 mx-0.5 rounded bg-white/10 text-shadow-sm inline-block" style="color: $1">',
    )
    .replace(/<\/font>/gi, "</span>")
    .replace(
      /<u>(.*?)<\/u>/gi,
      '<span class="underline decoration-cyan-400 decoration-2 font-medium">$1</span>',
    );
}

export function cleanHtml(raw: any): string {
  if (!raw) return "";
  let text = "";
  if (typeof raw === "string") {
    text = raw;
  } else if (typeof raw === "object") {
    text = Object.values(raw).join(" • ");
  } else {
    text = String(raw);
  }
  return text.replace(/<[^>]*>/g, "").trim();
}

export function formatNumber(
  val: number | undefined | null,
  decimals = 1,
): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  const rounded =
    Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return rounded.toLocaleString("en-US");
}

export function getSeriesName(code: string | undefined): string {
  if (!code) return "Other";
  const map: Record<string, string> = {
    Fate: "Fate",
    Ragnarok: "Record of Ragnarok",
    JJK: "Jujutsu Kaisen",
    NRT: "Naruto",
    Wistoria: "Wistoria: Wand and Sword",
    DGB: "Dragon Ball",
    DBZ: "Dragon Ball Z",
    OnePiece: "One Piece",
    OP: "One Piece",
    DMSlayer: "Demon Slayer",
    DN: "Death Note",
  };
  return map[code] || code;
}

export function getRobloxImageUrl(
  icon: string | number | undefined | null,
): string | null {
  if (!icon) return null;
  const str = String(icon);
  if (str.startsWith("/") || str.startsWith("http")) {
    return str;
  }
  const match = str.match(/rbxassetid:\/\/(\d+)/) || str.match(/(\d{6,})/);
  if (match && match[1] && match[1] !== "0") {
    return `/api/roblox-icon?id=${match[1]}`;
  }
  return null;
}

export function getElementConfig(element: string | undefined) {
  const e = (element || "").toLowerCase();
  switch (e) {
    case "luminus":
    case "luminous":
      return {
        uiIcon: "i-lucide-sun",
        color: "text-amber-300",
        bg: "bg-amber-500/15",
        border: "border-amber-400/30",
        label: "Luminus",
      };
    case "flora":
    case "nature":
      return {
        uiIcon: "i-lucide-leaf",
        color: "text-emerald-400",
        bg: "bg-emerald-500/15",
        border: "border-emerald-400/30",
        label: "Flora",
      };
    case "noctis":
    case "abyss":
    case "dark":
      return {
        uiIcon: "i-lucide-moon",
        color: "text-indigo-400",
        bg: "bg-indigo-500/15",
        border: "border-indigo-400/30",
        label: "Noctis",
      };
    case "fire":
      return {
        uiIcon: "i-lucide-flame",
        color: "text-orange-400",
        bg: "bg-orange-500/15",
        border: "border-orange-400/30",
        label: "Fire",
      };
    case "water":
      return {
        uiIcon: "i-lucide-droplets",
        color: "text-cyan-400",
        bg: "bg-cyan-500/15",
        border: "border-cyan-400/30",
        label: "Water",
      };
    case "wind":
      return {
        uiIcon: "i-lucide-wind",
        color: "text-teal-400",
        bg: "bg-teal-500/15",
        border: "border-teal-400/30",
        label: "Wind",
      };
    case "thunder":
      return {
        uiIcon: "i-lucide-zap",
        color: "text-yellow-400",
        bg: "bg-yellow-500/15",
        border: "border-yellow-400/30",
        label: "Thunder",
      };
    case "cosmic":
      return {
        uiIcon: "i-lucide-sparkles",
        color: "text-violet-400",
        bg: "bg-violet-500/15",
        border: "border-violet-400/30",
        label: "Cosmic",
      };
    case "moon":
      return {
        uiIcon: "i-lucide-moon",
        color: "text-purple-300",
        bg: "bg-purple-500/15",
        border: "border-purple-400/30",
        label: "Moon",
      };
    case "dimenion":
    case "flux":
      return {
        uiIcon: "i-lucide-orbit",
        color: "text-pink-400",
        bg: "bg-pink-500/15",
        border: "border-pink-400/30",
        label: "Dimension",
      };
    default:
      return {
        uiIcon: "i-lucide-shield",
        color: "text-slate-300",
        bg: "bg-slate-700/20",
        border: "border-slate-600/30",
        label: element || "None",
      };
  }
}
