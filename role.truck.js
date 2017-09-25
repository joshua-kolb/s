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
			creep.memory.target = findShippingTarget();
		}
		const result = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
		switch (result) {
			case OK:
				if (creep.carry.energy == 0) {
					startLoading(creep);
					return;
				}
				creep.memory.target = findShippingTarget();
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

function findLoadingTarget(creep) {
	return creep.pos.findClosestByRange(FIND_DROPPED_ENERGY).id;
}

function findShippingTarget(creep) {
	const semiContainers =  _.filter(Game.structures, (struct) => SEMI_CONTAINERS.includes(struct.structureType));
	let result = creep.pos.findClosestByRange(semiContainers).id;
	if (!result) {
		const containers = _.filter(Game.structures, (struct) => STANDARD_CONTAINERS.includes(struct.structureType));
		result = creep.pos.findClosestByRange(containers).id;
	}
	return result;
}

module.exports = roleTruck;