const roleTruck = {
	run: run
};

const STANDARD_CONTAINERS = [
	STRUCTURE_CONTAINER,
	STRUCTURE_STORAGE
];

const SEMI_CONTAINERS = [
	STRUCTURE_EXTENSION,
	STRUCTURE_SPAWN,
	STRUCTURE_TOWER
];

function run(creep) {

	if (creep.memory.loading) {
		if (!creep.memory.target) {
			creep.memory.target = findLoadingTarget(creep);
			return;
		}
		const result = creep.pickup(Game.getObjectById(creep.memory.target));
		switch (result) {
			case OK:
				if (creep.carry.energy == creep.carryCapacity) {
					startShipping(creep);
					return;
				}
				creep.memory.target = findLoadingTarget(creep);
				return;
			case ERR_NOT_IN_RANGE:
				creep.moveTo(Game.getObjectById(creep.memory.target));
				return;
			case ERR_INVALID_TARGET:
				creep.memory.target = findLoadingTarget(creep);
				return;
			case ERR_FULL:
				startShipping(creep);
				return;
			default:
				return;
		}
	}
	
	if (creep.memory.shipping) {
		if (!creep.memory.target) {
			creep.memory.target = findShippingTarget(creep);
			return;
		}
		const result = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
		switch (result) {
			case OK:
				if (creep.carry.energy == 0) {
					startLoading(creep);
					return;
				}
				creep.memory.target = findShippingTarget(creep);
				return;
			case ERR_NOT_IN_RANGE:
				creep.moveTo(Game.getObjectById(creep.memory.target));
				return;
			case ERR_INVALID_TARGET:
			case ERR_FULL:
				creep.memory.target = findShippingTarget(creep);
				return;
			case ERR_NOT_ENOUGH_RESOURCES:
				startLoading(creep);
				return;
			default:
				return;
		}
	}

	startLoading(creep);
}

function startLoading(creep) {
	creep.memory.loading = true;
	creep.memory.target = findLoadingTarget(creep);
	creep.say("load");
}

function startShipping(creep) {
	creep.memory.loading = false;
	creep.memory.shipping = true;
	creep.memory.target = findShippingTarget(creep);
	creep.say("ship");
}

// should be based on how much resource is at the location, the area around it, and how far away it is.
function findLoadingTarget(creep) {
	const result = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, (resource) => !Memory.loadingPositions.includes(resource.id));
	if (!result) {
		return null
	}
	Memory.loadingPositions.push(result.id);
	return result.id;
}

// should be filling containers over semiContainers a little, but currently isn't doing that...
function findShippingTarget(creep) {
	const semiContainers =  _.filter(Game.structures, (struct) => SEMI_CONTAINERS.includes(struct.structureType) && struct.energy < struct.energyCapacity);
	let result = creep.pos.findClosestByRange(semiContainers);
	if (!result) {
		const containers = _.filter(Game.structures, (struct) => STANDARD_CONTAINERS.includes(struct.structureType) && struct.energy < struct.energyCapacity);
		result = creep.pos.findClosestByRange(containers);
	}
	if (!result) {
		return null
	}
	return result.id;
}

module.exports = roleTruck;