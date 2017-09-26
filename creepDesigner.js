const PART_MAP = {
    "work": WORK,
    "move": MOVE,
    "carry": CARRY,
    "attack": ATTACK,
    "ranged_attack": RANGED_ATTACK,
    "heal": HEAL,
    "claim": CLAIM,
    "tough": TOUGH
};

function designCreep(role, energy) {
    let parts = {
        tough: 0,
        work: 0,
        claim: 0,
        carry: 0,
        ranged_attack: 0,
        attack: 0,
        heal: 0,
        move: 0
    };
    let result = [];
    switch (role) {
        case "miner":
            parts.work = Math.min(Math.floor((energy - 50) / 100), Math.floor((energy * 4 / 5) / 100));
            parts.move = Math.floor((energy - (parts.work * 100)) / 50);
            break;
        case "truck":
            parts.carry = Math.min(Math.floor((energy - 50) / 50), Math.floor((energy * 4 / 5) / 50));
            parts.move = Math.floor((energy - (parts.carry * 50)) / 50);
            break;
        case "engineer":
			parts.work = Math.min(Math.floor((energy - 100) / 100), Math.floor((energy * 4 / 5) / 100));
            parts.move = Math.min(Math.floor((energy - (parts.work * 100) - 50) / 50), Math.max(Math.floor((energy * 1 / 10) / 50), 1));
            parts.carry = Math.floor((energy - (parts.work * 100) - (parts.move * 50)) / 50);
            break;
        default:
            console.error("CreepDesigner error: role '" + role + "' not recognized");
    }
    for(let key in parts) {
        result = addNCopies(result, PART_MAP[key], parts[key]);
    }
    return result;
}

function addNCopies(A, item, n) {
    for (let i = 0; i < n; ++i) {
        A.push(item);
    }
    return A;
}

module.exports = designCreep;


