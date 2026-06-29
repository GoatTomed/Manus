import json
import os

kb = {
    "version": "1.1",
    "engine": "YouSuck Autonomous Luau Engine",
    "docs_source": "https://www.lua.org/manual/5.4/ & Roblox DevForum",
    "knowledge": {
        "GUI": {
            "services": ["StarterGui", "PlayerGui", "TweenService"],
            "classes": ["ScreenGui", "Frame", "TextLabel", "TextButton", "ImageLabel", "ScrollingFrame", "UIListLayout", "UICorner"],
            "patterns": {
                "basic_frame": """local screenGui = Instance.new("ScreenGui")
screenGui.Name = "YouSuckGui"
screenGui.Parent = game.Players.LocalPlayer:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Size = UDim2.new(0, 200, 0, 100)
frame.Position = UDim2.new(0.5, -100, 0.5, -50)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
frame.BorderSizePixel = 0
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = frame""",
                "button_click": """button.MouseButton1Click:Connect(function()
    print("Button Clicked!")
end)""",
                "tween_ui": """local TS = game:GetService("TweenService")
local info = TweenInfo.new(0.5, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)
local tween = TS:Create(frame, info, {Position = UDim2.new(0.5, -100, 0.2, 0)})
tween:Play()"""
            }
        },
        "Events": {
            "methods": ["Connect", "Wait", "Once", "Disconnect"],
            "types": ["RBXScriptSignal", "RBXScriptConnection"],
            "example": """local connection
connection = part.Touched:Connect(function(hit)
    print("Touched by", hit.Name)
    connection:Disconnect() -- Only once
end)"""
        },
        "BestPractices": [
            "Use task.wait() instead of wait()",
            "Use task.spawn() or task.defer() for threading",
            "Always use game:GetService()",
            "Prefer local variables for performance",
            "Use UDim2 for UI positioning and sizing"
        ]
    }
}

output_path = "/home/ubuntu/Manus/shared/lua_kb.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w") as f:
    json.dump(kb, f, indent=2)

print(f"Knowledge base built at {output_path}")
