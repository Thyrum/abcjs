const printSymbol = require('./print-symbol');

function drawDynamics(renderer, params, selectables) {
	if (params.pitch === undefined)
		window.console.error("Dynamic Element y-coordinate not set.");
	const scalex = 1;
	const scaley = 1;
	const el = printSymbol(renderer, params.anchor.x, params.pitch, params.dec, {
		scalex: scalex,
		scaley: scaley,
		klass: renderer.controller.classes.generate('decoration dynamics'),
		fill: renderer.foregroundColor,
		stroke: "none",
		name: "dynamics"
	});
	selectables.wrapSvgEl({ el_type: "dynamicDecoration", startChar: -1, endChar: -1, decoration: params.dec }, el);
	return [el];
}

module.exports = drawDynamics;
