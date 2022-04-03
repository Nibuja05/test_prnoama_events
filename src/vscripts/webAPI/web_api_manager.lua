--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
require("lualib_bundle");
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 1,["6"] = 1,["7"] = 2,["8"] = 2,["9"] = 3,["10"] = 3,["11"] = 4,["12"] = 4,["13"] = 5,["14"] = 5,["15"] = 6,["16"] = 6,["17"] = 7,["18"] = 7,["19"] = 9,["20"] = 9,["21"] = 9,["23"] = 9,["24"] = 18,["25"] = 19,["26"] = 20,["27"] = 22,["28"] = 22,["29"] = 23,["30"] = 22,["31"] = 22,["32"] = 18,["33"] = 30,["34"] = 31,["35"] = 33,["36"] = 33,["37"] = 33,["38"] = 33,["39"] = 34,["40"] = 30,["41"] = 40,["42"] = 41,["43"] = 42,["44"] = 43,["45"] = 44,["46"] = 40,["47"] = 57,["48"] = 64,["49"] = 65,["51"] = 69,["52"] = 70,["53"] = 71,["54"] = 72,["56"] = 75,["57"] = 76,["58"] = 76,["59"] = 76,["60"] = 76,["61"] = 78,["62"] = 78,["63"] = 79,["64"] = 80,["65"] = 81,["66"] = 82,["67"] = 83,["69"] = 86,["70"] = 86,["73"] = 88,["75"] = 88,["76"] = 88,["77"] = 88,["78"] = 90,["79"] = 91,["80"] = 91,["81"] = 91,["82"] = 92,["85"] = 97,["89"] = 94,["90"] = 95,["99"] = 102,["100"] = 103,["103"] = 107,["104"] = 111,["105"] = 112,["107"] = 115,["108"] = 118,["109"] = 119,["110"] = 119,["111"] = 119,["112"] = 119,["113"] = 119,["115"] = 119,["116"] = 119,["117"] = 119,["118"] = 119,["119"] = 120,["120"] = 121,["123"] = 78,["124"] = 78,["125"] = 57,["126"] = 130,["127"] = 131,["128"] = 131,["130"] = 133,["132"] = 134,["133"] = 134,["134"] = 135,["135"] = 136,["136"] = 136,["137"] = 136,["138"] = 137,["140"] = 134,["143"] = 141,["144"] = 141,["145"] = 143,["146"] = 143,["147"] = 143,["148"] = 143,["149"] = 141,["150"] = 148,["151"] = 149,["152"] = 149,["154"] = 150,["155"] = 151,["156"] = 152,["157"] = 153,["158"] = 153,["159"] = 153,["160"] = 153,["161"] = 157,["162"] = 157,["163"] = 157,["164"] = 157,["165"] = 161,["167"] = 165,["168"] = 166,["170"] = 168,["171"] = 170,["172"] = 141,["173"] = 172,["174"] = 173,["175"] = 141,["176"] = 141,["177"] = 141,["178"] = 130,["179"] = 182,["180"] = 183,["181"] = 184,["184"] = 185,["188"] = 188,["189"] = 188,["191"] = 190,["192"] = 191,["193"] = 193,["195"] = 194,["196"] = 194,["197"] = 194,["198"] = 194,["200"] = 195,["201"] = 196,["202"] = 198,["203"] = 199,["204"] = 199,["205"] = 198,["206"] = 198,["207"] = 198,["208"] = 198,["209"] = 198,["210"] = 198,["211"] = 198,["212"] = 207,["216"] = 210,["217"] = 210,["218"] = 210,["219"] = 210,["220"] = 210,["221"] = 210,["222"] = 210,["223"] = 210,["224"] = 210,["225"] = 210,["226"] = 210,["227"] = 182,["228"] = 220,["229"] = 221,["230"] = 220,["231"] = 224,["232"] = 225,["233"] = 224,["234"] = 228,["235"] = 229,["236"] = 228,["237"] = 232,["238"] = 233,["239"] = 232,["240"] = 11,["241"] = 13});
local ____exports = {}
local ____constants = require("core.constants")
local Constants = ____constants.Constants
local ____match_events = require("core.webAPI.match_events")
local MatchEvents = ____match_events.MatchEvents
local ____payments = require("core.webAPI.payments")
local Payments = ____payments.Payments
local ____feedback = require("core.webAPI.feedback")
local Feedback = ____feedback.Feedback
local ____util = require("lib.util")
local Util = ____util.Util
local ____supporters = require("core.webAPI.supporters")
local Supporters = ____supporters.Supporters
local ____error_tracking = require("core.webAPI.error_tracking")
local ErrorTracking = ____error_tracking.ErrorTracking
____exports.WebAPIManager = __TS__Class()
local WebAPIManager = ____exports.WebAPIManager
WebAPIManager.name = "WebAPIManager"
function WebAPIManager.prototype.____constructor(self)
end
function WebAPIManager.Init(self)
    self:DefaultValues()
    self:InitWebAPIClasses()
    Timers:CreateTimer(
        function()
            self:BeforeMatch()
        end
    )
end
function WebAPIManager.DefaultValues(self)
    ____exports.WebAPIManager.matchId = (IsInToolsMode() and RandomInt(-10000000, -1)) or tonumber(
        tostring(
            GameRules:Script_GetMatchID()
        )
    )
    ____exports.WebAPIManager.dedicatedServerKey = GetDedicatedServerKeyV2("1")
end
function WebAPIManager.InitWebAPIClasses(self)
    MatchEvents:Init()
    Payments:Init()
    Feedback:Init()
    ErrorTracking:Init()
end
function WebAPIManager.Send(self, path, data, onSuccess, onError, retryTimes)
    if not data then
        error(("Upon sending data to " .. path) .. ", data is empty, which should never be the case. Check the provided information.")
    end
    local request = CreateHTTPRequestScriptVM("POST", (self.serverHost .. "/api/lua/") .. path)
    if Util:WebAPIDebug() then
        print("Sending request to " .. path)
        DeepPrintTable(data)
    end
    request:SetHTTPRequestHeaderValue("Dedicated-Server-Key", self.dedicatedServerKey)
    request:SetHTTPRequestRawPostBody(
        "application/json",
        json.encode(data)
    )
    request:Send(
        function(response)
            if (response.StatusCode >= 200) and (response.StatusCode < 300) then
                local data = json.decode(response.Body)
                if Util:WebAPIDebug() then
                    print(("Response from " .. path) .. ":")
                    DeepPrintTable(data)
                end
                if onSuccess then
                    onSuccess(nil, data)
                end
            else
                local ____error = unpack(
                    {
                        json.decode(response.Body)
                    }
                )
                if Util:WebAPIDebug() then
                    print(
                        (("Status code error from " .. path) .. ": ") .. tostring(response.StatusCode)
                    )
                    if response.Body then
                        do
                            local function ____catch()
                                print("failed to deserialize body: ", response.Body)
                            end
                            local ____try, ____hasReturned = pcall(
                                function()
                                    local result = json.decode(response.Body)
                                    DeepPrintTable(result)
                                end
                            )
                            if not ____try then
                                ____hasReturned, ____returnValue = ____catch(____hasReturned)
                            end
                        end
                    end
                end
                if not ____error then
                    print("No Error part in response!")
                    return
                end
                local message = ((response.StatusCode == 0) and "Could not establish connection to the server. Please try again later.") or (____error.title or "Unknown error")
                if ____error.traceId then
                    message = message .. ((" Report it to the developer with this id: " .. ____error.traceId) .. ".")
                end
                ____error.message = message
                if retryTimes and (retryTimes >= 0) then
                    self:Send(
                        path,
                        data,
                        onSuccess,
                        onError,
                        (function()
                            retryTimes = retryTimes - 1
                            return retryTimes
                        end)()
                    )
                elseif onError then
                    onError(nil, ____error)
                end
            end
        end
    )
end
function WebAPIManager.BeforeMatch(self)
    if Util:WebAPIDebug() then
        print("Firing BeforeMatch event to the server")
    end
    local players = {}
    do
        local playerId = 0
        while playerId < (Constants.MAX_PLAYERS - 1) do
            if PlayerResource:IsValidPlayerID(playerId) and (not PlayerResource:IsFakeClient(playerId)) then
                local steamId = tostring(
                    PlayerResource:GetSteamID(playerId)
                )
                players[playerId + 1] = steamId
            end
            playerId = playerId + 1
        end
    end
    self:Send(
        "match/before",
        {
            custom_game = self.customGame,
            map_name = GetMapName(),
            players = players
        },
        function(____, data)
            if Util:WebAPIDebug() then
                print("BEFORE MATCH")
            end
            local playerSettingsList = {}
            for ____, playerData in ipairs(data.players) do
                local ____ = playerData.steam_id
                Managers.Settings:LoadPlayersSettings(
                    Util:GetPlayerIdBySteamId(playerData.steam_id),
                    playerData.settings
                )
                local settings = {
                    steam_id = playerData.steam_id,
                    settings = __TS__ObjectAssign({}, playerData.settings, {first_time_player = false})
                }
                __TS__ArrayPush(playerSettingsList, settings)
            end
            if Constants.WEBAPI_PRINT_DEBUGS then
                print("Confirm Settings and set first time player:")
            end
            Managers.WebAPIManager:Send("match/update-settings", {players = playerSettingsList})
            Managers.WaveManager:GameStart()
        end,
        function(____, ____error)
            print(____error.message)
        end,
        2
    )
end
function WebAPIManager.AfterMatch(self)
    if not IsInToolsMode() then
        if GameRules:IsCheatMode() then
            return
        end
        if GameRules:GetGameTime() < 60 then
            return
        end
    end
    if Util:WebAPIDebug() then
        print("Firing AfterMatch event call to the server.")
    end
    local players = {}
    local participatingPlayers = Managers.GameModeManager:GetAllPlayers()
    for ____, participatingPlayer in ipairs(participatingPlayers) do
        do
            if PlayerResource:IsFakeClient(
                participatingPlayer:GetPlayerID()
            ) then
                goto __continue38
            end
            local playerId = participatingPlayer:GetPlayerID()
            local hero = participatingPlayer:GetAssignedHero()
            local player = {
                steam_id = tostring(
                    PlayerResource:GetSteamID(playerId)
                ),
                hero_id = hero:GetHeroID(),
                lives = Managers.GameModeManager:GetLives(hero),
                shards_total = Managers.ShopManager:GetPlayerCombinedShardCount(playerId),
                networth = Managers.ShopManager:GetPlayerGold(playerId),
                equipped_weapons = {{weapon_id = 1, rarity = 1, enchantments_count = 2, level = 23, elements = {1}}}
            }
            __TS__ArrayPush(players, player)
        end
        ::__continue38::
    end
    self:Send(
        "match/after_match_team",
        {
            custom_game = self.customGame,
            map_name = GetMapName(),
            match_id = self.matchId,
            time = GameRules:GetGameTime(),
            round = Managers.WaveManager:GetCurrentWave(),
            players = players
        }
    )
end
function WebAPIManager.SetPlayerSupporterState(self, playerId, supporterState)
    Supporters:SetSupporterState(playerId, supporterState)
end
function WebAPIManager.GetSupporterLevel(self, playerId)
    return Supporters:GetSupporterLevel(playerId)
end
function WebAPIManager.IsDeveloper(self, playerId)
    return Supporters:IsDeveloper(playerId)
end
function WebAPIManager.TryError(self, callback, ...)
    ErrorTracking:TryCollectError(callback, ...)
end
WebAPIManager.serverHost = "https://api.revolt.dota2unofficial.com"
WebAPIManager.customGame = "reVolt"
return ____exports
