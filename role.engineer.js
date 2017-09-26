var roleEngineer = {
		run: run
};

const HEAVY_REPAIR_STRUCTS = [
	STRUCTURE_WALL,
	STRUCTURE_RAMPART
];

const STANDARD_CONTAINERS = [
	STRUCTURE_CONTAINER,
	STRUCTURE_STORAGE
];

const SEMI_CONTAINERS = [
	STRUCTURE_EXTENSION,
	STRUCTURE_SPAWN,
	STRUCTURE_TOWER
];

/** @param {Creep} creep **/
function run(creep) {

	// Game.creeps isn't actually an array, so we have to
	// turn it into a collection to get the length. This
	// is why it's getting mapped to itself.
	if (_.map(Game.creeps, c => c).length < 3) {
		harvest(creep);
		return;
	}

	if (creep.memory.refueling && creep.carry.energy == creep.carryCapacity) {
		creep.memory.refueling = false;
		decideTask(creep);
	} 
	else if (!creep.memory.refueling && creep.carry.energy == 0) {
		creep.memory.refueling = true;
		creep.memory.target = findClosestRefuelingStation(creep);
		creep.say("refuel");
	}

	let result;
	if (creep.memory.refueling) {		
		if (!creep.memory.target) {
			creep.memory.target = findClosestRefuelingStation(creep);
			return;
		}
		switch (creep.memory.refuelMethod) {
			case "pickup":
				result = creep.pickup(Game.getObjectById(creep.memory.target));
				break;
			case "withdraw":
				result = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
				break;
		}
	}
	else if (creep.memory.upgrading) {
		result = creep.upgradeController(Game.getObjectById(creep.memory.target));
	} 
	else if (creep.memory.building) {
		result = creep.build(Game.getObjectById(creep.memory.target));
	}
	else if (creep.memory.repairing) {
		result = creep.repair(Game.getObjectById(creep.memory.target));
	}

	switch(result) {
		case ERR_NOT_IN_RANGE:
			const moveResult = creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: creep.memory.color}});
			if (moveResult == ERR_INVALID_TARGET && creep.memory.refueling) {
				creep.memory.target = findClosestRefuelingStation(creep);
			}
			break;
		case ERR_INVALID_TARGET:
			decideTask(creep);
			break;
		case ERR_NOT_ENOUGH_RESOURCES:
			creep.memory.target = findClosestRefuelingStation(creep);
			break;
		default:
			break;
	}
}

function harvest(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
		const sources = creep.room.find(FIND_SOURCES);
		if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(sources[0]);
		}
		return;
	}

	const spawn = Game.spawns[_.keys(Game.spawns)[0]]
	if(spawn.energy < spawn.energyCapacity) {
		if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(spawn);
		}
	}
}

/** @param {Creep} creep **/
function decideTask(creep) {

	creep.memory.building = false;
	creep.memory.upgrading = false;
	creep.memory.repairing = false;

	const totalUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer" && creep.memory.upgrading).length;
	const totalRepairers = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer" && creep.memory.repairing).length;
	const totalBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer" && creep.memory.building).length;

	const buildingsInNeedOfRepair = _.filter(Game.structures, (struct) => 
		!HEAVY_REPAIR_STRUCTS.includes(struct.structureType) && (2 * struct.hits) < struct.hitsMax && struct.room.name == creep.room.name
	);

	const totalConstructionSites = _.keys(Game.constructionSites).length;
	if (buildingsInNeedOfRepair.length > 2 * totalRepairers) {
		creep.memory.repairing = true;
		const target = creep.pos.findClosestByRange(buildingsInNeedOfRepair)
		creep.memory.target = target ? target.id : null;
		creep.memory.color = "#00ffaa";
		creep.say("repair");
	}
	else if (totalUpgraders >= 1 && totalConstructionSites > 0) {
		creep.memory.building = true;
		creep.memory.target = findBuildTarget(creep);
		creep.memory.color = "#ffaa00";
		creep.say("build");
	}
	else {
		creep.memory.upgrading = true;
		creep.memory.target = creep.room.controller.id;
		creep.memory.color = "#ffffff";
		creep.say("upgrade");
	}
}

function findClosestRefuelingStation(creep) {
	const containers = 
		_.filter(Game.structures, (struct) => STANDARD_CONTAINERS.includes(struct.structureType) && struct.energy > 10).concat(
				 _.filter(Game.structures, (struct) => SEMI_CONTAINERS.includes(struct.structureType) && struct.energy > 10));
	
	let result;
	if (containers.length > 0) {
		result = creep.pos.findClosestByRange(containers);
		creep.memory.refuelMethod = "withdraw";
	} 
	
	if (!result) {
		return null;
	}
	return result.id;
}

function findBuildTarget(creep) {
	const sites = _.filter(Game.constructionSites, (site) => site.room.name == creep.room.name);
	const result = creep.pos.findClosestByRange(sites);
	if (!result) {
		return null
	}
	return result.id;
}
	
module.exports = roleEngineer;