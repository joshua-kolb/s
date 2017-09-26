const structSpawn = require('struct.spawn');
const roleMiner = require('role.miner');
const roleEngineer = require('role.engineer');
const roleTruck = require('role.truck');

module.exports.loop = function () {

    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
		}
	}

    for (let spawnId in Game.spawns) {
		const spawn = Game.spawns[spawnId];
		roleMiner.runMemoryOperations(spawn.room);
		roleTruck.runMemoryOperations(spawn.room);
		structSpawn.run(spawn);
    }

    for (let name in Game.creeps) {
		const creep = Game.creeps[name];
		switch(creep.memory.role) {
			case "miner":
				roleMiner.run(creep);
				break;
			case "engineer":
				roleEngineer.run(creep);
				break;
			case "truck":
				roleTruck.run(creep);
				break;
		}
    }
}