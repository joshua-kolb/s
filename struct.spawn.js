const designCreep = require("creepDesigner");

const structSpawn = {
    run: run
};

function run(spawn) {

	if (spawn.spawning) { 
        const spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            spawningCreep.memory.role,
            spawn.pos.x + 1, 
            spawn.pos.y, 
			{align: "left", opacity: 0.8});
		return;
	}
	
	if (spawn.energy < 150) {
		return;
	}

    const miners = _.filter(Game.creeps, (creep) => creep.memory.role == "miner");
	const engineers = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer");
	const trucks = _.filter(Game.creeps, (creep) => creep.memory.role == "truck");

	const availableMiningSpots = _.reduce(Memory.minerPositions[spawn.room.name], (sum, source) => source.hostile ? sum : sum + source.positions.length, 0);

	if (trucks.length < miners.length) {
		spawnCreep(spawn, "truck");
	}
	
	if (engineers.length < trucks.length) {
		spawnCreep(spawn, "engineer");
    }
	
	if (availableMiningSpots != 0) {
		spawnCreep(spawn, "miner");
	}
    
}

function spawnCreep(spawn, creepType) {
	const newName = spawn.createCreep(designCreep(creepType, spawn.energy/2), null, {role: creepType});
	console.log("Spawning new " + creepType + ": " + newName);
}

module.exports = structSpawn;