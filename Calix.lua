local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

while not Players.LocalPlayer do
    task.wait(0.1)
end

local LocalPlayer = Players.LocalPlayer

local function dim(color, factor)
    factor = factor or 0.78
    return Color3.new(color.R * factor, color.G * factor, color.B * factor)
end

local Theme = {
    BG = Color3.fromRGB(15, 15, 20),
    Sidebar = Color3.fromRGB(24, 24, 30),
    Surface = Color3.fromRGB(31, 31, 40),
    Raised = Color3.fromRGB(42, 42, 52),
    Border = Color3.fromRGB(66, 66, 78),
    Accent = Color3.fromRGB(247, 197, 46),
    AccentDim = Color3.fromRGB(190, 151, 37),
    Text = Color3.fromRGB(245, 245, 245),
    TextMid = Color3.fromRGB(190, 190, 200),
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
    for _, child in ipairs(children or {}) do
        child.Parent = obj
    end
    if props and props.Parent then
        obj.Parent = props.Parent
    end
    return obj
end

local function corner(parent, radius)
    return new("UICorner", { CornerRadius = UDim.new(0, radius or 8), Parent = parent })
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

local function animateClick(button)
    if not button then
        return
    end
    pcall(function()
        tween(button, { BackgroundColor3 = Theme.Accent }, 0.08)
        task.delay(0.1, function()
            tween(button, { BackgroundColor3 = Theme.Raised }, 0.12)
        end)
    end)
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

    local parentGui = LocalPlayer:FindFirstChild("PlayerGui") or LocalPlayer:WaitForChild("PlayerGui")
    local Gui = new("ScreenGui", {
        Name = "CalixUI",
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        IgnoreGuiInset = true,
        Parent = parentGui,
    })

    local Main = new("Frame", {
        Name = "Main",
        Size = UDim2.new(0, cfg.Width or 640, 0, cfg.Height or 440),
        Position = UDim2.new(0.5, -(cfg.Width or 640) / 2, 0.5, -(cfg.Height or 440) / 2),
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
        Text = cfg.Title or "Calix",
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
        if gpe then
            return
        end
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

function WindowMethods:SetAccent(color)
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
            if not self.Open and self.Main then
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

function WindowMethods:CreateTab(data)
    return self:AddTab(data)
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
    local Section = setmetatable({ Name = data.Name or "Section", Window = self.Window }, SectionMethods)
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
    new("UIPadding", { PaddingTop = UDim.new(0, 12), PaddingBottom = UDim.new(0, 12), PaddingLeft = UDim.new(0, 12), PaddingRight = UDim.new(0, 12), Parent = Card })
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

function TabMethods:CreateSection(data)
    return self:AddSection(data)
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
        if onClick then
            pcall(onClick)
        end
    end)
    return Button
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

function SectionMethods:CreateParagraph(data)
    data = data or {}
    self:AddLabel((data.Title and (data.Title .. ": \n") or "") .. tostring(data.Content or ""))
end

function SectionMethods:AddButton(data)
    data = data or {}
    return buildButton(self.Container, data.Name or "Button", data.Callback, data.Small)
end

function SectionMethods:CreateButton(data)
    return self:AddButton(data)
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

function SectionMethods:CreateToggle(data)
    return self:AddToggle(data)
end

function SectionMethods:AddSlider(data)
    data = data or {}
    local min = data.Min or 50
    local max = data.Max or 500
    local value = data.CurrentValue or min
    local label = new("TextLabel", {
        Size = UDim2.new(1, 0, 0, 18),
        BackgroundTransparency = 1,
        Text = (data.Name or "Slider") .. ": " .. tostring(value),
        TextColor3 = Theme.Text,
        FontFace = FONT_REG,
        TextSize = 12,
        TextXAlignment = Enum.TextXAlignment.Left,
        Parent = self.Container,
    })
    local bar = new("Frame", { Size = UDim2.new(1, 0, 0, 8), BackgroundColor3 = Theme.Raised, Parent = self.Container })
    corner(bar, 4)
    local fill = new("Frame", { Size = UDim2.new(0, 0, 1, 0), BackgroundColor3 = Theme.Accent, BorderSizePixel = 0, Parent = bar })
    corner(fill, 4)
    local knob = new("Frame", { Size = UDim2.new(0, 16, 0, 16), Position = UDim2.new(0, -8, 0.5, -8), BackgroundColor3 = Theme.Text, BorderSizePixel = 0, Parent = bar })
    corner(knob, 8)
    local function setValue(v)
        value = math.clamp(math.floor(v), min, max)
        local percent = (value - min) / math.max(max - min, 1)
        fill.Size = UDim2.new(percent, 0, 1, 0)
        knob.Position = UDim2.new(percent, -8, 0.5, -8)
        label.Text = (data.Name or "Slider") .. ": " .. tostring(value)
        if data.Callback then
            pcall(data.Callback, value)
        end
    end
    local dragging = false
    bar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
            local x = math.clamp(input.Position.X - bar.AbsolutePosition.X, 0, bar.AbsoluteSize.X)
            setValue(min + (max - min) * (x / math.max(bar.AbsoluteSize.X, 1)))
        end
    end)
    bar.InputChanged:Connect(function(input)
        if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
            local x = math.clamp(input.Position.X - bar.AbsolutePosition.X, 0, bar.AbsoluteSize.X)
            setValue(min + (max - min) * (x / math.max(bar.AbsoluteSize.X, 1)))
        end
    end)
    bar.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = false
        end
    end)
    setValue(value)
    return label
end

function SectionMethods:CreateSlider(data)
    return self:AddSlider(data)
end

function WindowMethods:Notify(message, kind, duration)
    local banner = new("TextLabel", {
        Size = UDim2.new(0, 220, 0, 34),
        Position = UDim2.new(1, -240, 0, 12),
        BackgroundColor3 = kind == "error" and Color3.fromRGB(180, 60, 60) or Theme.Accent,
        Text = tostring(message or ""),
        TextColor3 = Theme.Text,
        FontFace = FONT_REG,
        TextSize = 13,
        TextXAlignment = Enum.TextXAlignment.Center,
        TextYAlignment = Enum.TextYAlignment.Center,
        Parent = self.Content,
    })
    corner(banner, 10)
    stroke(banner, Theme.Border, 1, 0.3)
    task.delay(duration or 2, function()
        if banner and banner.Parent then
            banner:Destroy()
        end
    end)
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

local autoFarmActive = false
local speed = 200
local trapProtectionEnabled = true

local npcZoneTags = {
    "NPC9_Zone",
    "NPC10_AttackZone",
    "NPC12_LabyrinthZone",
    "NPC15_Zone",
    "NPC15_SpeedZone",
    "MacaronMonster_AttackZone"
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
    "TsunamiModel"
}

local path = {
    Vector3.new(-538.81, 54.73, 1467.41),
    Vector3.new(-1087.84, 54.72, 1467.17),
    Vector3.new(-1092.34, 296.73, 1467.14),
    Vector3.new(-1240.36, 302.92, 1469.17),
    Vector3.new(-1378.21, 290.70, 1468.16),
    Vector3.new(-1422.84, 335.34, 1469.52),
    Vector3.new(-1506.04, 337.10, 1469.52),
    Vector3.new(-1622.44, 321.50, 1469.52),
    Vector3.new(-1816.66, 301.41, 1467.65),
    Vector3.new(-1861.17, 317.35, 1468.30),
    Vector3.new(-2012.61, 307.68, 1467.25),
    Vector3.new(-2155.17, 317.56, 1467.23),
    Vector3.new(-2176.93, 325.10, 1467.23),
    Vector3.new(-2314.67, 315.22, 1467.26),
    Vector3.new(-2345.06, 326.15, 1467.24),
    Vector3.new(-2515.24, 322.99, 1467.24),
    Vector3.new(-2664.66, 294.50, 1480.21),
    Vector3.new(-2780.65, 306.12, 1477.10),
    Vector3.new(-2789.97, 309.54, 1477.40),
    Vector3.new(-2946.51, 296.72, 1477.03),
    Vector3.new(-3943.46, 296.73, 1475.96),
    Vector3.new(-4302.24, 296.71, 1473.44),
    Vector3.new(-4303.76, 343.73, 1473.44),
    Vector3.new(-4310.13, 343.75, 1488.40),
    Vector3.new(-4319.32, 398.57, 1603.56),
    Vector3.new(-4347.34, 400.42, 1610.86),
    Vector3.new(-4347.62, 407.62, 1571.09),
    Vector3.new(-4348.67, 418.48, 1438.44),
    Vector3.new(-4349.52, 434.76, 1406.09),
    Vector3.new(-4327.20, 434.89, 1393.84),
    Vector3.new(-4238.68, 436.17, 1393.75),
    Vector3.new(-4322.98, 440.25, 1493.15),
    Vector3.new(-4325.81, 471.13, 1509.14),
    Vector3.new(-4383.67, 471.24, 1537.19),
    Vector3.new(-5346, 477, 1460),
}

local function destroyZone(inst)
    if inst and inst.Parent then
        inst:Destroy()
    end
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

local function disableTrapPart(part)
    if not part:IsA("BasePart") then
        return
    end
    local name = part.Name
    if string.find(name, "MovingWall")
        or name == "WallL"
        or name == "WallR"
        or name == "LavaPart"
        or name == "Tsunami"
    then
        part.CanCollide = false
        part.CanTouch = false
        part.Transparency = 0.6
    end
end

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

local function getCharacterAndHRP()
    local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
    local hrp = character:FindFirstChild("HumanoidRootPart")
    return character, hrp
end

local function triggerTouchInterest(targetPart, playerPart)
    if firetouchinterest and targetPart and playerPart then
        firetouchinterest(targetPart, playerPart, 0)
        task.wait(0.05)
        firetouchinterest(targetPart, playerPart, 1)
    end
end

local function startFarm(window)
    if autoFarmActive then
        return
    end

    autoFarmActive = true
    window:Notify("Auto farm started", "success", 1.6)

    task.spawn(function()
        while autoFarmActive do
            local character, hrp = getCharacterAndHRP()
            if not hrp or not character:FindFirstChild("Humanoid") or character.Humanoid.Health <= 0 then
                task.wait(0.5)
                continue
            end

            local remotes = ReplicatedStorage:FindFirstChild("Remotes")
            local checkpointEvent = remotes and remotes:FindFirstChild("RequestCheckpointTp")
            if checkpointEvent then
                pcall(function()
                    checkpointEvent:FireServer(6, "wins")
                end)
            end

            task.wait(0.5)
            if not autoFarmActive then
                break
            end

            for _, targetPos in ipairs(path) do
                if not autoFarmActive then
                    break
                end

                character, hrp = getCharacterAndHRP()
                if not hrp or not character:FindFirstChild("Humanoid") or character.Humanoid.Health <= 0 then
                    break
                end

                local distance = (hrp.Position - targetPos).Magnitude
                local duration = math.max(distance / speed, 0.05)
                local tweenInfo = TweenInfo.new(duration, Enum.EasingStyle.Linear)
                local tween = TweenService:Create(hrp, tweenInfo, { CFrame = CFrame.new(targetPos) })

                local completed = false
                local connection
                connection = tween.Completed:Connect(function()
                    completed = true
                end)
                tween:Play()

                while not completed and autoFarmActive do
                    task.wait()
                    if not hrp or not hrp.Parent or not character:FindFirstChild("Humanoid") or character.Humanoid.Health <= 0 then
                        tween:Cancel()
                        if connection then
                            connection:Disconnect()
                        end
                        break
                    end
                end

                if connection then
                    connection:Disconnect()
                end
                if not completed then
                    break
                end
            end

            if not autoFarmActive then
                break
            end

            local winBlock = Workspace:FindFirstChild("Structure")
                and Workspace.Structure:FindFirstChild("Stage13")
                and Workspace.Structure.Stage13:FindFirstChild("WinBlock12")

            if winBlock then
                character, hrp = getCharacterAndHRP()
                if hrp then
                    triggerTouchInterest(winBlock, hrp)
                end
            end

            task.wait(0.5)
        end

        if not autoFarmActive then
            autoFarmActive = false
        end
    end)
end

local function stopFarm(window)
    if not autoFarmActive then
        return
    end
    autoFarmActive = false
    window:Notify("Auto farm stopped", "error", 1.6)
end

local Window = UI:CreateWindow({ Title = "Calix", Width = 640, Height = 440, ToggleKey = Enum.KeyCode.RightShift })

local mainTab = Window:CreateTab({ Name = "Main Farm" })
local mainSection = mainTab:CreateSection({ Name = "Automation" })
mainSection:CreateParagraph({
    Title = "Warning",
    Content = "This script is not verified. Use at your own risk.",
})
mainSection:CreateToggle({
    Name = "Auto Farm",
    CurrentValue = false,
    Callback = function(Value)
        if Value then
            startFarm(Window)
        else
            stopFarm(Window)
        end
    end,
})
mainSection:CreateSlider({
    Name = "Fly Speed",
    Min = 50,
    Max = 500,
    CurrentValue = speed,
    Callback = function(Value)
        speed = Value
    end,
})
mainSection:CreateToggle({
    Name = "Trap Disarmer",
    CurrentValue = true,
    Callback = function(Value)
        trapProtectionEnabled = Value
        Window:Notify(Value and "Trap disarmer enabled" or "Trap disarmer disabled", "success", 1.4)
    end,
})
mainSection:CreateButton({
    Name = "Disable Existing Traps",
    Callback = function()
        for _, tag in ipairs(trapTags) do
            for _, trap in ipairs(CollectionService:GetTagged(tag)) do
                for _, desc in ipairs(trap:GetDescendants()) do
                    disableTrapPart(desc)
                end
            end
        end
        Window:Notify("Existing traps disabled", "success", 1.4)
    end,
})

local bypassTab = Window:CreateTab({ Name = "Bypasses" })
local bypassSection = bypassTab:CreateSection({ Name = "Anti Death" })
bypassSection:CreateParagraph({
    Title = "Godmode",
    Content = "Prevents local humanoid health from being set to 0 by the server.",
})

local executorTab = Window:CreateTab({ Name = "Executor" })
local executorSection = executorTab:CreateSection({ Name = "Info" })
executorSection:CreateParagraph({
    Title = "Active Exploit",
    Content = getExecutorName(),
})
executorSection:CreateButton({
    Name = "Copy Executor",
    Callback = function()
        local executorName = getExecutorName()
        if setclipboard then
            setclipboard(executorName)
            Window:Notify("Executor copied", "success", 1.4)
        else
            Window:Notify("Clipboard not supported", "error", 1.4)
        end
    end,
})

Players.CharacterAdded:Connect(function()
    task.wait(0.2)
    if autoFarmActive then
        startFarm(Window)
    end
end)
