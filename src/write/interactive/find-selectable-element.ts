const createAnalysis = require('./create-analysis');

function findSelectableElement(event) {
	let selectable = event
	while (selectable && selectable.attributes && selectable.tagName.toLowerCase() !== 'svg' && !selectable.attributes.selectable) {
		selectable = selectable.parentNode
	}
	if (selectable && selectable.attributes && selectable.attributes.selectable) {
		let index = selectable.attributes['data-index'].nodeValue
		if (index) {
			index = parseInt(index, 10)
			if (index >= 0 && index < this.selectables.length) {
				const element = this.selectables[index]
				const ret = createAnalysis(element, event)
				ret.index = index
				ret.element = element
				return ret
			}
		}
	}
	return null
}

module.exports = findSelectableElement;
