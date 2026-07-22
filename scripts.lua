--[[ YouSuck — Final Clean Key System ]] 
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")
local MarketplaceService = game:GetService("MarketplaceService")

local Player = Players.LocalPlayer

local request = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request
if not request then 
    request = function(o) return HttpService:RequestAsync(o) end 
end

local API_URL = "https://yoursuck.vercel.app/api/verify-key"
local HEARTBEAT_URL = "https://yoursuck.vercel.app/api/clients"

local HEARTBEAT_INTERVAL = 15

-- PALETTE
local C = {
    BG = Color3.fromRGB(10, 10, 10),
    Surface = Color3.fromRGB(15, 15, 15),
    Raised = Color3.fromRGB(22, 22, 22),
    Border = Color3.fromRGB(38, 38, 38),
    Primary = Color3.fromRGB(1, 168, 225),
    PrimaryLo = Color3.fromRGB(1, 134, 181),
    Text = Color3.fromRGB(240, 240, 240),
    TextMid = Color3.fromRGB(150, 150, 150),
    TextLow = Color3.fromRGB(75, 75, 75),
    Success = Color3.fromRGB(34, 197, 94),
    Error = Color3.fromRGB(239, 68, 68),
    White = Color3.new(1, 1, 1),
}

local function tw(obj, goal, t, style, dir)
    TweenService:Create(obj, TweenInfo.new(t or 0.18, style or Enum.EasingStyle.Quart, dir or Enum.EasingDirection.Out), goal):Play()
end

local function corner(p, r)
    local c = Instance.new("UICorner", p)
    c.CornerRadius = UDim.new(0, r or 6)
    return c
end

local function stroke(p, col, thick)
    local s = Instance.new("UIStroke", p)
    s.Color = col or C.Border
    s.Thickness = thick or 1
    return s
end

local function pad(p, l, r, t, b)
    local u = Instance.new("UIPadding", p)
    u.PaddingLeft = UDim.new(0, l or 0)
    u.PaddingRight = UDim.new(0, r or 0)
    u.PaddingTop = UDim.new(0, t or 0)
    u.PaddingBottom = UDim.new(0, b or 0)
end

local function lbl(parent, props)
    local l = Instance.new("TextLabel", parent)
    l.BackgroundTransparency = 1
    l.BorderSizePixel = 0
    l.RichText = true
    for k, v in pairs(props) do l[k] = v end
    return l
end

local function frm(parent, props)
    local f = Instance.new("Frame", parent)
    f.BorderSizePixel = 0
    for k, v in pairs(props) do f[k] = v end
    return f
end

local function makeDraggable(root, handle)
    handle = handle or root
    local drag, dstart, opos
    handle.InputBegan:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
            drag = true; dstart = i.Position; opos = root.Position
            i.Changed:Connect(function() if i.UserInputState == Enum.UserInputState.End then drag = false end end)
        end
    end)
    handle.InputChanged:Connect(function(i)
        if drag and (i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch) then
            local d = i.Position - dstart
            root.Position = UDim2.new(opos.X.Scale, opos.X.Offset + d.X, opos.Y.Scale, opos.Y.Offset + d.Y)
        end
    end)
end

-- GUI
local Gui = Instance.new("ScreenGui")
Gui.Name = "KeySystem"
Gui.ResetOnSpawn = false
Gui.IgnoreGuiInset = true
Gui.DisplayOrder = 999
Gui.Parent = Player:WaitForChild("PlayerGui")

local Scrim = frm(Gui, { Size = UDim2.new(1,0,1,0), BackgroundColor3 = Color3.new(0,0,0), BackgroundTransparency = 1, ZIndex = 1 })
tw(Scrim, {BackgroundTransparency = 0.6}, 0.4)

local W, H = 400, 290
local Card = frm(Gui, { Size = UDim2.new(0, W, 0, H), Position = UDim2.new(0.5, -W/2, 0.5, -H/2 + 24), BackgroundColor3 = C.Surface, BackgroundTransparency = 1, ZIndex = 2 })
corner(Card, 10)
stroke(Card, C.Border, 1)
tw(Card, {BackgroundTransparency = 0, Position = UDim2.new(0.5,-W/2,0.5,-H/2)}, 0.4, Enum.EasingStyle.Quart)

local TBar = frm(Card, { Size = UDim2.new(1, 0, 0, 40), BackgroundColor3 = Color3.fromRGB(14, 14, 14), ZIndex = 3 })
corner(TBar, 10)
makeDraggable(Card, TBar)

lbl(TBar, { Size = UDim2.new(0, 120, 1, 0), Position = UDim2.new(0, 12, 0, 0), Text = " ", TextColor3 = C.Text, TextSize = 20, Font = Enum.Font.Gotham, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 4 })

local CloseBtn = Instance.new("TextButton", TBar)
CloseBtn.Size = UDim2.new(0, 28, 1, 0)
CloseBtn.Position = UDim2.new(1, -30, 0, 0)
CloseBtn.BackgroundTransparency = 1
CloseBtn.Text = "X"
CloseBtn.TextColor3 = Color3.fromRGB(180, 180, 180)
CloseBtn.Font = Enum.Font.Gotham
CloseBtn.TextSize = 13
CloseBtn.ZIndex = 5
CloseBtn.MouseButton1Click:Connect(function()
    tw(Card, {BackgroundTransparency=1, Position=UDim2.new(0.5,-W/2,0.5,-H/2+18)}, 0.25)
    tw(Scrim, {BackgroundTransparency=1}, 0.25)
    task.delay(0.3, function() Gui:Destroy() end)
end)

local Body = frm(Card, { Size = UDim2.new(1, 0, 1, -41), Position = UDim2.new(0, 0, 0, 41), BackgroundTransparency = 1, ZIndex = 3 })
pad(Body, 22, 22, 0, 0)

local Title = lbl(Body, { Size = UDim2.new(1, 0, 0, 26), Position = UDim2.new(0, 0, 0, 16), TextColor3 = C.Text, TextSize = 28, Font = Enum.Font.GothamBold, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 4 })
Title.RichText = true
Title.Text = ' <font color="#FFFFFF">                You</font><font color="#00ABFF">Suck</font>'

local InputWrap = frm(Body, { Size = UDim2.new(1, 0, 0, 42), Position = UDim2.new(0, 0, 0, 70), BackgroundColor3 = C.Raised, ZIndex = 4 })
corner(InputWrap, 7)
local InputStroke = stroke(InputWrap, C.Border, 1)
local Input = Instance.new("TextBox", InputWrap)
Input.Size = UDim2.new(1, 0, 1, 0)
Input.BackgroundTransparency = 1
Input.Text = ""
Input.PlaceholderText = "Paste Key Here"
Input.TextColor3 = C.Text
Input.PlaceholderColor3 = C.TextLow
Input.Font = Enum.Font.Gotham
Input.TextSize = 12
Input.ClearTextOnFocus = false
Input.ZIndex = 5
pad(Input, 14, 14, 0, 0)

local StatusRow = frm(Body, { Size = UDim2.new(1, 0, 0, 18), Position = UDim2.new(0, 0, 0, 178), BackgroundTransparency = 1, ZIndex = 4 })
local SDot = frm(StatusRow, { Size = UDim2.new(0, 6, 0, 6), Position = UDim2.new(0, 0, 0.5, -3), BackgroundColor3 = C.TextLow, ZIndex = 5 })
corner(SDot, 3)
local SLbl = lbl(StatusRow, { Size = UDim2.new(1, -12, 1, 0), Position = UDim2.new(0, 12, 0, 0), Text = "Awaiting input", TextColor3 = C.TextLow, TextSize = 11, Font = Enum.Font.Gotham, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 5 })

local function setStatus(msg, col, dotCol)
    SLbl.Text = msg
    SLbl.TextColor3 = col or C.TextLow
    tw(SDot, {BackgroundColor3 = dotCol or C.TextLow}, 0.15)
end

local function toast(msg, col, duration)
    col = col or C.Primary; duration = duration or 3
    local T = frm(Gui, { Size=UDim2.new(0,260,0,44), Position=UDim2.new(0.5,-130,1,10), BackgroundColor3=C.Surface, ZIndex=20 })
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

local BtnRow = frm(Body, { Size = UDim2.new(1, 0, 0, 42), Position = UDim2.new(0, 0, 0, 124), BackgroundTransparency = 1, ZIndex = 4 })

local GetKeyWrap = frm(BtnRow, { Size = UDim2.new(0.48, 0, 1, 0), Position = UDim2.new(0, 0, 0, 0), BackgroundColor3 = C.Primary, ZIndex = 4 })
corner(GetKeyWrap, 7)
local GetKeyBtn = Instance.new("TextButton", GetKeyWrap)
GetKeyBtn.Size = UDim2.new(1, 0, 1, 0)
GetKeyBtn.BackgroundTransparency = 1
GetKeyBtn.Text = "Get Key"
GetKeyBtn.TextColor3 = C.White
GetKeyBtn.Font = Enum.Font.GothamBold
GetKeyBtn.TextSize = 13
GetKeyBtn.ZIndex = 5
GetKeyBtn.MouseButton1Up:Connect(function()
    setclipboard("https://yoursuck.vercel.app/")
    toast("Link copied to clipboard!", C.Primary, 2.5)
end)

local BtnWrap = frm(BtnRow, { Size = UDim2.new(0.48, 0, 1, 0), Position = UDim2.new(0.52, 0, 0, 0), BackgroundColor3 = C.Primary, ZIndex = 4 })
corner(BtnWrap, 7)
local Btn = Instance.new("TextButton", BtnWrap)
Btn.Size = UDim2.new(1, 0, 1, 0)
Btn.BackgroundTransparency = 1
Btn.Text = "Verify Key"
Btn.TextColor3 = C.White
Btn.Font = Enum.Font.GothamBold
Btn.TextSize = 13
Btn.ZIndex = 5

-- EXECUTOR DETECTION WITH VERSION
local function getExecutor()
    if syn then
        return "Synapse X", (syn.get_version and tostring(syn.get_version()) or "")
    elseif fluxus then
        return "Fluxus", ""
    elseif getgenv and getgenv().KRNL_LOADED then
        return "Krnl", ""
    elseif getexecutorname then
        return getexecutorname(), (getexecutorversion and tostring(getexecutorversion()) or "")
    else
        return "Unknown", ""
    end
end

-- HEARTBEAT
local sessionStart = os.time()

local function startHeartbeat(key)
    local gameName = "Unknown Game"
    pcall(function() gameName = MarketplaceService:GetProductInfo(game.PlaceId).Name end)

    task.spawn(function()
        while task.wait(HEARTBEAT_INTERVAL) do
            pcall(function()
                local executorName, executorVersion = getExecutor()
                local payload = {
                    key = key,
                    robloxId = tostring(Player.UserId),
                    robloxName = Player.Name,
                    gameId = game.PlaceId,
                    gameName = gameName,
                    jobId = game.JobId,
                    timestamp = os.time(),
                    uptime = os.time() - sessionStart,
                    executor = executorName,
                    executorVersion = executorVersion,
                    ping = math.floor(game:GetService("Stats").Network.ServerStatsItem["Data Ping"]:GetValue() or 0),
                }

                request({
                    Url = HEARTBEAT_URL,
                    Method = "POST",
                    Headers = {["Content-Type"] = "application/json"},
                    Body = HttpService:JSONEncode(payload)
                })
            end)
        end
    end)
end

local function isoToTs(s)
    if not s or type(s) ~= "string" then return os.time() + 86400 end
    local y,mo,d,h,mi,sc = s:match("(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)")
    if not y then return os.time() + 86400 end
    return os.time({year=y,month=mo,day=d,hour=h,min=mi,sec=sc})
end

local function spawnPill(expiresAt, key)
    local ts = isoToTs(expiresAt)
    startHeartbeat(key)

    local Pill = frm(Gui, { Size=UDim2.new(0,220,0,36), Position=UDim2.new(1,-230,1,10), BackgroundColor3=C.Surface, ZIndex=15, Active=true })
    corner(Pill, 18); stroke(Pill, C.Border, 1); makeDraggable(Pill)
    local PillDot = frm(Pill, { Size=UDim2.new(0,7,0,7), Position=UDim2.new(0,12,0.5,-3), BackgroundColor3=C.Success, ZIndex=16 })
    corner(PillDot, 4)
    local PillLbl = lbl(Pill, { Size=UDim2.new(1,-28,1,0), Position=UDim2.new(0,24,0,0), Text="Session active", TextColor3=C.TextMid, TextSize=11, Font=Enum.Font.GothamBold, TextXAlignment=Enum.TextXAlignment.Left, ZIndex=16 })
    tw(Pill, {Position=UDim2.new(1,-230,1,-46)}, 0.4, Enum.EasingStyle.Back)

    local conn = RunService.Heartbeat:Connect(function()
        if not Pill.Parent then conn:Disconnect() return end
        local left = ts - os.time()
        if left <= 0 then
            PillLbl.Text = "Session expired"
            PillLbl.TextColor3 = C.Error
            PillDot.BackgroundColor3 = C.Error
        else
            local h = math.floor(left/3600)
            local m = math.floor((left%3600)/60)
            local s = left%60
            PillLbl.Text = string.format("%dh %02dm %02ds left", h, m, s)
        end
    end)
end

-- VERIFY
Btn.MouseButton1Click:Connect(function()
    local key = Input.Text:gsub("%s+","")
    if key == "" then
        setStatus("No key entered.", C.Error, C.Error)
        return
    end

    Btn.Text = "Verifying..."
    Btn.Active = false
    setStatus("Contacting server...", C.TextMid, C.Primary)

    task.spawn(function()
        local ok, res = pcall(function()
            return request({
                Url = API_URL,
                Method = "POST",
                Headers = {["Content-Type"] = "application/json"},
                Body = HttpService:JSONEncode({key = key, robloxId = tostring(Player.UserId)})
            })
        end)

        if ok and res and res.StatusCode == 200 then
            local dok, data = pcall(HttpService.JSONDecode, HttpService, res.Body)
            if dok and data.valid then
                Btn.Text = "Access Granted"
                setStatus("Authenticated successfully.", C.Success, C.Success)
                toast("Welcome Back!", C.Success, 3)

                task.wait(0.8)
                tw(Card, {BackgroundTransparency=1, Position=UDim2.new(0.5,-W/2,0.5,-H/2-16)}, 0.3)
                tw(Scrim, {BackgroundTransparency=1}, 0.3)

                task.delay(0.35, function()
                    Card:Destroy()
                    Scrim:Destroy()
                    spawnPill(data.expiresAt, key)
                end)
            else
                Btn.Text = "Verify Key"
                Btn.Active = true
                setStatus("Invalid key.", C.Error, C.Error)
            end
        else
            Btn.Text = "Verify Key"
            Btn.Active = true
            setStatus("Server error.", C.Error, C.Error)
        end
    end)
end)