local UI = loadstring(game:HttpGet("https://yoursuck.vercel.app/yousuck.lua", true))()

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local LocalPlayer = Players.LocalPlayer

----------------------------------------------------------------------
-- Helpers
----------------------------------------------------------------------
local function GetMyTycoon()
	for _, tycoon in ipairs(Workspace:GetChildren()) do
		local owner = tycoon:FindFirstChild("Owner")
		if owner and owner.Value == LocalPlayer then
			return tycoon
		end
	end
	return nil
end

local function getLEMON()
	local char = LocalPlayer.Character
	if not char then return end
	local hrp = char:FindFirstChild("HumanoidRootPart")
	if not hrp then return end
	local myPos = hrp.Position
	local dist = math.huge
	local bestPart, bestDet = nil, nil

	for _, tree in ipairs(Workspace:GetDescendants()) do
		if tree.Name == "LemonTree" then
			for _, fruit in ipairs(tree:GetChildren()) do
				if fruit.Name == "Fruit" and fruit.Transparency < 1 then
					local cp = fruit:FindFirstChild("ClickPart")
					if cp then
						local det = cp:FindFirstChildOfClass("ClickDetector")
						if det then
							local mag = (myPos - cp.Position).Magnitude
							if mag < dist then
								dist = mag
								bestPart = cp
								bestDet = det
							end
						end
					end
				end
			end
		end
	end
	return bestPart, bestDet
end

----------------------------------------------------------------------
-- Window
----------------------------------------------------------------------
local Window = UI:CreateWindow({
	Title = "Voxle Hub",
	Width = 620,
	Height = 400,
	ToggleKey = Enum.KeyCode.RightAlt,
})

-- Pitch black verify overlay with React-style design
local Overlay = Instance.new("Frame")
Overlay.Name = "VerifyOverlay"
Overlay.Size = UDim2.new(1, 0, 1, 0)
Overlay.Position = UDim2.new(0, 0, 0, 0)
Overlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
Overlay.BackgroundTransparency = 0
Overlay.ZIndex = 999
Overlay.Parent = Window.Main

-- Center container
local Center = Instance.new("Frame")
Center.Name = "Center"
Center.Size = UDim2.new(0, 400, 0, 200)
Center.Position = UDim2.new(0.5, -200, 0.5, -100)
Center.BackgroundColor3 = Color3.fromRGB(6, 6, 6)
Center.BorderSizePixel = 0
Center.Parent = Overlay

local CenterStroke = Instance.new("UIStroke")
CenterStroke.Color = Color3.fromRGB(26, 26, 26)
CenterStroke.Thickness = 1
CenterStroke.Parent = Center

local CenterCorner = Instance.new("UICorner")
CenterCorner.CornerRadius = UDim.new(0, 24)
CenterCorner.Parent = Center

-- Corner brackets (top-left)
local TLCorner = Instance.new("Frame")
TLCorner.Size = UDim2.new(0, 28, 0, 28)
TLCorner.Position = UDim2.new(0, 0, 0, 0)
TLCorner.BackgroundTransparency = 1
TLCorner.Parent = Center

local TLTop = Instance.new("Frame")
TLTop.Size = UDim2.new(0, 2, 0, 14)
TLTop.Position = UDim2.new(0, 0, 0, 0)
TLTop.BackgroundColor3 = Color3.fromRGB(0, 171, 255)
TLTop.BorderSizePixel = 0
TLTop.Parent = TLCorner

local TLLeft = Instance.new("Frame")
TLLeft.Size = UDim2.new(0, 14, 0, 2)
TLLeft.Position = UDim2.new(0, 0, 0, 0)
TLLeft.BackgroundColor3 = Color3.fromRGB(0, 171, 255)
TLLeft.BorderSizePixel = 0
TLLeft.Parent = TLCorner

-- Corner brackets (top-right)
local TRCorner = Instance.new("Frame")
TRCorner.Size = UDim2.new(0, 28, 0, 28)
TRCorner.Position = UDim2.new(1, -28, 0, 0)
TRCorner.BackgroundTransparency = 1
TRCorner.Parent = Center

local TRTop = Instance.new("Frame")
TRTop.Size = UDim2.new(0, 2, 0, 14)
TRTop.Position = UDim2.new(1, -2, 0, 0)
TRTop.BackgroundColor3 = Color3.fromRGB(0, 171, 255)
TRTop.BorderSizePixel = 0
TRTop.Parent = TRCorner

local TRRight = Instance.new("Frame")
TRRight.Size = UDim2.new(0, 14, 0, 2)
TRRight.Position = UDim2.new(0, 14, 0, 0)
TRRight.BackgroundColor3 = Color3.fromRGB(0, 171, 255)
TRRight.BorderSizePixel = 0
TRRight.Parent = TRCorner

-- Icon
local Icon = Instance.new("Frame")
Icon.Name = "Icon"
Icon.Size = UDim2.new(0, 56, 0, 56)
Icon.Position = UDim2.new(0.5, -28, 0, 20)
Icon.BackgroundColor3 = Color3.fromRGB(6, 10, 20)
Icon.BorderSizePixel = 0
Icon.Parent = Center

local IconBorder = Instance.new("UIStroke")
IconBorder.Color = Color3.fromRGB(26, 26, 26)
IconBorder.Thickness = 1
IconBorder.Parent = Icon

local IconCorner = Instance.new("UICorner")
IconCorner.CornerRadius = UDim.new(0, 10)
IconCorner.Parent = Icon

local IconInner = Instance.new("Frame")
IconInner.Size = UDim2.new(0, 32, 0, 32)
IconInner.Position = UDim2.new(0.5, -16, 0.5, -16)
IconInner.BackgroundColor3 = Color3.fromRGB(0, 171, 255)
IconInner.BorderSizePixel = 0
IconInner.Parent = Icon

local InnerCorner = Instance.new("UICorner")
InnerCorner.CornerRadius = UDim.new(0, 4)
InnerCorner.Parent = IconInner

-- Title
local Title = Instance.new("TextLabel")
Title.Name = "Title"
Title.Size = UDim2.new(1, 0, 0, 30)
Title.Position = UDim2.new(0, 0, 0, 90)
Title.BackgroundTransparency = 1
Title.Text = "# Verifying"
Title.TextColor3 = Color3.fromRGB(245, 245, 245)
Title.Font = Enum.Font.GothamBold
Title.TextSize = 20
Title.TextXAlignment = Enum.TextXAlignment.Center
Title.Parent = Center

-- Status message
local StatusMsg = Instance.new("TextLabel")
StatusMsg.Name = "Status"
StatusMsg.Size = UDim2.new(0.9, 0, 0, 20)
StatusMsg.Position = UDim2.new(0.05, 0, 0, 125)
StatusMsg.BackgroundTransparency = 1
StatusMsg.Text = "Connecting to verification server..."
StatusMsg.TextColor3 = Color3.fromRGB(156, 163, 175)
StatusMsg.Font = Enum.Font.Gotham
StatusMsg.TextSize = 12
StatusMsg.TextXAlignment = Enum.TextXAlignment.Center
StatusMsg.Parent = Center

-- Loading bar background
local LoadingBarBg = Instance.new("Frame")
LoadingBarBg.Name = "LoadingBarBg"
LoadingBarBg.Size = UDim2.new(0.8, 0, 0, 6)
LoadingBarBg.Position = UDim2.new(0.1, 0, 0, 155)
LoadingBarBg.BackgroundColor3 = Color3.fromRGB(26, 26, 26)
LoadingBarBg.BorderSizePixel = 0
LoadingBarBg.Parent = Center

local BarCorner = Instance.new("UICorner")
BarCorner.CornerRadius = UDim.new(0, 3)
BarCorner.Parent = LoadingBarBg

-- Loading bar fill
local LoadingFill = Instance.new("Frame")
LoadingFill.Name = "Fill"
LoadingFill.Size = UDim2.new(0, 0, 1, 0)
LoadingFill.BackgroundColor3 = Color3.fromRGB(0, 171, 255)
LoadingFill.BorderSizePixel = 0
LoadingFill.Parent = LoadingBarBg

local FillCorner = Instance.new("UICorner")
FillCorner.CornerRadius = UDim.new(0, 3)
FillCorner.Parent = LoadingFill

-- Animate loading bar and status
local messages = {
	"Connecting to verification server...",
	"Generating your link...",
	"Preparing verification...",
	"Redirecting...",
}

task.spawn(function()
	local start = tick()
	while Overlay.Parent and (tick() - start) < 3 do
		local elapsed = tick() - start
		local progress = elapsed / 3
		LoadingFill.Size = UDim2.new(progress, 0, 1, 0)
		local msgIdx = math.min(math.floor(progress * #messages) + 1, #messages)
		StatusMsg.Text = messages[msgIdx]
		task.wait(0.05)
	end
	if Overlay.Parent then
		Overlay:Destroy()
	end
end)

Window:CreateSidebar()

local MainTab = Window:AddTab({ Name = "Main" })
local MiscTab = Window:AddTab({ Name = "Misc" })

----------------------------------------------------------------------
-- MAIN TAB
----------------------------------------------------------------------
local Lemon = MainTab:AddSection({ Name = "Lemon Farming" })

Lemon:AddToggle({
	Name = "Lemon Aura",
	Callback = function(v)
		_G.AuraLemon = v
		if not v then return end
		task.spawn(function()
			while _G.AuraLemon do
				pcall(function()
					local hrp = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
					local cp, det = getLEMON()
					if hrp and cp and det then
						cp.CFrame = hrp.CFrame
						task.wait(0.05)
						if det.Parent then fireclickdetector(det) end
					end
				end)
				task.wait(0.1)
			end
		end)
	end,
})

Lemon:AddToggle({
	Name = "Auto Pick Lemons",
	Callback = function(v)
		_G.AutoPick = v
		if not v then return end
		task.spawn(function()
			while _G.AutoPick do
				pcall(function()
					local hrp = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
					local cp, det = getLEMON()
					if hrp and cp and det then
						hrp.CFrame = cp.CFrame * CFrame.new(0, 2, 0)
						task.wait(0.05)
						if det.Parent then fireclickdetector(det) end
					end
				end)
				task.wait(0.05)
			end
		end)
	end,
})

local Tycoon = MainTab:AddSection({ Name = "Tycoon Automation" })

Tycoon:AddToggle({
	Name = "Auto Click All Locations",
	Callback = function(v)
		_G.AutoClick = v
		if not v then return end
		task.spawn(function()
			while _G.AutoClick do
				task.wait(1)
				local myT = GetMyTycoon()
				if myT and myT:FindFirstChild("Locations") then
					for _, loc in ipairs(myT.Locations:GetChildren()) do
						if loc:IsA("Part") then
							pcall(function()
								myT.Remotes.WakeIncomeStream:InvokeServer(loc.Name:gsub("%s+", ""))
							end)
						end
					end
				end
			end
		end)
	end,
})

Tycoon:AddToggle({
	Name = "Auto Buy",
	Callback = function(v)
		_G.AutoBuy = v
		if not v then return end
		task.spawn(function()
			while _G.AutoBuy do
				local myT = GetMyTycoon()
				if myT then
					for _, obj in ipairs(myT:GetDescendants()) do
						if obj.Name == "Purchase" and obj:IsA("RemoteFunction") then
							pcall(function() obj:InvokeServer(false) end)
						end
					end
				end
				task.wait(1)
			end
		end)
	end,
})

Tycoon:AddToggle({
	Name = "Auto Upgrade All",
	Callback = function(v)
		_G.AutoUpgrade = v
		if not v then return end
		task.spawn(function()
			while _G.AutoUpgrade do
				task.wait(0.5)
				local myT = GetMyTycoon()
				if myT then
					for _, obj in ipairs(myT:GetDescendants()) do
						if obj.Name == "Upgrade" and obj:IsA("RemoteFunction") then
							pcall(function() obj:InvokeServer(1) end)
						end
					end
				end
			end
		end)
	end,
})

----------------------------------------------------------------------
-- MISC TAB
----------------------------------------------------------------------
local Misc = MiscTab:AddSection({ Name = "Misc" })

Misc:AddButton({
	Name = "Collect Keys",
	Callback = function()
		local root = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
		if root then
			root.CFrame = Workspace.Map.Sewer.CashVine.VineKey.CFrame
			task.wait(1)
			root.CFrame = Workspace.Map.Sewer.SewerAlien.UFOKey.CFrame
			Window:Notify("Teleported to Keys!", "success")
		end
	end,
})

Window:Notify("Voxle Hub Loaded!", "success", 3)
