const printPath = require('./print-path');
const roundNumber = require("./round-number");

function drawBeam(renderer, params) {
	if (params.beams.length === 0) return;

	let pathString = "";
	for (let i = 0; i < params.beams.length; i++) {
		const beam = params.beams[i];
		if (beam.split) {
			const slope = getSlope(renderer, beam.startX, beam.startY, beam.endX, beam.endY);
			const xes = [];
			for (var j = 0; j < beam.split.length; j += 2) {
				xes.push([beam.split[j], beam.split[j + 1]]);
			}
			for (j = 0; j < xes.length; j++) {
				const y1 = getY(beam.startX, beam.startY, slope, xes[j][0]);
				const y2 = getY(beam.startX, beam.startY, slope, xes[j][1]);
				pathString += draw(renderer, xes[j][0], y1, xes[j][1], y2, beam.dy);
			}
		} else
			pathString += draw(renderer, beam.startX, beam.startY, beam.endX, beam.endY, beam.dy);
	}
	const durationClass = ("abcjs-d" + params.duration).replace(/\./g, "-");
	const klasses = renderer.controller.classes.generate('beam-elem ' + durationClass);
	const el = printPath(renderer, {
		path: pathString,
		stroke: "none",
		fill: renderer.foregroundColor,
		'class': klasses
	});
	return [el];
}

function draw(renderer, startX, startY, endX, endY, dy) {
	// the X coordinates are actual coordinates, but the Y coordinates are in pitches.
	startY = roundNumber(renderer.calcY(startY));
	endY = roundNumber(renderer.calcY(endY));
	startX = roundNumber(startX);
	endX = roundNumber(endX);
	const startY2 = roundNumber(startY + dy);
	const endY2 = roundNumber(endY + dy);
	return "M" + startX + " " + startY + " L" + endX + " " + endY +
		"L" + endX + " " + endY2 + " L" + startX + " " + startY2 + "z";
}

function getSlope(renderer, startX, startY, endX, endY) {
	return (endY - startY) / (endX - startX);
}

function getY(startX, startY, slope, currentX) {
	const x = currentX - startX;
	return startY + x * slope;
}

module.exports = drawBeam;
