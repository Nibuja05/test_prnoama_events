import { Constants } from "./core/constants";
import { GameLogicManager } from "./core/managers";
import { reloadable } from "./lib/tstl-utils";

declare global {
	interface CDOTAGamerules {
		Addon: GameMode;
	}
}

@reloadable
export class GameMode {
	Game: CDOTABaseGameMode = GameRules.GetGameModeEntity();

	public static Precache(this: void, context: CScriptPrecacheContext) {}

	public static Activate(this: void) {
		// When the addon activates, create a new instance of this GameMode class.
		GameRules.Addon = new GameMode();
	}

	constructor() {
		this.SetGameRules();
		this.RegisterEvents();
		this.InitializeManager();
		this.ListenToGameEvent();
		this.SetupFilters();
	}

	/**
	 * Set the initial game rules.
	 */
	private SetGameRules(): void {
		// Game launch rules
		GameRules.LockCustomGameSetupTeamAssignment(true);
		GameRules.EnableCustomGameSetupAutoLaunch(true);
		GameRules.SetCustomGameSetupAutoLaunchDelay(IsInToolsMode() ? 3 : 5);
		GameRules.SetSameHeroSelectionEnabled(false);
		// Only uncomment if the mode forces all players to use a certain hero.
		//this.Game.SetCustomGameForceHero("npc_hero_sven");

		// Use the below rules to set the amount of players per team. Add additional teams if needed.
		// GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 5);
		// GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 5);

		// Music rules
		GameRules.SetCustomGameAllowBattleMusic(false);
		GameRules.SetCustomGameAllowHeroPickMusic(false);
		GameRules.SetCustomGameAllowMusicAtGameStart(false);

		// Game launch timers
		GameRules.SetPreGameTime(0);
		GameRules.SetShowcaseTime(0);
		GameRules.SetStrategyTime(0);
		GameRules.SetHeroSelectionTime(30);
		GameRules.SetCustomGameEndDelay(30);
		GameRules.SetPostGameTime(30);

		// Ongoing game rules
		GameRules.SetFirstBloodActive(false);
		GameRules.SetHideKillMessageHeaders(false);
		GameRules.SetHeroRespawnEnabled(true);
		this.Game.SetAnnouncerDisabled(true);
		this.Game.SetCameraDistanceOverride(-1);
		this.Game.SetDaynightCycleDisabled(true);
		this.Game.SetFogOfWarDisabled(false);
		this.Game.SetMaximumAttackSpeed(700);
		this.Game.SetDeathOverlayDisabled(true);
		this.Game.SetGiveFreeTPOnDeath(false);
		this.Game.SetInnateMeleeDamageBlockAmount(0);
		this.Game.SetInnateMeleeDamageBlockPercent(0);
		this.Game.SetKillingSpreeAnnouncerDisabled(true);
		this.Game.SetLoseGoldOnDeath(false);
		this.Game.SetPauseEnabled(true);
		this.Game.SetUnseenFogOfWarEnabled(true);
	}

	/**
	 * Register all basic listeners for this gamemode.
	 */
	private RegisterEvents(): void {
		// Register event listeners for dota engine events
		ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
		ListenToGameEvent("npc_spawned", (event) => this.OnNPCSpawned(event), undefined);
		ListenToGameEvent("player_chat", (event) => this.OnPlayerChat(event), undefined);
	}

	/**
	 * Initializes the `Manager` object to be used in the entire project.
	 */
	private InitializeManager() {
		new GameLogicManager();
	}

	//////////////////
	// GAME EVENTS //
	/////////////////

	private ListenToGameEvent() {
		// Register event listeners for dota engine events
		ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
		ListenToGameEvent("npc_spawned", (event) => this.OnNPCSpawned(event), undefined);
	}

	public OnStateChange(): void {
		const state = GameRules.State_Get();

		switch (state) {
			case GameState.CUSTOM_GAME_SETUP:
				// Automatically skip setup in tools
				if (IsInToolsMode()) {
					Timers.CreateTimer(3, () => {
						GameRules.FinishCustomGameSetup();
					});
				}
				break;

			case GameState.PRE_GAME:
				// Call pre-game event once pregame hits
				Timers.CreateTimer(0.2, () => this.OnPreGameStarted());
				break;

			case GameState.GAME_IN_PROGRESS:
				// Trigger game started event
				this.OnGameStarted();
				break;
		}
	}

	private OnPreGameStarted(): void {
		print("Pre-game phase started.");

		for (const [key, val] of Object.entries(Constants)) {
			if (typeof val === "number") {
				CustomNetTables.SetTableValue("constants", key, { value: val });
			}
			if (typeof val === "boolean") {
				CustomNetTables.SetTableValue("constants", key, { value: val ? 1 : 0 });
			}
		}

		let cheatMode = GameRules.IsCheatMode();
		CustomNetTables.SetTableValue("game_status", "dev", { cheats_enabled: cheatMode });
		// Do some stuff here
	}

	private OnGameStarted(): void {
		print("Game started.");

		// do some stuff here
	}

	/**
	 * Called whenever a player sends a chat message.
	 * Currently used to detect dev commands starting with "-".
	 * @param event includes the text and the playerId.
	 */
	private OnPlayerChat(event: PlayerChatEvent) {
		if (!event.playerid) return;

		// Check for dev commands
		if (event.text.startsWith("-")) {
			Managers.DevCommands.DevCommandFromChat(event.text);
		}
	}

	// Called on script_reload
	public Reload() {
		print("Script reloaded!");

		// Do some stuff here
	}

	private OnNPCSpawned(event: NpcSpawnedEvent) {
		const unit = EntIndexToHScript(event.entindex);
		if (!unit || !unit.IsBaseNPC()) return;

		// We know unit is valid and is of type CDOTA_BaseNPC here due to the above check.
		print(`Unit ${unit.GetUnitName()} was spawned.`);
	}

	/////////////
	// FILTERS //
	/////////////

	private SetupFilters() {
		this.Game.SetModifyGoldFilter((event) => this.GoldFilter(event), this);
		this.Game.SetModifyExperienceFilter((event) => this.ExperienceFilter(event), this);
		this.Game.SetDamageFilter((event) => this.DamageFilter(event), this);
		this.Game.SetModifierGainedFilter((event) => this.ModifierGainedFilter(event), this);
		this.Game.SetHealingFilter((event) => this.HealingFilter(event), this);
		this.Game.SetExecuteOrderFilter((event) => this.OrderFilter(event), this);
		this.Game.SetItemAddedToInventoryFilter((event) => this.ItemAddedToInventoryFilter(event), this);
		this.Game.SetAbilityTuningValueFilter((event) => this.AbilityTuningValueFilter(event), this);
		this.Game.SetBountyRunePickupFilter((event) => this.RunePickupFilter(event), this);
	}

	private GoldFilter(event: ModifyGoldFilterEvent): boolean {
		return true;
	}

	private ExperienceFilter(event: ModifyExperienceFilterEvent): boolean {
		return true;
	}

	private DamageFilter(event: DamageFilterEvent): boolean {
		return true;
	}

	private ModifierGainedFilter(event: ModifierGainedFilterEvent): boolean {
		return true;
	}

	private HealingFilter(event: HealingFilterEvent): boolean {
		return true;
	}

	private OrderFilter(event: ExecuteOrderFilterEvent): boolean {
		return true;
	}

	private ItemAddedToInventoryFilter(event: ItemAddedToInventoryFilterEvent): boolean {
		return true;
	}

	private AbilityTuningValueFilter(event: AbilityTuningValueFilterEvent): boolean {
		return true;
	}

	private RunePickupFilter(event: BountyRunePickupFilterEvent): boolean {
		return true;
	}
}
