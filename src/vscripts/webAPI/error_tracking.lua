--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
require("lualib_bundle");
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 4,["6"] = 4,["7"] = 6,["8"] = 6,["9"] = 6,["11"] = 6,["12"] = 11,["13"] = 12,["14"] = 13,["15"] = 14,["16"] = 15,["17"] = 17,["18"] = 17,["19"] = 17,["20"] = 18,["21"] = 19,["22"] = 20,["23"] = 21,["27"] = 25,["28"] = 13,["29"] = 28,["30"] = 11,["31"] = 31,["32"] = 32,["33"] = 33,["34"] = 31,["35"] = 36,["36"] = 37,["37"] = 38,["38"] = 38,["39"] = 40,["40"] = 41,["41"] = 38,["42"] = 38,["43"] = 38,["44"] = 46,["45"] = 36,["46"] = 49,["47"] = 50,["48"] = 50,["49"] = 52,["50"] = 53,["51"] = 50,["52"] = 50,["53"] = 50,["54"] = 49,["55"] = 59,["56"] = 60,["57"] = 60,["58"] = 60,["59"] = 62,["60"] = 63,["61"] = 64,["62"] = 65,["64"] = 72,["66"] = 75,["67"] = 60,["68"] = 60,["69"] = 60,["70"] = 59,["71"] = 9});
local ____exports = {}
local ____constants = require("core.constants")
local Constants = ____constants.Constants
____exports.ErrorTracking = __TS__Class()
local ErrorTracking = ____exports.ErrorTracking
ErrorTracking.name = "ErrorTracking"
function ErrorTracking.prototype.____constructor(self)
end
function ErrorTracking.Init(self)
    local oldTraceback = debug.traceback
    debug.traceback = function(...)
        local stack = oldTraceback(...)
        self:CollectErrors(stack)
        for ____, playerId in ipairs(
            Managers.GameModeManager:GetAllPlayerIDs()
        ) do
            if PlayerResource:IsValidPlayerID(playerId) and Managers.WebAPIManager:IsDeveloper(playerId) then
                local player = PlayerResource:GetPlayer(playerId)
                if player then
                    CustomGameEventManager:Send_ServerToPlayer(player, "webapi:print_error", {message = stack})
                end
            end
        end
        return stack
    end
    self:StartErrorTimer()
end
function ErrorTracking.CollectErrors(self, stack)
    stack = __TS__StringReplace(stack, ": at 0x%x+", ": at 0x")
    self.collectedErrors[stack] = self.collectedErrors[stack] or (0 + 1)
end
function ErrorTracking.PrintTryError(self, ...)
    local stack = debug.traceback(...)
    GameRules:GetGameModeEntity():SetContextThink(
        DoUniqueString("emitError"),
        function(self)
            error(stack, 0)
        end,
        0
    )
    return stack
end
function ErrorTracking.TryCollectError(self, callback, ...)
    return xpcall(
        callback,
        function(err)
            local ____ = (IsInToolsMode() and ____exports.ErrorTracking:PrintTryError(err)) or debug.traceback(err)
        end,
        ...
    )
end
function ErrorTracking.StartErrorTimer(self)
    Timers:CreateTimer(
        {
            useGameTime = false,
            callback = function()
                if #__TS__ObjectKeys(self.collectedErrors) > 0 then
                    if Constants.WEBAPI_ERROR_TRACKING_FORCE_SEND_ERRORS or (not IsInToolsMode()) then
                        Managers.WebAPIManager:Send("match/script-errors", {custom_game = Managers.WebAPIManager.customGame, errors = self.collectedErrors, match_id = Managers.WebAPIManager.matchId})
                    end
                    self.collectedErrors = {}
                end
                return 60
            end
        }
    )
end
ErrorTracking.collectedErrors = {}
return ____exports
