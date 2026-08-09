const tunebook = require('./abc_tunebook');
const EngraverController = require('../write/engraver-controller');

const tuneMetrics = function(abc, params) {
	function callback(div, tune, tuneNumber, abcString) {
		div = document.createElement("div");
		div.setAttribute("style", "visibility: hidden;");
		document.body.appendChild(div);
		const engraver_controller = new EngraverController(div, params);
		const widths = engraver_controller.getMeasureWidths(tune);
		div.parentNode.removeChild(div);
		return {sections: widths};
	}

	return tunebook.renderEngine(callback, "*", abc, params);
};

module.exports = tuneMetrics;
