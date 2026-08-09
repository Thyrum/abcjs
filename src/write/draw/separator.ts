function drawSeparator(renderer, width) {
	const fill = "rgba(0,0,0,255)";
	const stroke = "rgba(0,0,0,0)";
	const y = Math.round(renderer.y);
	const staffWidth = renderer.controller.width;
	const x1 = (staffWidth - width) / 2;
	const x2 = x1 + width;
	const pathString = 'M ' + x1 + ' ' + y +
		' L ' + x2 + ' ' + y +
		' L ' + x2 + ' ' + (y + 1) +
		' L ' + x1 + ' ' + (y + 1) +
		' L ' + x1 + ' ' + y + ' z';
	renderer.paper.pathToBack({ path: pathString, stroke: stroke, fill: fill, 'class': renderer.controller.classes.generate('defined-text') });
}

module.exports = drawSeparator;
