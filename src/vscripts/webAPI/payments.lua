--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
require("lualib_bundle");
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 1,["6"] = 1,["7"] = 2,["8"] = 2,["9"] = 3,["10"] = 3,["11"] = 5,["12"] = 5,["13"] = 5,["15"] = 5,["16"] = 11,["17"] = 12,["18"] = 12,["19"] = 12,["20"] = 13,["21"] = 12,["22"] = 12,["23"] = 16,["24"] = 16,["25"] = 16,["26"] = 17,["27"] = 16,["28"] = 16,["29"] = 20,["30"] = 20,["31"] = 22,["32"] = 23,["33"] = 20,["34"] = 20,["35"] = 20,["36"] = 29,["37"] = 11,["38"] = 39,["39"] = 40,["40"] = 41,["41"] = 41,["42"] = 41,["43"] = 42,["44"] = 43,["46"] = 46,["47"] = 46,["48"] = 48,["49"] = 48,["50"] = 50,["51"] = 50,["52"] = 48,["53"] = 48,["54"] = 48,["55"] = 48,["56"] = 46,["57"] = 55,["58"] = 56,["59"] = 57,["62"] = 59,["63"] = 46,["64"] = 64,["65"] = 65,["66"] = 66,["69"] = 68,["70"] = 46,["71"] = 46,["72"] = 39,["73"] = 84,["74"] = 85,["75"] = 86,["76"] = 86,["77"] = 86,["78"] = 87,["79"] = 88,["81"] = 91,["82"] = 92,["83"] = 93,["84"] = 95,["85"] = 96,["86"] = 96,["87"] = 96,["90"] = 101,["91"] = 102,["92"] = 102,["93"] = 102,["94"] = 102,["96"] = 104,["97"] = 105,["98"] = 106,["99"] = 107,["100"] = 107,["101"] = 107,["105"] = 84,["106"] = 121,["107"] = 122,["108"] = 123,["109"] = 124,["111"] = 127,["112"] = 128,["113"] = 130,["116"] = 132,["117"] = 133,["120"] = 135,["121"] = 137,["122"] = 138,["123"] = 139,["127"] = 144,["128"] = 121,["129"] = 6});
local ____exports = {}
local ____util = require("lib.util")
local Util = ____util.Util
local ____constants = require("core.constants")
local Constants = ____constants.Constants
local ____match_events = require("core.webAPI.match_events")
local MatchEvents = ____match_events.MatchEvents
____exports.Payments = __TS__Class()
local Payments = ____exports.Payments
Payments.name = "Payments"
function Payments.prototype.____constructor(self)
end
function Payments.Init(self)
    Util:RegisterClientEventListener(
        "webapi:payment_create",
        function(____, event, playerId)
            self:CreatePayment(playerId, event)
        end
    )
    Util:RegisterClientEventListener(
        "webapi:payment_window",
        function(____, event, playerId)
            self:OnPaymentWindowStatusChange(playerId, event)
        end
    )
    ListenToGameEvent(
        "player_disconnect",
        function(event)
            self:OnPaymentWindowStatusChange(event.PlayerID, {visible = 0})
        end,
        nil
    )
    MatchEvents.responseHandlers:set("payment_update", self.HandlePaymentUpdateResponse)
end
function Payments.CreatePayment(self, playerId, event)
    if Util:WebAPIDebug() then
        print(
            "Creating payment for PlayerID " .. tostring(playerId)
        )
        print("Event details:")
        DeepPrintTable(event)
    end
    Managers.WebAPIManager:Send(
        "payment/create",
        {
            match_id = Managers.WebAPIManager.matchId,
            steam_id = tostring(
                PlayerResource:GetSteamID(playerId)
            ),
            method = event.method,
            payment_kind = event.paymentKind,
            is_gift_code = (((event.isGiftCode == 1) and (function() return true end)) or (function() return false end))()
        },
        function(____, response)
            local player = PlayerResource:GetPlayer(playerId)
            if not player then
                return
            end
            CustomGameEventManager:Send_ServerToPlayer(player, "webapi:payment_succeeded", {id = event.id, url = response.url})
        end,
        function(____, ____error)
            local player = PlayerResource:GetPlayer(playerId)
            if not player then
                return
            end
            CustomGameEventManager:Send_ServerToPlayer(player, "webapi:payment_failed", {id = event.id, error = ____error.message})
        end
    )
end
function Payments.OnPaymentWindowStatusChange(self, playerId, event)
    if Util:WebAPIDebug() then
        print(
            "On payment window status change, called by player " .. tostring(playerId)
        )
        print("Event details:")
        DeepPrintTable(event)
    end
    if event.visible == 1 then
        ____exports.Payments.openPaymentWindows:add(playerId)
        MatchEvents.requestDelay = Constants.WEBAPI_MATCHEVENT_QUICK_REQUESTS_DELAY
        if Util:WebAPIDebug() then
            print(
                ((("Added player ID " .. tostring(playerId)) .. " to the list of opened payment windows and set request delay to ") .. tostring(Constants.WEBAPI_MATCHEVENT_QUICK_REQUESTS_DELAY)) .. "."
            )
        end
    else
        ____exports.Payments.openPaymentWindows:delete(playerId)
        if Util:WebAPIDebug() then
            print(
                ("Deleted playerId " .. tostring(playerId)) .. " from the list of open payment windows."
            )
        end
        if ____exports.Payments.openPaymentWindows.size == 0 then
            MatchEvents.requestDelay = Constants.WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY
            if Util:WebAPIDebug() then
                print(
                    "Payment windows are closed for all players. Set request delay to " .. tostring(Constants.WEBAPI_MATCHEVENT_DEFAULT_REQUEST_DELAY)
                )
            end
        end
    end
end
function Payments.HandlePaymentUpdateResponse(self, response)
    if Util:WebAPIDebug() then
        print("Handling payment update response")
        DeepPrintTable(response)
    end
    local steamId = response.steam_id
    local playerId = Util:GetPlayerIdBySteamId(steamId)
    if (not playerId) or (playerId == -1) then
        return
    end
    local player = PlayerResource:GetPlayer(playerId)
    if not player then
        return
    end
    CustomGameEventManager:Send_ServerToPlayer(player, "webapi:payment_update", response)
    if response.error then
        if Util:WebAPIDebug() then
            print("There was an error handling the payment update response, error: " .. response.error)
        end
        return
    end
    Managers.WebAPIManager:SetPlayerSupporterState(playerId, response.supporterState)
end
Payments.openPaymentWindows = __TS__New(Set)
return ____exports
