-- ============================================================
--  YouSuck — SCRIPT AVEC UI INTÉGRÉE (fixed)
--  Uses embedded UI library and robust key validation against web API
-- ============================================================

local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")
local TweenService = game:GetService("TweenService")

while not Players.LocalPlayer do
    task.wait(0.1)
end
local LocalPlayer = Players.LocalPlayer

local UI, Window, SettingsTab

local KEY_FILE = "yousuck_key.txt"
local SETTINGS_FILE = "yousuck_settings.json"
local VALIDATION_URL = "https://yoursuck.vercel.app/api/verify-key"
local CLIENT_HEARTBEAT_URL = "https://yoursuck.vercel.app/api/clients"
local heartbeatStarted = false

local function getSavedKey()
    if type(readfile) == "function" and type(isfile) == "function" then
        if isfile(KEY_FILE) then
            local ok, content = pcall(readfile, KEY_FILE)
            if ok and type(content) == "string" then
                return content:gsub("^%s*(.-)%s*$", "%1")
            end
        end
    end
    return nil
end

local function saveKey(key)
    if type(writefile) == "function" and key ~= "test" then
        pcall(writefile, KEY_FILE, key)
    end
end

local function getSavedSettings()
    if type(readfile) == "function" and type(isfile) == "function" then
        if isfile(SETTINGS_FILE) then
            local ok, content = pcall(readfile, SETTINGS_FILE)
            if ok and type(content) == "string" then
                local decodeOk, data = pcall(function() return HttpService:JSONDecode(content) end)
                if decodeOk and type(data) == "table" then
                    return data
                end
            end
        end
    end
    return {}
end

local function saveSettings(settings)
    if type(writefile) == "function" then
        local ok, content = pcall(function() return HttpService:JSONEncode(settings) end)
        if ok then
            pcall(writefile, SETTINGS_FILE, content)
        end
    end
end

local function debugPrint(...)
    local parts = {}
    for i = 1, select("#", ...) do
        parts[i] = tostring(select(i, ...))
    end
    pcall(function() print("[YouSuck] " .. table.concat(parts, " ")) end)
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

local function getGameName()
    local name = "Roblox"
    local ok, info = pcall(function()
        return game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId)
    end)
    if ok and type(info) == "table" and type(info.Name) == "string" and info.Name ~= "" then
        name = info.Name
    end
    return name
end

local function startClientHeartbeat()
    if not hasRequestApi() then
        debugPrint("Heartbeat disabled: no supported request API available")
        return
    end
    local uptime = 0
    task.spawn(function()
        while true do
            local payload = {
                robloxId = tostring(LocalPlayer.UserId or ""),
                robloxName = tostring(LocalPlayer.Name or "Player"),
                gameName = getGameName(),
                gameId = tostring(game.PlaceId or ""),
                uptime = uptime,
                executor = getExecutorName(),
                executorVersion = tostring((syn and syn.version) or "")
            }
            local ok, res = pcall(function() return safePost(CLIENT_HEARTBEAT_URL, payload) end)
            if not ok then
                debugPrint("Heartbeat request failed:", res)
            elseif ok and res == false then
                debugPrint("Heartbeat request returned false or no response")
            else
                debugPrint("Heartbeat sent", payload.robloxId, payload.gameId, payload.uptime)
            end
            uptime = uptime + 10
            task.wait(10)
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

UI = loadLocalUILibrary() or (function()
    if typeof(Font) ~= "table" or type(Font.new) ~= "function" then
        Font = Font or {}
        Font.new = function(...) return Enum.Font.Gotham end
    end

    local Players = game:GetService("Players")
    local TweenService = game:GetService("TweenService")
    local UserInputService = game:GetService("UserInputService")
    local HttpService = game:GetService("HttpService")
    local Player = Players.LocalPlayer

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

        local parentGui = Player:WaitForChild("PlayerGui")
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
            self.Window:Notify("Accent saved.", "success", 2)
        end)

        return container
    end

    function WindowMethods:Notify(msg, kind, duration)
        local accentColor = Theme.Accent
        if kind == "success" then accentColor = Theme.Success
        elseif kind == "error" then accentColor = Theme.Error end

        local Note = new("Frame", {
            Size = UDim2.new(0, 300, 0, 48),
            Position = UDim2.new(0.5, -150, 1, 60),
            BackgroundColor3 = Theme.Surface,
            BorderSizePixel = 0,
            Parent = self.Gui,
        })
        corner(Note, 8)
        local nStroke = stroke(Note, Theme.Accent, 1.5, 0)
        nStroke.Color = accentColor
        new("TextLabel", {
            Size = UDim2.new(1, -24, 1, 0),
            Position = UDim2.new(0, 14, 0, 0),
            BackgroundTransparency = 1,
            Text = msg,
            TextColor3 = Theme.Text,
            FontFace = FONT_REG,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextWrapped = true,
            Parent = Note,
        })

        tween(Note, { Position = UDim2.new(0.5, -150, 1, -70) }, 0.3)
        task.delay(duration or 3, function()
            tween(Note, { Position = UDim2.new(0.5, -150, 1, 60) }, 0.3)
            task.wait(0.3)
            Note:Destroy()
        end)
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

local State = {
    AutoWork = false,
    AutoHeal = false,
    AutoPatient = false,
    WalkSpeed = 16,
    InfiniteJump = false,
    PlayerESP = false,
    SelectedClass = "Intern",
}

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
    return
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

Window.KeyValidated = false
Window._keyValidator = nil
function Window:SetKeyValidator(fn) self._keyValidator = fn end
function Window:KeyValidationResult(valid, message)
    if valid then
        if not heartbeatStarted then
            heartbeatStarted = true
            startClientHeartbeat()
        end
        Overlay.Visible = false
        Window.KeyValidated = true
        StatusLabel.Text = message or "Access granted."
        local enteredKey = tostring(KeyBox.Text or ""):gsub("^%s*(.-)%s*$", "%1")
        if enteredKey ~= "" and enteredKey ~= "test" then
            saveKey(enteredKey)
        end
    else
        StatusLabel.Text = message or "Invalid key."
    end
end

ValidateBtn.MouseButton1Click:Connect(function()
    animateClick(ValidateBtn)
    local key = tostring(KeyBox.Text or ""):gsub("^%s*(.-)%s*$", "%1")
    if key == "" then StatusLabel.Text = "Enter a key to continue."; return end
    if type(Window._keyValidator) ~= "function" then
        StatusLabel.Text = "Validation disabled: validator missing. Reload the script."
        debugPrint("Key validator missing", Window._keyValidator)
        return
    end
    StatusLabel.Text = "Validating..."
    local ok, res = pcall(function() return Window._keyValidator(key, function(v, m) Window:KeyValidationResult(v, m) end) end)
    if not ok then
        StatusLabel.Text = "Validation error: " .. tostring(res)
        debugPrint("Key validation threw error", res)
        return
    end
    if type(res) == "boolean" then
        Window:KeyValidationResult(res)
        return
    end
    if type(res) ~= "boolean" then
        StatusLabel.Text = "Validation failed unexpectedly."
        debugPrint("Validator returned unexpected result", res)
    end
end)

FetchBtn.MouseButton1Click:Connect(function()
    animateClick(FetchBtn)
    if setclipboard then pcall(setclipboard, "https://yoursuck.vercel.app/") end
    StatusLabel.Text = "Key URL copied to clipboard."
end)

local function hasRequestApi()
    return (type(syn) == "table" and type(syn.request) == "function")
        or (type(http) == "table" and type(http.request) == "function")
        or type(http_request) == "function"
        or (type(fluxus) == "table" and type(fluxus.request) == "function")
        or (typeof(game) == "table" and type(game.HttpPost) == "function")
        or (HttpService and (type(HttpService.RequestAsync) == "function" or type(HttpService.PostAsync) == "function" or type(HttpService.GetAsync) == "function"))
end

local function safeGet(url)
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

    if HttpService and type(HttpService.RequestAsync) == "function" then
        local ok, res = pcall(function()
            return HttpService:RequestAsync({ Url = url, Method = "GET", Headers = { ["Content-Type"] = "application/json" } })
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

    if HttpService and type(HttpService.RequestAsync) == "function" then
        local ok, res = pcall(function()
            return HttpService:RequestAsync({ Url = url, Method = "POST", Body = payload, Headers = headers })
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
    if not Window or not Window.Gui then return end
    local existing = Window.Gui:FindFirstChild("SavedKeyNotice")
    if existing then existing:Destroy() end

    local note = make("Frame", {
        Name = "SavedKeyNotice",
        Size = UDim2.new(0, 340, 0, 56),
        Position = UDim2.new(1, -360, 1, -80),
        BackgroundColor3 = Color3.fromRGB(12, 12, 12),
        BorderSizePixel = 0,
        ZIndex = 1000,
        Parent = Window.Gui,
    })
    make("UICorner", { CornerRadius = UDim.new(0, 14), Parent = note })

    make("Frame", {
        Name = "AccentBar",
        Size = UDim2.new(0, 4, 1, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = Color3.fromRGB(56, 189, 248),
        BorderSizePixel = 0,
        Parent = note,
    })

    make("TextLabel", {
        Name = "NoticeText",
        Size = UDim2.new(1, -28, 1, -24),
        Position = UDim2.new(0, 12, 0, 12),
        BackgroundTransparency = 1,
        Text = text,
        TextColor3 = Color3.fromRGB(235, 235, 235),
        Font = Enum.Font.Gotham,
        TextSize = 14,
        TextWrapped = true,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextYAlignment = Enum.TextYAlignment.Top,
        Parent = note,
    })

    task.delay(5, function()
        if note and note.Parent then
            note:Destroy()
        end
    end)
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
    s = s:gsub("[^A-Za-z0-9%-]", "")
    s = s:upper()
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
        if Window and typeof(Window.Notify) == "function" then
            Window:Notify("Hide UI key saved.", "success", 2)
        end
    end
end })

if savedKey and savedKey ~= "" then
    StatusLabel.Text = "Validating saved key..."
    task.spawn(function()
        task.wait(0.2)
        local success, res = pcall(function()
            return Window._keyValidator(savedKey, function(v, m)
                Window:KeyValidationResult(v, m)
            end)
        end)

        if not success or res == false then
            if StatusLabel.Text:find("Validation server unreachable") or StatusLabel.Text:find("HTTP not available") or StatusLabel.Text:find("request failed") then
                Overlay.Visible = false
                StatusLabel.Text = "Saved key could not be verified, using cached login."
                Window.KeyValidated = true
                if not heartbeatStarted then
                    heartbeatStarted = true
                    startClientHeartbeat()
                end
            else
                Overlay.Visible = true
                StatusLabel.Text = "Saved key is invalid or expired."
            end
        elseif success and res == true and not heartbeatStarted then
            heartbeatStarted = true
            startClientHeartbeat()
        end
    end)
end

-- Notifications disabled in embedded UI
Window.Notify = function() end

-- Window loaded
Window:SetOpen(true)

-- End of fixed.lua
