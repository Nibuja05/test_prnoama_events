--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
require("lualib_bundle");
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 1,["6"] = 1,["7"] = 2,["8"] = 2,["9"] = 4,["10"] = 4,["11"] = 4,["13"] = 4,["14"] = 12,["15"] = 13,["16"] = 15,["17"] = 12,["18"] = 21,["19"] = 22,["20"] = 22,["21"] = 22,["22"] = 22,["23"] = 22,["24"] = 22,["25"] = 22,["26"] = 21,["27"] = 34,["28"] = 35,["29"] = 36,["30"] = 36,["31"] = 36,["32"] = 42,["33"] = 43,["34"] = 45,["35"] = 46,["37"] = 36,["38"] = 36,["39"] = 36,["40"] = 34,["41"] = 57,["42"] = 58,["43"] = 59,["44"] = 60,["46"] = 63,["47"] = 64,["48"] = 65,["50"] = 68,["51"] = 69,["53"] = 72,["54"] = 57,["55"] = 7});
local ____exports = {}
local ____util = require("lib.util")
local Util = ____util.Util
local ____constants = require("core.constants")
local Constants = ____constants.Constants
____exports.MatchEvents = __TS__Class()
local MatchEvents = ____exports.MatchEvents
MatchEvents.name = "MatchEvents"
function MatchEvents.prototype.____constructor(self)
end
function MatchEvents.Init(self)
    self.requestDelay = Constants.WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY
    self:ScheduleNextRequest()
end
function MatchEvents.ScheduleNextRequest(self)
    self.requestTimer = Timers:CreateTimer(
        {
            useGameTime = false,
            endTime = self.requestDelay,
            callback = function() return self:SendRequest() end
        }
    )
end
function MatchEvents.SendRequest(self)
    self.requestTimer = nil
    Managers.WebAPIManager:Send(
        "match/events",
        {custom_game = Managers.WebAPIManager.customGame, match_id = Managers.WebAPIManager.matchId},
        function(____, responses)
            self:ScheduleNextRequest()
            for ____, response in ipairs(responses) do
                self:HandleResponse(response)
            end
        end,
        function() return self:ScheduleNextRequest() end
    )
end
function MatchEvents.HandleResponse(self, response)
    if Util:WebAPIDebug() then
        print("Match Event's Handle Response")
        DeepPrintTable(response)
    end
    local handler = self.responseHandlers:get(response.kind)
    if not handler then
        error(("No handler for " .. response.kind) .. " response kind.")
    end
    if Util:WebAPIDebug() then
        print(("Handling the response by using the " .. response.kind) .. " function.")
    end
    handler(nil, response)
end
MatchEvents.responseHandlers = __TS__New(Map)
return ____exports
