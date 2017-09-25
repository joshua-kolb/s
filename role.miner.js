const Utils = require("common.utils");

const roleMiner = {
	run: run,
	findMinerPositions: findMinerPositions
};

/** @param {Creep} creep **/
function run(creep) {

	if (creep.ticksToLive == 1) {
		if (creep.memory.target) {
		// Open up the mining spot just before death
		Memory.minerPositions[creep.room.name][creep.memory.target.sourceId].positions[creep.memory.target.posIndex].filled = false;
		}
		return;
	}

	if (!creep.memory.target) {
		creep.memory.target = findMiningTarget(creep);
		if (!creep.memory.target) {
			return;
		}
		Memory.minerPositions[creep.room.name][creep.memory.target.sourceId].positions[creep.memory.target.posIndex].filled = true;
	}

	if (creep.memory.target.pos.x != creep.pos.x || creep.memory.target.pos.y != creep.pos.y) {
		creep.moveTo(creep.memory.target.pos.x, creep.memory.target.pos.y);
	}

	creep.harvest(creep.room.sources[creep.memory.target.sourceId]);
}

function findMiningTarget(creep) {
	let targets = [];
	for (let sourceId in Memory.minerPositions[creep.room.name]) {
		const source = Memory.minerPositions[creep.room.name][sourceId];
		if (!source.hostile) {
			_.forEach(source.positions, (pos, index) => {
				if (!pos.filled) {
					targets.push({
						sourceId: sourceId,
						posIndex: index,
						pos: pos.pos
					});
				}
			});
		}
	}
	return Utils.findClosestTarget(creep, targets);
}

function findMinerPositions(room) {
	const sources = room.find(FIND_SOURCES);

	let result = {};
	for(let sourceId in sources) {
		const source = sources[sourceId];
		result[sourceId] = {
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
	const creepsLocations = source.room.lookForAtArea(
		LOOK_CREEPS, 
		y + HOSTILE_SEARCH_RADIUS, 
		x - HOSTILE_SEARCH_RADIUS, 
		y - HOSTILE_SEARCH_RADIUS, 
		x + HOSTILE_SEARCH_RADIUS);
	return _.some(creepsLocations, (location) => {
		return location.creep.my;
	});
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