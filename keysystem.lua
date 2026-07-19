-- ============================================================
--  YouSuck — SCRIPT AVEC UI INTÉGRÉE
--  Utilise la bibliothèque d'UI fournie : https://gist.githubusercontent.com/GoatTomed/0667a5dd632ac54f2fec153edd7cd1f1/raw/46d7c6f5ab3a33be5f5587b909537c2b3dfcc092/library.lua
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
local VALIDATION_URL = "https://yoursuck.vercel.app/api/verify-key?key=%s"

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
                        print("[AH] Loaded local UI library:", path)
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

print("[AH] Inlined UI library loaded")

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
    warn("[AH] UI library not available or doesn't support CreateWindow")
    return
end

local ok, windowResult = pcall(function()
    return UI:CreateWindow({ Title = "YouSuck", Width = 580, Height = 420 })
end)
if not ok or type(windowResult) ~= "table" then
    warn("[AH] Failed to create window:", windowResult)
    return
end
Window = windowResult
print("[AH] Window created", Window, type(Window.SetOpen), type(Window.AddTab))

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
local StatusLabel = make("TextLabel", { Name = "Status", Size = UDim2.new(1, -40, 0, 20), Position = UDim2.new(0, 20, 0, 116), BackgroundTransparency = 1, Text = "Please enter your site key.", TextColor3 = UI.Theme.TextMid, Font = Enum.Font.Gotham, TextSize = 13, TextXAlignment = Enum.TextXAlignment.Left, Parent = Card })
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

local function showRightToast(msg)
    local screenGui = Window.Gui
    if not screenGui then return end
    local existing = screenGui:FindFirstChild("RightToast")
    if existing then existing:Destroy() end
    local toast = make("Frame", {
        Name = "RightToast",
        Size = UDim2.new(0, 240, 0, 48),
        Position = UDim2.new(1, 10, 0.5, -24),
        BackgroundColor3 = UI.Theme.Surface,
        BorderSizePixel = 0,
        ZIndex = 1000,
        Parent = screenGui
    })
    make("UICorner", { CornerRadius = UDim.new(0, 8), Parent = toast })
    make("UIStroke", { Color = UI.Theme.Error, Thickness = 1.5, Parent = toast })
    make("TextLabel", {
        Size = UDim2.new(1, -20, 1, 0),
        Position = UDim2.new(0, 10, 0, 0),
        BackgroundTransparency = 1,
        Text = msg,
        TextColor3 = UI.Theme.Text,
        Font = Enum.Font.GothamBold,
        TextSize = 14,
        TextXAlignment = Enum.TextXAlignment.Center,
        ZIndex = 1001,
        Parent = toast
    })
    local info = TweenInfo.new(0.35, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)
    local tweenIn = TweenService:Create(toast, info, { Position = UDim2.new(1, -260, 0.5, -24) })
    tweenIn:Play()
    task.delay(3, function()
        if toast and toast.Parent then
            local tweenOut = TweenService:Create(toast, info, { Position = UDim2.new(1, 10, 0.5, -24) })
            tweenOut:Play()
            tweenOut.Completed:Wait()
            if toast and toast.Parent then
                toast:Destroy()
            end
        end
    end)
end

Blocker.MouseButton1Click:Connect(function()
    showRightToast("Redeem A Key")
end)

Window.KeyValidated = false
Window._keyValidator = nil
function Window:SetKeyValidator(fn) self._keyValidator = fn end
function Window:KeyValidationResult(valid, message)
    if valid then
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
    if type(Window._keyValidator) ~= "function" then StatusLabel.Text = "No validator configured."; return end
    StatusLabel.Text = "Validating..."
    local ok, res = pcall(function() return Window._keyValidator(key, function(v, m) Window:KeyValidationResult(v, m) end) end)
    if not ok then StatusLabel.Text = "Validation error." end
    if ok and type(res) == "boolean" then Window:KeyValidationResult(res) end
end)

FetchBtn.MouseButton1Click:Connect(function()
    animateClick(FetchBtn)
    if setclipboard then pcall(setclipboard, "https://yoursuck.vercel.app/") end
    StatusLabel.Text = "Key URL copied to clipboard."
end)

Window:SetKeyValidator(function(key, callback)
    if key == "test" then
        callback(true, "Test key accepted.")
        return true
    end

    if typeof(game.HttpGet) ~= "function" then
        callback(false, "HTTP not available.")
        return false
    end

    local success, response = pcall(function()
        return game:HttpGet(string.format(VALIDATION_URL, HttpService:UrlEncode(key)))
    end)
    if not success or type(response) ~= "string" then
        callback(false, "Validation server unreachable.")
        return false
    end

    local ok, data = pcall(function()
        return HttpService:JSONDecode(response)
    end)
    if not ok or type(data) ~= "table" then
        callback(false, "Bad validation response.")
        return false
    end

    local isValid = data.valid == true
    callback(isValid, tostring(data.message or (isValid and "Access granted." or "Invalid key.")))
    return isValid
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
            Overlay.Visible = true
            StatusLabel.Text = "Saved key is invalid or expired."
        end
    end)
end

Window:Notify("YouSuck UI loaded. Enter key to unlock.", "success", 4)
Window:SetOpen(true)
