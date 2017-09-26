const roleTruck = {
	run: run,
	runMemoryOperations: runMemoryOperations
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
		if (creep.ticksToLive == 1) {
			stopLoading();
		}
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
	stopShipping(creep);
	creep.memory.loading = true;
	creep.memory.target = findLoadingTarget(creep);
	creep.say("load");
}

function startShipping(creep) {
	stopLoading(creep);
	creep.memory.shipping = true;
	creep.memory.target = findShippingTarget(creep);
	creep.say("ship");
}

function stopLoading(creep) {
	creep.memory.loading = false;
	_.find(Memory.loadingAreas[creep.room.name].areas, area => {
		if (area.centerPos == creep.memory.loadingArea.centerPos) {
			area.totalPickupPower -= _.where(creep.body, part => part.type == CARRY).length * 50;
		}
	});
	delete creep.memory.loadingArea;
}

function stopShipping(creep) {
	creep.memory.shipping = false;
}

// should be based on how much resource is at the location, the area around it, and how far away it is.


function findLoadingTarget(creep) {
	
	if (!creep.memory.loadingArea || 
		!creep.memory.loadingArea.targets ||
		creep.memory.loadingArea.targets.length == 0) {

		creep.memory.loadingArea = _.find(Memory.loadingAreas[creep.room.name].areas, (area) => {
			if (area.totalPickupPower < area.totalResource) {
				area.totalPickupPower += _.where(creep.body, part => part.type == CARRY).length * 50;
				return true;
			}
			return false;
		});

		if (creep.memory.loadingArea.targets.length == 0) {
			return null;
		}	
	}

	return creep.memory.loadingArea.targets.pop().id;
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

/*

loadingAreas: {
	"room1": {
		lastCheckTime: *time_ticks*,
		areas: [
			{
				centerPos: *RoomPosition*,
				totalResource: 200,
				totalPickupPower: 100,
				targets: [
					{
						id: *id*,
						amount: 50
						assignedPickupPower: 0
					}
				]
			}
		]
	}
} 

*/

const LOADING_AREA_CHECK_TIME = 5;
function runMemoryOperations(room) {
	if (!Memory.loadingAreas) {
		Memory.loadingAreas = {};
	}

	if (!Memory.loadingAreas[room.name] || Memory.loadingAreas[room.name].lastCheckTime - Game.time > LOADING_AREA_CHECK_TIME) {
		Memory.loadingAreas[room.name] = roleTruck.findLoadingAreas(room);
	}
}

const LOADING_AREA_RANGE = 2;
function findLoadingAreas(room) {
	const oldAreas = Memory.loadingAreas && Memory.loadingAreas[room.name] && Memory.loadingAreas[room.name].areas ? Memory.loadingAreas[room.name].areas : [];
	const sources = room.find(FIND_SOURCES);
	return {
		lastCheckTime: Game.time,
		areas: _.map(sources, (source) => {
			const drops = source.pos.findInRange(FIND_DROPPED_RESOURCES, LOADING_AREA_RANGE);
			const oldArea = _.find(oldArea, (area) => area.centerPos == source.pos);
			return {
				centerPos: source.pos,
				totalResource: _.reduce(drops, (sum, drop) => sum + drop.amount, 0),
				totalPickupPower: oldArea ? oldArea.totalPickupPower : 0,
				targets: _.map(drops, drop => { 
					const oldTarget = oldArea ? _.find(oldArea.targets, (target) => target.id == drop.id) : undefined;
					return {
						id: drop.id,
						amount: drop.amount,
						assignedPickupPower:  oldTarget || 0
					};
				 })
			};
		})
	};
}

module.exports = roleTruck;