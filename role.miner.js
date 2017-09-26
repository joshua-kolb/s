const Utils = require("common.utils");

const roleMiner = {
	run: run,
	runMemoryOperations: runMemoryOperations
};

/** @param {Creep} creep **/
function run(creep) {

	if (creep.ticksToLive == 1) {
		if (creep.memory.target) {
		// Open up the mining spot just before death
		Memory.minerPositions[creep.room.name][creep.memory.target.sourceIndex].positions[creep.memory.target.posIndex].filled = false;
		}
		return;
	}

	if (!creep.memory.target) {
		creep.memory.target = findMiningTarget(creep);
		if (!creep.memory.target) {
			return;
		}
		Memory.minerPositions[creep.room.name][creep.memory.target.sourceIndex].positions[creep.memory.target.posIndex].filled = true;
	}

	if (creep.memory.target.pos.x != creep.pos.x || creep.memory.target.pos.y != creep.pos.y) {
		creep.moveTo(creep.memory.target.pos.x, creep.memory.target.pos.y);
	}

	creep.harvest(Game.getObjectById(creep.memory.target.sourceId));
}

function findMiningTarget(creep) {
	let targets = [];
	for (let sourceIndex in Memory.minerPositions[creep.room.name]) {
		const source = Memory.minerPositions[creep.room.name][sourceIndex];
		if (!source.hostile) {
			_.forEach(source.positions, (pos, index) => {
				if (!pos.filled) {
					targets.push({
						sourceIndex: sourceIndex,
						sourceId: source.id,
						posIndex: index,
						pos: pos.pos
					});
				}
			});
		}
	}
	return Utils.findClosestTarget(creep, targets);
}

const MINER_POSITION_CHECK_TIME = 300;
function runMemoryOperations(room) {
	if (!Memory.minerPositions) {
		Memory.minerPositions = {};
	}

	if (!Memory.minerPositions[room.name] || Memory.minerPositions[room.name].lastCheckTime - Game.time > MINER_POSITION_CHECK_TIME) {
		Memory.minerPositions[room.name] = roleMiner.findMinerPositions(spawn.room);
		Memory.minerPositions[room.name].lastCheckTime = Game.time;
	}
}

function findMinerPositions(room) {
	const sources = room.find(FIND_SOURCES);

	let result = {};
	for(let sourceId in sources) {
		const source = sources[sourceId];
		result[sourceId] = {
			id: source.id,
			hostile: findIfSourceIsHostile(source),
			positions: findPositionsAroundSource(source)
		};
	}
	return result;
}

const HOSTILE_SEARCH_RADIUS = 5;
function findIfSourceIsHostile(source) {
	const x = source.pos.x;
	const y = source.pos.y;
	const creepsLocations = source.pos.findInRange(FIND_HOSTILE_CREEPS, HOSTILE_SEARCH_RADIUS);
	return creepsLocations.length != 0;
}

function findPositionsAroundSource(source) {
	let result = [];
	for (let x = source.pos.x - 1; x <= source.pos.x + 1; x++) {
		for (let y = source.pos.y - 1; y <= source.pos.y + 1; y++) {
			if ((x != source.pos.x || y != source.pos.y) && Game.map.getTerrainAt(x,y,source.room.name) == "plain") {
				result.push({
					pos: new RoomPosition(x, y, source.pos.roomName),
					filled: false
				});
			}
		}
	}
	return result;
}
	
module.exports = roleMiner;
/*

example 

"minerPositions": {
	"room1": {
		"source1": {
			"hostile": true,
			"positions": [
				{
					"pos": RoomPositionObject
					"filled": false
				}
			]
		}
	}
}

*/