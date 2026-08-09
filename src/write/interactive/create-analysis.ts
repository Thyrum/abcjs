function findNumber(klass, match, target, name) {
	if (klass.indexOf(match) === 0) {
		const value = klass.replace(match, '');
		const num = parseInt(value, 10);
		if ('' + num === value)
			target[name] = num;
	}
}

function createAnalysis(target, ev) {
	const classes = [];
	if (target.absEl.elemset) {
		const classObj = {};
		for (let j = 0; j < target.absEl.elemset.length; j++) {
			const es = target.absEl.elemset[j];
			if (es) {
				const klass = es.getAttribute("class").split(' ');
				for (let k = 0; k < klass.length; k++)
					classObj[klass[k]] = true;
			}
		}
		for (let kk = 0; kk < Object.keys(classObj).length; kk++)
			classes.push(Object.keys(classObj)[kk]);
	}
	const analysis = {};
	for (let ii = 0; ii < classes.length; ii++) {
		findNumber(classes[ii], "abcjs-v", analysis, "voice");
		findNumber(classes[ii], "abcjs-l", analysis, "line");
		findNumber(classes[ii], "abcjs-m", analysis, "measure");
	}
	if (target.staffPos)
		analysis.staffPos = target.staffPos;
	let closest = ev.target;
	while (closest && closest.dataset && !closest.dataset.name && closest.tagName.toLowerCase() !== 'svg')
		closest = closest.parentNode;
	let parent = ev.target;
	while (parent && parent.dataset && !parent.dataset.index && parent.tagName.toLowerCase() !== 'svg')
		parent = parent.parentNode;
	if (parent && parent.dataset) {
		analysis.name = parent.dataset.name;
		analysis.clickedName = closest.dataset.name;
		analysis.parentClasses = parent.classList;
	}
	if (closest && closest.classList)
		analysis.clickedClasses = closest.classList;
	analysis.selectableElement = target.svgEl;
	return {classes: classes, analysis: analysis}
}

module.exports = createAnalysis;
