
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")
local TweenService = game:GetService("TweenService")

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
            Parent = ProfileCard
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
            Parent = ProfileCard
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

    function SectionMethods:AddLabel(text)
        local label = new("TextLabel", {
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
        return label
    end

    function SectionMethods:AddImageLabel(data)
        data = data or {}
        local container = new("Frame", {
            Size = UDim2.new(1, 0, 0, (data.Name and 18 or 0) + (data.SizeY or 128)),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })
        if data.Name then
            new("TextLabel", {
                Size = UDim2.new(1, 0, 0, 18),
                BackgroundTransparency = 1,
                Text = tostring(data.Name),
                TextColor3 = Theme.TextMid,
                FontFace = FONT_REG,
                TextSize = 13,
                TextXAlignment = Enum.TextXAlignment.Left,
                Parent = container,
            })
        end
        local image = new("ImageLabel", {
            Size = UDim2.new(1, 0, 0, data.SizeY or 128),
            Position = UDim2.new(0, 0, 0, data.Name and 18 or 0),
            BackgroundTransparency = 0,
            BackgroundColor3 = Theme.Surface,
            Image = tostring(data.Image or ""),
            ScaleType = Enum.ScaleType.Fit,
            Parent = container,
        })
        corner(image, 10)
        stroke(image, Theme.Border, 1, 0.35)
        return image
    end

    function SectionMethods:AddButton(data)
        data = data or {}
        local Button = new("TextButton", {
            Size = UDim2.new(1, 0, 0, 32),
            BackgroundColor3 = Theme.Raised,
            AutoButtonColor = false,
            Text = tostring(data.Name or "Button"),
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            Parent = self.Container,
        })
        corner(Button, 8)
        stroke(Button, Theme.Border, 1, 0.35)

        Button.MouseEnter:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Border }, 0.12)
        end)
        Button.MouseLeave:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Raised }, 0.12)
        end)

        Button.MouseButton1Click:Connect(function()
            animateClick(Button)
            if data.Callback then
                pcall(data.Callback)
            end
        end)

        return Button
    end

    function SectionMethods:AddToggle(data)
        data = data or {}
        local flag = tostring(data.Flag or (data.Name and data.Name:gsub("%s+", "_") or "toggle"))
        if UI.Flags[flag] == nil then
            UI.Flags[flag] = data.Default == true
        end
        local Button = new("TextButton", {
            Size = UDim2.new(1, 0, 0, 32),
            BackgroundColor3 = Theme.Raised,
            AutoButtonColor = false,
            Text = tostring(data.Name or "Toggle") .. " [" .. (UI.Flags[flag] and "ON" or "OFF") .. "]",
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            Parent = self.Container,
        })
        corner(Button, 8)
        stroke(Button, Theme.Border, 1, 0.35)

        local function refresh()
            Button.Text = tostring(data.Name or "Toggle") .. " [" .. (UI.Flags[flag] and "ON" or "OFF") .. "]"
        end

        Button.MouseEnter:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Border }, 0.12)
        end)
        Button.MouseLeave:Connect(function()
            tween(Button, { BackgroundColor3 = Theme.Raised }, 0.12)
        end)

        Button.MouseButton1Click:Connect(function()
            UI.Flags[flag] = not UI.Flags[flag]
            refresh()
            if data.Callback then
                pcall(data.Callback, UI.Flags[flag])
            end
        end)

        return {
            Get = function() return UI.Flags[flag] end,
            Set = function(_, value)
                UI.Flags[flag] = value and true or false
                refresh()
            end,
        }
    end

    function SectionMethods:AddDropdown(data)
        data = data or {}
        local items = data.Items or {}
        local selected = data.Default or items[1]
        local container = new("Frame", {
            Size = UDim2.new(1, 0, 0, 32),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })
        local Box = new("TextButton", {
            Size = UDim2.new(1, 0, 0, 32),
            BackgroundColor3 = Theme.Raised,
            AutoButtonColor = false,
            Text = tostring(data.Name or "Dropdown") .. ": " .. tostring(selected),
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            Parent = container,
        })
        corner(Box, 8)
        stroke(Box, Theme.Border, 1, 0.35)

        local Open = false
        local Holder = new("Frame", {
            Size = UDim2.new(1, 0, 0, 0),
            Position = UDim2.new(0, 0, 1, 4),
            BackgroundColor3 = Theme.Surface,
            Parent = container,
        })
        Holder.ClipsDescendants = true
        new("UIListLayout", { Padding = UDim.new(0, 4), SortOrder = Enum.SortOrder.LayoutOrder, Parent = Holder })
        new("UIPadding", { PaddingTop = UDim.new(0, 4), PaddingBottom = UDim.new(0, 4), PaddingLeft = UDim.new(0, 8), PaddingRight = UDim.new(0, 8), Parent = Holder })

        local function setSelected(item)
            selected = item
            Box.Text = tostring(data.Name or "Dropdown") .. ": " .. tostring(selected)
            if data.Callback then
                pcall(data.Callback, selected)
            end
        end

        for _, item in ipairs(items) do
            local Option = new("TextButton", {
                Size = UDim2.new(1, 0, 0, 28),
                BackgroundColor3 = Theme.Raised,
                AutoButtonColor = false,
                Text = tostring(item),
                TextColor3 = Theme.Text,
                FontFace = FONT_REG,
                TextSize = 13,
                Parent = Holder,
            })
            corner(Option, 6)
            stroke(Option, Theme.Border, 1, 0.35)
            Option.MouseButton1Click:Connect(function()
                setSelected(item)
                Open = false
                tween(Holder, { Size = UDim2.new(1, 0, 0, 0) }, 0.15)
            end)
        end

        Box.MouseButton1Click:Connect(function()
            Open = not Open
            local targetSize = Open and #items * 32 or 0
            tween(Holder, { Size = UDim2.new(1, 0, 0, targetSize) }, 0.15)
        end)

        return {
            Get = function() return selected end,
            Set = function(_, value)
                setSelected(value)
            end,
        }
    end

    function SectionMethods:AddSlider(data)
        data = data or {}
        local value = tonumber(data.Default) or tonumber(data.Min) or 0
        local container = new("Frame", {
            Size = UDim2.new(1, 0, 0, 36),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })
        local Label = new("TextLabel", {
            Size = UDim2.new(1, 0, 0, 16),
            BackgroundTransparency = 1,
            Text = tostring(data.Name or "Slider") .. ": " .. tostring(value),
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            Parent = container,
        })
        local Bar = new("TextButton", {
            Size = UDim2.new(1, 0, 0, 16),
            Position = UDim2.new(0, 0, 0, 20),
            BackgroundColor3 = Theme.Border,
            AutoButtonColor = false,
            Text = "",
            Parent = container,
        })
        corner(Bar, 6)
        local Fill = new("Frame", {
            Size = UDim2.new(0, 0, 1, 0),
            BackgroundColor3 = Theme.Accent,
            Parent = Bar,
        })
        corner(Fill, 6)

        local dragging = false
        local function updateValue(posX)
            local percent = math.clamp((posX - Bar.AbsolutePosition.X) / Bar.AbsoluteSize.X, 0, 1)
            value = math.floor((data.Min or 0) + (data.Max or 100 - (data.Min or 0)) * percent)
            Fill.Size = UDim2.new(percent, 0, 1, 0)
            Label.Text = tostring(data.Name or "Slider") .. ": " .. tostring(value)
            if data.Callback then
                pcall(data.Callback, value)
            end
        end

        Bar.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = true
                updateValue(input.Position.X)
            end
        end)
        Bar.InputChanged:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseMovement and dragging then
                updateValue(input.Position.X)
            end
        end)
        Bar.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = false
            end
        end)

        return {
            Get = function() return value end,
            Set = function(_, newValue)
                value = tonumber(newValue) or value
                local percent = ((value - (data.Min or 0)) / math.max((data.Max or 100) - (data.Min or 0), 1))
                Fill.Size = UDim2.new(percent, 0, 1, 0)
                Label.Text = tostring(data.Name or "Slider") .. ": " .. tostring(value)
            end,
        }
    end

    function SectionMethods:AddTextbox(data)
        data = data or {}
        local frame = new("Frame", {
            Size = UDim2.new(1, 0, 0, 58),
            BackgroundTransparency = 1,
            Parent = self.Container,
        })
        if data.Name then
            new("TextLabel", {
                Size = UDim2.new(1, 0, 0, 18),
                BackgroundTransparency = 1,
                Text = tostring(data.Name),
                TextColor3 = Theme.TextMid,
                FontFace = FONT_REG,
                TextSize = 13,
                TextXAlignment = Enum.TextXAlignment.Left,
                Parent = frame,
            })
        end
        local TextBox = new("TextBox", {
            Size = UDim2.new(1, 0, 0, 32),
            Position = UDim2.new(0, 0, 0, 26),
            BackgroundColor3 = Theme.Surface,
            Text = tostring(data.Default or ""),
            PlaceholderText = tostring(data.Placeholder or ""),
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            ClearTextOnFocus = false,
            Parent = frame,
        })
        corner(TextBox, 8)
        stroke(TextBox, Theme.Border, 1, 0.35)

        if data.Callback then
            TextBox.FocusLost:Connect(function()
                pcall(data.Callback, TextBox.Text)
            end)
        end

        return {
            Get = function() return TextBox.Text end,
            Set = function(_, value) TextBox.Text = tostring(value or "") end,
            OnFocusLost = function(fn)
                if type(fn) == "function" then
                    TextBox.FocusLost:Connect(function(enterPressed)
                        fn(TextBox.Text, enterPressed)
                    end)
                end
            end,
        }
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

local mouse = LocalPlayer:GetMouse()
local ScriptWhitelist = {}
local ForceWhitelist = {}
local TargetedPlayer = nil
local TargetNameInput = nil
local TargetInfoLabel = nil
local TargetImageLabel = nil
local FlySpeed = 50
local PotionTool = nil
local SavedCheckpoint = nil
local FreeEmotesEnabled = false
local AntiAFKConnection = nil
local AntiChatSpyConnection = nil
local flying = false
local flyConnections = {}
local flyControls = {w = false, a = false, s = false, d = false, u = false, dn = false}

local State = {
    AutoWork = false,
    AutoHeal = false,
    AutoPatient = false,
    WalkSpeed = 16,
    InfiniteJump = false,
    PlayerESP = false,
    SelectedClass = "Intern",
}

local function debugSafe(pcallFunc, ...)
    local ok, result = pcall(pcallFunc, ...)
    return ok, result
end

local function GetPing()
    local success, ping = pcall(function()
        return (game:GetService("Stats").Network.ServerStatsItem["Data Ping"]:GetValue()) / 1000
    end)
    return (success and type(ping) == "number") and ping or 0.05
end

local function RandomChar()
    local length = math.random(1, 5)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end
    return table.concat(array)
end

local function SendNotify(title, message, duration)
    pcall(function()
        game:GetService("StarterGui"):SetCore("SendNotification", {Title = title, Text = message, Duration = duration or 3})
    end)
end

local function GetPlayer(UserDisplay)
    if type(UserDisplay) ~= "string" or UserDisplay == "" then
        return nil
    end
    local search = UserDisplay:lower()
    for _, player in ipairs(Players:GetPlayers()) do
        if player.Name:lower():find(search, 1, true) or player.DisplayName:lower():find(search, 1, true) then
            return player
        end
    end
    return nil
end

local function GetCharacter(player)
    return player and player.Character
end

local function GetRoot(player)
    local character = GetCharacter(player)
    if character and character:FindFirstChild("HumanoidRootPart") then
        return character.HumanoidRootPart
    end
    return nil
end

local function TeleportTO(posX, posY, posZ, player, method)
    pcall(function()
        local root = GetRoot(LocalPlayer)
        if not root then
            return
        end
        if method == "safe" then
            task.spawn(function()
                for i = 1, 30 do
                    task.wait()
                    root.Velocity = Vector3.new(0, 0, 0)
                    if player == "pos" then
                        root.CFrame = CFrame.new(posX, posY, posZ)
                    else
                        local targetRoot = GetRoot(player)
                        if targetRoot then
                            root.CFrame = CFrame.new(targetRoot.Position) + Vector3.new(0, 2, 0)
                        end
                    end
                end
            end)
        else
            root.Velocity = Vector3.new(0, 0, 0)
            if player == "pos" then
                root.CFrame = CFrame.new(posX, posY, posZ)
            else
                local targetRoot = GetRoot(player)
                if targetRoot then
                    root.CFrame = CFrame.new(targetRoot.Position) + Vector3.new(0, 2, 0)
                end
            end
        end
    end)
end

local function PredictionTP(player, method)
    local root = GetRoot(player)
    if not root then
        return
    end
    local pos = root.Position
    local vel = root.Velocity
    local ping = GetPing()
    local targetPos = Vector3.new(
        pos.X + vel.X * (ping * 3.5),
        pos.Y + vel.Y * (ping * 2),
        pos.Z + vel.Z * (ping * 3.5)
    )
    local localRoot = GetRoot(LocalPlayer)
    if localRoot then
        localRoot.CFrame = CFrame.new(targetPos)
        if method == "safe" then
            task.wait()
            localRoot.CFrame = CFrame.new(pos)
            task.wait()
            localRoot.CFrame = CFrame.new(targetPos)
        end
    end
end

local function GetPush()
    local PushTool = nil
    pcall(function()
        if LocalPlayer.Backpack:FindFirstChild("Push") then
            PushTool = LocalPlayer.Backpack.Push
        elseif LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Push") then
            PushTool = LocalPlayer.Character.Push
        else
            for _, player in ipairs(Players:GetPlayers()) do
                if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("Push") then
                    PushTool = player.Character.Push
                    break
                end
            end
        end
    end)
    return PushTool
end

local function Push(target)
    if not target or not target.Character then
        return
    end
    local tool = GetPush()
    if tool and tool:FindFirstChild("PushTool") then
        pcall(function()
            tool.PushTool:FireServer(target.Character)
        end)
    end
end

local function ToggleRagdoll(bool)
    pcall(function()
        local character = GetCharacter(LocalPlayer)
        if not character then return end
        for _, name in ipairs({"Falling down", "Swimming", "StartRagdoll", "Pushed", "RagdollMe"}) do
            if character:FindFirstChild(name) then
                character[name].Disabled = bool
            end
        end
    end)
end

local function PlayAnim(id, time, speed)
    pcall(function()
        local character = GetCharacter(LocalPlayer)
        if not character or not character:FindFirstChild("Humanoid") then
            return
        end
        if character:FindFirstChild("Animate") then
            character.Animate.Disabled = false
        end
        local humanoid = character.Humanoid
        for _, track in ipairs(humanoid:GetPlayingAnimationTracks()) do
            track:Stop()
        end
        if character:FindFirstChild("Animate") then
            character.Animate.Disabled = true
        end
        local anim = Instance.new("Animation")
        anim.AnimationId = "rbxassetid://" .. tostring(id)
        local loadAnim = humanoid:LoadAnimation(anim)
        loadAnim:Play()
        if type(time) == "number" then
            loadAnim.TimePosition = time
        end
        if type(speed) == "number" then
            loadAnim:AdjustSpeed(speed)
        end
        loadAnim.Stopped:Connect(function()
            if character:FindFirstChild("Animate") then
                character.Animate.Disabled = false
            end
            for _, track in ipairs(humanoid:GetPlayingAnimationTracks()) do
                track:Stop()
            end
        end)
    end)
end

local function StopAnim()
    pcall(function()
        local character = GetCharacter(LocalPlayer)
        if not character or not character:FindFirstChild("Humanoid") then
            return
        end
        if character:FindFirstChild("Animate") then
            character.Animate.Disabled = false
        end
        for _, track in ipairs(character.Humanoid:GetPlayingAnimationTracks()) do
            track:Stop()
        end
    end)
end

local function UpdateTarget(player)
    if player and player:IsA("Player") then
        if table.find(ForceWhitelist, player.UserId) then
            SendNotify("System Broken", "You can't target this player: @" .. player.Name .. " / " .. player.DisplayName, 5)
            return
        end
        TargetedPlayer = player
        if TargetNameInput then
            TargetNameInput:Set(player.Name)
        end
        if TargetInfoLabel then
            TargetInfoLabel.Text = "UserID: " .. player.UserId .. "\nDisplay: " .. player.DisplayName .. "\nJoined: " .. os.date("%d-%m-%Y", os.time() - player.AccountAge * 24 * 3600)
        end
        if TargetImageLabel and TargetImageLabel:IsA("ImageLabel") then
            pcall(function()
                local thumb = Players:GetUserThumbnailAsync(player.UserId, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size420x420)
                if type(thumb) == "string" and thumb ~= "" then
                    TargetImageLabel.Image = thumb
                end
            end)
        end
    else
        TargetedPlayer = nil
        if TargetNameInput then
            TargetNameInput:Set("")
        end
        if TargetInfoLabel then
            TargetInfoLabel.Text = "UserID: \nDisplay: \nJoined: "
        end
        if TargetImageLabel and TargetImageLabel:IsA("ImageLabel") then
            TargetImageLabel.Image = "rbxassetid://10818605405"
        end
    end
end

local function stopFly()
    flying = false
    for _, conn in ipairs(flyConnections) do
        if conn and conn.Disconnect then
            conn:Disconnect()
        elseif conn and conn.disconnect then
            conn:disconnect()
        end
    end
    flyConnections = {}
    local character = GetCharacter(LocalPlayer)
    if character and character:FindFirstChild("Humanoid") then
        character.Humanoid.PlatformStand = false
    end
    local root = GetRoot(LocalPlayer)
    if root then
        for _, child in ipairs(root:GetChildren()) do
            if child:IsA("BodyGyro") or child:IsA("BodyVelocity") then
                child:Destroy()
            end
        end
    end
end

local function startFly()
    local character = GetCharacter(LocalPlayer)
    if not character or not character:FindFirstChild("Humanoid") then
        return
    end
    local root = GetRoot(LocalPlayer)
    if not root then
        return
    end
    flying = true
    character.Humanoid.PlatformStand = true
    local bg = Instance.new("BodyGyro")
    bg.P = 9e4
    bg.MaxTorque = Vector3.new(9e9, 9e9, 9e9)
    bg.CFrame = root.CFrame
    bg.Parent = root

    local bv = Instance.new("BodyVelocity")
    bv.MaxForce = Vector3.new(9e9, 9e9, 9e9)
    bv.Velocity = Vector3.new(0, 0, 0)
    bv.Parent = root

    flyConnections[#flyConnections + 1] = RunService.Heartbeat:Connect(function()
        if not flying or not root.Parent then
            return
        end
        local camera = workspace.CurrentCamera
        local direction = Vector3.new()
        if flyControls.w then
            direction = direction + camera.CFrame.LookVector
        end
        if flyControls.s then
            direction = direction - camera.CFrame.LookVector
        end
        if flyControls.a then
            direction = direction - camera.CFrame.RightVector
        end
        if flyControls.d then
            direction = direction + camera.CFrame.RightVector
        end
        if flyControls.u then
            direction = direction + Vector3.new(0, 1, 0)
        end
        if flyControls.dn then
            direction = direction - Vector3.new(0, 1, 0)
        end
        if direction.Magnitude > 0 then
            direction = direction.Unit * FlySpeed
        end
        bv.Velocity = direction
        bg.CFrame = camera.CFrame
    end)

    flyConnections[#flyConnections + 1] = UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        if input.KeyCode == Enum.KeyCode.W then flyControls.w = true end
        if input.KeyCode == Enum.KeyCode.S then flyControls.s = true end
        if input.KeyCode == Enum.KeyCode.A then flyControls.a = true end
        if input.KeyCode == Enum.KeyCode.D then flyControls.d = true end
        if input.KeyCode == Enum.KeyCode.Space then flyControls.u = true end
        if input.KeyCode == Enum.KeyCode.LeftControl or input.KeyCode == Enum.KeyCode.RightControl then flyControls.dn = true end
    end)

    flyConnections[#flyConnections + 1] = UserInputService.InputEnded:Connect(function(input)
        if input.KeyCode == Enum.KeyCode.W then flyControls.w = false end
        if input.KeyCode == Enum.KeyCode.S then flyControls.s = false end
        if input.KeyCode == Enum.KeyCode.A then flyControls.a = false end
        if input.KeyCode == Enum.KeyCode.D then flyControls.d = false end
        if input.KeyCode == Enum.KeyCode.Space then flyControls.u = false end
        if input.KeyCode == Enum.KeyCode.LeftControl or input.KeyCode == Enum.KeyCode.RightControl then flyControls.dn = false end
    end)
end

local function setAnimationPreset(preset)
    local character = GetCharacter(LocalPlayer)
    if not character or not character:FindFirstChild("Animate") or not character:FindFirstChild("Humanoid") then
        return
    end
    local animate = character.Animate
    animate.Disabled = true
    StopAnim()
    if preset.idle1 then animate.idle.Animation1.AnimationId = preset.idle1 end
    if preset.idle2 then animate.idle.Animation2.AnimationId = preset.idle2 end
    if preset.walk then animate.walk.WalkAnim.AnimationId = preset.walk end
    if preset.run then animate.run.RunAnim.AnimationId = preset.run end
    if preset.jump then animate.jump.JumpAnim.AnimationId = preset.jump end
    if preset.climb then animate.climb.ClimbAnim.AnimationId = preset.climb end
    if preset.fall then animate.fall.FallAnim.AnimationId = preset.fall end
    if preset.swim then animate.swim.Swim.AnimationId = preset.swim end
    if preset.swimIdle then animate.swimidle.SwimIdle.AnimationId = preset.swimIdle end
    pcall(function() LocalPlayer.Character.Humanoid:ChangeState(3) end)
    animate.Disabled = false
end

local function applyShaderEffects(enabled)
    local light = game:GetService("Lighting")
    if enabled then
        light.Brightness = 2.25
        light.ExposureCompensation = 0.1
        light.ClockTime = 17.55
        local Sky = Instance.new("Sky")
        local Bloom = Instance.new("BloomEffect")
        local Blur = Instance.new("BlurEffect")
        local ColorC = Instance.new("ColorCorrectionEffect")
        local SunRays = Instance.new("SunRaysEffect")

        Sky.SkyboxBk = "http://www.roblox.com/asset/?id=144933338"
        Sky.SkyboxDn = "http://www.roblox.com/asset/?id=144931530"
        Sky.SkyboxFt = "http://www.roblox.com/asset/?id=144933262"
        Sky.SkyboxLf = "http://www.roblox.com/asset/?id=144933244"
        Sky.SkyboxRt = "http://www.roblox.com/asset/?id=144933299"
        Sky.SkyboxUp = "http://www.roblox.com/asset/?id=144931564"
        Sky.StarCount = 5000
        Sky.SunAngularSize = 5
        Sky.Parent = light

        Bloom.Intensity = 0.3
        Bloom.Size = 10
        Bloom.Threshold = 0.8
        Bloom.Parent = light

        Blur.Size = 5
        Blur.Parent = light

        ColorC.Brightness = 0
        ColorC.Contrast = 0.1
        ColorC.Saturation = 0.25
        ColorC.TintColor = Color3.fromRGB(255, 255, 255)
        ColorC.Parent = light

        SunRays.Intensity = 0.1
        SunRays.Spread = 0.8
        SunRays.Parent = light
    else
        for _, child in ipairs(light:GetChildren()) do
            if child:IsA("Sky") or child:IsA("BloomEffect") or child:IsA("BlurEffect") or child:IsA("ColorCorrectionEffect") or child:IsA("SunRaysEffect") then
                child:Destroy()
            end
        end
        light.Brightness = 2
        light.ExposureCompensation = 0
    end
end

local function ServerHop()
    local requestFn = request or (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request)
    if not requestFn then
        return
    end
    local servers = {}
    local ok, res = pcall(function()
        return requestFn({Url = string.format("https://games.roblox.com/v1/games/%d/servers/Public?sortOrder=Desc&limit=100", game.PlaceId)})
    end)
    if not ok or type(res) ~= "table" or type(res.Body) ~= "string" then
        return
    end
    local body = nil
    pcall(function() body = HttpService:JSONDecode(res.Body) end)
    if body and body.data then
        for _, v in ipairs(body.data) do
            if type(v) == "table" and tonumber(v.playing) and tonumber(v.maxPlayers) and v.playing < v.maxPlayers and v.id ~= game.JobId then
                table.insert(servers, v.id)
            end
        end
    end
    if #servers > 0 then
        game:GetService("TeleportService"):TeleportToPlaceInstance(game.PlaceId, servers[math.random(1, #servers)], LocalPlayer)
    end
end

local function isToolEquipped(name)
    return LocalPlayer.Character and LocalPlayer.Character:FindFirstChild(name) or LocalPlayer.Backpack:FindFirstChild(name)
end

local function createTargetingTool()
    if isToolEquipped("ClickTarget") then
        return
    end
    local GetTargetTool = Instance.new("Tool")
    GetTargetTool.Name = "ClickTarget"
    GetTargetTool.RequiresHandle = false
    GetTargetTool.TextureId = "rbxassetid://2716591855"
    GetTargetTool.ToolTip = "Select Target"
    GetTargetTool.Activated:Connect(function()
        local hit = mouse.Target
        local person = nil
        if hit and hit.Parent then
            if hit.Parent:IsA("Model") then
                person = Players:GetPlayerFromCharacter(hit.Parent)
            elseif hit.Parent:IsA("Accessory") then
                person = Players:GetPlayerFromCharacter(hit.Parent.Parent)
            end
        end
        if person then
            UpdateTarget(person)
        end
    end)
    GetTargetTool.Parent = LocalPlayer.Backpack
end

local function createModdedPushTool()
    if isToolEquipped("ModdedPush") then
        return
    end
    local ModdedPush = Instance.new("Tool")
    ModdedPush.Name = "ModdedPush"
    ModdedPush.RequiresHandle = false
    ModdedPush.TextureId = "rbxassetid://14478599909"
    ModdedPush.ToolTip = "Modded push"
    ModdedPush.Activated:Connect(function()
        local root = GetRoot(LocalPlayer)
        local hit = mouse.Target
        local person = nil
        if hit and hit.Parent then
            if hit.Parent:IsA("Model") then
                person = Players:GetPlayerFromCharacter(hit.Parent)
            elseif hit.Parent:IsA("Accessory") then
                person = Players:GetPlayerFromCharacter(hit.Parent.Parent)
            end
        end
        if person then
            local pushpos = root.CFrame
            PredictionTP(person)
            task.wait(GetPing() + 0.05)
            Push(person)
            root.CFrame = pushpos
        end
    end)
    ModdedPush.Parent = LocalPlayer.Backpack
end

local function createFreeEmotes()
    if FreeEmotesEnabled then
        return
    end
    FreeEmotesEnabled = true
    SendNotify("System Broken", "Loading free emotes. Credits: Gi#7331", 5)
    pcall(function()
        loadstring(game:HttpGet("https://raw.githubusercontent.com/H20CalibreYT/SystemBroken/main/AllEmotes"))()
    end)
end

local function LoadScriptLibraryButton(name, url)
    return function()
        pcall(function()
            loadstring(game:HttpGet(url, true))()
        end)
    end
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

-- Feature tabs extracted from SystemBroken
local CharacterTab = Window:AddTab({ Name = "Character" })
local CharacterSection = CharacterTab:AddSection({ Name = "Movement" })
local WalkSpeedInput = CharacterSection:AddTextbox({ Name = "Walk Speed", Placeholder = "Number [1-99999]", Default = "16" })
CharacterSection:AddButton({ Name = "Set Walk Speed", Callback = function()
    local speed = tonumber(WalkSpeedInput:Get()) or 16
    pcall(function()
        if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
            LocalPlayer.Character.Humanoid.WalkSpeed = speed
            SendNotify("System Broken", "Walk speed updated.", 5)
        end
    end)
end })

local JumpPowerInput = CharacterSection:AddTextbox({ Name = "Jump Power", Placeholder = "Number [1-99999]", Default = "50" })
CharacterSection:AddButton({ Name = "Set Jump Power", Callback = function()
    local power = tonumber(JumpPowerInput:Get()) or 50
    pcall(function()
        if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
            LocalPlayer.Character.Humanoid.JumpPower = power
            SendNotify("System Broken", "Jump power updated.", 5)
        end
    end)
end })

local FlySpeedInput = CharacterSection:AddTextbox({ Name = "Fly Speed", Placeholder = "Number [1-99999]", Default = "50" })
CharacterSection:AddButton({ Name = "Set Fly Speed", Callback = function()
    FlySpeed = tonumber(FlySpeedInput:Get()) or 50
    SendNotify("System Broken", "Fly speed updated.", 5)
end })

CharacterSection:AddButton({ Name = "Save Checkpoint", Callback = function()
    local root = GetRoot(LocalPlayer)
    if root then
        SavedCheckpoint = root.Position
        SendNotify("System Broken", "Checkpoint saved.", 5)
    end
end })

CharacterSection:AddButton({ Name = "Clear Checkpoint", Callback = function()
    SavedCheckpoint = nil
    SendNotify("System Broken", "Checkpoint cleared.", 5)
end })

CharacterSection:AddButton({ Name = "Respawn", Callback = function()
    local root = GetRoot(LocalPlayer)
    local pos = root and root.Position
    if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
        LocalPlayer.Character.Humanoid.Health = 0
        if pos then
            LocalPlayer.CharacterAdded:Wait()
            task.wait(GetPing() + 0.1)
            TeleportTO(pos.X, pos.Y, pos.Z, "pos", "safe")
        end
    end
end })

CharacterSection:AddToggle({ Name = "Fly", Flag = "CharacterFly", Callback = function(enabled)
    if enabled then
        startFly()
        SendNotify("System Broken", "Fly enabled.", 5)
    else
        stopFly()
        SendNotify("System Broken", "Fly disabled.", 5)
    end
end })

local TargetTab = Window:AddTab({ Name = "Target" })
local TargetSection = TargetTab:AddSection({ Name = "Target Actions" })
TargetNameInput = TargetSection:AddTextbox({ Name = "Target Name", Placeholder = "@target...", Default = "" })
TargetInfoLabel = TargetSection:AddLabel("UserID: \nDisplay: \nJoined: ")
TargetImageLabel = TargetSection:AddImageLabel({ Name = "Target Image", Image = "rbxassetid://10818605405", SizeY = 128 })
TargetSection:AddButton({ Name = "Select Target Tool", Callback = function()
    createTargetingTool()
    SendNotify("System Broken", "Click the target tool on a player.", 5)
end })
TargetSection:AddButton({ Name = "Push Target", Callback = function()
    if TargetedPlayer then
        local root = GetRoot(LocalPlayer)
        local oldPos = root and root.CFrame
        PredictionTP(TargetedPlayer)
        task.wait(GetPing() + 0.05)
        Push(TargetedPlayer)
        if oldPos then
            root.CFrame = oldPos
        end
    end
end })
TargetSection:AddButton({ Name = "Teleport To Target", Callback = function()
    if TargetedPlayer then
        TeleportTO(0, 0, 0, TargetedPlayer, "safe")
    end
end })
TargetSection:AddButton({ Name = "Whitelist Target", Callback = function()
    if TargetedPlayer then
        local id = TargetedPlayer.UserId
        if table.find(ScriptWhitelist, id) then
            for i, v in ipairs(ScriptWhitelist) do
                if v == id then
                    table.remove(ScriptWhitelist, i)
                    break
                end
            end
            SendNotify("System Broken", TargetedPlayer.Name .. " removed from whitelist.", 5)
        else
            table.insert(ScriptWhitelist, id)
            SendNotify("System Broken", TargetedPlayer.Name .. " added to whitelist.", 5)
        end
    end
end })
TargetSection:AddButton({ Name = "Clear Target", Callback = function()
    UpdateTarget(nil)
    SendNotify("System Broken", "Target cleared.", 5)
end })
TargetSection:AddToggle({ Name = "View Target", Flag = "ViewTarget", Callback = function(enabled)
    task.spawn(function()
        if enabled and TargetedPlayer then
            repeat
                pcall(function()
                    if TargetedPlayer.Character and TargetedPlayer.Character:FindFirstChild("Humanoid") then
                        workspace.CurrentCamera.CameraSubject = TargetedPlayer.Character.Humanoid
                    end
                end)
                task.wait(0.5)
            until not UI.Flags.ViewTarget
            if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
                workspace.CurrentCamera.CameraSubject = LocalPlayer.Character.Humanoid
            end
        end
    end)
end })
TargetSection:AddToggle({ Name = "Fling Target", Flag = "FlingTarget", Callback = function(enabled)
    if enabled and TargetedPlayer then
        task.spawn(function()
            repeat
                pcall(function()
                    PredictionTP(TargetedPlayer, "safe")
                end)
                task.wait(0.2)
            until not UI.Flags.FlingTarget
        end)
    end
end })

TargetNameInput.OnFocusLost(function(text)
    local player = GetPlayer(text)
    UpdateTarget(player)
end)

local AnimationsTab = Window:AddTab({ Name = "Animations" })
local AnimSection = AnimationsTab:AddSection({ Name = "Presets" })
local function addAnimButton(name, preset)
    AnimSection:AddButton({ Name = name, Callback = function()
        setAnimationPreset(preset)
    end })
end
addAnimButton("Vampire", {
    idle1 = "http://www.roblox.com/asset/?id=1083445855",
    idle2 = "http://www.roblox.com/asset/?id=1083450166",
    walk = "http://www.roblox.com/asset/?id=1083473930",
    run = "http://www.roblox.com/asset/?id=1083462077",
    jump = "http://www.roblox.com/asset/?id=1083455352",
    climb = "http://www.roblox.com/asset/?id=1083439238",
    fall = "http://www.roblox.com/asset/?id=1083443587",
})
addAnimButton("Hero", {
    idle1 = "http://www.roblox.com/asset/?id=616111295",
    idle2 = "http://www.roblox.com/asset/?id=616113536",
    walk = "http://www.roblox.com/asset/?id=616122287",
    run = "http://www.roblox.com/asset/?id=616117076",
    jump = "http://www.roblox.com/asset/?id=616115533",
    climb = "http://www.roblox.com/asset/?id=616104706",
    fall = "http://www.roblox.com/asset/?id=616108001",
})
addAnimButton("Zombie Classic", {
    idle1 = "http://www.roblox.com/asset/?id=616158929",
    idle2 = "http://www.roblox.com/asset/?id=616160636",
    walk = "http://www.roblox.com/asset/?id=616168032",
    run = "http://www.roblox.com/asset/?id=616163682",
    jump = "http://www.roblox.com/asset/?id=616161997",
    climb = "http://www.roblox.com/asset/?id=616156119",
    fall = "http://www.roblox.com/asset/?id=616157476",
})
addAnimButton("Mage", {
    idle1 = "http://www.roblox.com/asset/?id=707742142",
    idle2 = "http://www.roblox.com/asset/?id=707855907",
    walk = "http://www.roblox.com/asset/?id=707897309",
    run = "http://www.roblox.com/asset/?id=707861613",
    jump = "http://www.roblox.com/asset/?id=707853694",
    climb = "http://www.roblox.com/asset/?id=707826056",
    fall = "http://www.roblox.com/asset/?id=707829716",
})
addAnimButton("Ghost", {
    idle1 = "http://www.roblox.com/asset/?id=616006778",
    idle2 = "http://www.roblox.com/asset/?id=616008087",
    walk = "http://www.roblox.com/asset/?id=616010382",
    run = "http://www.roblox.com/asset/?id=616013216",
    jump = "http://www.roblox.com/asset/?id=616008936",
    climb = "http://www.roblox.com/asset/?id=616003713",
    fall = "http://www.roblox.com/asset/?id=616005863",
})
addAnimButton("Elder", {
    idle1 = "http://www.roblox.com/asset/?id=845397899",
    idle2 = "http://www.roblox.com/asset/?id=845400520",
    walk = "http://www.roblox.com/asset/?id=845403856",
    run = "http://www.roblox.com/asset/?id=845386501",
    jump = "http://www.roblox.com/asset/?id=845398858",
    climb = "http://www.roblox.com/asset/?id=845392038",
    fall = "http://www.roblox.com/asset/?id=845396048",
})
addAnimButton("Levitation", {
    idle1 = "http://www.roblox.com/asset/?id=616006778",
    idle2 = "http://www.roblox.com/asset/?id=616008087",
    walk = "http://www.roblox.com/asset/?id=616013216",
    run = "http://www.roblox.com/asset/?id=616010382",
    jump = "http://www.roblox.com/asset/?id=616008936",
    climb = "http://www.roblox.com/asset/?id=616003713",
    fall = "http://www.roblox.com/asset/?id=616005863",
})
addAnimButton("Astronaut", {
    idle1 = "http://www.roblox.com/asset/?id=891621366",
    idle2 = "http://www.roblox.com/asset/?id=891633237",
    walk = "http://www.roblox.com/asset/?id=891667138",
    run = "http://www.roblox.com/asset/?id=891636393",
    jump = "http://www.roblox.com/asset/?id=891627522",
    climb = "http://www.roblox.com/asset/?id=891609353",
    fall = "http://www.roblox.com/asset/?id=891617961",
})
addAnimButton("Ninja", {
    idle1 = "http://www.roblox.com/asset/?id=656117400",
    idle2 = "http://www.roblox.com/asset/?id=656118341",
    walk = "http://www.roblox.com/asset/?id=656121766",
    run = "http://www.roblox.com/asset/?id=656118852",
    jump = "http://www.roblox.com/asset/?id=656117878",
    climb = "http://www.roblox.com/asset/?id=656114359",
    fall = "http://www.roblox.com/asset/?id=656115606",
})
addAnimButton("Werewolf", {
    idle1 = "http://www.roblox.com/asset/?id=1083195517",
    idle2 = "http://www.roblox.com/asset/?id=1083214717",
    walk = "http://www.roblox.com/asset/?id=1083178339",
    run = "http://www.roblox.com/asset/?id=1083216690",
    jump = "http://www.roblox.com/asset/?id=1083218792",
    climb = "http://www.roblox.com/asset/?id=1083182000",
    fall = "http://www.roblox.com/asset/?id=1083189019",
})
addAnimButton("Cartoon", {
    idle1 = "http://www.roblox.com/asset/?id=742637544",
    idle2 = "http://www.roblox.com/asset/?id=742638445",
    walk = "http://www.roblox.com/asset/?id=742640026",
    run = "http://www.roblox.com/asset/?id=742638842",
    jump = "http://www.roblox.com/asset/?id=742637942",
    climb = "http://www.roblox.com/asset/?id=742636889",
    fall = "http://www.roblox.com/asset/?id=742637151",
})
addAnimButton("Pirate", {
    idle1 = "http://www.roblox.com/asset/?id=750781874",
    idle2 = "http://www.roblox.com/asset/?id=750782770",
    walk = "http://www.roblox.com/asset/?id=750785693",
    run = "http://www.roblox.com/asset/?id=750783738",
    jump = "http://www.roblox.com/asset/?id=750782230",
    climb = "http://www.roblox.com/asset/?id=750779899",
    fall = "http://www.roblox.com/asset/?id=750780242",
})
addAnimButton("Sneaky", {
    idle1 = "http://www.roblox.com/asset/?id=1132473842",
    idle2 = "http://www.roblox.com/asset/?id=1132477671",
    walk = "http://www.roblox.com/asset/?id=1132510133",
    run = "http://www.roblox.com/asset/?id=1132494274",
    jump = "http://www.roblox.com/asset/?id=1132489853",
    climb = "http://www.roblox.com/asset/?id=1132461372",
    fall = "http://www.roblox.com/asset/?id=1132469004",
})
addAnimButton("Toy", {
    idle1 = "http://www.roblox.com/asset/?id=782841498",
    idle2 = "http://www.roblox.com/asset/?id=782845736",
    walk = "http://www.roblox.com/asset/?id=782843345",
    run = "http://www.roblox.com/asset/?id=782842708",
    jump = "http://www.roblox.com/asset/?id=782847020",
    climb = "http://www.roblox.com/asset/?id=782843869",
    fall = "http://www.roblox.com/asset/?id=782846423",
})
addAnimButton("Knight", {
    idle1 = "http://www.roblox.com/asset/?id=657595757",
    idle2 = "http://www.roblox.com/asset/?id=657568135",
    walk = "http://www.roblox.com/asset/?id=657552124",
    run = "http://www.roblox.com/asset/?id=657564596",
    jump = "http://www.roblox.com/asset/?id=658409194",
    climb = "http://www.roblox.com/asset/?id=658360781",
    fall = "http://www.roblox.com/asset/?id=657600338",
})
addAnimButton("Confident", {
    idle1 = "http://www.roblox.com/asset/?id=1069977950",
    idle2 = "http://www.roblox.com/asset/?id=1069987858",
    walk = "http://www.roblox.com/asset/?id=1070017263",
    run = "http://www.roblox.com/asset/?id=1070001516",
    jump = "http://www.roblox.com/asset/?id=1069984524",
    climb = "http://www.roblox.com/asset/?id=1069946257",
    fall = "http://www.roblox.com/asset/?id=1069973677",
})
addAnimButton("Popstar", {
    idle1 = "http://www.roblox.com/asset/?id=1212900985",
    idle2 = "http://www.roblox.com/asset/?id=1212900985",
    walk = "http://www.roblox.com/asset/?id=1212980338",
    run = "http://www.roblox.com/asset/?id=1212980348",
    jump = "http://www.roblox.com/asset/?id=1212954642",
    climb = "http://www.roblox.com/asset/?id=1213044953",
    fall = "http://www.roblox.com/asset/?id=1212900995",
})
addAnimButton("Princess", {
    idle1 = "http://www.roblox.com/asset/?id=941003647",
    idle2 = "http://www.roblox.com/asset/?id=941013098",
    walk = "http://www.roblox.com/asset/?id=941028902",
    run = "http://www.roblox.com/asset/?id=941015281",
    jump = "http://www.roblox.com/asset/?id=941008832",
    climb = "http://www.roblox.com/asset/?id=940996062",
    fall = "http://www.roblox.com/asset/?id=941000007",
})
addAnimButton("Cowboy", {
    idle1 = "http://www.roblox.com/asset/?id=1014390418",
    idle2 = "http://www.roblox.com/asset/?id=1014398616",
    walk = "http://www.roblox.com/asset/?id=1014421541",
    run = "http://www.roblox.com/asset/?id=1014401683",
    jump = "http://www.roblox.com/asset/?id=1014394726",
    climb = "http://www.roblox.com/asset/?id=1014380606",
    fall = "http://www.roblox.com/asset/?id=1014384571",
})
addAnimButton("Patrol", {
    idle1 = "http://www.roblox.com/asset/?id=1149612882",
    idle2 = "http://www.roblox.com/asset/?id=1150842221",
    walk = "http://www.roblox.com/asset/?id=1151231493",
    run = "http://www.roblox.com/asset/?id=1150967949",
    jump = "http://www.roblox.com/asset/?id=1150944216",
    climb = "http://www.roblox.com/asset/?id=1148811837",
    fall = "http://www.roblox.com/asset/?id=1148863382",
})
addAnimButton("Zombie FE", {
    idle1 = "http://www.roblox.com/asset/?id=3489171152",
    idle2 = "http://www.roblox.com/asset/?id=3489171152",
    walk = "http://www.roblox.com/asset/?id=3489174223",
    run = "http://www.roblox.com/asset/?id=3489173414",
    jump = "http://www.roblox.com/asset/?id=616161997",
    climb = "http://www.roblox.com/asset/?id=616156119",
    fall = "http://www.roblox.com/asset/?id=616157476",
})

local MiscTab = Window:AddTab({ Name = "Misc" })
local MiscSection = MiscTab:AddSection({ Name = "Utilities" })
MiscSection:AddToggle({ Name = "Anti fling", Flag = "MiscAntiFling", Callback = function(enabled)
    if enabled then
        loadstring(game:HttpGet('https://raw.githubusercontent.com/H20CalibreYT/SystemBroken/main/AntiFling'))()
    end
end })
MiscSection:AddToggle({ Name = "Anti chat spy", Flag = "MiscAntiChatSpy", Callback = function(enabled)
    if enabled then
        AntiChatSpyConnection = task.spawn(function()
            while UI.Flags.MiscAntiChatSpy do
                Players:Chat(RandomChar())
                task.wait(1)
            end
        end)
    elseif AntiChatSpyConnection then
        AntiChatSpyConnection = nil
    end
end })
MiscSection:AddToggle({ Name = "Anti AFK", Flag = "MiscAntiAFK", Callback = function(enabled)
    if enabled then
        AntiAFKConnection = LocalPlayer.Idled:Connect(function()
            local VirtualUser = game:GetService("VirtualUser")
            VirtualUser:CaptureController()
            VirtualUser:ClickButton2(Vector2.new())
        end)
    elseif AntiAFKConnection then
        AntiAFKConnection:Disconnect()
        AntiAFKConnection = nil
    end
end })
MiscSection:AddToggle({ Name = "Shaders", Flag = "MiscShaders", Callback = function(enabled)
    applyShaderEffects(enabled)
end })
MiscSection:AddButton({ Name = "Day", Callback = function()
    if UI.Flags.MiscShaders then
        game:GetService("Lighting").ClockTime = 14
    else
        SendNotify("System Broken", "Please turn on shaders first.", 5)
    end
end })
MiscSection:AddButton({ Name = "Night", Callback = function()
    if UI.Flags.MiscShaders then
        game:GetService("Lighting").ClockTime = 19
    else
        SendNotify("System Broken", "Please turn on shaders first.", 5)
    end
end })
MiscSection:AddButton({ Name = "Rejoin", Callback = function()
    game:GetService("TeleportService"):TeleportToPlaceInstance(game.PlaceId, game.JobId, LocalPlayer)
end })
MiscSection:AddButton({ Name = "CMDX", Callback = LoadScriptLibraryButton("CMDX", "https://raw.githubusercontent.com/CMD-X/CMD-X/master/Source") })
MiscSection:AddButton({ Name = "Infinite Yield", Callback = LoadScriptLibraryButton("InfiniteYield", "https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source") })
MiscSection:AddButton({ Name = "Explode", Callback = function()
    ToggleRagdoll(false)
    task.wait()
    if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
        LocalPlayer.Character.Humanoid:ChangeState(0)
        local root = GetRoot(LocalPlayer)
        if root then
            local bav = Instance.new("BodyAngularVelocity")
            bav.Parent = root
            bav.Name = "Spin"
            bav.MaxTorque = Vector3.new(0, math.huge, 0)
            bav.AngularVelocity = Vector3.new(0, 150, 0)
            task.wait(3)
            if bav.Parent then bav:Destroy() end
            LocalPlayer.Character.Humanoid:ChangeState(15)
        end
    end
end })
MiscSection:AddButton({ Name = "Free emotes", Callback = function()
    createFreeEmotes()
end })
MiscSection:AddButton({ Name = "Server hop", Callback = function()
    ServerHop()
end })
local ChatBypassInput = MiscSection:AddTextbox({ Name = "Chat Bypass", Placeholder = "Chat bypass [You won't get banned for your messages]", Default = "" })
ChatBypassInput.OnFocusLost(function(text)
    if not text or text == "" then
        return
    end

    local ok, err = pcall(function()
        local args = { [1] = text, [2] = "All" }
        game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer(unpack(args))
    end)

    if not ok then
        warn("ChatBypass send failed:", err)
    end

    ChatBypassInput:Set("")
end)

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
