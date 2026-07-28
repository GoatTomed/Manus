local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local target = {
    pos = Vector3.new(1076.139893, 167.640793, -697.692261),
    jump = false,
}

local function getPlayerCharacter()
    local player = Players.LocalPlayer
    if not player then
        return nil, nil, nil
    end

    local character = player.Character or player.CharacterAdded:Wait()
    local hrp = character:WaitForChild("HumanoidRootPart", 10)
    local humanoid = character:FindFirstChildOfClass("Humanoid")

    return character, hrp, humanoid
end

local function moveToTarget(targetPos)
    local character, hrp, humanoid = getPlayerCharacter()
    if not character or not hrp or not humanoid then
        warn("[POTO] Character, HumanoidRootPart, or Humanoid not available")
        return false
    end

    humanoid.AutoRotate = true
    humanoid.WalkSpeed = 20

    local reached = false
    local connection
    connection = humanoid.MoveToFinished:Connect(function(success)
        if success then
            reached = true
        end
    end)

    humanoid:MoveTo(targetPos)

    local deadline = tick() + 20
    while tick() < deadline and humanoid.Health > 0 and not reached do
        if (hrp.Position - targetPos).Magnitude <= 4 then
            reached = true
            break
        end

        humanoid:MoveTo(targetPos)
        if target.jump then
            humanoid.Jump = true
        end

        RunService.Heartbeat:Wait()
    end

    if connection then
        connection:Disconnect()
    end

    return reached or (hrp.Position - targetPos).Magnitude <= 4
end

local function main()
    print("[POTO] moving to target:", tostring(target.pos), "jump=", tostring(target.jump))
    local success = moveToTarget(target.pos)
    if success then
        print("[POTO] reached target")
    else
        warn("[POTO] failed to reach target")
    end
end

main()
