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

	let newCreepEnergy = Math.floor(spawn.room.energyCapacityAvailable * (7/8) / 50) * 50;
	if (spawn.room.energyAvailable < newCreepEnergy) {
		return;
	}

	// Game.creeps isn't actually an array, so we have to
	// turn it into a collection to get the length. This
	// is why it's getting mapped to itself.
	if (_.map(Game.creeps, c => c).length == 0) {
		spawnCreep(spawn, "engineer", newCreepEnergy);
		return;
	}

    const miners = _.filter(Game.creeps, (creep) => creep.memory.role == "miner");
	const engineers = _.filter(Game.creeps, (creep) => creep.memory.role == "engineer");
	const trucks = _.filter(Game.creeps, (creep) => creep.memory.role == "truck");

	const availableMiningSpots = _.reduce(Memory.minerPositions[spawn.room.name], (sum, source) => source.hostile || !source.positions ? sum : sum + source.positions.length, 0);

	if (trucks.length < miners.length * (2/3)) {
		spawnCreep(spawn, "truck", newCreepEnergy);
	}
	else if (engineers.length < miners.length) {
		spawnCreep(spawn, "engineer", newCreepEnergy);
    }
	else if (availableMiningSpots != 0) {
		spawnCreep(spawn, "miner", newCreepEnergy);
	}
    
}

function spawnCreep(spawn, creepType, energy) {
	const newName = spawn.createCreep(designCreep(creepType, energy), null, {role: creepType});
	console.log("Spawning new " + creepType + ": " + newName);
}

module.exports = structSpawn;