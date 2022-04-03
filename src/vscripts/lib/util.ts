import { Constants } from "../core/constants";

/**
 * Similar to the normal `Map<T, Q>`, but allows to add a default value to the get function,
 * if the key doesn't exist in the map.
 */
export class DefaultMap<T, Q> extends Map<T, Q> {
	constructor() {
		super();
	}
	/**
	 * Get a value from this map matching the given name.
	 * @param name name to check for
	 * @param defaultVal value to return if the name doesn't exist
	 * @returns value matching the name or default value if it doesn't exist
	 */
	getDefault(name: T, defaultVal: Q): Q {
		if (this.has(name)) {
			return super.get(name)!;
		}
		return defaultVal;
	}
}

export namespace Util {
	/**
	 * Prints all contents of an table (lua table: array/object).
	 * @param tab table to print
	 */
	export function PrintTable(tab: { [key: string]: any }) {
		print("{");
		for (const [key, val] of Object.entries(tab)) {
			print(`\t${key}:`, val);
		}
		print("}");
	}

	/**
	 * Create a new array with a specific length and prefilled with a given value.
	 * @param length length of the array
	 * @param value value to fill the array with
	 * @returns filled array
	 */
	export function CreateFilledArray<T>(length: number, value: T): T[] {
		let arr: T[] = [];
		for (let i = 0; i < length; i++) {
			arr.push(value);
		}
		return arr;
	}

	/**
	 * Return a random integer number between the min and max value,
	 * but always in the form [min] + multiple of [stepSize]
	 * @param min minimum value
	 * @param max maximum value
	 * @param stepSize step size
	 * @returns
	 */
	export function RandomIntSteps(min: number, max: number, stepSize: number) {
		let maxStep = math.floor((max - min) / stepSize);
		return min + RandomInt(0, maxStep) * stepSize;
	}

	/**
	 * Returns a random element from an array.
	 * @param arr array to choose from
	 * @returns random element
	 */
	export function GetRandomArrayElement<T>(arr: T[]): T {
		return arr[RandomInt(0, arr.length - 1)];
	}

	/**
	 * Remove a random element from an array and return it.
	 * @param arr array to choose from
	 * @returns [picked element, remaining array]
	 */
	export function PickRandomArrayElement<T>(arr: T[]): [T, T[]] {
		let elem = arr[RandomInt(0, arr.length - 1)];
		return [elem, arr.filter((item) => item !== elem)];
	}

	/**
	 * Returns multiple random elements from an array.
	 * @param arr array to choose from
	 * @param count number of wanted elements
	 * @returns multiple (count) random elements
	 */
	export function GetRandomArrayElements<T>(arr: T[], count: number): T[] {
		if (count === 0) return [];
		if (count <= 1) {
			return [GetRandomArrayElement(arr)];
		}
		if (count >= arr.length) {
			return arr;
		}
		let usedIndeces: number[] = [];
		let elements: T[] = [];
		do {
			let rnd = RandomInt(0, arr.length - 1);
			if (usedIndeces.indexOf(rnd) > -1) {
				continue;
			}
			elements.push(arr[rnd]);
			usedIndeces.push(rnd);
		} while (usedIndeces.length < count);
		return elements;
	}

	/**
	 * Helper function calculate the sum of all array members.
	 * @param arr number array
	 * @returns sum of all numbers of the array
	 */
	export function SumArr(arr: number[]): number {
		return arr.reduce((prev, cur) => {
			return prev + cur;
		});
	}

	/**
	 * Find a random key from an object, with value being probability.
	 * @param keyToWeightObject
	 * @returns randomly chosen key
	 */
	export function GetRandomObjectKeyBalanced(keyToWeightObject: { [weaponName: string]: number }): string {
		return Util.GetRandomArrayElementBalanced(Object.keys(keyToWeightObject), Object.values(keyToWeightObject));
	}

	/**
	 * Find a random element from an array, but with a weighted probability.
	 * @param arr array to choose from
	 * @param weights relative probability of the elements
	 * @returns randomly chosen element
	 */
	export function GetRandomArrayElementBalanced<T>(arr: T[], weights: number[] | Map<T, number>): T {
		const sum = weights instanceof Map ? SumArr([...weights.values()]) : SumArr(weights);
		let rand = RandomInt(0, sum);
		let curWeight = 0;
		for (let i = 0; i < arr.length; i++) {
			curWeight += weights instanceof Map ? weights.get(arr[i]) ?? 0 : weights[i];
			if (rand <= curWeight) {
				return arr[i];
			}
		}
		return arr[arr.length - 1];
	}

	/**
	 * Converts a lua table (with indeces as keys) to an Array.
	 * @param table
	 * @returns
	 */
	export function TableToArray<T>(table: { [key: string]: T }): T[] {
		let result: T[] = [];
		let i = 1;
		while (table["" + i]) {
			result.push(table["" + i]);
			i++;
		}
		return result;
	}

	/**
	 * Calculates the angle in degrees between two vectors.
	 * @param vectorA
	 * @param vectorB
	 * @returns
	 */
	export function AngleCalculation(vectorA: Vector, vectorB: Vector): number {
		let dot = DotProduct(vectorA, vectorB);
		let angleOld = math.acos(dot);
		return 57.29577951 * angleOld;
	}

	/**
	 * Rotate a 2D Vector clockwise by x degrees.
	 * @param direction vector to rotate
	 * @param degree angle to rotate in degrees
	 * @returns rotated vector
	 */
	export function RotateVector2D(direction: Vector, degree: number): Vector {
		let rotMatrix = Matrix("R", degree);
		return (rotMatrix * direction) as Vector;
	}

	let rotationMatrices: Map<number, Matrix> = new Map();
	/**
	 * Rotate a 2D Vector clockwise by x degrees.
	 * Saves used rotation matrices to speed up calculation, if the same rotation angle is used multiple times.
	 * Can get a negative angle to rotate counter-clockwise instead.
	 * @param direction vector to rotate
	 * @param degree angle to rotate in degrees
	 * @returns rotated vector
	 */
	export function RotateVector2D_Fast(direction: Vector, degree: number): Vector {
		if (!rotationMatrices.has(degree)) {
			rotationMatrices.set(degree, Matrix("R", degree));
		}
		let rotMatrix = rotationMatrices.get(degree)!; // always exists, ensured by check before
		return (rotMatrix * direction) as Vector;
	}

	/**
	 * Calculate the angle between two vectors as degrees (with sign as side indicator).
	 * @param vectorA
	 * @param vectorB
	 * @returns
	 */
	export function AngleCalculationWithSide(vectorA: Vector, vectorB: Vector): number {
		let a2 = Math.atan2(vectorA.y, vectorA.x);
		let a1 = Math.atan2(vectorB.y, vectorB.x);
		let sign = a1 > a2 ? 1 : -1;
		let angle = a1 - a2;
		let K = -sign * Math.PI * 2;
		angle = Math.abs(K + angle) < Math.abs(angle) ? K + angle : angle;
		return RadToDeg(angle);
	}

	/**
	 * Return the side of a test point in reference to another direction (with start location).
	 * @param direction
	 * @param origin
	 * @param point
	 * @returns
	 */
	export function GetVectorSide(direction: Vector, origin: Vector, point: Vector): 1 | 0 | -1 {
		let goal = (origin + direction * 1000) as Vector;
		let a = (goal.x - origin.x) * (point.y - origin.y) - (goal.y - origin.y) * (point.x - origin.x);
		return Sign(a);
	}

	/**
	 * Intersection point of two vectors.
	 * Following algorithm from https://en.wikipedia.org/wiki/Line–line_intersection#Given_two_points_on_each_line_segment
	 * @param startA
	 * @param endA
	 * @param startB
	 * @param endB
	 */
	export function GetLineIntersection(
		startA: Vector,
		endA: Vector,
		startB: Vector,
		endB: Vector
	): Vector | undefined {
		let d_1 = Matrix([startA.x, 1], [endA.x, 1]).Determinant()!;
		let d_2 = Matrix([startB.x, 1], [endB.x, 1]).Determinant()!;
		let d_3 = Matrix([startA.y, 1], [endA.y, 1]).Determinant()!;
		let d_4 = Matrix([startB.y, 1], [endB.y, 1]).Determinant()!;
		let d = Matrix([d_1, d_3], [d_2, d_4]).Determinant()!;

		// lines are parallel or don't touch
		if (d === 0) return;

		let d_11 = Matrix([startA.x, startA.y], [endA.x, endA.y]).Determinant()!;
		let d_12 = Matrix([startB.x, startB.y], [endB.x, endB.y]).Determinant()!;

		let dx_13 = Matrix([startA.x, 1], [endA.x, 1]).Determinant()!;
		let dx_14 = Matrix([startB.x, 1], [endB.x, 1]).Determinant()!;
		let dy_13 = Matrix([startA.y, 1], [endA.y, 1]).Determinant()!;
		let dy_14 = Matrix([startB.y, 1], [endB.y, 1]).Determinant()!;

		let dx = Matrix([d_11, dx_13], [d_12, dx_14]).Determinant()!;
		let dy = Matrix([d_11, dy_13], [d_12, dy_14]).Determinant()!;

		return Vector(dx / d, dy / d, startA.z);
	}

	/**
	 * Calculate the minimal distance to a line segment from a point (in 2D).
	 * @param startLoc
	 * @param endLoc
	 * @param testLoc
	 * @returns
	 */
	export function GetLineDistance(startLoc: Vector, endLoc: Vector, testLoc: Vector): number {
		let l2 = sqrDist(startLoc, endLoc);
		if (l2 == 0) return sqrDist(startLoc, testLoc);
		let t =
			((testLoc.x - startLoc.x) * (endLoc.x - startLoc.x) + (testLoc.y - startLoc.y) * (endLoc.y - startLoc.y)) /
			l2;
		t = Math.max(0, Math.min(1, t));
		return (
			(testLoc -
				Vector(startLoc.x + t * (endLoc.x - startLoc.x), startLoc.y + t * (endLoc.y - startLoc.y), 0)) as Vector
		).Length2D();
	}

	/**
	 * Calculate the minimal distance to a line segment from a point (in 2D) and the closest point on that line.
	 * @param startLoc
	 * @param endLoc
	 * @param testLoc
	 * @returns
	 */
	export function LineDistanceWithPosition(startLoc: Vector, endLoc: Vector, testLoc: Vector): [number, Vector] {
		let l2 = sqrDist(startLoc, endLoc);
		if (l2 == 0) return [sqrDist(startLoc, testLoc), startLoc];
		let t =
			((testLoc.x - startLoc.x) * (endLoc.x - startLoc.x) + (testLoc.y - startLoc.y) * (endLoc.y - startLoc.y)) /
			l2;
		t = Math.max(0, Math.min(1, t));
		let linePos = Vector(
			startLoc.x + t * (endLoc.x - startLoc.x),
			startLoc.y + t * (endLoc.y - startLoc.y),
			startLoc.z
		);
		return [((testLoc - linePos) as Vector).Length2D(), linePos];
	}

	/**
	 * Finds all units in a 2D cone, that is defined through a start point, length and an angle.
	 * Can be fetched in any order supported by FindOrder.
	 * @param team the team the unit finding should reference from.
	 * @param teamFilter filters based on team
	 * @param typeFilter filters based on types
	 * @param flagFilter filters based on flags
	 * @param startLoc the starting position that the cone should originate from.
	 * @param direction the general direction of the cone.
	 * @param distance the distance the cone reaches.
	 * @param angle the angle to either side of the direction that the cone should expand its search.
	 * @param findOrder the order, based on the FindOrder enum, that results should be returned in. Defaults to FindOrder.ANY.
	 * @param debugMode should the cone be drawn in the game? Used for debugging purposes.
	 */
	export function FindUnitsInCone(
		team: DotaTeam,
		teamFilter: UnitTargetTeam,
		typeFilter: UnitTargetType,
		flagFilter: UnitTargetFlags,
		startLoc: Vector,
		direction: Vector,
		distance: number,
		angle: number,
		findOrder: FindOrder = FindOrder.ANY,
		debugMode?: boolean
	) {
		startLoc = GetGroundPosition(startLoc, undefined);
		let endLoc = (startLoc + direction * distance) as Vector;
		let width = GetConeWidth(distance, angle / 2);

		let debugDir: Vector;
		if (debugMode) {
			debugDir = RotateVector2D(direction, 90).Normalized();
			let debugPos1 = (endLoc + debugDir * width) as Vector;
			let debugPos2 = (endLoc - debugDir * width) as Vector;
			DebugDrawLine(startLoc, debugPos1, 0, 255, 0, false, 5);
			DebugDrawLine(startLoc, debugPos2, 0, 255, 0, false, 5);
			DebugDrawLine(debugPos2, debugPos1, 0, 255, 0, false, 5);
			DebugDrawLine(startLoc, endLoc, 255, 0, 0, false, 5);
		}

		let units = FindUnitsInLine(team, startLoc, endLoc, undefined, width, teamFilter, typeFilter, flagFilter);
		let result: CDOTA_BaseNPC[] = [];
		for (const unit of units) {
			let unitLoc = unit.GetAbsOrigin();
			let unitDistance = ((unitLoc - startLoc) as Vector).Length2D();
			if (unitDistance > distance) continue;
			let [lineDistance, linePos] = LineDistanceWithPosition(startLoc, endLoc, unitLoc);
			let curDistance = ((startLoc - linePos) as Vector).Length2D();
			let curWidth = GetConeWidth(curDistance, angle / 2);
			if (curWidth >= lineDistance) {
				result.push(unit);
			}

			if (debugMode) {
				DebugDrawCircle(unitLoc, Vector(0, 0, 255), 0, 50, false, 5);
				let debugDir2 = ((unitLoc - startLoc) as Vector).Normalized();
				let debugPos3 = (startLoc + debugDir2 * (unitDistance - 50)) as Vector;
				DebugDrawLine(startLoc, debugPos3, 0, 0, 255, false, 5);
				let anglePos = (linePos + debugDir! * (lineDistance - 50)) as Vector;
				DebugDrawLine(linePos, anglePos, 0, 0, 255, false, 5);
				DebugDrawCircle(linePos, Vector(0, 0, 255), 255, 25, false, 5);
			}
		}

		if (findOrder === FindOrder.CLOSEST) {
			// Sort from closest to farthest from the start position of the call
			result.sort((firstUnit, secondUnit) => {
				const firstUnitDistance = Util.CalculateDistance(startLoc, firstUnit.GetAbsOrigin());
				const secondUnitDistance = Util.CalculateDistance(startLoc, secondUnit.GetAbsOrigin());

				return firstUnitDistance - secondUnitDistance;
			});
		} else if (findOrder === FindOrder.FARTHEST) {
			// Sort from farthest to closest from the start position of the call
			result.sort((firstUnit, secondUnit) => {
				const firstUnitDistance = Util.CalculateDistance(startLoc, firstUnit.GetAbsOrigin());
				const secondUnitDistance = Util.CalculateDistance(startLoc, secondUnit.GetAbsOrigin());

				return secondUnitDistance - firstUnitDistance;
			});
		}

		return result;
	}

	/**
	 * Calculates the width of a cone at any given distance.
	 * @param distance
	 * @param angle
	 * @returns
	 */
	export function GetConeWidth(distance: number, angle: number): number {
		let beta = 90 - angle;
		let side = distance / math.sin(DegToRad(beta));
		let width = math.sqrt(sqr(side) - sqr(distance));
		return width;
	}

	/**
	 * Squares distance of two vectors.
	 * @param vectorA
	 * @param vectorB
	 * @returns
	 */
	export function sqrDist(vectorA: Vector, vectorB: Vector): number {
		return sqr(vectorA.x - vectorB.x) + sqr(vectorA.y - vectorB.y);
	}

	/**
	 * Squared number.
	 * @param x
	 * @returns
	 */
	export function sqr(x: number): number {
		return x * x;
	}

	/**
	 * Checks if this vector is (0,0,z).
	 * @param vec
	 * @returns
	 */
	export function IsZeroVector(vec: Vector): boolean {
		return vec.x === 0 && vec.y === 0;
	}

	/**
	 * checks wether a number is positive, 0 or negative.
	 * @param x
	 * @returns
	 */
	export function Sign(x: number): 1 | 0 | -1 {
		return x > 0 ? 1 : x < 0 ? -1 : 0;
	}

	/**
	 * Converts degree to radians.
	 * @param deg
	 * @returns
	 */
	export function DegToRad(deg: number): number {
		return deg * (Math.PI / 180);
	}

	/**
	 * Converts radians to degrees.
	 * @param rad
	 * @returns
	 */
	export function RadToDeg(rad: number): number {
		return (360 * rad) / (Math.PI * 2);
	}

	export function FindClosestPlayer(position: Vector): CDOTA_BaseNPC_Hero | undefined {
		let results = FindUnitsInRadius(
			DotaTeam.GOODGUYS,
			position,
			undefined,
			FIND_UNITS_EVERYWHERE,
			UnitTargetTeam.BOTH,
			UnitTargetType.HERO,
			UnitTargetFlags.NONE,
			FindOrder.CLOSEST,
			false
		);
		return results.length > 0 ? (results[0] as CDOTA_BaseNPC_Hero) : undefined;
	}

	/**
	 * Calculates the distance between two vectors.
	 * @param point1 the first vector
	 * @param point2 the second vector
	 * @returns A number representing the distance between the vectors.
	 */
	export function CalculateDistance(point1: Vector, point2: Vector): number {
		return point1.__sub(point2).Length2D();
	}

	/**
	 * Calculates the distance between the AbsOrigins of two entities.
	 * @param entity1 the first entity
	 * @param entity2 the second entity
	 * @returns A number representing the distance between the two entities.
	 */
	export function CalculateDistanceBetweenEntities(entity1: CBaseEntity, entity2: CBaseEntity) {
		return CalculateDistance(entity1.GetAbsOrigin(), entity2.GetAbsOrigin());
	}

	/**
	 * Calculates the direction from a point towards another point.
	 * @param fromPoint the vector to point from
	 * @param toPoint the vector to point towards
	 * @returns normalized vector pointing towards toPoint.
	 */
	export function CalculateDirection(fromPoint: Vector, toPoint: Vector): Vector {
		return toPoint.__sub(fromPoint).Normalized();
	}

	/**
	 * Calculates the direction from the first entity towards the second, using their AbsOrigins.
	 * @param fromEntity the entity to point from
	 * @param towardsEntity the entity to point towards
	 * @returns normalized vector pointing towards the location of the entity provided in towardsEntity.
	 */
	export function CalculateDirectionBetweenEntities(fromEntity: CBaseEntity, towardsEntity: CBaseEntity) {
		return CalculateDirection(fromEntity.GetAbsOrigin(), towardsEntity.GetAbsOrigin());
	}

	/**
	 * Checks whether an array is empty. If it is indeed not an empty array, it is transformed into the NonEmptyArray type.
	 * @param arr The array to check whether it is empty.
	 */
	export function IsNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
		return arr.length > 0;
	}

	/**
	 * Returns whether the passed ability can be cast at the caster towards the target, if any.
	 * @param caster The unit attempting to cast its abilities.
	 * @param ability The ability being attempted to cast.
	 * @param target The target of the ability - can be nil (e.g. for No Target abilities)
	 * @returns true if the ability can be cast by the caster. Otherwise returns false.
	 */
	export function CanAbilityBeCast(
		caster: CDOTA_BaseNPC,
		ability: CDOTABaseAbility,
		target?: CDOTA_BaseNPC
	): boolean {
		if (!CanUnitCastAbilities(caster) || !CanUnitCastAbility(caster, ability, target)) {
			return false;
		}

		return true;
	}

	/**
	 * Returns whether the unit is currently able to cast abilities.
	 * @param caster the unit attempting to cast.
	 * @returns true if the user can cast abilities.
	 */
	export function CanUnitCastAbilities(caster: CDOTA_BaseNPC): boolean {
		if (
			caster.IsStunned() ||
			caster.IsCommandRestricted() ||
			caster.IsCurrentlyHorizontalMotionControlled() ||
			caster.IsCurrentlyVerticalMotionControlled() ||
			caster.IsFrozen() ||
			caster.IsHexed() ||
			caster.IsIllusion() ||
			caster.IsSilenced()
		) {
			return false;
		}
		return true;
	}

	/**
	 * Returns whether the ability has sufficient values to allow casting it.
	 * @param caster the unit attempting to cast the ability.
	 * @param ability the ability being evaluated.
	 * @param target optional - the target of the ability, if any.
	 * @returns true if the ability can be cast, otherwise false.
	 */
	function CanUnitCastAbility(caster: CDOTA_BaseNPC, ability: CDOTABaseAbility, target?: CDOTA_BaseNPC): boolean {
		if (caster.GetMana() < ability.GetManaCost(ability.GetLevel())) return false;
		if (!ability.IsCooldownReady()) return false;

		// If there is no target, then no further checks needed; ability can be cast
		if (!target) return true;

		// Otherwise, verify with unit filter
		return (
			UnitFilter(
				target,
				ability.GetAbilityTargetTeam(),
				ability.GetAbilityTargetType(),
				ability.GetAbilityTargetFlags(),
				caster.GetTeamNumber()
			) === UnitFilterResult.SUCCESS
		);
	}

	/**
	 * Calculate a estimated position of a moving target after a delay.
	 * @param target moving target
	 * @param delay when the ability starts after aiming
	 * @returns estimated position
	 */
	export function GetEstimatedPositionAfterDelay(target: CDOTA_BaseNPC, delay: number): Vector {
		const targetPosition = target.GetAbsOrigin();
		const targetDirection = target.GetForwardVector();
		const speed = target.GetBaseMoveSpeed();
		const totalSpeed = target.GetMoveSpeedModifier(speed, false);
		const distance = totalSpeed * delay + RandomInt(0, 200);

		return (targetPosition + targetDirection * distance) as Vector;
	}

	/**
	 * Checks if the number provided has the value as the bit.
	 * @param checker The number where the bit can be included in.
	 * @param value The value to check as the bit
	 * @returns Whether the bit is located in the number
	 */
	export function HasBit(checker: number, value: number) {
		return (checker & value) === value;
	}

	/**
	 * Get a random position around a specific position. Takes a minimum and maximum as values to contain the positions around those values.
	 * @param position The center position to get a random position around.
	 * @param minDistance The minimum distance from the center to find a value a position in.
	 * @param maxDistance The maximum distance from the center to find a value a position in.
	 * @returns A random Vector around the center.
	 */
	export function GenerateRandomPositionAroundPosition(
		position: Vector,
		minDistance: number,
		maxDistance: number
	): Vector {
		return (position +
			RandomVector(minDistance + Math.sqrt(RandomFloat(0, 1)) * (maxDistance! - minDistance!))) as Vector;
	}

	/**
	 * Checks for nearby phantom thinkers around the provided location.
	 * @param location The location to look around.
	 * @param radius The radius to search in from the location as the center.
	 * @returns Whether at least one phantom blocker int he around was found and is confirmed to be a phantom blocker.
	 */
	export function CheckForNearbyBlockingThinkers(unit: CDOTA_BaseNPC, location: Vector, radius: number): boolean {
		const entities = Entities.FindAllByClassnameWithin("npc_dota_thinker", location, radius) as CDOTA_BaseNPC[];
		return entities.some((entity) => entity.IsPhantomBlocker() && entity.GetTeam() !== unit.GetTeam());
	}

	/**
	 * Set the current time for all participating players.
	 * @param time time to set
	 */
	export function SetClientTimersForAllPlayers(time: number) {
		CustomNetTables.SetTableValue("game_status", "time", {
			time: time,
		});
	}

	/**
	 * Find and return all abilties a unit has.
	 * @param unit unit to check
	 * @returns list of abilities
	 */
	export function GetAllUnitAbilities(unit: CDOTA_BaseNPC): CDOTABaseAbility[] {
		let abilities: CDOTABaseAbility[] = [];
		for (let index = 0; index < unit.GetAbilityCount(); index++) {
			let ability = unit.GetAbilityByIndex(index);
			if (!ability) break;
			abilities.push(ability);
		}

		return abilities;
	}

	/**
	 * Use this function when expecting event calls from panorama side.
	 * Handles custom connection delay, if enabled.
	 * @param eventName name of the event
	 * @param listener listener callback
	 * @param applyDelay
	 * @returns listener id
	 */
	export function RegisterClientEventListener<T extends string | object>(
		eventName: (T extends string ? T : string) | keyof CustomGameEventDeclarations,
		listener: (event: NetworkedData<CCustomGameEventManager.InferEventType<T, object>>, playerId: PlayerID) => void,
		applyDelay: boolean = true
	): CustomGameEventListenerID {
		return CustomGameEventManager.RegisterListener(eventName, (_, event) => {
			if (Managers && Constants.ENABLE_ARTIFICIAL_DELAY && applyDelay) {
				let lag = Managers.DevCommands.GetConnectionDelay();
				Timers.CreateTimer({
					endTime: lag,
					useGameTime: false,
					callback: () => {
						listener(event, event.PlayerID);
					},
				});
			} else {
				listener(event, event.PlayerID);
			}
		});
	}

	/**
	 * Use this function to send a client event to single player.
	 * Handles custom connection delay, if enabled.
	 * @param player player to send the event to
	 * @param eventName name of the event
	 * @param eventData according event data
	 */
	export function SendClientEventToPlayer<T extends string | object>(
		playerId: PlayerID,
		eventName: (T extends string ? T : string) | keyof CustomGameEventDeclarations,
		eventData: CCustomGameEventManager.InferEventType<T, never>,
		applyDelay: boolean = true
	) {
		if (Constants.ENABLE_ARTIFICIAL_DELAY && applyDelay) {
			let lag = Constants.ARTIFICIAL_DELAY_VALUE;
			Timers.CreateTimer({
				endTime: lag,
				useGameTime: false,
				callback: () => {
					const player = PlayerResource.GetPlayer(playerId);
					if (player) {
						CustomGameEventManager.Send_ServerToPlayer(player, eventName, eventData);
					}
				},
			});
		} else {
			const player = PlayerResource.GetPlayer(playerId);
			if (player) {
				CustomGameEventManager.Send_ServerToPlayer(player, eventName, eventData);
			}
		}
	}

	/**
	 * Use this function to send a client event to all players.
	 * Handles custom connection delay, if enabled.
	 * @param eventName name of the event
	 * @param eventData according event data
	 */
	export function SendClientEventToAllPlayers<T extends string | object>(
		eventName: (T extends string ? T : string) | keyof CustomGameEventDeclarations,
		eventData: CCustomGameEventManager.InferEventType<T, never>,
		applyDelay: boolean = true
	): void {
		if (Constants.ENABLE_ARTIFICIAL_DELAY && applyDelay) {
			let lag = Constants.ARTIFICIAL_DELAY_VALUE;
			Timers.CreateTimer({
				endTime: lag,
				useGameTime: false,
				callback: () => {
					CustomGameEventManager.Send_ServerToAllClients(eventName, eventData);
				},
			});
		} else {
			CustomGameEventManager.Send_ServerToAllClients(eventName, eventData);
		}
	}

	/**
	 * Use this function to set player specific values inside a nettable
	 * @param tableName name of the nettable
	 * @param keyName high level key (playerId most of the time)
	 * @param subKeyName sub key
	 * @param subValue value
	 */
	export function SetSubNetTableValue<
		TName extends keyof CustomNetTableDeclarations,
		K extends keyof CustomNetTableDeclarations[TName],
		S extends keyof NetworkedData<CustomNetTableDeclarations[TName][K]>
	>(tableName: TName, keyName: K, subKeyName: S, subValue: NetworkedData<CustomNetTableDeclarations[TName][K]>[S]) {
		let table = CustomNetTables.GetTableValue(tableName, keyName);
		if (!table) {
			table = {} as NetworkedData<CustomNetTableDeclarations[TName][K]>;
		}
		table![subKeyName] = subValue!;
		CustomNetTables.SetTableValue(tableName, keyName, table as CustomNetTableDeclarations[TName][K]);
	}

	/**
	 * Use this function to get player specific values from a nettable
	 * @param tableName name of the nettable
	 * @param keyName high level key (playerId most of the time)
	 * @param subKeyName sub key
	 */
	export function GetSubNetTableValue<
		TName extends keyof CustomNetTableDeclarations,
		K extends keyof CustomNetTableDeclarations[TName],
		S extends keyof NetworkedData<CustomNetTableDeclarations[TName][K]>
	>(tableName: TName, keyName: K, subKeyName: S) {
		const table = CustomNetTables.GetTableValue(tableName, keyName);
		return table![subKeyName];
	}

	/**
	 * Fetch the player's ID based on its steam ID by iterating over all players and checking their SteamID.
	 * @param steamId Steam ID to compare IDs with.
	 * @returns either the player's ID, or -1 if there is no match.
	 */
	export function GetPlayerIdBySteamId(steamId: string) {
		return GetAllPlayerIDs().find((playerId) => steamId === tostring(PlayerResource.GetSteamID(playerId))) ?? -1;
	}

	/**
	 * Gets all valid players in the game, including players that were eliminated, but not those currently disconnected.
	 * @returns an array representing all valid player entities in the game.
	 */
	export function GetAllPlayers(): CDOTAPlayer[] {
		const players: CDOTAPlayer[] = [];

		for (let playerId = 0; playerId < DOTA_MAX_TEAM_PLAYERS; playerId++) {
			if (PlayerResource.IsValidPlayer(playerId)) {
				const player = PlayerResource.GetPlayer(playerId);
				if (player) {
					players.push(player);
				}
			}
		}

		return players;
	}

	/**
	 * Gets the player id of all valid players in the game, including players that were eliminated or are disconnected.
	 * @returns an array representing all valid player entities in the game.
	 */
	export function GetAllPlayerIDs(): PlayerID[] {
		const playerIds: PlayerID[] = [];

		for (let playerId = 0; playerId < DOTA_MAX_TEAM_PLAYERS; playerId++) {
			if (PlayerResource.IsValidPlayer(playerId)) {
				playerIds.push(playerId);
			}
		}

		return playerIds;
	}

	/**
	 * Returns whether a debug message should be printed, based on WebAPI print debugging constants.
	 */
	export function WebAPIDebug() {
		return Constants.WEBAPI_DEBUG_TOOLS_ONLY
			? IsInToolsMode() && Constants.WEBAPI_PRINT_DEBUGS
			: Constants.WEBAPI_PRINT_DEBUGS;
	}

	/**
	 * Draw debug overlay lines to preview FindUnitsInLine area.
	 * @param start
	 * @param end
	 * @param direction
	 * @param width
	 * @param color
	 * @param zTest
	 * @param duration
	 */
	export function DebugDrawLineWidth(
		start: Vector,
		end: Vector,
		direction: Vector,
		width: number,
		color: Vector,
		zTest: boolean,
		duration: number
	) {
		const ortho = Util.RotateVector2D(direction, 90);
		const halfWidth = width / 2;
		DebugDrawLine(
			(start + Vector(halfWidth, halfWidth, 0) * ortho) as Vector,
			(end + Vector(halfWidth, halfWidth, 0) * ortho) as Vector,
			color.x,
			color.y,
			color.z,
			zTest,
			duration
		);
		DebugDrawLine(
			(start + Vector(halfWidth, halfWidth, 0) * -ortho) as Vector,
			(end + Vector(halfWidth, halfWidth, 0) * -ortho) as Vector,
			color.x,
			color.y,
			color.z,
			zTest,
			duration
		);
		DebugDrawLine(start, end, color.x, color.y, color.z, zTest, duration);
	}

	/**
	 * Shuffles an array and returns it.
	 * @param array
	 * @returns
	 */
	export function ShuffleArray<T>(array: Array<T>): Array<T> {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	/**
	 * Returns random position in cone.
	 * @param pos
	 * @param direction
	 * @param maxAngle
	 * @param maxDistance
	 * @returns
	 */
	export function GetRandomPositionInCone(pos: Vector, direction: Vector, maxAngle: number, maxDistance: number) {
		const newDirection = Util.RotateVector2D(direction, RandomFloat(-maxAngle / 2, maxAngle));
		const randomPosition = (pos + newDirection * RandomFloat(0, maxDistance)) as Vector;
		return randomPosition;
	}

	/**
	 * Converts world position to offset grid coords.
	 * @param position
	 * @param offset
	 * @returns coords object
	 */
	export function PositionToOffsetGridCoords(position: Vector, offset: number) {
		const yCoord = Math.round(position.y / offset);
		let xCoord;
		if (yCoord % 2 === 0) {
			xCoord = Math.round((position.x + offset / 2) / offset);
		} else {
			xCoord = Math.round(position.x / offset);
		}
		return { xCoord: xCoord, yCoord: yCoord };
	}

	/**
	 * Converts offset grid coords to world position.
	 * @param x
	 * @param y
	 * @param offset
	 * @returns
	 */
	export function OffsetGridCoordsToPosition(x: number, y: number, offset: number) {
		x *= offset;
		if (y % 2 === 0) {
			x += offset / 2;
		}
		return Vector(x, y * offset, 0);
	}

	/**
	 * Recursively checks adjacent cells to find free cell.
	 * @param grid
	 * @param x initial X coord
	 * @param y initial Y coord
	 * @returns
	 */
	export function FindFreeCell<T>(grid: T[][], x: number, y: number): FindFreeCellResult {
		const checks = Util.ShuffleArray([
			[1, 0],
			[-1, 0],
			[-1, 1],
			[-1, -1],
			[0, 1],
			[0, -1],
		]);
		for (let index = 0; index < checks.length; index++) {
			const [checkX, checkY] = checks[index];
			if (!grid[x + checkX] || !grid[x + checkX][y + checkY]) {
				return { success: true, xCoord: x + checkX, yCoord: y + checkY };
			}
		}
		for (let index = 0; index < checks.length; index++) {
			const [checkX, checkY] = checks[index];
			const findFreeCellResult = FindFreeCell(grid, x + checkX, y + checkY);
			if (findFreeCellResult.success) {
				return findFreeCellResult;
			}
		}
		return { success: false, xCoord: x, yCoord: y };
	}
}
