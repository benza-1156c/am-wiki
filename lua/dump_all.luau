local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local StarterGui = game:GetService("StarterGui")

local function sanitize(t, visited, depth)
    depth = depth or 0
    if depth > 14 then return nil end
    local tp = typeof(t)
    if tp == "string" or tp == "boolean" then
        return t
    elseif tp == "number" then
        if t ~= t or t == math.huge or t == -math.huge then
            return tostring(t)
        end
        return t
    elseif tp == "Instance" then
        local ok, str = pcall(function() return t:GetFullName() end)
        return ok and str or t.Name
    elseif tp ~= "table" then
        return tostring(t)
    end
    visited = visited or {}
    if visited[t] then return nil end
    visited[t] = true
    local clean = {}
    for k, v in pairs(t) do
        local val = sanitize(v, visited, depth + 1)
        if val ~= nil then
            clean[tostring(k)] = val
        end
    end
    return clean
end

local function formatAssetId(raw)
    if not raw then return nil end
    local str = tostring(raw)
    local match = str:match("rbxassetid://(%d+)") or str:match("(%d%d%d%d%d+)")
    if match and match ~= "0" then
        return "rbxassetid://" .. match
    end
    return nil
end

local function scanForUnitIcons()
    local iconMap = {}
    print("[AM Dump] Scanning game assets for Unit Icons...")

    local candidates = {
        ReplicatedStorage:FindFirstChild("Icons", true),
        ReplicatedStorage:FindFirstChild("UnitIcons", true),
        ReplicatedStorage:FindFirstChild("Images", true),
        ReplicatedStorage:FindFirstChild("AssetData", true),
        ReplicatedStorage:FindFirstChild("IconData", true),
        ReplicatedStorage:FindFirstChild("Thumbnails", true),
    }

    for _, cand in ipairs(candidates) do
        if cand and cand:IsA("ModuleScript") then
            local ok, res = pcall(require, cand)
            if ok and type(res) == "table" then
                for k, v in pairs(res) do
                    local asset = formatAssetId(v)
                    if asset then
                        iconMap[string.lower(tostring(k))] = asset
                    end
                end
            end
        elseif cand and cand:IsA("Folder") then
            for _, item in ipairs(cand:GetDescendants()) do
                if item:IsA("ImageLabel") or item:IsA("ImageButton") or item:IsA("Decal") or item:IsA("Texture") then
                    local asset = formatAssetId(item.Image or item.Texture)
                    if asset then
                        iconMap[string.lower(item.Name)] = asset
                    end
                end
            end
        end
    end

    local localPlayer = Players.LocalPlayer
    local guiSearchRoots = {}
    if localPlayer and localPlayer:FindFirstChild("PlayerGui") then
        table.insert(guiSearchRoots, localPlayer.PlayerGui)
    end
    if StarterGui then
        table.insert(guiSearchRoots, StarterGui)
    end

    for _, root in ipairs(guiSearchRoots) do
        for _, desc in ipairs(root:GetDescendants()) do
            if desc:IsA("ImageLabel") or desc:IsA("ImageButton") then
                local asset = formatAssetId(desc.Image)
                if asset then
                    iconMap[string.lower(desc.Name)] = asset
                    for attrName, attrVal in pairs(desc:GetAttributes()) do
                        if string.find(string.lower(attrName), "unit") or string.find(string.lower(attrName), "id") then
                            iconMap[string.lower(tostring(attrVal))] = asset
                        end
                    end
                end
            end
        end
    end

    return iconMap
end

local function run()
    local modules = ReplicatedStorage:WaitForChild("Modules", 5)
    local dataFolder = modules and modules:WaitForChild("Data", 5)
    
    if not modules or not dataFolder then
        error("Could not find Modules/Data in ReplicatedStorage. Make sure you are in the game!")
    end

    local UnitConfig = require(modules:WaitForChild("UnitConfig"))
    local PassiveData = dataFolder:WaitForChild("PassiveData", 5)
    local TraitsData = require(dataFolder:WaitForChild("TraitsData"))
    local GearData = require(modules:WaitForChild("ItemDatabase"):WaitForChild("GearData"))
    local UnitLevelData = require(dataFolder:WaitForChild("UnitLevelData"))

    local passives = {}
    if PassiveData then
        for _, mod in ipairs(PassiveData:GetChildren()) do
            if mod:IsA("ModuleScript") then
                local ok, val = pcall(require, mod)
                if ok and type(val) == "table" then
                    passives[mod.Name] = val
                end
            end
        end
    end

    local discoveredIcons = scanForUnitIcons()
    local rawUnits = UnitConfig.Units or {}
    local unitsWithIcons = 0

    for unitId, unitData in pairs(rawUnits) do
        if type(unitData) == "table" then
            local idKey = string.lower(tostring(unitId))
            local nameKey = unitData.Name and string.lower(tostring(unitData.Name))
            local dispKey = unitData.DisplayName and string.lower(tostring(unitData.DisplayName))

            local matchedIcon = discoveredIcons[idKey] or (nameKey and discoveredIcons[nameKey]) or (dispKey and discoveredIcons[dispKey])
            if matchedIcon then
                unitData.Icon = matchedIcon
                unitsWithIcons = unitsWithIcons + 1
            elseif not unitData.Icon then
                unitData.Icon = nil
            end
        end
    end

    local dump = {
        formulas = {
            baseMaxLevel = UnitLevelData.MaxLevel or 50,
            maxLevelAt6Stars = 80,
            levelCapPerStar = 5,
            levelMultiplier = 0.1,
            expBase = UnitLevelData.BaseExp or 50,
            expMultiplier = UnitLevelData.Multiplier or 1.15,
            awakening = {
                star1 = { damage = 0.01 },
                star2 = { health = 0.02 },
                star3 = { speed = 0.02 },
                star4 = { skillDamage = 0.02 },
                star5 = { range = 0.02 },
                star6 = { damage = 0.05 }
            }
        },
        units = sanitize(rawUnits),
        skills = sanitize(passives),
        traits = sanitize(TraitsData.TraitsData or {}),
        gears = sanitize(GearData.Data or {})
    }

    local json = HttpService:JSONEncode(dump)

    local fileSaved = false
    local clipSaved = false

    if writefile then
        pcall(function()
            writefile("am_database.json", json)
            fileSaved = true
        end)
    end

    if setclipboard then
        pcall(function()
            setclipboard(json)
            clipSaved = true
        end)
    end
end

local ok, err = pcall(run)
if not ok then
    warn("[AM Dump Error]: " .. tostring(err))
    if writefile then
        pcall(function()
            writefile("am_error.log", tostring(err))
        end)
    end
end
