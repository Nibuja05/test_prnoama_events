import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";

@registerAbility()
export class example_ability extends BaseAbility {
	caster = this.GetCaster();

	// Example usage of ability transformer (including the SpecialValue field).
	// It is currently disabled, meaning it wouldn't do anything on its own, however, if you're interested, enabling it is very easy. Talk to us (Nibuja or Shush) in Discord to learn more.
	BaseProperties: AbilityBaseProperties = {
		Behavior: AbilityBehavior.NO_TARGET,
		CastPoint: 0.5,
		Cooldown: 8,
		ManaCost: 20,
		MaxLevel: 4,
		TextureName: "axe_counter_helix",
		UnitDamageType: DamageTypes.MAGICAL,
		UnitTargetType: [UnitTargetType.BASIC, UnitTargetType.HERO],
	};

	SpecialValues: AbilitySpecials = {
		damage: [50, 100, 150, 200],
		radius: 280,
	};

	OnSpellStart(): void {
		const radius = this.GetSpecialValueFor("radius");
		const damage = this.GetSpecialValueFor("damage");

		const enemies = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			this.caster.GetAbsOrigin(),
			undefined,
			radius,
			this.GetAbilityTargetTeam(),
			this.GetAbilityTargetType(),
			this.GetAbilityTargetFlags(),
			FindOrder.ANY,
			false
		);

		for (const enemy of enemies) {
			ApplyDamage({
				attacker: this.caster,
				damage: damage,
				damage_type: this.GetAbilityDamageType(),
				victim: enemy,
				ability: this,
			});
		}
	}
}
