local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local allUnits = {}
local count = 0

local function sanitizeForJSON(data, visited)
    local t = typeof(data)
    
    if t == "string" or t == "boolean" then
        return data
    elseif t == "number" then
        if data ~= data or data == math.huge or data == -math.huge then
            return tostring(data)
        end
        return data
    elseif type(data) ~= "table" then
        return tostring(data)
    end
    
    visited = visited or {}
    if visited[data] then
        return "[Cyclic]" 
    end
    visited[data] = true
    
    local cleanTable = {}
    for k, v in pairs(data) do
        local cleanValue = sanitizeForJSON(v, visited)
        if cleanValue ~= nil then
            cleanTable[tostring(k)] = cleanValue
        end
    end
    return cleanTable
end

for _, module in pairs(ReplicatedStorage:GetDescendants()) do
    if module:IsA("ModuleScript") and not string.find(module:GetFullName(), "Cmdr") then
        local success, data = pcall(function() return require(module) end)
        
        if success and type(data) == "table" then
            local isUnitInfo, hasStats = pcall(function()
                return (data.AttackSpeed ~= nil) or (data.BaseDamage ~= nil) or (data.WalkSpeed ~= nil) or (data.Cost ~= nil)
            end)
            
            if isUnitInfo and hasStats then
                allUnits[module.Name] = data
                count = count + 1
            else
                pcall(function()
                    for key, val in pairs(data) do
                        if type(val) == "table" then
                            local isSubUnit, hasSubStats = pcall(function()
                                return (val.AttackSpeed ~= nil) or (val.BaseDamage ~= nil) or (val.WalkSpeed ~= nil) or (val.Cost ~= nil)
                            end)
                            if isSubUnit and hasSubStats then
                                allUnits[tostring(key)] = val
                                count = count + 1
                            end
                        end
                    end
                end)
            end
        end
    end
end

local cleanUnits = sanitizeForJSON(allUnits)

local encodeSuccess, encodedData = pcall(function()
    return HttpService:JSONEncode(cleanUnits)
end)

if encodeSuccess then
    if setclipboard then
        setclipboard(encodedData)
        print(count)
    end
else
    warn(tostring(encodedData))
end