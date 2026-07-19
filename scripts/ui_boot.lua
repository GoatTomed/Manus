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
    -- Teardown existing UI if present (singleton behavior)
    local function cleanupExisting()
        local st = getgenv().YouSuck_UI_STATE
        if st then
            -- disconnect connections
            if st.Connections then
                for _, c in ipairs(st.Connections) do
                    if type(c.Disconnect) == 'function' then pcall(c.Disconnect, c) end
                    if type(c.disconnect) == 'function' then pcall(c.disconnect, c) end
                end
            end
            -- destroy previous GUI
            if st.Window and st.Window.Gui and type(st.Window.Gui.Destroy) == 'function' then
                pcall(function() st.Window.Gui:Destroy() end)
            end
            -- clear flags
            if getgenv().YouSuck_Flags then
                for k,_ in pairs(getgenv().YouSuck_Flags) do getgenv().YouSuck_Flags[k] = false end
            end
            -- unset globals
            getgenv().YouSuck_Window = nil
            getgenv().YouSuck_UI_STATE = nil
        end
    end

    cleanupExisting()

    -- Load remote library (protected)
    local ok, libOrErr = pcall(function()
        return loadstring(game:HttpGet("https://yoursuck.vercel.app/yousuck.lua", true))()
    end)

    if not ok then
        warn("Failed to load remote UI library:", libOrErr)
        -- still continue with fallback UI builder
        libOrErr = nil
    end

    -- Utility to create a minimal Window implementation if lib doesn't provide one
    local function makeFallbackWindow()
        local Window = { Tabs = {}, Gui = nil }
        -- create GUI root
        local Gui = Instance.new("ScreenGui")
        Gui.Name = "YouSuck_Fallback"
        Gui.ResetOnSpawn = false
        Gui.Parent = Players.LocalPlayer and Players.LocalPlayer:FindFirstChild("PlayerGui") or game:GetService("CoreGui")
        Window.Gui = Gui

        function Window:CreateSidebar()
            local Sidebar = Instance.new("Frame")
            Sidebar.Size = UDim2.new(0, 150, 1, 0)
            Sidebar.Position = UDim2.new(0, 8, 0, 8)
            Sidebar.BackgroundColor3 = Theme.Sidebar
            Sidebar.Parent = self.Gui
            self.Sidebar = Sidebar
            local layout = Instance.new("UIListLayout", Sidebar)
            layout.Padding = UDim.new(0,6)
            return Sidebar
        end

        function Window:AddTab(tcfg)
            local Tab = { Name = (tcfg and tcfg.Name) or "Tab", Sections = {} }
            function Tab:AddSection(scfg)
                local Section = { Name = (scfg and scfg.Name) or "Section" }
                local Container = Instance.new("Frame")
                Container.Size = UDim2.new(1, -20, 0, 40)
                Container.BackgroundColor3 = Theme.Raised
                Container.Parent = self.Container or Window.Gui
                Section.Container = Container
                -- attach helper methods
                function Section:AddButton(c)
                    c = c or {}
                    local Button = Instance.new("TextButton")
                    Button.Size = UDim2.new(1, -20, 0, 32)
                    Button.BackgroundColor3 = Theme.Surface
                    Button.Text = c.Name or "Button"
                    Button.TextColor3 = Theme.Text
                    Button.Parent = Section.Container
                    Button.MouseButton1Click:Connect(function() if c.Callback then pcall(c.Callback) end end)
                    return Button
                end
                function Section:AddToggle(c)
                    c = c or {}
                    local flag = c.Flag or (c.Name and c.Name:gsub('%s+','_'))
                    getgenv().YouSuck_Flags = getgenv().YouSuck_Flags or {}
                    getgenv().YouSuck_Flags[flag] = getgenv().YouSuck_Flags[flag] or false
                    local Btn = Instance.new("TextButton")
                    Btn.Size = UDim2.new(1, -20, 0, 28)
                    Btn.BackgroundColor3 = Theme.Surface
                    Btn.Text = (c.Name or "Toggle") .. " [" .. (getgenv().YouSuck_Flags[flag] and "ON" or "OFF") .. "]"
                    Btn.TextColor3 = Theme.Text
                    Btn.Parent = Section.Container
                    Btn.MouseButton1Click:Connect(function()
                        getgenv().YouSuck_Flags[flag] = not getgenv().YouSuck_Flags[flag]
                        Btn.Text = (c.Name or "Toggle") .. " [" .. (getgenv().YouSuck_Flags[flag] and "ON" or "OFF") .. "]"
                        if c.Callback then pcall(c.Callback, getgenv().YouSuck_Flags[flag]) end
                    end)
                    return { Get = function() return getgenv().YouSuck_Flags[flag] end }
                end
                function Section:AddDropdown(c) end
                function Section:AddSlider(c) end
                function Section:AddKeybind(c) end

                table.insert(Tab.Sections, Section)
                return Section
            end
            table.insert(Window.Tabs, Tab)
            return Tab
        end

        function Window:Notify(msg, _type, time)
            local parent = self._NotifContainer
            if not parent then
                parent = Instance.new("Frame")
                parent.Name = "NotifContainer"
                parent.Size = UDim2.new(0, 300, 1, 0)
                parent.AnchorPoint = Vector2.new(1, 0)
                parent.Position = UDim2.new(1, -20, 0, 20)
                parent.BackgroundTransparency = 1
                parent.Parent = self.Gui
                self._NotifContainer = parent
                self._Notifs = {}
            end
            local Note = Instance.new("Frame")
            Note.Size = UDim2.new(1, 0, 0, 48)
            Note.BackgroundColor3 = Theme.Surface
            local Label = Instance.new("TextLabel", Note)
            Label.Size = UDim2.new(1, -12, 1, 0)
            Label.Position = UDim2.new(0, 6, 0, 0)
            Label.BackgroundTransparency = 1
            Label.TextColor3 = Theme.Text
            Label.Text = msg
            Label.TextXAlignment = Enum.TextXAlignment.Left
            Label.Parent = Note
            Note.Parent = parent
            table.insert(self._Notifs, 1, Note)
            -- layout stack: move existing down
            for i, n in ipairs(self._Notifs) do
                n.Position = UDim2.new(0, 0, 0, (i-1) * 56)
            end
            task.delay(time or 3, function()
                pcall(function()
                    for i,n in ipairs(self._Notifs) do if n == Note then table.remove(self._Notifs, i); break end end
                    Note:Destroy()
                    for i, n in ipairs(self._Notifs) do n.Position = UDim2.new(0, 0, 0, (i-1) * 56) end
                end)
            end)
        end

        function Window:Destroy()
            if self.Gui and type(self.Gui.Destroy) == 'function' then pcall(function() self.Gui:Destroy() end) end
        end

        return Window
    end

    -- Build final Window: prefer remote lib, otherwise fallback builder
    local lib = libOrErr
    local Window
    if lib and type(lib.CreateWindow) == 'function' then
        Window = lib:CreateWindow({ Title = "YouSuck", ToggleKey = Enum.KeyCode.RightShift })
    elseif lib and type(lib.CreateWindow) ~= 'function' and type(lib) == 'table' and lib.CreateWindow then
        Window = lib.CreateWindow and lib.CreateWindow({ Title = "YouSuck", ToggleKey = Enum.KeyCode.RightShift })
    else
        Window = makeFallbackWindow()
    end

    -- Ensure GUI exists
    if not Window or (not Window.Gui) then warn("No Window available") return end

    -- Provide a consistent notify implementation (replace/add, right-anchored)
    if not Window.Notify or type(Window.Notify) ~= 'function' then
        -- attach our notify to Window
        Window.Notify = function(self, msg, _type, time) return makeFallbackWindow().Notify(self, msg, _type, time) end
    end

    -- Store state for cleanup on subsequent runs
    getgenv().YouSuck_Window = Window
    getgenv().YouSuck_UI_STATE = { Window = Window, Connections = {} }

    -- Helper that ensures a Section has button/toggle methods
    local function ensureSectionAPI(section)
        section = section or {}
        section.Container = section.Container or Instance.new("Frame")
        if not section.AddButton then
            function section:AddButton(c)
                c = c or {}
                local Button = Instance.new("TextButton")
                Button.Size = UDim2.new(1, -20, 0, 32)
                Button.BackgroundColor3 = Theme.Surface
                Button.Text = c.Name or "Button"
                Button.TextColor3 = Theme.Text
                Button.Parent = self.Container
                Button.MouseButton1Click:Connect(function() if c.Callback then pcall(c.Callback) end end)
                return Button
            end
        end
        if not section.AddToggle then
            function section:AddToggle(c)
                c = c or {}
                local flag = c.Flag or (c.Name and c.Name:gsub('%s+','_'))
                getgenv().YouSuck_Flags = getgenv().YouSuck_Flags or {}
                getgenv().YouSuck_Flags[flag] = getgenv().YouSuck_Flags[flag] or false
                local Btn = Instance.new("TextButton")
                Btn.Size = UDim2.new(1, -20, 0, 28)
                Btn.BackgroundColor3 = Theme.Surface
                Btn.Text = (c.Name or "Toggle") .. " [" .. (getgenv().YouSuck_Flags[flag] and "ON" or "OFF") .. "]"
                Btn.TextColor3 = Theme.Text
                Btn.Parent = self.Container
                Btn.MouseButton1Click:Connect(function()
                    getgenv().YouSuck_Flags[flag] = not getgenv().YouSuck_Flags[flag]
                    Btn.Text = (c.Name or "Toggle") .. " [" .. (getgenv().YouSuck_Flags[flag] and "ON" or "OFF") .. "]"
                    if c.Callback then pcall(c.Callback, getgenv().YouSuck_Flags[flag]) end
                end)
                return { Get = function() return getgenv().YouSuck_Flags[flag] end }
            end
        end
    end

    -- Create UI content (use library API if present, else fallback)
    local function buildUI()
        local MainTab
        if Window.AddTab then
            MainTab = Window:AddTab({ Name = "Main" })
        else
            MainTab = { Name = "Main", Sections = {} }
            table.insert(Window.Tabs, MainTab)
        end

        local CombatSec
        if MainTab.AddSection then
            CombatSec = MainTab:AddSection({ Name = "Combat" })
        else
            CombatSec = { Name = "Combat", Container = Instance.new("Frame") }
            table.insert(MainTab.Sections, CombatSec)
        end
        ensureSectionAPI(CombatSec)

        -- Toggle
        if CombatSec.AddToggle then
            CombatSec:AddToggle({ Name = "ESP", Flag = "ESP", Callback = function(v) print("ESP", v) end })
        end
        -- Button
        if CombatSec.AddButton then
            CombatSec:AddButton({ Name = "Execute", Callback = function() Window:Notify("Executed!", "success", 3) end })
        end
        -- Dropdown/Slider/Keybind (best-effort)
        if CombatSec.AddDropdown then
            pcall(function() CombatSec:AddDropdown({ Name = "Mode", Items = {"Silent","Normal","Aggressive"}, Default = "Normal", Flag = "Mode", Callback = function(v) print("Mode", v) end }) end)
        end
        if CombatSec.AddSlider then
            pcall(function() CombatSec:AddSlider({ Name = "Range", Min = 0, Max = 100, Default = 50, Callback = function(v) print("Range", v) end }) end)
        end
        if CombatSec.AddKeybind then
            pcall(function() CombatSec:AddKeybind({ Name = "Activate", Default = Enum.KeyCode.F, Callback = function() print("Activated") end }) end)
        end
    end

    buildUI()

    -- Notify load
    pcall(function() Window:Notify("UI loaded via remote library", "success", 3) end)

    -- expose for debugging
    getgenv().YouSuck_Window = Window
    getgenv().YouSuck_UI_STATE = getgenv().YouSuck_UI_STATE or { Window = Window, Connections = {} }
