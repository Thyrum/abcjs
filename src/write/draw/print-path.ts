function printPath(renderer, attrs, params) {
	const ret = renderer.paper.path(attrs);

	return ret;
}

module.exports = printPath;
