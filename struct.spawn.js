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
	
	const newCreepEnergy = spawn.room.energyCapacityAvailable / 2;
	if (spawn.room.energyAvailable < newCreepEnergy) {
		return;
	}

    const miners = _.filter(Game.creeps, (creep) => creep.memory.role == "miner");
	const engineers = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer");
	const trucks = _.filter(Game.creeps, (creep) => creep.memory.role == "truck");

	const availableMiningSpots = _.reduce(Memory.minerPositions[spawn.room.name], (sum, source) => source.hostile ? sum : sum + source.positions.length, 0);

	if (trucks.length < miners.length) {
		spawnCreep(spawn, "truck", newCreepEnergy);
	}
	
	if (engineers.length < trucks.length) {
		spawnCreep(spawn, "engineer", newCreepEnergy);
    }
	
	if (availableMiningSpots != 0) {
		spawnCreep(spawn, "miner", newCreepEnergy);
	}
    
}

function spawnCreep(spawn, creepType, energy) {
	const newName = spawn.createCreep(designCreep(creepType, energy), null, {role: creepType});
	console.log("Spawning new " + creepType + ": " + newName);
}

module.exports = structSpawn;