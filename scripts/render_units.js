import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require(path.resolve('node_modules/sharp'))

const DB_PATH = path.resolve('public/database.json')
const BACKUP_PATH = path.resolve('public/database.backup.json')
const OUTPUT_DIR = path.resolve('public/images/units')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const mcpPath =
  process.env.REAL_MCP_PATH ||
  path.join(process.env.LOCALAPPDATA || '', 'Real/data/mcp/real-mcp.exe')

if (!fs.existsSync(mcpPath)) {
  console.error(`real-mcp.exe not found at ${mcpPath}`)
  process.exit(1)
}

const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
const units = Array.isArray(dbData) ? dbData : dbData.units || []

const proc = spawn(mcpPath, [], {
  stdio: ['pipe', 'pipe', 'pipe']
})

let reqId = 1
const pendingCalls = new Map()

function sendRpc(method, params) {
  return new Promise((resolve, reject) => {
    const id = reqId++
    pendingCalls.set(id, { resolve, reject })
    const data = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'
    proc.stdin.write(data)
  })
}

function callTool(name, args) {
  return sendRpc('tools/call', { name, arguments: args })
}

let buffer = ''
proc.stdout.on('data', (d) => {
  buffer += d.toString()
  const lines = buffer.split('\n')
  buffer = lines.pop()
  for (const line of lines) {
    if (!line.trim()) continue
    try {
      const msg = JSON.parse(line)
      if (msg.id && pendingCalls.has(msg.id)) {
        const { resolve } = pendingCalls.get(msg.id)
        pendingCalls.delete(msg.id)
        resolve(msg.result)
      }
    } catch {}
  }
})

proc.stderr.on('data', () => {})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function run() {
  await sendRpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'am-renderer', version: '1.0.0' }
  })

  const clientsRes = await callTool('list-clients', {})
  const clientsData = JSON.parse(clientsRes.content[0].text)
  if (!clientsData.clients || clientsData.clients.length === 0) {
    throw new Error('Roblox client not found.')
  }

  const client = clientsData.clients[0]
  console.log(`Connected: ${client.displayName} (${client.fps} FPS)`)

  const scanCode = `
    local RS = game:GetService("ReplicatedStorage")
    local HttpService = game:GetService("HttpService")
    local map = {}
    if RS:FindFirstChild("Units") then
      for _, f in ipairs(RS.Units:GetChildren()) do
        if f:IsA("Folder") then
          for _, m in ipairs(f:GetChildren()) do
            if m:IsA("Model") then
              map[string.lower(m.Name)] = { folder = f.Name, name = m.Name }
            end
          end
        elseif f:IsA("Model") then
          map[string.lower(f.Name)] = { folder = "Root", name = f.Name }
        end
      end
    end
    return HttpService:JSONEncode(map)
  `
  const scanRes = await callTool('eval', { code: scanCode })
  const modelMap = JSON.parse(scanRes.content[0].text)

  const setupGuiCode = `
    local CoreGui = game:GetService("CoreGui")
    local old = CoreGui:FindFirstChild("FullScreenCaptureGui")
    if old then old:Destroy() end

    local gui = Instance.new("ScreenGui")
    gui.Name = "FullScreenCaptureGui"
    gui.IgnoreGuiInset = true
    gui.DisplayOrder = 999999
    gui.ResetOnSpawn = false
    gui.Parent = CoreGui

    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, 0, 1, 0)
    frame.Position = UDim2.new(0, 0, 0, 0)
    frame.BackgroundColor3 = Color3.fromRGB(11, 14, 20)
    frame.BorderSizePixel = 0
    frame.Parent = gui

    local vp = Instance.new("ViewportFrame")
    vp.Name = "StudioViewport"
    vp.Size = UDim2.new(1, 0, 1, 0)
    vp.Position = UDim2.new(0, 0, 0, 0)
    vp.BackgroundTransparency = 1
    vp.BorderSizePixel = 0
    vp.Ambient = Color3.fromRGB(220, 220, 220)
    vp.LightColor = Color3.fromRGB(255, 255, 255)
    vp.LightDirection = Vector3.new(-1, -1, -1).Unit
    vp.Parent = frame

    local cam = Instance.new("Camera")
    cam.Name = "StudioCamera"
    cam.FieldOfView = 35
    cam.Parent = vp
    vp.CurrentCamera = cam

    return "OK"
  `
  await callTool('eval', { code: setupGuiCode })
  await sleep(300)

  function findModelName(u) {
    const rawId = (u.id || '').replace(/^unit_/, '')
    const name = u.name || ''
    const disp = u.displayName || ''
    const candidates = [
      rawId,
      name,
      disp,
      name.replace(/\s*\(.*\)/, '').trim(),
      disp.replace(/\s*\(.*\)/, '').trim(),
      name.replace(/[^a-zA-Z0-9]/g, ''),
      disp.replace(/[^a-zA-Z0-9]/g, '')
    ]
    for (const c of candidates) {
      const lower = c.toLowerCase()
      if (modelMap[lower]) return modelMap[lower].name
    }
    for (const k of Object.keys(modelMap)) {
      const lowerName = name.toLowerCase()
      if (lowerName && (k.includes(lowerName) || lowerName.includes(k))) {
        return modelMap[k].name
      }
    }
    return null
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(dbData, null, 2))

  const validUnits = units.filter((u) => u.id && u.id !== 'unit_XXX')
  console.log(`Rendering ${validUnits.length} units...`)

  let success = 0

  for (let i = 0; i < validUnits.length; i++) {
    const u = validUnits[i]
    const modelName = findModelName(u)
    const prefix = `[${i + 1}/${validUnits.length}]`

    if (!modelName) {
      console.log(`${prefix} Skip: ${u.name}`)
      continue
    }

    const renderUnitCode = `
      local CoreGui = game:GetService("CoreGui")
      local RS = game:GetService("ReplicatedStorage")
      local gui = CoreGui:FindFirstChild("FullScreenCaptureGui")
      if not gui then return "NO_GUI" end

      local vp = gui.Frame.StudioViewport
      local cam = vp.StudioCamera

      for _, c in ipairs(vp:GetChildren()) do
        if c:IsA("Model") then c:Destroy() end
      end

      local targetModel = nil
      if RS:FindFirstChild("Units") then
        for _, f in ipairs(RS.Units:GetChildren()) do
          local found = f:FindFirstChild("${modelName}")
          if found and found:IsA("Model") then
            targetModel = found
            break
          end
        end
        if not targetModel then
          local found = RS.Units:FindFirstChild("${modelName}")
          if found and found:IsA("Model") then targetModel = found end
        end
      end

      if not targetModel then return "MODEL_NOT_FOUND" end

      local clone = targetModel:Clone()
      clone.Parent = vp

      local head = clone:FindFirstChild("Head") or clone.PrimaryPart or clone:FindFirstChildWhichIsA("BasePart")
      if head then
        cam.CFrame = CFrame.new(head.Position + Vector3.new(0, 0.1, -4.2), head.Position)
      else
        local cf, size = clone:GetBoundingBox()
        cam.CFrame = CFrame.new(cf.Position + Vector3.new(0, size.Y * 0.25, -size.Z * 2.8), cf.Position)
      end

      return "OK"
    `
    const renderRes = await callTool('eval', { code: renderUnitCode })
    if (renderRes.content[0].text !== 'OK') {
      console.log(`${prefix} Error: ${u.name}`)
      continue
    }

    await sleep(200)

    const shotRes = await callTool('screenshot-window', { mode: 'roblox' })
    const fullBuffer = Buffer.from(shotRes.content[0].data, 'base64')

    const meta = await sharp(fullBuffer).metadata()
    const size = Math.min(meta.width, meta.height)
    const left = Math.floor((meta.width - size) / 2)
    const top = Math.floor((meta.height - size) / 2)

    const outFile = path.join(OUTPUT_DIR, `${u.id}.png`)
    await sharp(fullBuffer)
      .extract({ left, top, width: size, height: size })
      .resize(240, 240, { fit: 'cover' })
      .toFile(outFile)

    u.icon = `/images/units/${u.id}.png`
    success++
    console.log(`${prefix} ${u.name} -> ${u.id}.png`)
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2))

  await callTool('eval', {
    code: `
      local g = game:GetService("CoreGui"):FindFirstChild("FullScreenCaptureGui")
      if g then g:Destroy() end
      return "OK"
    `
  })

  console.log(`Done! Rendered ${success}/${validUnits.length} units.`)
  proc.kill()
  process.exit(0)
}

run().catch((err) => {
  console.error('Error:', err.message || err)
  try {
    proc.kill()
  } catch {}
  process.exit(1)
})
