import { Util } from "../lib/util";

/*
	* Creates a particle that will survive player reconnects
	* @param particleName
	* @param particleAttach
	* @param owner
	* @param setup
	* @returns static particle handle that allows you to destroy it later
	*/
export function CreateStaticParticle(
	particleName: string,
	particleAttach: ParticleAttachment,
	owner: CBaseEntity,
	setup: (particleId: ParticleID) => void
): StaticParticleBase {
	return new StaticParticle(particleName, particleAttach, owner, setup);
}

export class StaticParticle implements StaticParticleBase {
	private static particles: StaticParticle[] = [];

	private particlesForPlayers: ParticleID[] = [];
	private particleName: string;
	private particleAttach: ParticleAttachment;
	private owner: CBaseEntity;
	private setup?: (particleId: ParticleID) => void;
	private destroyed: boolean = false;

	constructor(
		particleName: string,
		particleAttach: ParticleAttachment,
		owner: CBaseEntity,
		setup?: (particleId: ParticleID) => void
	) {
		this.particleName = particleName;
		this.particleAttach = particleAttach;
		this.owner = owner;
		this.setup = setup;

		this.createParticles();

		StaticParticle.particles.push(this);
	}

	/**
	 * @param player that needs particle update
	 */
	static UpdateParticlesForPlayer(player: CDOTAPlayer) {
		StaticParticle.particles.forEach((staticParticle) => {
			staticParticle.UpdateForPlayer(player);
		});
	}

	/**
	 * Create static particle for all players
	 * @param updateForPlayer optional, will create particle only for this player
	 */
	private createParticles(updateForPlayer?: CDOTAPlayer) {
		for (const player of Util.GetAllPlayers()) {
			if (!updateForPlayer || updateForPlayer === player) {
				let particleId = ParticleManager.CreateParticleForPlayer(
					this.particleName,
					this.particleAttach,
					this.owner,
					player
				);

				if (this.setup) this.setup(particleId);

				this.particlesForPlayers[player.GetPlayerID()] = particleId;
			}
		}
	}

	/**
	 * Recreate static particle for given player
	 * @param player that needs particle update
	 */
	UpdateForPlayer(player: CDOTAPlayer) {
		if (!this.destroyed) {
			const oldParticle = this.particlesForPlayers[player.GetPlayerID()];
			if (oldParticle) {
				ParticleManager.DestroyParticle(oldParticle, true);
				ParticleManager.ReleaseParticleIndex(oldParticle);
			}
			this.createParticles(player);
		}
	}

	/**
	 * Destroy static particle and release its index for all players
	 * @param immediate if true destroy it without playing end caps
	 */
	DestroyForAllPlayers(immediate: boolean): void {
		if (!this.destroyed) {
			this.particlesForPlayers.forEach((particleId) => {
				if (particleId) {
					ParticleManager.DestroyParticle(particleId, immediate);
					ParticleManager.ReleaseParticleIndex(particleId);
				}
			});
			this.destroyed = true;
		}
	}
}
