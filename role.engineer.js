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

	if (creep.memory.refueling && creep.carry.energy == creep.carryCapacity) {
		creep.memory.refueling = false;
		decideTask(creep);
	} 
	else if (creep.carry.energy == 0) {
		creep.memory.refueling = true;
		creep.memory.target = findClosestRefuelingStation(creep);
		creep.say('🔄 refuel');
	}

	let result;
	if (creep.memory.refueling) {		
		if (!creep.memory.target) {
			creep.memory.target = findClosestRefuelingStation(creep);
			return;
		}
		switch (creep.memory.refuelMethod) {
			case 'pickup':
				result = creep.pickup(creep.memory.target);
				break;
			case 'withdraw':
				result = creep.withdraw(creep.memory.target, RESOURCE_ENERGY);
				break;
		}
	}
	else if (creep.memory.upgrading) {
		result = creep.upgradeController(creep.memory.target);
	} 
	else if (creep.memory.building) {
		result = creep.build(creep.memory.target);
	}
	else if (creep.memory.repairing) {
		result = creep.repair(creep.memory.target);
	}

	switch(result) {
		case ERR_NOT_IN_RANGE:
			creep.moveTo(creep.memory.target, {visualizePathStyle: {stroke: creep.memory.color}});
			break;
		case ERR_INVALID_TARGET:
			decideTask(creep);
			break;
		default:
			decideTask(creep);
			break;
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

	if (buildingsInNeedOfRepair.length > 2 * totalRepairers) {
		creep.memory.repairing = true;
		creep.memory.target = creep.pos.findClosestByRange(buildingsInNeedOfRepair);
		creep.memory.color = "#00ffaa";
		creep.say("🏥 repair");
	}
	else if (totalUpgraders > 1 && Game.constructionSites.length > totalBuilders) {
		creep.memory.building = true;
		creep.memory.target = findBuildTarget(creep);
		creep.memory.color = "#ffaa00";
		creep.say("🛠️ build");
	}
	else {
		creep.memory.upgrading = true;
		creep.memory.target = creep.room.controller;
		creep.memory.color = "#ffffff";
		creep.say("⚡ upgrade");
	}
}

function findClosestRefuelingStation(creep) {
	const containers = 
		_.concat(_.filter(Game.structures, (struct) => STANDARD_CONTAINERS.includes(struct.structureType)),
				 _.filter(Game.structures, (struct) => SEMI_CONTAINERS.includes(struct.structureType) && struct.energy >= (3/4) * (struct.energyCapacity)));
	return creep.pos.findClosestByRange(containers);
}

function findBuildTarget(creep) {
	const sites = _.filter(Game.constructionSites, (site) => site.room.name == creep.room.name);
	return creep.pos.findClosestByRange(sites);
}
	
module.exports = roleEngineer;