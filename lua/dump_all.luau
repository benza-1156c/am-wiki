local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local function sanitize(t, visited, depth)
    depth = depth or 0
    if depth > 12 then return nil end
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

local function run()
    local modules = ReplicatedStorage:WaitForChild("Modules")
    local dataFolder = modules:WaitForChild("Data")
    
    local UnitConfig = require(modules:WaitForChild("UnitConfig"))
    local PassiveData = dataFolder:WaitForChild("PassiveData")
    local TraitsData = require(dataFolder:WaitForChild("TraitsData"))
    local GearData = require(modules:WaitForChild("ItemDatabase"):WaitForChild("GearData"))
    local UnitLevelData = require(dataFolder:WaitForChild("UnitLevelData"))

    local passives = {}
    for _, mod in ipairs(PassiveData:GetChildren()) do
        if mod:IsA("ModuleScript") then
            local ok, val = pcall(require, mod)
            if ok and type(val) == "table" then
                passives[mod.Name] = val
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
        units = sanitize(UnitConfig.Units or {}),
        skills = sanitize(passives),
        traits = sanitize(TraitsData.TraitsData or {}),
        gears = sanitize(GearData.Data or {})
    }

    local json = HttpService:JSONEncode(dump)
    if writefile then
        pcall(function()
            writefile("am_database.json", json)
        end)
    end
    if setclipboard then
        pcall(function()
            setclipboard(json)
        end)
    end
    print("[AM Dump] Exported " .. tostring(#json) .. " bytes successfully.")
end

local ok, err = pcall(run)
if not ok and writefile then
    pcall(function()
        writefile("am_error.log", tostring(err))
    end)
end

