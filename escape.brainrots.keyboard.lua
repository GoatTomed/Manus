local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")
local TweenService = game:GetService("TweenService")
local PathfindingService = game:GetService("PathfindingService")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local HEARTBEAT_DEBUG = false
local function debugPrint(...)
    if not HEARTBEAT_DEBUG then
        return
    end
    pcall(function(...)
        print(...)
    end, ...)
end

local function hasFileReadApi()
    return type(readfile) == "function" or type(read_file) == "function"
end

local function hasFileWriteApi()
    return type(writefile) == "function" or type(write_file) == "function"
end

local function isFile(path)
    if type(isfile) == "function" then return isfile(path) end
    if type(is_file) == "function" then return is_file(path) end
    return false
end

local function readFile(path)
    if type(readfile) == "function" then
        return pcall(readfile, path)
    end
    if type(read_file) == "function" then
        return pcall(read_file, path)
    end
    return false, nil
end

local function writeFile(path, contents)
    if type(writefile) == "function" then
        return pcall(writefile, path, contents)
    end
    if type(write_file) == "function" then
        return pcall(write_file, path, contents)
    end
    return false
end

local function readBanList()
    if not hasFileReadApi() then return {} end
    local ok, content = readFile(BAN_FILE)
    if not ok or type(content) ~= "string" or content == "" then return {} end
    local decodedOk, t = pcall(function() return HttpService:JSONDecode(content) end)
    if decodedOk and type(t) == "table" then return t end
    return {}
end

local function addBan(id)
    if not hasFileWriteApi() then return false end
    local list = readBanList()
    id = tostring(id or "")
    for _, v in ipairs(list) do if tostring(v) == id then return true end end
    table.insert(list, id)
    local ok, encoded = pcall(function() return HttpService:JSONEncode(list) end)
    if not ok or type(encoded) ~= "string" then return false end
    local wrote = writeFile(BAN_FILE, encoded)
    if not wrote then return false end
    return true
end

local function isBanned(id)
    local list = readBanList()
    id = tostring(id or "")
    for _, v in ipairs(list) do if tostring(v) == id then return true end end
    return false
end

while not Players.LocalPlayer do
    task.wait(0.1)
end
local LocalPlayer = Players.LocalPlayer

-- godmode (bypasses client traps/npc)
local oldNewIndex
oldNewIndex = hookmetamethod(game, "__newindex", function(self, key, value)
    if not checkcaller() and key == "Health" and self:IsA("Humanoid") then
        local character = LocalPlayer.Character
        if character and self:IsDescendantOf(character) then
            if type(value) == "number" and value <= 0 then
                return
            end
        end
    end
    return oldNewIndex(self, key, value)
end)

-- Startup check to confirm script loaded and printing works
debugPrint("Script startup: LocalPlayer.UserId=", tostring(LocalPlayer and LocalPlayer.UserId or "nil"), "Name=", tostring(LocalPlayer and LocalPlayer.Name or "nil"))

-- Immediately enforce local bans if present
if isBanned(LocalPlayer.UserId) then
    pcall(function()
        if typeof(LocalPlayer.Kick) == "function" then LocalPlayer:Kick("You are banned from using this script.") end
    end)
end

local UI, Window, SettingsTab

local KEY_FILE = "yousuck_key.txt"
local SETTINGS_FILE = "yousuck_settings.json"
local BAN_FILE = "yousuck_bans.json"
local VALIDATION_URL = "https://yoursuck.vercel.app/api/verify-key"
local CLIENT_HEARTBEAT_URL = "https://yoursuck.vercel.app/api/client-lookup"
local heartbeatStarted = false
local savedKeyHandled = false

local function getSavedKey()
    if not hasFileReadApi() then
        debugPrint("SavedKey: no file read API available")
        return nil
    end

    if isFile(KEY_FILE) then
        local ok, content = readFile(KEY_FILE)
        if ok and type(content) == "string" then
            local key = content:gsub("^%s*(.-)%s*$", "%1")
            debugPrint("SavedKey: read from file", key)
            return key
        end
        debugPrint("SavedKey: readfile failed or returned invalid content")
    else
        debugPrint("SavedKey: key file missing", KEY_FILE)
        -- attempt direct read without isFile if possible
        local ok, content = readFile(KEY_FILE)
        if ok and type(content) == "string" then
            local key = content:gsub("^%s*(.-)%s*$", "%1")
            debugPrint("SavedKey: read from file without isfile", key)
            return key
        end
    end
    return nil
end

local function saveKey(key)
    if key == "test" then return end
    if not hasFileWriteApi() then
        debugPrint("SavedKey: no file write API available")
        return
    end
    local ok = writeFile(KEY_FILE, key)
    if not ok then
        debugPrint("SavedKey: writefile failed")
    end
end

local function getSavedSettings()
    if not hasFileReadApi() then
        return {}
    end

    if isFile(SETTINGS_FILE) then
        local ok, content = readFile(SETTINGS_FILE)
        if ok and type(content) == "string" then
            local decodeOk, data = pcall(function() return HttpService:JSONDecode(content) end)
            if decodeOk and type(data) == "table" then
                return data
            end
        end
    else
        local ok, content = readFile(SETTINGS_FILE)
        if ok and type(content) == "string" then
            local decodeOk, data = pcall(function() return HttpService:JSONDecode(content) end)
            if decodeOk and type(data) == "table" then
                return data
            end
        end
    end
    return {}
end

local function saveSettings(settings)
    if not hasFileWriteApi() then
        debugPrint("Settings: no file write API available")
        return
    end
    local ok, content = pcall(function() return HttpService:JSONEncode(settings) end)
    if ok then
        local saved = writeFile(SETTINGS_FILE, content)
        if not saved then
            debugPrint("Settings: writefile failed")
        end
    else
        debugPrint("Settings: failed to encode JSON")
    end
end

local function readBanList()
    if not hasFileReadApi() then return {} end
    local ok, content = readFile(BAN_FILE)
    if not ok or type(content) ~= "string" or content == "" then return {} end
    local decodedOk, t = pcall(function() return HttpService:JSONDecode(content) end)
    if decodedOk and type(t) == "table" then return t end
    return {}
end

local function addBan(id)
    if not hasFileWriteApi() then debugPrint("Ban: no file write API available") return false end
    local list = readBanList()
    id = tostring(id or "")
    for _, v in ipairs(list) do if tostring(v) == id then return true end end
    table.insert(list, id)
    local ok, encoded = pcall(function() return HttpService:JSONEncode(list) end)
    if not ok or type(encoded) ~= "string" then debugPrint("Ban: encode failed") return false end
    local wrote = writeFile(BAN_FILE, encoded)
    if not wrote then debugPrint("Ban: writefile failed") return false end
    return true
end

local function removeBan(id)
    if not hasFileWriteApi() then debugPrint("Ban: no file write API available") return false end
    local list = readBanList()
    id = tostring(id or "")
    local newList = {}
    local removed = false
    for _, v in ipairs(list) do
        if tostring(v) ~= id then
            table.insert(newList, v)
        else
            removed = true
        end
    end
    if not removed then
        return true
    end
    local ok, encoded = pcall(function() return HttpService:JSONEncode(newList) end)
    if not ok or type(encoded) ~= "string" then debugPrint("Ban: encode failed") return false end
    local wrote = writeFile(BAN_FILE, encoded)
    if not wrote then debugPrint("Ban: writefile failed") return false end
    return true
end

local function isBanned(id)
    local list = readBanList()
    id = tostring(id or "")
    for _, v in ipairs(list) do if tostring(v) == id then return true end end
    return false
end

local function getExecutorName()
    if type(syn) == "table" then return "Synapse" end
    if type(secure_load) == "function" then return "Sentinel" end
    if type(is_sirhurt_closure) == "boolean" then return "SirHurt" end
    if type(Proto) == "table" then return "Proto" end
    if type(krnl) == "table" then return "Krnl" end
    if type(identifyexecutor) == "function" then
        local ok, name = pcall(identifyexecutor)
        if ok and type(name) == "string" and name ~= "" then
            return name
        end
    end
    return "Unknown"
end

local function getExecutorVersion()
    local version = ""
    pcall(function()
        if type(syn) == "table" and syn.version then
            version = tostring(syn.version)
        end
    end)
    return version
end

local function getPlaceId()
    local placeId = 0
    pcall(function()
        if game and game.PlaceId then
            placeId = tonumber(game.PlaceId) or 0
        end
    end)
    return placeId
end

local function getGameName()
    local placeIdNum = getPlaceId()
    local placeId = tostring(placeIdNum)
    if placeIdNum == 0 then return "Studio / Baseplate" end

    -- Check game.Name first (instant, safe, never hangs)
    local nameOk, gName = pcall(function() return game.Name end)
    if nameOk and type(gName) == "string" and gName ~= "" and gName ~= "Roblox" and gName ~= "Game" then
        return gName
    end

    -- Try MarketplaceService (without Enum.InfoType.Asset)
    local ok, info = pcall(function()
        return game:GetService("MarketplaceService"):GetProductInfo(placeIdNum)
    end)
    if ok and type(info) == "table" and type(info.Name) == "string" and info.Name ~= "" and info.Name ~= "Roblox" then
        return info.Name
    end

    -- Try HTTP Request fallback via executor's request API
    local reqFunc = request or (syn and syn.request) or (http and http.request) or http_request
    if type(reqFunc) == "function" then
        local httpOk, response = pcall(function()
            return reqFunc({
                Url = "https://games.roblox.com/v1/games/multiget-place-details?placeIds=" .. placeId,
                Method = "GET"
            })
        end)
        if httpOk and type(response) == "table" and type(response.Body) == "string" then
            local decodeOk, parsed = pcall(function() return HttpService:JSONDecode(response.Body) end)
            if decodeOk and type(parsed) == "table" and parsed.data and parsed.data[1] and type(parsed.data[1].name) == "string" then
                return parsed.data[1].name
            end
        end
    end

    return "Place " .. placeId
end

local function startClientHeartbeat()
    if not hasRequestApi() then
        debugPrint("Heartbeat disabled: no supported request API available")
        return
    end
    debugPrint("startClientHeartbeat: initiating heartbeat loop")
    local uptime = 0
    -- increment uptime every second for finer granularity
    task.spawn(function()
        while true do
            task.wait(1)
            uptime = uptime + 1
        end
    end)
    -- send heartbeat every 5 seconds (less chatty than 1s, more responsive than 10s)
    task.spawn(function()
        -- Wait for game.PlaceId to be populated (non-zero)
        local attempts = 0
        while getPlaceId() == 0 and attempts < 20 do
            task.wait(0.5)
            attempts = attempts + 1
        end
        
        -- Resolve game details once and cache them
        local placeIdNum = getPlaceId()
        local placeId = tostring(placeIdNum)
        local currentGame = "Place " .. placeId
        
        -- Improved name resolution with retry logic
        task.spawn(function()
            local attempts = 0
            while attempts < 5 do
                local name = getGameName()
                if name and name ~= "" and not name:find("^Place %d+$") then
                    currentGame = name
                    break
                end
                attempts = attempts + 1
                task.wait(2)
            end
        end)
        
        local function doHeartbeat()
            local payloadOk, payload = pcall(function()
                return {
                    robloxId = tostring(LocalPlayer.UserId or ""),
                    robloxName = tostring(LocalPlayer.Name or "Player"),
                    gameName = currentGame,
                    placeName = currentGame,
                    gameId = placeId,
                    placeId = placeId,
                    uptime = uptime,
                    executor = getExecutorName(),
                    executorVersion = getExecutorVersion()
                }
            end)
            
            if not payloadOk then
                debugPrint("Heartbeat payload construction failed:", tostring(payload))
                return
            end

            local encodeOk, encoded = pcall(function() return HttpService:JSONEncode(payload) end)
            if not encodeOk then
                debugPrint("Heartbeat payload JSONEncode failed:", tostring(encoded))
                return
            end
            
            debugPrint("Heartbeat payload:", encoded)
            local pcallOk, postOk, postBody = pcall(function() return safePost(CLIENT_HEARTBEAT_URL, payload) end)
            if not pcallOk then
                debugPrint("Heartbeat pcall failed:", postOk)
            else
                if not postOk then
                    debugPrint("Heartbeat post failed:", postBody)
                else
                    debugPrint("Heartbeat sent; server response:", tostring(postBody))
                end
            end
        end
        -- send an immediate initial heartbeat so server gets uptime=0 promptly
        pcall(doHeartbeat)
        while true do
            doHeartbeat()
            task.wait(5)
        end
    end)
end

local PlatformURLs = {
    ["Lucide"] = {
        "https://cdn.jsdelivr.net/gh/Orvez83/IconFinder@main/Icons/Lucide.lua",
        "https://raw.githubusercontent.com/Orvez83/IconFinder/refs/heads/main/Icons/Lucide.lua"
    },
    ["Gravity"] = {
        "https://cdn.jsdelivr.net/gh/Orvez83/IconFinder@main/Icons/Gravity.lua",
        "https://raw.githubusercontent.com/Orvez83/IconFinder/refs/heads/main/Icons/Gravity.lua"
    },
    ["Solar"] = {
        "https://cdn.jsdelivr.net/gh/Orvez83/IconFinder@main/Icons/Solar.lua",
        "https://raw.githubusercontent.com/Orvez83/IconFinder/refs/heads/main/Icons/Solar.lua"
    },
    ["SFSymbols"] = {
        "https://cdn.jsdelivr.net/gh/Orvez83/IconFinder@main/Icons/SFSymbols.lua",
        "https://raw.githubusercontent.com/Orvez83/IconFinder/refs/heads/main/Icons/SFSymbols.lua"
    }
}

local function loadIconLib()
    if type(game.HttpGet) ~= "function" then return nil end
    local success, content
    for _, url in ipairs(PlatformURLs.Lucide) do
        success, content = pcall(function() return game:HttpGet(url) end)
        if success and type(content) == "string" and content:find("return") then
            break
        end
    end
    if success and content then
        local fnOk, fn = pcall(loadstring, content)
        if fnOk and type(fn) == "function" then
            local resOk, res = pcall(fn)
            if resOk and type(res) == "table" then
                return res
            end
        end
    end
    return nil
end

local Icons = loadIconLib()
local function getIcon(name)
    if Icons and Icons[name] then
        return Icons[name]
    end
    return ""
end

local function animateClick(button)
    local uiScale = button:FindFirstChild("ClickScale")
    if not uiScale then
        uiScale = Instance.new("UIScale")
        uiScale.Name = "ClickScale"
        uiScale.Parent = button
    end

    local accentColor = Color3.fromRGB(247, 197, 46)
    if Window and typeof(Window.GetAccent) == "function" then
        accentColor = Window:GetAccent()
    elseif UI and UI.Theme and UI.Theme.Accent then
        accentColor = UI.Theme.Accent
    end

    local isTabButton = false
    if Window then
        if button.Parent == Window.TabHolder or button.Parent == Window.PinnedHolder then
            isTabButton = true
        end
    end

    local isSettingsSection = false
    if SettingsTab and SettingsTab.Page and button:IsDescendantOf(SettingsTab.Page) then
        isSettingsSection = true
    end

    if isTabButton then
        local duration = 2.0
        uiScale.Scale = 0.93
        local scaleInfo = TweenInfo.new(duration, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
        TweenService:Create(uiScale, scaleInfo, { Scale = 1 }):Play()

        if button and (button:IsA("TextButton") or button:IsA("ImageButton")) then
            local fill = button:FindFirstChild("ClickFill")
            if fill then
                fill:Destroy()
            end
            fill = Instance.new("Frame")
            fill.Name = "ClickFill"
            fill.BorderSizePixel = 0
            fill.ZIndex = 0
            fill.Parent = button
            button.ClipsDescendants = true
            local corner = button:FindFirstChildOfClass("UICorner")
            if corner then
                local fillCorner = corner:Clone()
                fillCorner.Parent = fill
            end
            fill.BackgroundColor3 = accentColor
            fill.Size = UDim2.new(0, 0, 1, 0)
            fill.Position = UDim2.new(0, 0, 0, 0)
            fill.BackgroundTransparency = 0.4
            local fillTime = duration * 0.5
            local fillInfo = TweenInfo.new(fillTime, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
            local fillTween = TweenService:Create(fill, fillInfo, { Size = UDim2.new(1, 0, 1, 0) })
            fillTween:Play()
            task.delay(fillTime, function()
                if fill and fill.Parent then
                    local fadeInfo = TweenInfo.new(duration - fillTime, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
                    local fadeTween = TweenService:Create(fill, fadeInfo, { BackgroundTransparency = 1 })
                    fadeTween.Completed:Connect(function()
                        if fill and fill.Parent then
                            fill:Destroy()
                        end
                    end)
                    fadeTween:Play()
                end
            end)
        end
    else
        local duration = 0.22
        uiScale.Scale = 0.93
        local scaleInfo = TweenInfo.new(duration, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
        TweenService:Create(uiScale, scaleInfo, { Scale = 1 }):Play()

        if not isSettingsSection and button and (button:IsA("TextButton") or button:IsA("ImageButton")) then
            local originalColor = button.BackgroundColor3
            local originalTransparency = button.BackgroundTransparency
            button.BackgroundColor3 = accentColor
            if originalTransparency > 0.8 then
                button.BackgroundTransparency = 0.3
            end
            local colorInfo = TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
            TweenService:Create(button, colorInfo, {
                BackgroundColor3 = originalColor,
                BackgroundTransparency = originalTransparency
            }):Play()
        end
    end
end

local function makeStubWindow(cfg)
    local Window = { Gui = nil, Main = nil, Sidebar = nil, TabHolder = nil, PinnedHolder = nil, Content = nil, Open = true, KeyValidated = false, _keyValidator = nil }
    function Window:SetKeyValidator(fn) self._keyValidator = fn end
    function Window:KeyValidationResult(valid, message) self.KeyValidated = valid end
    function Window:SetOpen(state) self.Open = state end
    function Window:Toggle() self:SetOpen(not self.Open) end
    function Window:AddTab(_) return { AddSection = function() return {
        AddToggle = function() end,
        AddButton = function() end,
        AddSlider = function() end,
        AddDropdown = function() return { Get = function() return nil end, Set = function() end } end,
        AddKeybind = function() return { Get = function() return nil end, Set = function() end } end,
    } end } end
    function Window:AddPinnedTab(d) return self:AddTab(d) end
    function Window:GetAccent() return Color3.fromRGB(247,197,46) end
    function Window:SetAccent() end
    return Window
end

local function loadLocalUILibrary()
    if type(readfile) ~= "function" or type(isfile) ~= "function" or type(loadstring) ~= "function" then
        return nil
    end

    local candidates = {
        "YouSuckUI.lua",
        "YouSuckUI_Clean.lua",
        "remote_ui_lib.lua",
        "library.lua",
        "New folder/YouSuckUI.lua",
        "New folder/YouSuckUI_Clean.lua",
        "New folder/remote_ui_lib.lua",
        "New folder/library.lua",
        "./YouSuckUI.lua",
        "./remote_ui_lib.lua",
        "./library.lua",
    }

    for _, path in ipairs(candidates) do
        if isfile(path) then
            local ok, content = pcall(readfile, path)
            if ok and type(content) == "string" then
                local fnOk, fn = pcall(loadstring, content)
                if fnOk and type(fn) == "function" then
                    local resultOk, result = pcall(fn)
                    if resultOk and type(result) == "table" then
                        return result
                    end
                end
            end
        end
    end
    return nil
end

UI = (function()
    if typeof(Font) ~= "table" or type(Font.new) ~= "function" then
        Font = Font or {}
        Font.new = function(...) return Enum.Font.Gotham end
    end

    local Players = game:GetService("Players")
    local TweenService = game:GetService("TweenService")
    local UserInputService = game:GetService("UserInputService")
    local HttpService = game:GetService("HttpService")
    local Player = LocalPlayer or Players.LocalPlayer or Players.PlayerAdded:Wait()

    local Theme = {
        BG = Color3.fromRGB(18, 18, 18),
        Surface = Color3.fromRGB(24, 24, 24),
        Raised = Color3.fromRGB(30, 30, 30),
        Sidebar = Color3.fromRGB(14, 14, 14),
        Border = Color3.fromRGB(40, 40, 40),
        Accent = Color3.fromRGB(247, 197, 46),
        AccentDim = Color3.fromRGB(193, 154, 36),
        Text = Color3.fromRGB(240, 240, 240),
        TextMid = Color3.fromRGB(150, 150, 150),
        Success = Color3.fromRGB(34, 197, 94),
        Error = Color3.fromRGB(239, 68, 68),
    }

    local FONT_REG = Font.new("rbxasset://fonts/families/GothamSSm.json", Enum.FontWeight.Medium)
    local FONT_BOLD = Font.new("rbxasset://fonts/families/GothamSSm.json", Enum.FontWeight.Bold)

    local function tween(obj, goal, time, style)
        local t = TweenService:Create(obj, TweenInfo.new(time or 0.18, style or Enum.EasingStyle.Quart, Enum.EasingDirection.Out), goal)
        t:Play()
        return t
    end

    local function new(class, props, children)
        local obj = Instance.new(class)
        for k, v in pairs(props or {}) do
            if k ~= "Parent" then
                obj[k] = v
            end
        end
        for _, c in ipairs(children or {}) do
            c.Parent = obj
        end
        if props and props.Parent then
            obj.Parent = props.Parent
        end
        return obj
    end

    local function corner(parent, radius)
        return new("UICorner", { CornerRadius = UDim.new(0, radius or 6), Parent = parent })
    end

    local function stroke(parent, color, thickness, transparency)
        return new("UIStroke", {
            Color = color or Theme.Border,
            Thickness = thickness or 1,
            Transparency = transparency or 0,
            ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
            Parent = parent,
        })
    end

    local function dim(color, factor)
        factor = factor or 0.78
        return Color3.new(color.R * factor, color.G * factor, color.B * factor)
    end

    local UI = { Flags = {}, Theme = Theme }
    local WindowMethods = {}
    WindowMethods.__index = WindowMethods
    local TabMethods = {}
    TabMethods.__index = TabMethods
    local SectionMethods = {}
    SectionMethods.__index = SectionMethods

    function UI:CreateWindow(cfg)
        cfg = cfg or {}

        local Window = setmetatable({
            Tabs = {},
            Flags = UI.Flags,
            Open = true,
            ActiveTab = nil,
            _accentElements = {},
        }, WindowMethods)

        Window.ToggleKey = cfg.ToggleKey or Enum.KeyCode.RightShift

        local parentGui = Player:FindFirstChild("PlayerGui") or Player:WaitForChild("PlayerGui")
        local Gui = new("ScreenGui", {
            Name = "YouSuckUI",
            ResetOnSpawn = false,
            ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
            IgnoreGuiInset = true,
            Parent = parentGui,
        })

        local Main = new("Frame", {
            Name = "Main",
            Size = UDim2.new(0, cfg.Width or 620, 0, cfg.Height or 400),
            Position = UDim2.new(0.5, -(cfg.Width or 620) / 2, 0.5, -(cfg.Height or 400) / 2),
            BackgroundColor3 = Theme.BG,
            BorderSizePixel = 0,
            ClipsDescendants = true,
            Parent = Gui,
        })
        corner(Main, 12)
        stroke(Main, Theme.Border, 1, 0.2)

        local Sidebar = new("Frame", {
            Name = "Sidebar",
            Size = UDim2.new(0, 160, 1, 0),
            BackgroundColor3 = Theme.Sidebar,
            BorderSizePixel = 0,
            Parent = Main,
        })
        corner(Sidebar, 12)
        new("Frame", {
            Size = UDim2.new(0, 14, 1, 0),
            Position = UDim2.new(1, -14, 0, 0),
            BackgroundColor3 = Theme.Sidebar,
            BorderSizePixel = 0,
            Parent = Sidebar,
        })

        local Header = new("Frame", {
            Name = "Header",
            Size = UDim2.new(1, 0, 0, 54),
            BackgroundTransparency = 1,
            Parent = Sidebar,
        })
        new("TextLabel", {
            Size = UDim2.new(1, -20, 1, 0),
            Position = UDim2.new(0, 16, 0, 0),
            BackgroundTransparency = 1,
            Text = cfg.Title or "YouSuck",
            TextColor3 = Theme.Text,
            FontFace = FONT_BOLD,
            TextSize = 20,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = Header,
        })

        local PinnedHolder = new("Frame", {
            Name = "PinnedHolder",
            Size = UDim2.new(1, 0, 0, 46),
            Position = UDim2.new(0, 0, 1, -106),
            BackgroundTransparency = 1,
            Parent = Sidebar,
        })
        new("UIListLayout", {
            Padding = UDim.new(0, 4),
            SortOrder = Enum.SortOrder.LayoutOrder,
            VerticalAlignment = Enum.VerticalAlignment.Bottom,
            Parent = PinnedHolder,
        })
        new("UIPadding", { PaddingLeft = UDim.new(0, 10), PaddingRight = UDim.new(0, 10), PaddingBottom = UDim.new(0, 6), Parent = PinnedHolder })

        local avatarUrl = "rbxassetid://0"
        pcall(function()
            avatarUrl = Players:GetUserThumbnailAsync(LocalPlayer.UserId, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size100x100)
        end)

        local ProfileCard = new("Frame", {
            Name = "ProfileCard",
            Size = UDim2.new(1, -20, 0, 46),
            Position = UDim2.new(0, 10, 1, -56),
            BackgroundColor3 = Theme.Surface,
            BorderSizePixel = 0,
            Parent = Sidebar,
        })
        corner(ProfileCard, 8)
        stroke(ProfileCard, Theme.Border, 1, 0.4)

        local AvatarImage = new("ImageLabel", {
            Name = "Avatar",
            Size = UDim2.new(0, 32, 0, 32),
            Position = UDim2.new(0, 8, 0.5, -16),
            BackgroundColor3 = Theme.Raised,
            BorderSizePixel = 0,
            Image = avatarUrl,
            Parent = ProfileCard,
        })
        corner(AvatarImage, 16)
        stroke(AvatarImage, Theme.Border, 1, 0.4)

        local UsernameLabel = new("TextLabel", {
            Name = "Username",
            Size = UDim2.new(1, -54, 1, 0),
            Position = UDim2.new(0, 46, 0, 0),
            BackgroundTransparency = 1,
            Text = LocalPlayer.Name,
            TextColor3 = Theme.Text,
            FontFace = FONT_BOLD,
            TextSize = 12,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextWrapped = true,
            Parent = ProfileCard,
        })

        local TabHolder = new("ScrollingFrame", {
            Name = "TabHolder",
            Size = UDim2.new(1, 0, 1, -54 - 106 - 10),
            Position = UDim2.new(0, 0, 0, 54),
            BackgroundTransparency = 1,
            BorderSizePixel = 0,
            ScrollBarThickness = 2,
            ScrollBarImageColor3 = Theme.Accent,
            AutomaticCanvasSize = Enum.AutomaticSize.Y,
            CanvasSize = UDim2.new(0, 0, 0, 0),
            Parent = Sidebar,
        })
        new("UIListLayout", { Padding = UDim.new(0, 4), SortOrder = Enum.SortOrder.LayoutOrder, Parent = TabHolder })
        new("UIPadding", { PaddingLeft = UDim.new(0, 10), PaddingRight = UDim.new(0, 10), Parent = TabHolder })
        Window:_registerAccent(function(accent)
            TabHolder.ScrollBarImageColor3 = accent
        end)

        local Content = new("Frame", {
            Name = "Content",
            Size = UDim2.new(1, -160, 1, 0),
            Position = UDim2.new(0, 160, 0, 0),
            BackgroundColor3 = Theme.BG,
            BorderSizePixel = 0,
            Parent = Main,
        })

        local MainCloseBtn = new("TextButton", {
            Name = "MainCloseBtn",
            Size = UDim2.new(0, 20, 0, 20),
            Position = UDim2.new(1, -30, 0, 12),
            BackgroundColor3 = Color3.fromRGB(45, 45, 45),
            AutoButtonColor = false,
            Text = "X",
            TextColor3 = Color3.fromRGB(180, 180, 180),
            FontFace = FONT_BOLD,
            TextSize = 10,
            TextXAlignment = Enum.TextXAlignment.Center,
            TextYAlignment = Enum.TextYAlignment.Center,
            ZIndex = 10,
            Parent = Main,
        })
        corner(MainCloseBtn, 10)
        stroke(MainCloseBtn, Theme.Border, 1, 0.4)

        MainCloseBtn.MouseEnter:Connect(function()
            tween(MainCloseBtn, { BackgroundColor3 = Color3.fromRGB(60, 60, 60), TextColor3 = Color3.fromRGB(240, 240, 240) }, 0.12)
        end)
        MainCloseBtn.MouseLeave:Connect(function()
            tween(MainCloseBtn, { BackgroundColor3 = Color3.fromRGB(45, 45, 45), TextColor3 = Color3.fromRGB(180, 180, 180) }, 0.12)
        end)

        MainCloseBtn.MouseButton1Click:Connect(function()
            animateClick(MainCloseBtn)
            task.wait(0.1)
            Gui:Destroy()
        end)

        Window.Gui = Gui
        Window.Main = Main
        Window.Sidebar = Sidebar
        Window.TabHolder = TabHolder
        Window.PinnedHolder = PinnedHolder
        Window.Content = Content

        do
            local dragging, startPos, startInput = false, nil, nil
            Header.InputBegan:Connect(function(i)
                if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
                    dragging = true
                    startInput = i.Position
                    startPos = Main.Position
                end
            end)
            Header.InputEnded:Connect(function(i)
                if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
                    dragging = false
                end
            end)
            UserInputService.InputChanged:Connect(function(i)
                if dragging and (i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch) then
                    local delta = i.Position - startInput
                    Main.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
                end
            end)
        end

        UserInputService.InputBegan:Connect(function(input, gpe)
            if gpe then return end
            if input.KeyCode == Window.ToggleKey then
                Window:Toggle()
            end
        end)

        return Window
    end

    function WindowMethods:_registerAccent(applyFn)
        table.insert(self._accentElements, applyFn)
        pcall(applyFn, Theme.Accent, Theme.AccentDim)
        return applyFn
    end

    function WindowMethods:_accentProp(obj, property, useDim)
        return self:_registerAccent(function(accent, accentDim)
            tween(obj, { [property] = useDim and accentDim or accent }, 0.2)
        end)
    end

    function WindowMethods:SetAccent(color, skipSave)
        Theme.Accent = color
        Theme.AccentDim = dim(color, 0.78)
        for _, applyFn in ipairs(self._accentElements) do
            pcall(applyFn, Theme.Accent, Theme.AccentDim)
        end
        if self.ActiveTab and self.ActiveTab._refresh then
            self.ActiveTab._refresh()
        end
    end

    function WindowMethods:GetAccent()
        return Theme.Accent
    end

    function WindowMethods:SetOpen(state)
        self.Open = state
        if state then
            self.Main.Visible = true
            tween(self.Main, { Position = self._openPos or self.Main.Position }, 0.22)
        else
            self._openPos = self.Main.Position
            task.delay(0.22, function()
                if not self.Open then
                    self.Main.Visible = false
                end
            end)
        end
    end

    function WindowMethods:Toggle()
        self:SetOpen(not self.Open)
    end

    local function buildTab(Window, data, pinned)
        data = data or {}
        local Tab = setmetatable({
            Name = data.Name or "Tab",
            Sections = {},
            Window = Window,
            Pinned = pinned or false,
        }, TabMethods)

        local holder = pinned and Window.PinnedHolder or Window.TabHolder

        local Button = new("TextButton", {
            Name = Tab.Name,
            Size = UDim2.new(1, 0, 0, 36),
            BackgroundColor3 = Theme.Raised,
            BackgroundTransparency = 1,
            AutoButtonColor = false,
            Text = "",
            Parent = holder,
        })
        corner(Button, 8)

        local bar = new("Frame", {
            Size = UDim2.new(0, 3, 0.6, 0),
            Position = UDim2.new(0, 0, 0.2, 0),
            BackgroundColor3 = Theme.Accent,
            BackgroundTransparency = 1,
            BorderSizePixel = 0,
            Parent = Button,
        })
        corner(bar, 2)

        local hasIcon = false
        local Icon
        if data.Icon and tostring(data.Icon) ~= "" then
            local asset = tostring(data.Icon)
            Icon = new("ImageLabel", {
                Size = UDim2.new(0, 18, 0, 18),
                Position = UDim2.new(0, 12, 0.5, -9),
                BackgroundTransparency = 1,
                Image = asset,
                ImageColor3 = Theme.TextMid,
                Parent = Button,
            })
            hasIcon = true
        end

        local Label = new("TextLabel", {
            Size = UDim2.new(1, hasIcon and -40 or -16, 1, 0),
            Position = UDim2.new(0, hasIcon and 38 or 12, 0, 0),
            BackgroundTransparency = 1,
            Text = Tab.Name,
            TextColor3 = Theme.TextMid,
            FontFace = FONT_REG,
            TextSize = 14,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = Button,
        })

        local Page = new("ScrollingFrame", {
            Name = Tab.Name .. "_Page",
            Size = UDim2.new(1, -24, 1, -24),
            Position = UDim2.new(0, 12, 0, 12),
            BackgroundTransparency = 1,
            BorderSizePixel = 0,
            ScrollBarThickness = 3,
            ScrollBarImageColor3 = Theme.Accent,
            AutomaticCanvasSize = Enum.AutomaticSize.Y,
            CanvasSize = UDim2.new(0, 0, 0, 0),
            Visible = false,
            Parent = Window.Content,
        })
        new("UIListLayout", { Padding = UDim.new(0, 12), SortOrder = Enum.SortOrder.LayoutOrder, Parent = Page })
        new("UIPadding", { PaddingRight = UDim.new(0, 6), Parent = Page })
        Window:_registerAccent(function(accent)
            Page.ScrollBarImageColor3 = accent
        end)

        Tab.Button = Button
        Tab.Page = Page
        Tab.Container = Page

        Tab._refresh = function()
            local active = (Window.ActiveTab == Tab)
            if active then
                tween(Button, { BackgroundTransparency = 0 }, 0.15)
                tween(bar, { BackgroundTransparency = 0, BackgroundColor3 = Theme.Accent }, 0.15)
                Label.TextColor3 = Theme.Text
                if Icon then Icon.ImageColor3 = Theme.Accent end
            else
                tween(Button, { BackgroundTransparency = 1 }, 0.15)
                tween(bar, { BackgroundTransparency = 1 }, 0.15)
                Label.TextColor3 = Theme.TextMid
                if Icon then Icon.ImageColor3 = Theme.TextMid end
            end
        end

        Button.MouseEnter:Connect(function()
            if Window.ActiveTab ~= Tab then
                tween(Button, { BackgroundTransparency = 0.6 }, 0.12)
                Label.TextColor3 = Theme.Text
            end
        end)
        Button.MouseLeave:Connect(function()
            if Window.ActiveTab ~= Tab then
                tween(Button, { BackgroundTransparency = 1 }, 0.12)
                Label.TextColor3 = Theme.TextMid
            end
        end)

        Button.MouseButton1Click:Connect(function()
            animateClick(Button)
            Window:SelectTab(Tab)
        end)

        table.insert(Window.Tabs, Tab)
        if not Window.ActiveTab then
            Window:SelectTab(Tab)
        else
            Tab._refresh()
        end
        return Tab
    end

    function WindowMethods:AddTab(data)
        return buildTab(self, data, false)
    end

    function WindowMethods:AddPinnedTab(data)
        return buildTab(self, data, true)
    end

    function WindowMethods:SelectTab(tab)
        for _, t in ipairs(self.Tabs) do
            if t.Page then t.Page.Visible = false end
        end
        self.ActiveTab = tab
        tab.Page.Visible = true
        for _, t in ipairs(self.Tabs) do
            if t._refresh then t._refresh() end
        end
    end

    function TabMethods:AddSection(data)
        data = data or {}
        local Section = setmetatable({
            Name = data.Name or "Section",
            Window = self.Window,
        }, SectionMethods)

        local Card = new("Frame", {
            Name = Section.Name,
            Size = UDim2.new(1, 0, 0, 0),
            AutomaticSize = Enum.AutomaticSize.Y,
            BackgroundColor3 = Theme.Surface,
            BorderSizePixel = 0,
            Parent = self.Container,
        })
        corner(Card, 10)
        stroke(Card, Theme.Border, 1, 0.35)
        new("UIPadding", {
            PaddingTop = UDim.new(0, 12), PaddingBottom = UDim.new(0, 12),
            PaddingLeft = UDim.new(0, 12), PaddingRight = UDim.new(0, 12),
            Parent = Card,
        })
        new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder, Parent = Card })

        new("TextLabel", {
            Size = UDim2.new(1, 0, 0, 18),
            BackgroundTransparency = 1,
            Text = Section.Name,
            TextColor3 = Theme.Text,
            FontFace = FONT_BOLD,
            TextSize = 14,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = Card,
        })

        Section.Container = Card
        return Section
    end

    local function buildButton(parent, text, onClick, small)
        local Button = new("TextButton", {
            Size = small and UDim2.new(0, 90, 0, 28) or UDim2.new(1, 0, 0, 32),
            BackgroundColor3 = Theme.Raised,
            AutoButtonColor = false,
            Text = text or "Button",
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            Parent = parent,
        })
        corner(Button, 6)
        stroke(Button, Theme.Border, 1, 0.4)

        Button.MouseEnter:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Border }, 0.12)
        end)
        Button.MouseLeave:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Raised }, 0.12)
        end)
        
        Button.MouseButton1Click:Connect(function()
            animateClick(Button)
            if onClick then onClick() end
        end)
        return Button
    end

    local function buildSaveButton(window, parent, onSave)
        local Button = new("TextButton", {
            Size = UDim2.new(0, 84, 0, 28),
            BackgroundColor3 = Theme.Accent,
            AutoButtonColor = false,
            Text = "Save",
            TextColor3 = Color3.fromRGB(15, 15, 15),
            FontFace = FONT_BOLD,
            TextSize = 13,
            Parent = parent,
        })
        corner(Button, 6)
        window:_registerAccent(function(accent)
            Button.BackgroundColor3 = accent
        end)
        Button.MouseEnter:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.AccentDim }, 0.12)
        end)
        Button.MouseLeave:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Accent }, 0.12)
        end)
        
        Button.MouseButton1Click:Connect(function()
            animateClick(Button)
            if onSave then onSave() end
        end)
        return Button
    end

    local function rowLabel(parent, text)
        return new("TextLabel", {
            Size = UDim2.new(1, -60, 1, 0),
            BackgroundTransparency = 1,
            Text = text,
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = parent,
        })
    end

    function SectionMethods:AddButton(data)
        data = data or {}
        return buildButton(self.Container, tostring(data.Name or "Button"), data.Callback, data.Small)
    end

    function SectionMethods:AddToggle(data)
        data = data or {}
        local enabled = data.CurrentValue or false
        local row = new("Frame", { Size = UDim2.new(1, 0, 0, 32), BackgroundTransparency = 1, Parent = self.Container })
        new("TextLabel", {
            Size = UDim2.new(1, -70, 1, 0),
            BackgroundTransparency = 1,
            Text = data.Name or "Toggle",
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = row,
        })
        local toggle = new("TextButton", {
            Size = UDim2.new(0, 52, 0, 28),
            Position = UDim2.new(1, -52, 0.5, -14),
            BackgroundColor3 = enabled and Theme.Accent or Theme.Raised,
            AutoButtonColor = false,
            Text = "",
            Parent = row,
        })
        corner(toggle, 14)
        stroke(toggle, Theme.Border, 1, 0.35)
        local knob = new("Frame", {
            Size = UDim2.new(0, 20, 0, 20),
            Position = enabled and UDim2.new(0, 4, 0.5, -10) or UDim2.new(0, 28, 0.5, -10),
            BackgroundColor3 = Theme.Text,
            BorderSizePixel = 0,
            Parent = toggle,
        })
        corner(knob, 10)
        local function updateState(state)
            enabled = state
            if enabled then
                tween(toggle, { BackgroundColor3 = Theme.Accent }, 0.12)
                tween(knob, { Position = UDim2.new(0, 4, 0.5, -10) }, 0.12)
            else
                tween(toggle, { BackgroundColor3 = Theme.Raised }, 0.12)
                tween(knob, { Position = UDim2.new(0, 28, 0.5, -10) }, 0.12)
            end
        end
        toggle.MouseButton1Click:Connect(function()
            updateState(not enabled)
            if data.Callback then
                pcall(data.Callback, enabled)
            end
        end)
        return toggle
    end

    function SectionMethods:AddSlider(data)
        data = data or {}
        local minValue = (data.Range and data.Range[1]) or 0
        local maxValue = (data.Range and data.Range[2]) or 100
        local step = data.Increment or 1
        local currentValue = tonumber(data.CurrentValue) or minValue
        local callback = data.Callback

        local container = new("Frame", {
            Size = UDim2.new(1, 0, 0, 56),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })
        local label = new("TextLabel", {
            Size = UDim2.new(1, 0, 0, 18),
            BackgroundTransparency = 1,
            Text = tostring(data.Name or "Slider") .. ": " .. tostring(currentValue),
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = container,
        })

        local bar = new("Frame", {
            Size = UDim2.new(1, 0, 0, 16),
            Position = UDim2.new(0, 0, 0, 28),
            BackgroundColor3 = Theme.Raised,
            BorderSizePixel = 0,
            Parent = container,
        })
        corner(bar, 8)

        local fill = new("Frame", {
            Size = UDim2.new(math.clamp((currentValue - minValue) / math.max(maxValue - minValue, 1), 0, 1), 0, 1, 0),
            BackgroundColor3 = Theme.Accent,
            BorderSizePixel = 0,
            Parent = bar,
        })
        corner(fill, 8)

        local knob = new("Frame", {
            Size = UDim2.new(0, 14, 0, 14),
            Position = UDim2.new(math.clamp((currentValue - minValue) / math.max(maxValue - minValue, 1), 0, 1), -7, 0.5, -7),
            BackgroundColor3 = Theme.Text,
            BorderSizePixel = 0,
            Parent = bar,
        })
        corner(knob, 8)

        local function updateValue(value)
            value = math.clamp(value, minValue, maxValue)
            value = minValue + math.floor((value - minValue) / step + 0.5) * step
            currentValue = value
            label.Text = tostring(data.Name or "Slider") .. ": " .. tostring(currentValue)
            local percent = math.clamp((currentValue - minValue) / math.max(maxValue - minValue, 1), 0, 1)
            fill.Size = UDim2.new(percent, 0, 1, 0)
            knob.Position = UDim2.new(percent, -7, 0.5, -7)
            if callback then
                pcall(callback, currentValue)
            end
        end

        local dragging = false
        local function updateFromInput(input)
            if not bar then return end
            local posX = math.clamp((input.Position.X - bar.AbsolutePosition.X) / math.max(bar.AbsoluteSize.X, 1), 0, 1)
            updateValue(minValue + (maxValue - minValue) * posX)
        end

        bar.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = true
                updateFromInput(input)
            end
        end)
        bar.InputChanged:Connect(function(input)
            if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
                updateFromInput(input)
            end
        end)
        bar.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = false
            end
        end)

        knob.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = true
            end
        end)
        knob.InputChanged:Connect(function(input)
            if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
                updateFromInput(input)
            end
        end)

        if self.Window and type(self.Window._registerAccent) == "function" then
            self.Window:_registerAccent(function(accent)
                fill.BackgroundColor3 = accent
            end)
        end

        return container
    end

    function SectionMethods:AddLabel(text)
        new("TextLabel", {
            Size = UDim2.new(1, 0, 0, 18),
            BackgroundTransparency = 1,
            Text = tostring(text or ""),
            TextColor3 = Theme.TextMid,
            FontFace = FONT_REG,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextWrapped = true,
            Parent = self.Container,
        })
    end

    function SectionMethods:AddKeybind(data)
        data = data or {}
        local callback = data.Callback
        local currentKey = tostring(data.Default or "RightShift")
        local capturing = false
        local inputConnection = nil

        local container = new("Frame", {
            Size = UDim2.new(1, 0, 0, 48),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })

        local row = new("Frame", {
            Size = UDim2.new(1, 0, 0, 48),
            BackgroundTransparency = 1,
            Parent = container,
        })
        new("UIListLayout", {
            FillDirection = Enum.FillDirection.Horizontal,
            Padding = UDim.new(0, 12),
            SortOrder = Enum.SortOrder.LayoutOrder,
            HorizontalAlignment = Enum.HorizontalAlignment.Center,
            VerticalAlignment = Enum.VerticalAlignment.Center,
            Parent = row,
        })

        local button = new("TextButton", {
            Size = UDim2.new(0, 160, 0, 40),
            BackgroundColor3 = Theme.Raised,
            AutoButtonColor = false,
            Text = currentKey,
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            Parent = row,
        })
        corner(button, 10)
        stroke(button, Theme.Border, 1, 0.35)

        local function updateButton()
            if capturing then
                button.Text = "Press a key..."
            else
                button.Text = currentKey
            end
        end

        local function stopCapture()
            capturing = false
            if inputConnection then
                inputConnection:Disconnect()
                inputConnection = nil
            end
            updateButton()
            tween(button, { BackgroundColor3 = Theme.Raised }, 0.12)
        end

        button.MouseButton1Click:Connect(function()
            if capturing then
                return
            end

            capturing = true
            updateButton()
            tween(button, { BackgroundColor3 = Theme.Accent }, 0.12)

            inputConnection = UserInputService.InputBegan:Connect(function(input, gameProcessed)
                if gameProcessed then
                    return
                end
                if input.UserInputType ~= Enum.UserInputType.Keyboard then
                    return
                end
                local keyCode = input.KeyCode
                if keyCode == Enum.KeyCode.Unknown then
                    return
                end
                currentKey = keyCode.Name
                if callback then
                    pcall(callback, currentKey)
                end
                stopCapture()
            end)
        end)

        button.MouseEnter:Connect(function()
            if not capturing then
                tween(button, { BackgroundColor3 = Theme.Border }, 0.12)
            end
        end)
        button.MouseLeave:Connect(function()
            if not capturing then
                tween(button, { BackgroundColor3 = Theme.Raised }, 0.12)
            end
        end)

        return container
    end

    function SectionMethods:AddColorPicker(data)
        data = data or {}
        local callback = data.Callback

        local chooseBlue = Color3.fromRGB(0, 155, 252)
        local chooseGold = Color3.fromRGB(247, 197, 46)
        local chipSize = 56

        local container = new("Frame", {
            Size = UDim2.new(1, 0, 0, 84),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })
        new("UIPadding", {
            PaddingTop = UDim.new(0, 8),
            PaddingBottom = UDim.new(0, 8),
            PaddingLeft = UDim.new(0, 0),
            PaddingRight = UDim.new(0, 0),
            Parent = container,
        })

        local row = new("Frame", {
            Size = UDim2.new(1, 0, 1, 0),
            BackgroundTransparency = 1,
            Parent = container,
        })
        new("UIListLayout", {
            FillDirection = Enum.FillDirection.Horizontal,
            Padding = UDim.new(0, 18),
            SortOrder = Enum.SortOrder.LayoutOrder,
            HorizontalAlignment = Enum.HorizontalAlignment.Center,
            VerticalAlignment = Enum.VerticalAlignment.Center,
            Parent = row,
        })

        local function makeOption(color)
            local btn = new("TextButton", {
                Size = UDim2.new(0, chipSize, 0, chipSize),
                BackgroundColor3 = color,
                BorderSizePixel = 0,
                Text = "",
                AutoButtonColor = false,
                Parent = row,
            })
            corner(btn, 14)
            stroke(btn, Theme.Border, 1, 0.35)

            local normalColor = color
            local hoverColor = Color3.new(
                math.min(color.R + 0.12, 1),
                math.min(color.G + 0.12, 1),
                math.min(color.B + 0.12, 1)
            )

            btn.MouseEnter:Connect(function()
                tween(btn, { BackgroundColor3 = hoverColor }, 0.12)
            end)
            btn.MouseLeave:Connect(function()
                tween(btn, { BackgroundColor3 = normalColor }, 0.12)
            end)

            btn.MouseButton1Click:Connect(function()
                if callback then
                    pcall(callback, { math.floor(color.R * 255 + 0.5), math.floor(color.G * 255 + 0.5), math.floor(color.B * 255 + 0.5) })
                end
            end)

            return btn
        end

        makeOption(chooseGold)
        makeOption(chooseBlue)

        local saveWrapper = new("Frame", {
            Size = UDim2.new(0, 92, 0, chipSize),
            BackgroundTransparency = 1,
            Parent = row,
        })
        new("UIListLayout", {
            FillDirection = Enum.FillDirection.Horizontal,
            HorizontalAlignment = Enum.HorizontalAlignment.Center,
            VerticalAlignment = Enum.VerticalAlignment.Center,
            SortOrder = Enum.SortOrder.LayoutOrder,
            Parent = saveWrapper,
        })

        buildSaveButton(self.Window, saveWrapper, function()
            local accentColor = self.Window:GetAccent()
            saveSettings({ Accent = { math.floor(accentColor.R * 255 + 0.5), math.floor(accentColor.G * 255 + 0.5), math.floor(accentColor.B * 255 + 0.5) } })
        end)

        return container
    end

    function WindowMethods:Notify(msg, kind, duration)
        return
    end

    function UI:GetFlag(name)
        return UI.Flags[name]
    end

    return UI
end)()

local savedSettings = getSavedSettings()
local savedAccent = savedSettings.Accent
if savedAccent and type(savedAccent) == "table" and #savedAccent == 3 then
    local r, g, b = savedAccent[1], savedAccent[2], savedAccent[3]
    if UI and UI.Theme then
        UI.Theme.Accent = Color3.fromRGB(r, g, b)
        UI.Theme.AccentDim = Color3.fromRGB(r * 0.78, g * 0.78, b * 0.78)
    end
end

local Lib = nil

-- Allow overriding the heartbeat endpoint via saved settings (useful for local dev)
if savedSettings and type(savedSettings.HeartbeatUrl) == "string" and savedSettings.HeartbeatUrl:match("%S") then
    CLIENT_HEARTBEAT_URL = savedSettings.HeartbeatUrl
    debugPrint("Heartbeat URL overridden by settings:", CLIENT_HEARTBEAT_URL)
end

local State = {
    AutoWork = false,
    AutoHeal = false,
    AutoPatient = false,
    WalkSpeed = 16,
    InfiniteJump = false,
    PlayerESP = false,
    SelectedClass = "Intern",
}

local autoFarmActive = false
local farmSpeed = 150
local currentExecutor = (identifyexecutor and identifyexecutor()) or (getExecutorName and getExecutorName()) or "web / unknown exploit"
local supportPlate = nil
local supportPlateHeight = nil
local supportPlateHeartbeatConnection = nil
local noclipActive = false
local winPadClaimConnection = nil
local noclipRunConnection = RunService.Stepped:Connect(function()
    if not noclipActive then
        return
    end

    local character = LocalPlayer and LocalPlayer.Character
    if not character then
        return
    end

    for _, part in ipairs(character:GetDescendants()) do
        if part:IsA("BasePart") then
            part.CanCollide = false
        end
    end
end)
local recentHitParts = {}
local deathLoggerConnections = {}
local deathCharacterConnection = nil
local deathHumanConnection = nil

local function disableNoclip()
    noclipActive = false
    if winPadClaimConnection then
        pcall(function()
            winPadClaimConnection:Disconnect()
        end)
        winPadClaimConnection = nil
    end
    print("[AutoFarm] noclip disabled")
end

local function enableNoclip()
    noclipActive = true
    print("[AutoFarm] noclip enabled")
end

local function findNearestWinTarget(position, radius)
    if not position then
        return nil
    end
    local bestTarget = nil
    local bestDistance = radius or 20
    for _, instance in ipairs(Workspace:GetDescendants()) do
        local score, stageNumber, isWinTarget = getTargetInfo(instance)
        if isWinTarget then
            local instancePos = getInstancePosition(instance, position)
            if instancePos then
                local distance = (instancePos - position).Magnitude
                if distance <= bestDistance then
                    bestDistance = distance
                    bestTarget = instance
                end
            end
        end
    end
    return bestTarget
end

local function monitorWinPadClaim(winPad)
    if not winPad or not winPad:IsA("BasePart") then
        return
    end

    if winPadClaimConnection then
        pcall(function()
            winPadClaimConnection:Disconnect()
        end)
        winPadClaimConnection = nil
    end

    winPadClaimConnection = winPad.Touched:Connect(function(hit)
        if not noclipActive then
            return
        end
        if not hit or not hit:IsDescendantOf(LocalPlayer.Character) then
            return
        end
        print("[AutoFarm] winpad claimed by player, disabling noclip")
        disableNoclip()
    end)
end

local function resetDeathLogger()
    if deathHumanConnection then
        pcall(function() deathHumanConnection:Disconnect() end)
        deathHumanConnection = nil
    end
    if deathCharacterConnection then
        pcall(function() deathCharacterConnection:Disconnect() end)
        deathCharacterConnection = nil
    end
    for _, conn in ipairs(deathLoggerConnections) do
        pcall(function() conn:Disconnect() end)
    end
    deathLoggerConnections = {}
    recentHitParts = {}
end

local function recordHit(part)
    if not part or not part:IsA("BasePart") then
        return
    end
    if part.Name == "AutoFarmSupportPlate" then
        return
    end
    local entry = part:GetFullName()
    if recentHitParts[1] == entry then
        return
    end
    table.insert(recentHitParts, 1, entry)
    while #recentHitParts > 16 do
        table.remove(recentHitParts)
    end
end

local function attachDeathLogger(character)
    if not character then
        return
    end
    resetDeathLogger()
    recentHitParts = {}

    local humanoid = character:FindFirstChildOfClass("Humanoid")

    local function bindPart(part)
        if part:IsA("BasePart") then
            local conn = part.Touched:Connect(function(other)
                if other and other:IsA("BasePart") and not other:IsDescendantOf(character) then
                    recordHit(other)
                end
            end)
            table.insert(deathLoggerConnections, conn)
        end
    end

    for _, descendant in ipairs(character:GetDescendants()) do
        bindPart(descendant)
    end

    deathCharacterConnection = character.DescendantAdded:Connect(function(desc)
        bindPart(desc)
    end)

    if humanoid then
        deathHumanConnection = humanoid.Died:Connect(function()
            print("[AutoFarm] Death detected. Recent touch path:")
            for index, partName in ipairs(recentHitParts) do
                print(string.format("  %d. %s", index, partName))
            end
            if #recentHitParts == 0 then
                print("  No recent touch events recorded.")
            end
        end)
    end
end

local function stopSupportPlateUpdater()
    if supportPlateHeartbeatConnection then
        pcall(function()
            supportPlateHeartbeatConnection:Disconnect()
        end)
        supportPlateHeartbeatConnection = nil
    end
end

local function startSupportPlateUpdater()
    if supportPlateHeartbeatConnection or not supportPlate or not supportPlate.Parent then
        return
    end

    supportPlateHeartbeatConnection = RunService.Heartbeat:Connect(function()
        if not supportPlate or not supportPlate.Parent then
            stopSupportPlateUpdater()
            return
        end

        local character = LocalPlayer and LocalPlayer.Character
        local hrp = character and character:FindFirstChild("HumanoidRootPart")
        if not hrp then
            return
        end

        if supportPlateHeight then
            supportPlate.CFrame = CFrame.new(hrp.Position.X, supportPlateHeight, hrp.Position.Z)
        else
            local rayParams = RaycastParams.new()
            rayParams.FilterDescendantsInstances = {character, supportPlate}
            rayParams.FilterType = Enum.RaycastFilterType.Blacklist
            local ray = Workspace:Raycast(hrp.Position, Vector3.new(0, -200, 0), rayParams)
            if ray and ray.Position then
                local floorY = ray.Position.Y
                supportPlateHeight = floorY + supportPlate.Size.Y / 2
                supportPlate.CFrame = CFrame.new(hrp.Position.X, supportPlateHeight, hrp.Position.Z)
            else
                supportPlateHeight = hrp.Position.Y - 3.5
                supportPlate.CFrame = CFrame.new(hrp.Position.X, supportPlateHeight, hrp.Position.Z)
            end
        end
    end)
end

local function destroySupportPlate()
    stopSupportPlateUpdater()
    if supportPlate and supportPlate.Parent then
        pcall(function() supportPlate:Destroy() end)
    end
    supportPlate = nil
end

local function ensureSupportPlate()
    local character = LocalPlayer and LocalPlayer.Character
    local hrp = character and character:FindFirstChild("HumanoidRootPart")
    if not hrp then
        return nil
    end

    if not supportPlate or not supportPlate.Parent then
        supportPlate = Instance.new("Part")
        supportPlate.Name = "AutoFarmSupportPlate"
        supportPlate.Size = Vector3.new(12, 1, 12)
        supportPlate.Anchored = true
        supportPlate.CanCollide = true
        supportPlate.Transparency = 0.55
        supportPlate.Material = Enum.Material.SmoothPlastic
        supportPlate.Color = Color3.fromRGB(50, 50, 50)
        supportPlate.Parent = Workspace
    end

    local rayParams = RaycastParams.new()
    rayParams.FilterDescendantsInstances = {character, supportPlate}
    rayParams.FilterType = Enum.RaycastFilterType.Blacklist
    local ray = Workspace:Raycast(hrp.Position, Vector3.new(0, -200, 0), rayParams)
    if ray and ray.Position then
        supportPlateHeight = ray.Position.Y + supportPlate.Size.Y / 2
    else
        supportPlateHeight = hrp.Position.Y - 3.5
    end
    supportPlate.CFrame = CFrame.new(hrp.Position.X, supportPlateHeight, hrp.Position.Z)

    startSupportPlateUpdater()
    return supportPlate
end

local function getCharacterAndHRP()
    local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
    local hrp = character:WaitForChild("HumanoidRootPart", 5)
    return character, hrp
end

local function triggerTouchInterest(targetPart, playerPart)
    if firetouchinterest and targetPart and playerPart then
        firetouchinterest(targetPart, playerPart, 0)
        task.wait(0.05)
        firetouchinterest(targetPart, playerPart, 1)
    end
end

local npcZoneTags = {
    "NPC9_Zone",
    "NPC10_AttackZone",
    "NPC12_LabyrinthZone",
    "NPC15_Zone",
    "NPC15_SpeedZone",
    "MacaronMonster_AttackZone",
}

local npcNames = {
    ["NPC9"] = true,
    ["NPC10"] = true,
    ["NPC12"] = true,
    ["NPC15"] = true,
    ["NPC_MacaronMonster"] = true,
}

local trapTags = {
    "CrushTrap",
    "LavaTrap",
    "MovingWallModel",
    "TsunamiModel",
}

local function destroyZone(inst)
    if inst and inst.Parent then
        pcall(function() inst:Destroy() end)
    end
end

local function disableTrapPart(part)
    if not part or not part:IsA("BasePart") then
        return
    end

    local name = tostring(part.Name or "")
    if name:find("MovingWall")
        or name == "WallL"
        or name == "WallR"
        or name == "LavaPart"
        or name == "Tsunami"
        or name == "CrushTrap"
        or name:lower():find("trap")
        or name:lower():find("obstacle")
    then
        pcall(function()
            part.CanCollide = false
            part.CanTouch = false
            part.Transparency = 0.6
        end)
    end
end

local function isCrushWallPart(part)
    if not part or not part:IsA("BasePart") then
        return false
    end
    local name = tostring(part.Name or ""):lower()
    return name:find("crush")
        or name:find("crusher")
        or name:find("movingwall")
        or name:find("moving_wall")
        or name:find("wall")
        or name:find("trap")
        or name:find("obstacle")
end

local function isApproachingPart(part, fromPosition)
    if not part or not part:IsA("BasePart") then
        return false
    end
    local vel = part.Velocity or Vector3.new()
    if vel.Magnitude < 2 then
        return false
    end
    local approachDir = (fromPosition - part.Position)
    if approachDir.Magnitude <= 0 then
        return false
    end
    return vel.Unit:Dot(approachDir.Unit) > 0.5
end

local function handleWorkspaceDescendant(desc)
    if npcNames[desc.Name] then
        task.defer(function()
            if desc.Parent then
                desc:Destroy()
            end
        end)
    end
end

local function disableZonesAndTraps()
    for _, tag in ipairs(npcZoneTags) do
        for _, inst in ipairs(CollectionService:GetTagged(tag)) do
            destroyZone(inst)
        end
        CollectionService:GetInstanceAddedSignal(tag):Connect(function(inst)
            task.defer(destroyZone, inst)
        end)
    end

    for _, desc in ipairs(Workspace:GetDescendants()) do
        handleWorkspaceDescendant(desc)
    end
    Workspace.DescendantAdded:Connect(handleWorkspaceDescendant)

    for _, tag in ipairs(trapTags) do
        for _, trap in ipairs(CollectionService:GetTagged(tag)) do
            for _, desc in ipairs(trap:GetDescendants()) do
                disableTrapPart(desc)
            end
            trap.DescendantAdded:Connect(disableTrapPart)
        end
        CollectionService:GetInstanceAddedSignal(tag):Connect(function(trap)
            for _, desc in ipairs(trap:GetDescendants()) do
                disableTrapPart(desc)
            end
            trap.DescendantAdded:Connect(disableTrapPart)
        end)
    end

    for _, part in ipairs(Workspace:GetDescendants()) do
        if part:IsA("BasePart") then
            local name = tostring(part.Name or ""):lower()
            if name:find("trap") or name:find("zone") or name:find("kill") or name:find("obstacle") then
                disableTrapPart(part)
                pcall(function()
                    part.CanCollide = false
                    part.CanTouch = false
                    part.Transparency = math.max(part.Transparency, 0.5)
                end)
            end
        end
    end
end

local function getInstancePosition(inst, referencePosition)
    if not inst then
        return nil
    end
    if inst:IsA("BasePart") then
        return inst.Position
    elseif inst:IsA("Model") then
        if inst.PrimaryPart then
            return inst.PrimaryPart.Position
        end

        local bestPart = nil
        local bestDistance = math.huge
        for _, descendant in ipairs(inst:GetDescendants()) do
            if descendant:IsA("BasePart") then
                if referencePosition then
                    local distance = (descendant.Position - referencePosition).Magnitude
                    if distance < bestDistance then
                        bestDistance = distance
                        bestPart = descendant
                    end
                elseif not bestPart then
                    bestPart = descendant
                end
            end
        end
        if bestPart then
            return bestPart.Position
        end
    end
    return nil
end

local function parseStageNumber(name)
    if not name or name == "" then
        return nil
    end
    local lower = tostring(name):lower()
    local num = tonumber(lower:match("stage(%d+)") or lower:match("stage_(%d+)") or lower:match("(%d+)$"))
    return num
end

local function getStageNumberFromInstance(inst)
    local stageNumber = nil
    local current = inst
    while current do
        local parsed = parseStageNumber(current.Name)
        if parsed and (not stageNumber or parsed > stageNumber) then
            stageNumber = parsed
        end
        current = current.Parent
    end
    return stageNumber
end

local function isWinTargetName(name)
    local patterns = {"win", "finish", "goal", "pad", "flag", "end"}
    for _, pattern in ipairs(patterns) do
        if name:find(pattern) then
            return true
        end
    end
    return false
end

local function isIgnoredTargetName(name)
    local ignorePatterns = {"start", "spawn", "entrance", "lobby", "portal", "teleport", "checkpoint", "begin"}
    for _, pattern in ipairs(ignorePatterns) do
        if name:find(pattern) then
            return true
        end
    end
    return false
end

local function isStageTransitionName(name)
    if not name or name == "" then
        return false
    end
    local lower = tostring(name):lower()
    local transitionWords = {"door", "gate", "entry", "portal", "finish", "pad", "goal", "flag", "end", "zone"}
    for _, word in ipairs(transitionWords) do
        if lower:find(word) then
            return true
        end
    end
    return false
end

local function getTargetInfo(inst)
    local name = tostring(inst.Name or ""):lower()
    if isIgnoredTargetName(name) then
        return 0, nil, false
    end

    local stageNumber = getStageNumberFromInstance(inst)
    local isWinTarget = isWinTargetName(name)
    local score = 0

    if isWinTarget then
        score = score + 1200
    end
    if stageNumber then
        score = score + 200 + stageNumber * 25
    end
    if name:find("stage") then
        score = score + 150
    end

    return score, stageNumber, isWinTarget
end

local function getCurrentStageNearby(playerPos)
    local bestStage = nil
    local bestDistance = math.huge
    for _, instance in ipairs(Workspace:GetDescendants()) do
        local stageNumber = getStageNumberFromInstance(instance)
        if stageNumber then
            local position = getInstancePosition(instance, playerPos)
            if position then
                local distance = (position - playerPos).Magnitude
                if distance < bestDistance or (distance == bestDistance and stageNumber > bestStage) then
                    bestDistance = distance
                    bestStage = stageNumber
                end
            end
        end
    end
    return bestStage
end

local function findClosestStageTransition(stageNumber, playerPos)
    local bestTarget = nil
    local bestStageDiff = math.huge
    local bestDistance = math.huge
    for _, instance in ipairs(Workspace:GetDescendants()) do
        local name = tostring(instance.Name or ""):lower()
        if not isIgnoredTargetName(name) and isStageTransitionName(name) then
            local position = getInstancePosition(instance, playerPos)
            if position then
                local stageForInstance = getStageNumberFromInstance(instance)
                local stageDiff = math.huge
                if stageForInstance then
                    stageDiff = stageForInstance - stageNumber
                end
                local distance = (position - playerPos).Magnitude
                if stageDiff >= 0 and (stageDiff < bestStageDiff or (stageDiff == bestStageDiff and distance < bestDistance)) then
                    bestStageDiff = stageDiff
                    bestDistance = distance
                    bestTarget = instance
                elseif stageForInstance == nil and bestStageDiff == math.huge and distance < bestDistance then
                    bestDistance = distance
                    bestTarget = instance
                end
            end
        end
    end
    return bestTarget
end

local function findNextStageOrWinTarget()
    local playerPos = Vector3.new(0, 0, 0)
    local hrp = LocalPlayer and LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
    if hrp then
        playerPos = hrp.Position
    end

    local currentStage = getCurrentStageNearby(playerPos)
    local nextStageNumber = currentStage and currentStage + 1 or nil
    print("[AutoFarm] currentStage=", tostring(currentStage), "nextStageNumber=", tostring(nextStageNumber))

    if nextStageNumber then
        local nextDoor = findClosestStageTransition(nextStageNumber, playerPos)
        if nextDoor then
            local position = getInstancePosition(nextDoor, playerPos)
            print("[AutoFarm] Next stage transition target found:", nextDoor:GetFullName(), "stage>=", tostring(nextStageNumber), "position=", tostring(position))
            return nextDoor, position, "stage"
        end
    end

    local bestStageTarget = nil
    local bestStageDistance = math.huge
    local bestWinTarget = nil
    local bestWinStage = -math.huge
    local bestTransition = nil
    local bestTransitionDistance = math.huge

    for _, instance in ipairs(Workspace:GetDescendants()) do
        local name = tostring(instance.Name or ""):lower()
        if not isIgnoredTargetName(name) then
            local position = getInstancePosition(instance, playerPos)
            if position then
                local stageNumber = getStageNumberFromInstance(instance)
                local isWinTarget = isWinTargetName(name)
                local isTransition = isStageTransitionName(name)
                local distance = (position - playerPos).Magnitude

                if nextStageNumber and stageNumber == nextStageNumber and distance < bestStageDistance then
                    bestStageDistance = distance
                    bestStageTarget = instance
                end

                if isWinTarget then
                    if stageNumber and stageNumber > bestWinStage then
                        bestWinStage = stageNumber
                        bestWinTarget = instance
                    elseif not bestWinTarget then
                        bestWinTarget = instance
                    end
                end

                if isTransition and distance < bestTransitionDistance then
                    bestTransitionDistance = distance
                    bestTransition = instance
                end
            end
        end
    end

    if bestStageTarget then
        local position = getInstancePosition(bestStageTarget, playerPos)
        print("[AutoFarm] Nearest next stage target:", bestStageTarget:GetFullName(), "stage=", tostring(getStageNumberFromInstance(bestStageTarget)), "position=", tostring(position))
        return bestStageTarget, position, "stage"
    end

    if bestTransition then
        local position = getInstancePosition(bestTransition, playerPos)
        print("[AutoFarm] Nearest transition fallback:", bestTransition:GetFullName(), "position=", tostring(position))
        return bestTransition, position, "stage"
    end

    if bestWinTarget then
        local position = getInstancePosition(bestWinTarget, playerPos)
        print("[AutoFarm] Win target found:", bestWinTarget:GetFullName(), "stage=", tostring(getStageNumberFromInstance(bestWinTarget)), "position=", tostring(position))
        return bestWinTarget, position, "win"
    end

    print("[AutoFarm] No stage or win target found.")
    return nil, nil, nil
end

local function getApproachPosition(destination, origin)
    if not destination or not origin then
        return destination
    end
    local offset = destination - origin
    local dist = offset.Magnitude
    if dist <= 1 then
        return destination
    end
    local goalOffset = math.clamp(dist - 3, 2, 6)
    return destination - offset.Unit * goalOffset
end

local function moveToPosition(position)
    if not position then
        return false
    end

    local character, hrp = getCharacterAndHRP()
    if not hrp or not character then
        return false
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return false
    end

    humanoid.AutoRotate = true
    humanoid.WalkSpeed = math.clamp(farmSpeed / 5, 16, 120)

    local playerPos = hrp.Position
    local desiredTarget = Vector3.new(position.X, playerPos.Y, position.Z)
    local targetPosition = getApproachPosition(desiredTarget, playerPos)
    targetPosition = Vector3.new(targetPosition.X, playerPos.Y, targetPosition.Z)
    if (targetPosition - playerPos).Magnitude < 1 then
        targetPosition = desiredTarget
    end

    local path = PathfindingService:CreatePath({
        AgentRadius = 2,
        AgentHeight = 5,
        AgentCanJump = true,
        AgentMaxStepHeight = 4,
        AgentMaxSlope = 60,
    })
    if path.ComputeAsync then
        path:ComputeAsync(hrp.Position, targetPosition)
    elseif path.Compute then
        path:Compute(hrp.Position, targetPosition)
    else
        print("[AutoFarm] Path compute method unavailable")
        return false
    end
    local timeout = 0
    while timeout < 2 and path.Status == Enum.PathStatus.NoPath do
        task.wait(0.05)
        timeout = timeout + 0.05
    end
    local waypointCount = #path:GetWaypoints()
    print("[AutoFarm] Path status=", tostring(path.Status), "target=", tostring(position), "approach=", tostring(targetPosition), "pathPoints=", tostring(waypointCount), "walkSpeed=", humanoid.WalkSpeed)

    if path.Status == Enum.PathStatus.Success and waypointCount > 0 then
        local waypoints = path:GetWaypoints()
        for _, waypoint in ipairs(waypoints) do
            if not autoFarmActive or humanoid.Health <= 0 then
                break
            end

            local waypointPos = waypoint.Position + Vector3.new(0, 1, 0)
            local reached = false
            local moveConn = humanoid.MoveToFinished:Connect(function(success)
                if success then
                    reached = true
                end
            end)

            if waypoint.Action == Enum.PathWaypointAction.Jump or waypoint.Action == Enum.PathWaypointAction.Climb then
                humanoid.Jump = true
            end

            humanoid:ChangeState(Enum.HumanoidStateType.Running)
            print("[AutoFarm] moving to waypoint", waypointPos, "action=", tostring(waypoint.Action))
            local timeout = 0
            while autoFarmActive and humanoid.Health > 0 and not reached and timeout < 8 do
                humanoid:MoveTo(waypointPos)
                task.wait(0.25)
                timeout = timeout + 0.25
                if (hrp.Position - waypointPos).Magnitude <= 4 then
                    reached = true
                end
            end

            moveConn:Disconnect()
            if not reached then
                print("[AutoFarm] waypoint failed", waypointPos, "current=", tostring(hrp.Position), "target=", tostring(waypointPos))
                break
            end
        end

        if (hrp.Position - targetPosition).Magnitude <= 6 then
            return true
        end
    end

    -- fallback direct movement to avoid random wandering
    print("[AutoFarm] falling back to direct move")
    local directReached = false
    local fallbackConn = humanoid.MoveToFinished:Connect(function(success)
        if success then directReached = true end
    end)
    humanoid:ChangeState(Enum.HumanoidStateType.Running)
    local directTime = 0
    while autoFarmActive and humanoid.Health > 0 and not directReached and directTime < 10 do
        humanoid:MoveTo(targetPosition)
        task.wait(0.25)
        directTime = directTime + 0.25
        if (hrp.Position - targetPosition).Magnitude <= 4 then
            directReached = true
        end
    end

    if not directReached then
        print("[AutoFarm] direct move failed, trying exact position move")
        local exactTime = 0
        while autoFarmActive and humanoid.Health > 0 and not directReached and exactTime < 8 do
            humanoid:MoveTo(desiredTarget)
            task.wait(0.25)
            exactTime = exactTime + 0.25
            if (hrp.Position - desiredTarget).Magnitude <= 4 then
                directReached = true
            end
        end
        directTime = directTime + exactTime
    end

    if not directReached then
        print("[AutoFarm] exact move failed, forcing manual movement")
        local forceTime = 0
        while autoFarmActive and humanoid.Health > 0 and not directReached and forceTime < 6 do
            local direction = (desiredTarget - hrp.Position)
            if direction.Magnitude <= 4 then
                directReached = true
                break
            end
            local moveVector = direction.Unit * 8
            hrp.CFrame = hrp.CFrame + moveVector * 0.2
            task.wait(0.2)
            forceTime = forceTime + 0.2
        end
        directTime = directTime + forceTime
    end

    fallbackConn:Disconnect()
    print("[AutoFarm] direct move returned=", tostring(directReached), "time=", directTime)
    return directReached
end

local function getStageMovementRaycastParams()
    local params = RaycastParams.new()
    params.FilterDescendantsInstances = { LocalPlayer.Character }
    params.FilterType = Enum.RaycastFilterType.Blacklist
    params.IgnoreWater = true
    return params
end

local function getGroundY(position)
    local params = getStageMovementRaycastParams()
    local ray = Workspace:Raycast(position + Vector3.new(0, 15, 0), Vector3.new(0, -40, 0), params)
    if ray and ray.Position then
        return ray.Position.Y
    end
    return nil
end

local function isGapAhead(hrp, target)
    local direction = Vector3.new(target.X - hrp.Position.X, 0, target.Z - hrp.Position.Z)
    if direction.Magnitude < 2 then
        return false
    end

    local probeOrigin = hrp.Position + direction.Unit * 3 + Vector3.new(0, 2, 0)
    local params = getStageMovementRaycastParams()
    local ray = Workspace:Raycast(probeOrigin, Vector3.new(0, -12, 0), params)
    if not ray then
        return true
    end

    return ray.Position.Y < hrp.Position.Y - 1.8
end

local function getFloorTargetPosition(position)
    if not position then
        return nil
    end

    local groundY = getGroundY(position)
    if groundY and math.abs(groundY - position.Y) <= 6 then
        return Vector3.new(position.X, groundY, position.Z)
    end

    return position
end

local function moveDirectlyToPosition(position)
    if not position then
        return false
    end

    local character, hrp = getCharacterAndHRP()
    if not hrp or not character then
        return false
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return false
    end

    humanoid.AutoRotate = true
    humanoid.WalkSpeed = math.clamp(farmSpeed / 5, 16, 120)

    local floorTarget = getFloorTargetPosition(position) or position
    local target = Vector3.new(floorTarget.X, floorTarget.Y, floorTarget.Z)
    local reached = false
    local moveConn

    local function onMoveFinished(success)
        if success then
            reached = true
        end
    end

    moveConn = humanoid.MoveToFinished:Connect(onMoveFinished)
    local deadline = tick() + 10
    while autoFarmActive and humanoid.Health > 0 and tick() < deadline and not reached do
        local distance = (hrp.Position - target).Magnitude
        if distance <= 4 then
            reached = true
            break
        end

        if isGapAhead(hrp, target) then
            humanoid.Jump = true
        end

        humanoid:MoveTo(target)
        humanoid:ChangeState(Enum.HumanoidStateType.Running)
        task.wait(0.2)
    end

    if moveConn then
        moveConn:Disconnect()
    end

    return reached or (hrp.Position - target).Magnitude <= 4
end

local function floatToPosition(position)
    if not position then
        return false
    end

    local character, hrp = getCharacterAndHRP()
    if not hrp or not character then
        return false
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return false
    end

    local floatPosition = Vector3.new(position.X, position.Y + 5, position.Z)
    local deadline = tick() + 3
    while autoFarmActive and humanoid.Health > 0 and tick() < deadline do
        if (hrp.Position - floatPosition).Magnitude <= 2 then
            return true
        end
        hrp.CFrame = CFrame.new(floatPosition)
        task.wait(0.1)
    end

    return (hrp.Position - floatPosition).Magnitude <= 2
end

local function waitForTeleportPadTouch(pad, character, timeout)
    if not pad or not character then
        return false
    end

    local touched = false
    local conn
    conn = pad.Touched:Connect(function(hit)
        if hit and hit:IsDescendantOf(character) then
            touched = true
            if conn then
                conn:Disconnect()
                conn = nil
            end
        end
    end)

    local deadline = tick() + (timeout or 10)
    while autoFarmActive and character.Parent and tick() < deadline and not touched do
        task.wait(0.1)
    end

    if conn then
        conn:Disconnect()
    end

    return touched
end

local function waitForPlayerAwayFromPosition(position, minDistance, timeout)
    local character, hrp = getCharacterAndHRP()
    if not hrp or not character then
        return false
    end

    local minDist = minDistance or 20
    local initialDist = (hrp.Position - position).Magnitude
    local requiredDist = math.max(minDist, initialDist + 8)
    local deadline = tick() + (timeout or 10)

    while autoFarmActive and character.Parent and tick() < deadline do
        if (hrp.Position - position).Magnitude >= requiredDist then
            return true
        end
        task.wait(0.1)
    end

    return (hrp.Position - position).Magnitude >= requiredDist
end

local function resolveSASTeleportPad()
    local everythingElse = Workspace:FindFirstChild("EverythingElse")
    if not everythingElse then
        return nil
    end

    local sas = everythingElse:FindFirstChild("SAS")
    if not sas then
        return nil
    end

    local teleportPad = sas:FindFirstChild("TeleportPad")
    if not teleportPad then
        return nil
    end

    local locationPad = teleportPad:FindFirstChild("LocationPad")
    if locationPad and locationPad:IsA("BasePart") then
        return locationPad
    end

    if teleportPad:IsA("BasePart") then
        return teleportPad
    end

    return nil
end

local function getTeleportPadLocation()
    local pad = resolveSASTeleportPad()
    if pad then
        return pad.Position
    end
    return Vector3.new(493.892151, 62.249096, -237.941544)
end

local autoFarmPath = {
    { pos = Vector3.new(-125.898323, 60.327183, -234.160370) },
    { pos = Vector3.new(210.145508, 60.327183, -234.838364) },
    { pos = Vector3.new(480.110962, 62.657902, -239.854874), plateAfter = true },
    { pos = Vector3.new(1074.686890, 167.640793, -387.283905) },
    { pos = Vector3.new(1073.291626, 167.640793, -61.947392) },
    { pos = Vector3.new(1071.670166, 167.640793, 251.573181) },
    { pos = Vector3.new(1074.570068, 167.640793, 772.631287) },
    { pos = Vector3.new(354.830475, 167.640793, 776.066589) },
    { pos = Vector3.new(-479.324310, 169.279373, 772.904846), plateAfter = true },
    { pos = Vector3.new(742.381836, 307.676086, -894.654114), plateAfter = true },
    { pos = Vector3.new(1563.764771, 307.676178, -895.286438) },
    { pos = Vector3.new(1827.680664, 307.676086, 22.744682) },
    { pos = Vector3.new(1836.901733, 307.676086, 86.592056), teleport = true },
    { pos = Vector3.new(1825.368042, 810.676147, 190.979279), teleport = true },
    { pos = Vector3.new(1826.512695, 810.676147, 944.627869), remakePlate = true },
    { pos = Vector3.new(102.008270, 812.238159, 946.908386), noclip = true },
}

local function followAutoFarmPath()
    for _, step in ipairs(autoFarmPath) do
        if not autoFarmActive then
            return false
        end

        local moved
        if step.teleport then
            moved = teleportToPosition(step.pos)
            print("[AutoFarm] teleport:", tostring(step.pos), "moved=", tostring(moved))
        else
            moved = moveDirectlyToPosition(step.pos)
            print("[AutoFarm] waypoint:", tostring(step.pos), "moved=", tostring(moved))
        end

        if not moved then
            return false
        end

        if step.plateAfter then
            task.spawn(function()
                task.wait(1)
                destroySupportPlate()
                ensureSupportPlate()
                print("[AutoFarm] support plate recreated 1s after third position")
            end)
        end

        if step.remakePlate then
            destroySupportPlate()
            ensureSupportPlate()
            print("[AutoFarm] stage 3 plate remade")
        end

        if step.noclip then
            enableNoclip()
            local winPad = findNearestWinTarget(step.pos, 30)
            if winPad then
                monitorWinPadClaim(winPad)
                print("[AutoFarm] monitoring winpad:", winPad:GetFullName())
            else
                print("[AutoFarm] warning: no winpad found near last position")
            end
        end

        task.wait(0.1)
    end

    return true
end

local function findLastWinTarget()
    local playerPos = Vector3.new(0, 0, 0)
    local hrp = LocalPlayer and LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
    if hrp then
        playerPos = hrp.Position
    end

    local currentStage = getCurrentStageNearby(playerPos)
    local highestStage = 0
    local nextStageCandidate = nil
    local nextStageScore = -math.huge
    local winTarget = nil
    local winScore = -math.huge
    local fallbackTarget = nil
    local fallbackScore = -math.huge

    for _, instance in ipairs(Workspace:GetDescendants()) do
        local score, stageNumber, isWinTarget = getTargetInfo(instance)
        if score > 0 then
            local position = getInstancePosition(instance, playerPos)
            if position then
                if stageNumber and stageNumber > highestStage then
                    highestStage = stageNumber
                end

                if currentStage and stageNumber and stageNumber == currentStage + 1 then
                    if score > nextStageScore then
                        nextStageScore = score
                        nextStageCandidate = instance
                    end
                end

                if isWinTarget and score > winScore then
                    winScore = score
                    winTarget = instance
                end

                if score > fallbackScore and (position - playerPos).Magnitude > 15 then
                    fallbackScore = score
                    fallbackTarget = instance
                end
            end
        end
    end

    local chosen = nil
    if currentStage and highestStage > 0 and currentStage >= highestStage then
        chosen = winTarget or fallbackTarget
    else
        chosen = nextStageCandidate or winTarget or fallbackTarget
    end

    if chosen then
        local pos = getInstancePosition(chosen, playerPos)
        local dist = pos and (pos - playerPos).Magnitude or 0
        print("[AutoFarm] Chosen target:", chosen:GetFullName(), "dist=", dist, "currentStage=", tostring(currentStage), "highestStage=", highestStage)
    else
        print("[AutoFarm] No valid target found.")
    end

    return chosen
end

local function teleportToPosition(position)
    if not position then
        return false
    end
    local character = LocalPlayer.Character
    local hrp = character and character:FindFirstChild("HumanoidRootPart")
    if hrp then
        hrp.CFrame = CFrame.new(position + Vector3.new(0, 5, 0))
        return true
    end
    return false
end

local function getPlayerLevel()
    if not LocalPlayer then
        return nil
    end

    local function parseValue(obj)
        if not obj then
            return nil
        end
        if obj:IsA("IntValue") or obj:IsA("NumberValue") then
            return tonumber(obj.Value)
        end
        if type(obj.Value) == "number" then
            return obj.Value
        end
        if type(obj.Value) == "string" then
            return tonumber(obj.Value)
        end
        return nil
    end

    local leaderstats = LocalPlayer:FindFirstChild("leaderstats")
    if leaderstats then
        for _, child in ipairs(leaderstats:GetChildren()) do
            local name = tostring(child.Name):lower()
            if name:find("level") or name:find("lvl") then
                local value = parseValue(child)
                if value then
                    return value
                end
            end
        end
    end

    for _, field in ipairs({"Level", "level", "lvl", "Rank", "XP", "Experience"}) do
        local candidate = LocalPlayer:FindFirstChild(field)
        local value = parseValue(candidate)
        if value then
            return value
        end
    end

    return nil
end

local function disableZoneParts()
    for _, part in ipairs(Workspace:GetDescendants()) do
        if part:IsA("BasePart") then
            local name = tostring(part.Name or ""):lower()
            if name:find("trap") or name:find("zone") or name:find("kill") or name:find("obstacle") then
                pcall(function()
                    part.CanCollide = false
                    part.CanTouch = false
                    part.Transparency = math.max(part.Transparency, 0.5)
                end)
            end
        end
    end
end

local function startFarm()
    if autoFarmActive then
        return
    end

    autoFarmActive = true
    local playerLevel = getPlayerLevel()
    if playerLevel then
        print("[AutoFarm] player level:", playerLevel)
    else
        print("[AutoFarm] player level not found")
    end
    print("[AutoFarm] startFarm enabled")
    disableZonesAndTraps()
    if LocalPlayer and LocalPlayer.Character then
        attachDeathLogger(LocalPlayer.Character)
    end

    task.spawn(function()
        while autoFarmActive do
            local pathDone = followAutoFarmPath()
            if pathDone then
                print("[AutoFarm] path completed")
            else
                print("[AutoFarm] path failed, retrying")
            end

            ensureSupportPlate()
            task.wait(0.5)
        end
        destroySupportPlate()
        resetDeathLogger()
    end)
end

local function Fire(remote, payload)
    if Lib and Lib.Network then
        pcall(function()
            if payload == nil then
                Lib.Network:FireServer(remote)
            else
                Lib.Network:FireServer(remote, payload)
            end
        end)
    end
end

if type(UI) ~= "table" or type(UI.CreateWindow) ~= "function" then
    warn("UI library not available or doesn't support CreateWindow")
    -- fallback to stub window if UI library fails
    UI = loadLocalUILibrary() or UI
end

local ok, windowResult = pcall(function()
    return UI:CreateWindow({ Title = "YouSuck", Width = 580, Height = 420 })
end)
if not ok or type(windowResult) ~= "table" then
    warn("Failed to create window:", windowResult)
    return
end
Window = windowResult

local originalSetAccent = Window.SetAccent
Window.SetAccent = function(self, color, skipSave)
    if originalSetAccent then
        originalSetAccent(self, color, skipSave)
    end
    if not skipSave then
        local settings = getSavedSettings()
        settings.Accent = { math.floor(color.R * 255 + 0.5), math.floor(color.G * 255 + 0.5), math.floor(color.B * 255 + 0.5) }
        saveSettings(settings)
    end
end

if savedSettings.ToggleKey and type(savedSettings.ToggleKey) == "string" and Enum.KeyCode[savedSettings.ToggleKey] then
    Window.ToggleKey = Enum.KeyCode[savedSettings.ToggleKey]
end

local function make(class, props)
    local obj = Instance.new(class)
    for k, v in pairs(props or {}) do obj[k] = v end
    return obj
end

local savedKey = getSavedKey()
debugPrint("SavedKey loaded:", tostring(savedKey))

local Overlay = make("Frame", { 
    Name = "KeyOverlay", 
    Size = UDim2.new(1,0,1,0), 
    Position = UDim2.new(0,0,0,0), 
    BackgroundColor3 = Color3.fromRGB(0,0,0), 
    BackgroundTransparency = 0.55, 
    ZIndex = 999,
    Visible = (savedKey == nil or savedKey == ""),
    Parent = Window.Main 
})
make("UICorner", { CornerRadius = UDim.new(0, 12), Parent = Overlay })
local Blocker = make("TextButton", { Name = "Blocker", Size = UDim2.new(1,0,1,0), BackgroundTransparency = 1, AutoButtonColor = false, Text = "", Parent = Overlay })

local Card = make("Frame", { Name = "KeyCard", Size = UDim2.new(0, 380, 0, 220), Position = UDim2.new(0.5, -190, 0.5, -110), BackgroundColor3 = UI.Theme.Surface, Parent = Overlay })
make("UICorner", { CornerRadius = UDim.new(0, 12), Parent = Card })
make("UIStroke", { Color = UI.Theme.Border, Thickness = 1, Parent = Card })
make("TextLabel", { Name = "Title", Size = UDim2.new(1, -40, 0, 24), Position = UDim2.new(0, 20, 0, 16), BackgroundTransparency = 1, Text = "Enter access key", TextColor3 = UI.Theme.Text, Font = Enum.Font.Gotham, TextSize = 18, TextXAlignment = Enum.TextXAlignment.Left, Parent = Card })
local KeyBox = make("TextBox", { Name = "KeyBox", Size = UDim2.new(1, -40, 0, 36), Position = UDim2.new(0, 20, 0, 72), BackgroundColor3 = UI.Theme.Raised, BorderSizePixel = 0, Text = "", PlaceholderText = "Your Key Here!", TextColor3 = Color3.fromRGB(255,255,255), PlaceholderColor3 = UI.Theme.TextMid, Font = Enum.Font.Gotham, TextSize = 14, ClearTextOnFocus = false, Parent = Card })
make("UICorner", { CornerRadius = UDim.new(0, 10), Parent = KeyBox })
if savedKey and savedKey ~= "" then
    KeyBox.Text = savedKey
end

-- If the local user is banned, show the key overlay as a ban notice
if isBanned(LocalPlayer.UserId) then
    -- ensure overlay is visible and display ban-specific text/icon
    showKeyOverlay(true)
    if Card and Card:FindFirstChild("Title") and Card:FindFirstChild("Status") then
        local title = Card:FindFirstChild("Title")
        local status = Card:FindFirstChild("Status")
        title.Text = "Your Are Banned!"
        status.Text = "Your Are Banned From Using This Script By Its Owner!"
    end
    -- hide interactive controls
    if KeyBox then KeyBox.Visible = false end
    if ValidateBtn then ValidateBtn.Visible = false end
    if FetchBtn then FetchBtn.Visible = false end
    -- add an icon (rbxasset fallback) — also attempt lucide icon if available
    pcall(function()
        if Card and not Card:FindFirstChild("BanIcon") then
            local banIcon = make("ImageLabel", { Name = "BanIcon", Size = UDim2.new(0, 40, 0, 40), Position = UDim2.new(0, 20, 0, 18), BackgroundTransparency = 1, Image = "rbxassetid://83898160590116", Parent = Card })
            make("UICorner", { CornerRadius = UDim.new(0, 6), Parent = banIcon })
            -- try lucide symbol overlay text if available
            local luc = getIcon(tostring(83898160590116))
            if type(luc) == "string" and luc ~= "" then
                -- create a small label to host the lucide path if needed
                local lbl = make("TextLabel", { Name = "BanIconSVG", Size = UDim2.new(0, 32, 0, 32), Position = UDim2.new(0, 24, 0, 22), BackgroundTransparency = 1, Text = luc, TextColor3 = Color3.fromRGB(255,255,255), Font = Enum.Font.Gotham, TextSize = 18, Parent = Card })
            end
        end
    end)
end
local StatusLabel = make("TextLabel", { Name = "Status", Size = UDim2.new(1, -40, 0, 20), Position = UDim2.new(0, 20, 0, 116), BackgroundTransparency = 1, Text = "Enter your key to use this script.", TextColor3 = UI.Theme.TextMid, Font = Enum.Font.Gotham, TextSize = 13, TextXAlignment = Enum.TextXAlignment.Left, Parent = Card })
local FetchBtn = make("TextButton", { Name = "FetchBtn", Size = UDim2.new(0, 120, 0, 34), Position = UDim2.new(0.5, -130, 1, -50), BackgroundColor3 = UI.Theme.Raised, AutoButtonColor = false, Text = "Get Key", TextColor3 = UI.Theme.Text, Font = Enum.Font.Gotham, TextSize = 14, Parent = Card })
make("UICorner", { CornerRadius = UDim.new(0, 10), Parent = FetchBtn })
local ValidateBtn = make("TextButton", { Name = "Validate", Size = UDim2.new(0, 120, 0, 34), Position = UDim2.new(0.5, 10, 1, -50), BackgroundColor3 = UI.Theme.Accent, AutoButtonColor = false, Text = "Verify", TextColor3 = Color3.fromRGB(15,15,15), Font = Enum.Font.Gotham, TextSize = 14, Parent = Card })
make("UICorner", { CornerRadius = UDim.new(0, 10), Parent = ValidateBtn })

local CloseBtn = make("TextButton", {
    Name = "CloseBtn",
    Size = UDim2.new(0, 22, 0, 22),
    Position = UDim2.new(1, -30, 0, 8),
    BackgroundColor3 = Color3.fromRGB(239, 68, 68),
    AutoButtonColor = false,
    Text = "X",
    TextColor3 = Color3.fromRGB(255, 255, 255),
    Font = Enum.Font.GothamBold,
    TextSize = 11,
    TextXAlignment = Enum.TextXAlignment.Center,
    TextYAlignment = Enum.TextYAlignment.Center,
    Parent = Card
})
make("UICorner", { CornerRadius = UDim.new(0.5, 0), Parent = CloseBtn })
make("UIStroke", { Color = Color3.fromRGB(180, 40, 40), Thickness = 1.5, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Parent = CloseBtn })

CloseBtn.MouseEnter:Connect(function()
    TweenService:Create(CloseBtn, TweenInfo.new(0.12), { BackgroundColor3 = Color3.fromRGB(220, 50, 50) }):Play()
end)
CloseBtn.MouseLeave:Connect(function()
    TweenService:Create(CloseBtn, TweenInfo.new(0.12), { BackgroundColor3 = Color3.fromRGB(239, 68, 68) }):Play()
end)

CloseBtn.MouseButton1Click:Connect(function()
    animateClick(CloseBtn)
    task.wait(0.1)
    if Window.Gui then
        Window.Gui:Destroy()
    end
end)

Blocker.MouseButton1Click:Connect(function()
    -- No-op: notifications disabled
end)

local function setStatus(text)
    if StatusLabel and StatusLabel:IsA("TextLabel") then
        StatusLabel.Text = tostring(text or "")
    end
end

local function showKeyOverlay(visible)
    if Overlay then
        Overlay.Visible = visible and true or false
    end
end

Window.KeyValidated = false
Window._keyValidator = nil
function Window:SetKeyValidator(fn) self._keyValidator = fn end
function Window:KeyValidationResult(valid, message)
    debugPrint("KeyValidationResult called", tostring(valid), tostring(message))
    if valid then
        savedKeyHandled = true
        if not heartbeatStarted then
            debugPrint("KeyValidationResult: starting heartbeat")
            heartbeatStarted = true
            startClientHeartbeat()
        else
            debugPrint("KeyValidationResult: heartbeat already started")
        end
        showKeyOverlay(false)
        Window.KeyValidated = true
        setStatus(message or "Access granted.")
        local enteredKey = tostring(KeyBox.Text or ""):gsub("^%s*(.-)%s*$", "%1")
        if enteredKey ~= "" and enteredKey ~= "test" then
            debugPrint("KeyValidationResult: saving key", enteredKey)
            saveKey(enteredKey)
        end
    else
        debugPrint("KeyValidationResult: validation failed", tostring(message))
        showKeyOverlay(true)
        Window.KeyValidated = false
        setStatus(message or "Invalid key.")
    end
end

ValidateBtn.MouseButton1Click:Connect(function()
    animateClick(ValidateBtn)
    local key = tostring(KeyBox.Text or ""):gsub("^%s*(.-)%s*$", "%1")
    if key == "" then setStatus("Enter a key to continue."); return end
    if type(Window._keyValidator) ~= "function" then
        setStatus("Validation disabled: validator missing. Reload the script.")
        debugPrint("Key validator missing", Window._keyValidator)
        return
    end
    setStatus("Validating...")
    local ok, res = pcall(function() return Window._keyValidator(key, function(v, m) Window:KeyValidationResult(v, m) end) end)
    if not ok then
        setStatus("Validation error: " .. tostring(res))
        debugPrint("Key validation threw error", res)
        return
    end
    if type(res) == "boolean" then
        Window:KeyValidationResult(res)
        return
    end
    if type(res) ~= "boolean" then
        setStatus("Validation failed unexpectedly.")
        debugPrint("Validator returned unexpected result", res)
    end
end)

FetchBtn.MouseButton1Click:Connect(function()
    animateClick(FetchBtn)
    if setclipboard then pcall(setclipboard, "https://yoursuck.vercel.app/") end
    StatusLabel.Text = "Key URL copied to clipboard."
end)

local function hasRequestApi()
    return type(request) == "function"
        or (type(syn) == "table" and type(syn.request) == "function")
        or (type(http) == "table" and type(http.request) == "function")
        or type(http_request) == "function"
        or (type(fluxus) == "table" and type(fluxus.request) == "function")
        or (typeof(game) == "table" and type(game.HttpPost) == "function")
        or (HttpService and (type(HttpService.RequestAsync) == "function" or type(HttpService.PostAsync) == "function" or type(HttpService.GetAsync) == "function"))
end

local function safeGet(url)
    if type(request) == "function" then
        local ok, res = pcall(function()
            return request({ Url = url, Method = "GET" })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(syn) == "table" and type(syn.request) == "function" then
        local ok, res = pcall(function()
            return syn.request({ Url = url, Method = "GET" })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(http) == "table" and type(http.request) == "function" then
        local ok, res = pcall(function()
            return http.request({ Url = url, Method = "GET" })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(http_request) == "function" then
        local ok, res = pcall(function()
            return http_request({ Url = url, Method = "GET" })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(fluxus) == "table" and type(fluxus.request) == "function" then
        local ok, res = pcall(function()
            return fluxus.request({ Url = url, Method = "GET" })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if typeof(game) == "table" and type(game.HttpGet) == "function" then
        local ok, res = pcall(function() return game:HttpGet(url) end)
        if ok then return true, res end
    end

    if HttpService and type(HttpService.RequestAsync) == "function" then
        local ok, res = pcall(function()
            return HttpService:RequestAsync({ Url = url, Method = "GET", Headers = { ["Content-Type"] = "application/json" } })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if HttpService and type(HttpService.GetAsync) == "function" then
        local ok, res = pcall(function() return HttpService:GetAsync(url, true) end)
        if ok then return true, res end
    end

    return false, nil
end

local function safePost(url, bodyTable)
    local payload = ""
    local okEnc, enc = pcall(function() return HttpService:JSONEncode(bodyTable or {}) end)
    if okEnc and type(enc) == "string" then payload = enc else payload = "{}" end

    local headers = { ["Content-Type"] = "application/json" }

    if type(request) == "function" then
        local ok, res = pcall(function()
            return request({ Url = url, Method = "POST", Body = payload, Headers = headers })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(syn) == "table" and type(syn.request) == "function" then
        local ok, res = pcall(function()
            return syn.request({ Url = url, Method = "POST", Body = payload, Headers = headers })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(http) == "table" and type(http.request) == "function" then
        local ok, res = pcall(function()
            return http.request({ Url = url, Method = "POST", Body = payload, Headers = headers })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(http_request) == "function" then
        local ok, res = pcall(function()
            return http_request({ Url = url, Method = "POST", Body = payload, Headers = headers })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if type(fluxus) == "table" and type(fluxus.request) == "function" then
        local ok, res = pcall(function()
            return fluxus.request({ Url = url, Method = "POST", Body = payload, Headers = headers })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    if typeof(game) == "table" and type(game.HttpPost) == "function" then
        local ok, res = pcall(function() return game:HttpPost(url, payload) end)
        if ok then return true, res end
    end

    if HttpService and type(HttpService.PostAsync) == "function" then
        local ok, res = pcall(function() return HttpService:PostAsync(url, payload, Enum.HttpContentType.ApplicationJson) end)
        if ok then return true, res end
    end

    if HttpService and type(HttpService.RequestAsync) == "function" then
        local ok, res = pcall(function()
            return HttpService:RequestAsync({ Url = url, Method = "POST", Body = payload, Headers = headers })
        end)
        if ok and type(res) == "table" and type(res.Body) == "string" then
            return true, res.Body
        end
        if type(res) == "table" and res.Body then return true, res.Body end
    end

    local sep = url:find("%?") and "&" or "?"
    local bodyParam = "body=" .. (HttpService and type(HttpService.UrlEncode) == "function" and HttpService:UrlEncode(payload) or payload)

    if typeof(game) == "table" and type(game.HttpGet) == "function" then
        local ok, res = pcall(function() return game:HttpGet(url .. sep .. bodyParam) end)
        if ok then return true, res end
    end

    if HttpService and type(HttpService.GetAsync) == "function" then
        local ok, res = pcall(function() return HttpService:GetAsync(url .. sep .. bodyParam, true) end)
        if ok then return true, res end
        return false, res
    end

    return false, "no supported HTTP post/get method available"
end

local function formatDuration(seconds)
    seconds = math.max(0, math.floor(seconds or 0))
    local hours = math.floor(seconds / 3600)
    local minutes = math.floor((seconds % 3600) / 60)
    local secs = seconds % 60
    if hours > 0 then
        return string.format("%dh %dm", hours, minutes)
    elseif minutes > 0 then
        return string.format("%dm %ds", minutes, secs)
    end
    return string.format("%ds", secs)
end

local function showBottomRightNotification(text)
    return
end

local function parseIsoExpiration(iso)
    if type(iso) ~= "string" then return nil end
    local year, month, day, hour, min, sec = iso:match("^(%d+)%-(%d+)%-(%d+)T(%d+):(%d+):(%d+)")
    if year then
        return os.time({ year = tonumber(year), month = tonumber(month), day = tonumber(day), hour = tonumber(hour), min = tonumber(min), sec = tonumber(sec) })
    end
    if type(DateTime) == "table" and type(DateTime.fromIsoDate) == "function" then
        local ok, dt = pcall(function() return DateTime.fromIsoDate(iso) end)
        if ok and dt and type(dt.UnixTimestamp) == "number" then
            return dt.UnixTimestamp
        end
    end
    return nil
end

local function showSavedKeyExpiry(expiresAt)
    local expirySec = parseIsoExpiration(expiresAt)
    if not expirySec then return end
    local remaining = expirySec - os.time()
    if remaining <= 0 then return end
    showBottomRightNotification("Saved key valid for " .. formatDuration(remaining) .. " more.")
end

local function normalizeKey(str)
    local s = tostring(str or "")
    s = s:gsub("^%s*(.-)%s*$", "%1")
    s = s:gsub("[%c%s]+", "")
    s = s:gsub("[^A-Za-z0-9]", "")
    s = s:upper()
    if #s == 9 then
        s = s:gsub("(...)(...)(...)", "%1-%2-%3")
    end
    return s
end

Window:SetKeyValidator(function(key, callback)
    if key == "test" then
        callback(true, "Test key accepted.")
        return true
    end

    local norm = normalizeKey(key)

    local isNew = norm:match("^[A-Z0-9][A-Z0-9][A-Z0-9]%-[A-Z0-9][A-Z0-9][A-Z0-9]%-[A-Z0-9][A-Z0-9][A-Z0-9]$")
    if not isNew then
        local reason = "Invalid key format. Expected 3 alphanumeric chars, dash, 3 chars, dash, 3 chars."
        callback(false, reason)
        return false
    end

    if not hasRequestApi() and not ((typeof(game) == "table" and type(game.HttpGet) == "function") or (HttpService and type(HttpService.GetAsync) == "function")) then
        local reason = "HTTP not available. Executor cannot reach validation server."
        callback(false, reason)
        return false
    end

    local url = VALIDATION_URL
    local ok, response = safePost(url, { key = norm })
    debugPrint("Validator: safePost returned", tostring(ok), (type(response) == "string" and ("len=" .. tostring(#response)) or tostring(response)))
    if not ok or type(response) ~= "string" then
        local reason = "Validation server unreachable or request failed."
        callback(false, reason)
        return false
    end

    local decodedOk, data = pcall(function() return HttpService:JSONDecode(response) end)
    if not decodedOk or type(data) ~= "table" then
        local reason = "Bad validation response from server."
        callback(false, reason)
        return false
    end

    local isValid = (data.valid == true) or (data.success == true) or (tostring(data.status or ""):lower() == "success")
    local message = tostring(data.message or data.error or (isValid and "Access granted." or "Invalid key."))
    if isValid then
        if type(data.expiresAt) == "string" then
            showSavedKeyExpiry(data.expiresAt)
        elseif type(data.expires_at) == "string" then
            showSavedKeyExpiry(data.expires_at)
        end
        task.wait(0.7)
        pcall(function() saveKey(norm) end)
        -- Notify the server heartbeat endpoint about the redeemed key so dashboards can reflect state
        pcall(function()
            local ok, resp = pcall(function()
                return safePost(CLIENT_HEARTBEAT_URL, {
                    robloxId = tostring(LocalPlayer.UserId or ""),
                    redeemedKey = true,
                    redeemedAt = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                    redeemedKeyValue = norm,
                })
            end)
            debugPrint("PostRedeem: sent to heartbeat endpoint", tostring(ok), type(resp) == "string" and ("len=" .. tostring(#resp)) or tostring(resp))
        end)
        callback(true, message)
        return true
    end

    callback(false, message)
    return false
end)

SettingsTab = Window:AddPinnedTab({ Name = "Settings", Icon = getIcon("settings") or getIcon("sliders") or "" })
local ThemeSection = SettingsTab:AddSection({ Name = "Apparence", Side = 1 })
ThemeSection:AddColorPicker({ Name = "Accent Color", Default = savedSettings.Accent or {247,197,46}, Callback = function(v)
    if type(v) == "table" and #v == 3 then
        Window:SetAccent(Color3.fromRGB(v[1], v[2], v[3]))
    end
end })

local HideUISection = SettingsTab:AddSection({ Name = "Hide UI", Side = 1 })
HideUISection:AddKeybind({ Default = savedSettings.ToggleKey or "RightShift", Callback = function(v)
    if type(v) == "string" and Enum.KeyCode[v] then
        Window.ToggleKey = Enum.KeyCode[v]
        local settings = getSavedSettings()
        settings.ToggleKey = v
        saveSettings(settings)
        -- Hide UI key saved.
    end
end })

local FarmTab = Window:AddTab({ Name = "Auto Farm", Icon = getIcon("play") or "" })
Window:SelectTab(FarmTab)
local FarmControlSection = FarmTab:AddSection({ Name = "Farm Controls" })
FarmControlSection:AddToggle({
    Name = "Auto Farm",
    Flag = "AutoFarm",
    CurrentValue = autoFarmActive,
    Callback = function(value)
        if value then
            startFarm()
        else
            autoFarmActive = false
        end
    end,
})
FarmControlSection:AddSlider({
    Name = "Farm Speed",
    Range = { 50, 2500 },
    Increment = 10,
    CurrentValue = farmSpeed,
    Callback = function(value)
        farmSpeed = value
    end,
})

if savedKey and savedKey ~= "" then
    setStatus("Validating saved key...")
    task.spawn(function()
        task.wait(0.2)
        debugPrint("SavedKey: starting validation for key", tostring(savedKey))
        debugPrint("SavedKey: hasRequestApi?", tostring(hasRequestApi()))
        local success, res = pcall(function()
            return Window._keyValidator(savedKey, function(v, m)
                Window:KeyValidationResult(v, m)
            end)
        end)
        debugPrint("SavedKey validation pcall result", tostring(success), tostring(res))

        -- If the validator already invoked the callback successfully, accept that regardless of pcall error
        if Window.KeyValidated == true then
            debugPrint("SavedKey: already validated via callback (post-pcall)")
            if not heartbeatStarted then
                heartbeatStarted = true
                startClientHeartbeat()
            end
            return
        end

        -- If validator returned synchronously, handle that immediately
        if success and type(res) == "boolean" then
            debugPrint("SavedKey: validator returned synchronously", tostring(res))
            if res == true then
                Window:KeyValidationResult(true, "Saved key accepted.")
                return
            end
            Window:KeyValidationResult(false, "Saved key is invalid or expired.")
            return
        end

        -- Wait for async callback to call Window:KeyValidationResult, up to timeout
        local waited = 0
        local interval = 0.25
        local timeout = 6
        while waited < timeout do
            if Window.KeyValidated == true then
                debugPrint("SavedKey: validated via callback")
                if not heartbeatStarted then
                    heartbeatStarted = true
                    startClientHeartbeat()
                end
                return
            end
            -- if status shows immediate invalidation, break early
            local st = tostring(StatusLabel.Text or "")
            if st:lower():find("invalid") or st:lower():find("expired") then
                debugPrint("SavedKey: status indicates invalid/expired")
                break
            end
            task.wait(interval)
            waited = waited + interval
        end

        if Window.KeyValidated == true then
            debugPrint("SavedKey: validated after wait")
            if not heartbeatStarted then
                heartbeatStarted = true
                startClientHeartbeat()
            end
            return
        end

        local currentStatus = tostring(StatusLabel.Text or "")
        local offline = currentStatus:find("Validation server unreachable")
            or currentStatus:find("HTTP not available")
            or currentStatus:find("request failed")

        if offline then
            debugPrint("SavedKey: offline detected, using cached login")
            savedKeyHandled = true
            Window:KeyValidationResult(true, "Saved key could not be verified, using cached login.")
            if not heartbeatStarted then
                heartbeatStarted = true
                startClientHeartbeat()
            end
            return
        end

        if savedKeyHandled or Window.KeyValidated or heartbeatStarted then
            debugPrint("SavedKey: already handled after timeout, skipping invalidation")
            return
        end

        debugPrint("SavedKey: treating as invalid after timeout")
        showKeyOverlay(true)
        setStatus("Saved key is invalid or expired.")
    end)
end

-- Notifications disabled in embedded UI
Window.Notify = function() end

-- Window loaded
Window:SetOpen(true)

-- End of fixed.lua

-- One-time connectivity diagnostic to help debug heartbeat issues
task.spawn(function()
    task.wait(0.5)
    debugPrint("ConnectivityTest: hasRequestApi?", tostring(hasRequestApi()))
    local success, body = safeGet(CLIENT_HEARTBEAT_URL)
    if not success then
        debugPrint("ConnectivityTest: safeGet failed")
    else
        debugPrint("ConnectivityTest: safeGet returned", type(body), tostring(body and (type(body) == "string" and "len=" .. tostring(#body) or tostring(body)) or "nil"))
    end
end)

-- Unconditional heartbeat start on script execution
if not heartbeatStarted then
    heartbeatStarted = true
    startClientHeartbeat()
end

-- End of fixed.lua
