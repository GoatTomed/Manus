local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Player = Players.LocalPlayer

local C = {
    Surface = Color3.fromRGB(15, 15, 15),
    Border = Color3.fromRGB(38, 38, 38),
    Primary = Color3.fromRGB(1, 168, 225),
    Text = Color3.fromRGB(240, 240, 240),
    TextMid = Color3.fromRGB(150, 150, 150),
    Success = Color3.fromRGB(34, 197, 94),
    Error = Color3.fromRGB(239, 68, 68),
}

local function tw(obj, goal, t, style, dir)
    TweenService:Create(obj, TweenInfo.new(t or 0.18, style or Enum.EasingStyle.Quart, dir or Enum.EasingDirection.Out), goal):Play()
end
local function corner(p, r) local c = Instance.new("UICorner", p) c.CornerRadius = UDim.new(0, r or 6) return c end
local function stroke(p, col, thick) local s = Instance.new("UIStroke", p) s.Color = col or C.Border s.Thickness = thick or 1 return s end
local function frm(parent, props)
    local f = Instance.new("Frame", parent)
    f.BorderSizePixel = 0
    for k, v in pairs(props) do f[k] = v end
    return f
end
local function lbl(parent, props)
    local l = Instance.new("TextLabel", parent)
    l.BackgroundTransparency = 1
    l.BorderSizePixel = 0
    for k, v in pairs(props) do l[k] = v end
    return l
end

local Gui = Instance.new("ScreenGui")
Gui.Name = "ToastGui"
Gui.ResetOnSpawn = false
Gui.IgnoreGuiInset = true
Gui.DisplayOrder = 999
Gui.Parent = Player:WaitForChild("PlayerGui")

local function toast(msg, col, duration)
    col = col or C.Primary; duration = duration or 3
    local T = frm(Gui, {
        Size = UDim2.new(0, 260, 0, 44),
        Position = UDim2.new(0.5, -130, 1, 10),
        BackgroundColor3 = C.Surface,
        ZIndex = 20,
    })
    corner(T, 8); stroke(T, col, 1)
    local Acc = frm(T, {Size=UDim2.new(0,3,1,-16), Position=UDim2.new(0,7,0,8), BackgroundColor3=col, ZIndex=21})
    corner(Acc, 2)
    lbl(T, {Size=UDim2.new(1,-22,1,0), Position=UDim2.new(0,18,0,0), Text=msg, TextColor3=C.Text, TextSize=12, Font=Enum.Font.GothamBold, TextXAlignment=Enum.TextXAlignment.Left, ZIndex=22})
    tw(T, {Position=UDim2.new(0.5,-130,1,-54)}, 0.35, Enum.EasingStyle.Back)
    task.delay(duration, function()
        tw(T, {Position=UDim2.new(0.5,-130,1,10), BackgroundTransparency=1}, 0.3)
        task.delay(0.35, function() T:Destroy() end)
    end)
end

if game.PlaceId == 79268393072444 then
    print("Correct Place ID! Loading script...")
    toast("Correct Game! Launching Script...", C.Success, 5)
    task.wait(1)
    loadstring(game:HttpGet("https://pastebin.com/raw/e8cVpx8u"))()
else
    print("Wrong Place ID: " .. tostring(game.PlaceId))
    toast("Wrong Game! Not Supported.", C.Error, 5)
end
