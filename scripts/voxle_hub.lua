loadstring(game:HttpGet("https://yoursuck.vercel.app/yousuck.lua", true))()

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
