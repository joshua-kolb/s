var designCreep = require("creepDesigner");

var structSpawn = {
    run: run
};

function run(spawn) {

	if (spawn.spawning) { 
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            "🛠️" + spawningCreep.memory.role,
            spawn.pos.x + 1, 
            spawn.pos.y, 
			{align: "left", opacity: 0.8});
		return;
	}
	
	if (spawn.energy < (5/6)*spawn.energyCapacity) {
		return;
	}

    const miners = _.filter(Game.creeps, (creep) => creep.memory.role == "miner");
	const engineers = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer");
	const trucks = _.filter(Game.creeps, (creep) => creep.memory.role == "truck");

	const availableMiningSpots = _.reduce(Memory["miningPositions"][spawn.room.name], (sum, source) => source.hostile ? sum : sum + source.positions.length, 0);

	if (trucks.length < miners.length) {
		spawnCreep(spawn, "truck");
	}
	else if (engineers.length < trucks.length) {
		spawnCreep(spawn, "engineer");
    }
    else if (availableMiningSpots != 0) {
		spawnCreep(spawn, "miner");
	}
    
}

function spawnCreep(spawn, creepType) {
	const newName = spawn.createCreep(designCreep(creepType, spawn.energy), null, {role: creepType});
	console.log("Spawning new " + creepType + ": " + newName);
}

module.exports = structSpawn;