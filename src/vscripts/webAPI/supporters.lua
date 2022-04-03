--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
require("lualib_bundle");
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 1,["6"] = 1,["7"] = 1,["9"] = 1,["10"] = 23,["11"] = 24,["12"] = 24,["13"] = 24,["14"] = 24,["15"] = 23,["16"] = 32,["17"] = 33,["18"] = 33,["19"] = 33,["20"] = 33,["21"] = 32,["22"] = 41,["23"] = 42,["24"] = 41,["25"] = 50,["26"] = 51,["27"] = 50,["28"] = 59,["29"] = 60,["30"] = 60,["31"] = 60,["32"] = 61,["33"] = 59,["34"] = 2,["35"] = 3});
local ____exports = {}
____exports.Supporters = __TS__Class()
local Supporters = ____exports.Supporters
Supporters.name = "Supporters"
function Supporters.prototype.____constructor(self)
end
function Supporters.GetSupporterLevel(self, playerId)
    return __TS__OptionalChainAccess(
        self.supporterStateMap:get(playerId),
        "level"
    )
end
function Supporters.GetSupporterEndDate(self, playerId)
    return __TS__OptionalChainAccess(
        self.supporterStateMap:get(playerId),
        "endDate"
    )
end
function Supporters.SetSupporterState(self, playerId, state)
    self.supporterStateMap:set(playerId, state)
end
function Supporters.GetSupporterState(self, playerId)
    return self.supporterStateMap:get(playerId)
end
function Supporters.IsDeveloper(self, playerId)
    local steamId = tostring(
        PlayerResource:GetSteamID(playerId)
    )
    return self.developerSteamIds:has(steamId)
end
Supporters.supporterStateMap = __TS__New(Map)
Supporters.developerSteamIds = __TS__New(Set, {"76561198132422587", "76561198054179075", "76561198052211234", "76561198007141460", "76561198064622537", "76561198188258659", "76561199069138789", "76561198249367546", "76561197994333648", "76561198068804194", "76561198001376044", "76561198011433508"})
return ____exports
