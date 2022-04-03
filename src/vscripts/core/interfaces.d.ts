interface CDOTA_BaseNPC {}
interface CDOTA_BaseNPC_Hero {}
interface CDOTABaseAbility {}
interface CDOTA_Buff {}

declare var Managers: import("./managers").GameLogicManager;

interface FindFreeCellResult {
	success: boolean;
	xCoord: number;
	yCoord: number;
}

interface StaticParticleBase {
	/**
	 * Destroy static particle and release its index for all players
	 * @param immediate if true destroy it without playing end caps
	 */
	DestroyForAllPlayers(immediate: boolean): void;
}
