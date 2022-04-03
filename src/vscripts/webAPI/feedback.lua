--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
require("lualib_bundle");
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 1,["6"] = 1,["7"] = 2,["8"] = 2,["9"] = 4,["10"] = 4,["11"] = 4,["13"] = 4,["14"] = 10,["15"] = 11,["16"] = 11,["17"] = 11,["18"] = 12,["19"] = 11,["20"] = 11,["21"] = 15,["22"] = 15,["23"] = 15,["24"] = 16,["25"] = 15,["26"] = 15,["27"] = 10,["28"] = 26,["29"] = 27,["32"] = 28,["33"] = 29,["36"] = 31,["37"] = 32,["38"] = 32,["39"] = 32,["40"] = 33,["41"] = 34,["43"] = 37,["44"] = 39,["45"] = 40,["46"] = 41,["48"] = 44,["49"] = 44,["50"] = 44,["51"] = 44,["52"] = 45,["53"] = 45,["54"] = 45,["55"] = 46,["56"] = 45,["57"] = 45,["58"] = 48,["59"] = 48,["60"] = 48,["61"] = 49,["62"] = 49,["63"] = 51,["64"] = 51,["65"] = 51,["66"] = 51,["67"] = 49,["68"] = 49,["69"] = 57,["70"] = 57,["71"] = 49,["72"] = 49,["74"] = 26,["75"] = 66,["76"] = 67,["79"] = 68,["80"] = 69,["83"] = 71,["84"] = 72,["85"] = 72,["86"] = 72,["88"] = 75,["89"] = 77,["90"] = 78,["91"] = 79,["93"] = 82,["94"] = 83,["95"] = 83,["96"] = 83,["98"] = 88,["99"] = 66,["100"] = 5});
local ____exports = {}
local ____util = require("lib.util")
local Util = ____util.Util
local ____constants = require("core.constants")
local Constants = ____constants.Constants
____exports.Feedback = __TS__Class()
local Feedback = ____exports.Feedback
Feedback.name = "Feedback"
function Feedback.prototype.____constructor(self)
end
function Feedback.Init(self)
    Util:RegisterClientEventListener(
        "webapi:send_feedback",
        function(____, event, playerId)
            self:GetFeedbackFromPlayer(playerId, event)
        end
    )
    Util:RegisterClientEventListener(
        "webapi:check_feedback_cooldown",
        function(____, _, playerId)
            self:CheckCooldown(playerId)
        end
    )
end
function Feedback.GetFeedbackFromPlayer(self, playerId, event)
    if not PlayerResource:IsValidPlayerID(playerId) then
        return
    end
    local player = PlayerResource:GetPlayer(playerId)
    if not player then
        return
    end
    if Util:WebAPIDebug() then
        print(
            "Called GetFeedbackFromPlayer, initiated by PlayerID " .. tostring(playerId)
        )
        print("Event's contents:")
        DeepPrintTable(event)
    end
    local remainingCooldown = self.feedbackCooldowns:get(playerId)
    if (not remainingCooldown) or ((GameRules:GetGameTime() - remainingCooldown) > Constants.WEBAPI_FEEDBACK_COOLDOWN) then
        if Util:WebAPIDebug() then
            print("No cooldown on feedback, sending feedback to the server!")
        end
        self.feedbackCooldowns:set(
            playerId,
            GameRules:GetGameTime()
        )
        Timers:CreateTimer(
            Constants.WEBAPI_FEEDBACK_COOLDOWN,
            function()
                CustomGameEventManager:Send_ServerToPlayer(player, "webapi:update_feedback_cooldown", {cooldown = 0})
            end
        )
        local steamId = tostring(
            PlayerResource:GetSteamID(playerId)
        )
        Managers.WebAPIManager:Send(
            "match/feedback",
            {
                steam_id = steamId,
                content = event.text,
                supporter_level = Managers.WebAPIManager:GetSupporterLevel(playerId)
            },
            function() return print("Successfully sent feedback") end,
            function(____, ____error) return print(
                "Error while sending feedback: " .. tostring(____error)
            ) end
        )
    end
end
function Feedback.CheckCooldown(self, playerId)
    if not PlayerResource:IsValidPlayerID(playerId) then
        return
    end
    local player = PlayerResource:GetPlayer(playerId)
    if not player then
        return
    end
    if Util:WebAPIDebug() then
        print(
            ("CheckCooldown initiated by PlayerID " .. tostring(playerId)) .. "."
        )
    end
    local isCooldown = true
    local remainingCooldown = self.feedbackCooldowns:get(playerId)
    if (not remainingCooldown) or ((GameRules:GetGameTime() - remainingCooldown) > Constants.WEBAPI_FEEDBACK_COOLDOWN) then
        isCooldown = false
    end
    if Util:WebAPIDebug() then
        print(
            ((("PlayerID " .. tostring(playerId)) .. " is ") .. ((isCooldown and "on cooldown") or "not on cooldown")) .. ". Sending state to player."
        )
    end
    CustomGameEventManager:Send_ServerToPlayer(player, "webapi:update_feedback_cooldown", {cooldown = (isCooldown and 1) or 0})
end
Feedback.feedbackCooldowns = __TS__New(Map)
return ____exports
