-- ui_boot.lua
-- Loader script for Roblox executors. Fetches the remote UI library and builds a sample UI.

local ok, lib = pcall(function()
    return loadstring(game:HttpGet("https://yoursuck.vercel.app/yousuck.lua", true))()
end)

if not ok or not lib then
    warn("Failed to load remote UI library:", lib)
    return
end

-- Defensive helpers: library may be older and miss some helpers
local Window
if type(lib.CreateWindow) == "function" then
    Window = lib:CreateWindow({ Title = "YouSuck", ToggleKey = Enum.KeyCode.RightShift })
else
    -- Fallback if the library returns a table with CreateWindow as a function directly
    Window = lib.CreateWindow and lib.CreateWindow({ Title = "YouSuck", ToggleKey = Enum.KeyCode.RightShift }) or nil
end
if not Window then warn("Library returned no Window API") return end

if type(Window.CreateSidebar) == "function" then
    Window:CreateSidebar()
end

-- Safely add tab/sections using available APIs
local function safeAddTab(win, name)
    if win.AddTab then return win:AddTab({ Name = name }) end
    -- fallback: create minimal container
    local t = { Name = name, Sections = {}, Container = Instance.new("Frame") }
    table.insert(win.Tabs, t)
    return t
end

local function safeAddSection(tab, name)
    if tab.AddSection then return tab:AddSection({ Name = name }) end
    -- fallback struct
    local s = { Name = name, Container = Instance.new("Frame") }
    table.insert(tab.Sections, s)
    return s
end

local Main = safeAddTab(Window, "Main")
local Combat = safeAddSection(Main, "Combat")

-- Add a toggle (use library AddToggle if present, otherwise emulate with a button)
if Combat.AddToggle then
    Combat:AddToggle({ Name = "ESP", Flag = "ESP", Callback = function(v) print("ESP", v) end })
else
    -- emulate toggle
    if Combat.AddButton then
        Combat:AddButton({ Name = "ESP (toggle)", Callback = function()
            local cur = lib.Flags and lib.Flags.ESP or false
            lib.Flags = lib.Flags or {}
            lib.Flags.ESP = not cur
            print("ESP set to", lib.Flags.ESP)
        end })
    end
end

-- Add more controls if present
if Combat.AddSlider then
    Combat:AddSlider({ Name = "Range", Min = 0, Max = 100, Default = 50, Callback = function(v) print("Range", v) end })
end

if Combat.AddDropdown then
    Combat:AddDropdown({ Name = "Mode", Items = {"Silent","Normal","Aggressive"}, Default = "Normal", Flag = "Mode", Callback = function(v) print("Mode", v) end })
end

if Combat.AddKeybind then
    Combat:AddKeybind({ Name = "Activate", Default = Enum.KeyCode.F, Callback = function() print("Activated") end })
end

if Window.Notify then
    Window:Notify("UI loaded via remote library", "success", 3)
end

-- Example execute button
if Combat.AddButton then
    Combat:AddButton({ Name = "Execute", Callback = function()
        if Window.Notify then Window:Notify("Executed!", "success") end
        print("Execute pressed")
    end })
end

-- Expose Window globally for quick REPL access
getgenv().YouSuck_Window = Window
