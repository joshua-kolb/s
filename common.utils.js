const Utils = {
	findClosestTarget: findClosestTarget
};

function findClosestTarget(creep, targets) {
	let closestTarget;
	let bestDistance = Number.POSITIVE_INFINITY;
	_.forEach(targets, (target) => {
		const distance =  Math.max(Math.abs(target.pos.x - creep.pos.x),Math.abs(target.pos.y - creep.pos.y))
		if (distance < bestDistance) {
			bestDistance = distance;
			closestTarget = target;
		}
	});
	return closestTarget;
}

module.exports = Utils;