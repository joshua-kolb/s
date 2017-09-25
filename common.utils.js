const Utils = {
	findClosestTarget: findClosestTarget
};

function findClosestTarget(creep, targets) {
	let closestTarget;
	let bestDistance = Number.POSITIVE_INFINITY;
	_.forEach(targets, (target) => {
		const distance =  Math.max((target.pos.x - creep.pos.x),(target.pos.y - creep.pos.y))
		if (cistance < bestDistance) {
			bestDistance = distance;
			closestTarget = target;
		}
	});
	return closestTarget;
}

module.exports = Utils;