
const TabNote = require('./tab-note');

const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function tabNotes(fromNote, toNote) {
	//console.log("INIT TabNotes")
	let fromN = new TabNote(fromNote);
	const toN = new TabNote(toNote);
	// check that toN is not lower than fromN
	if (toN.isLowerThan(fromN)) {
		const from = fromN.emit();
		const tn = toN.emit();
		return {
			error: 'Invalid string Instrument tuning : ' +
				tn + ' string lower than ' + from + ' string'
		};
	}
	const buildReturned = [];
	const startIndex = notes.indexOf(fromN.name);
	const toIndex = notes.indexOf(toN.name);
	if ((startIndex == -1) || (toIndex == -1)) {
		return buildReturned;
	}
	let finished = false;
	while (!finished) {
		buildReturned.push(fromN.emit());
		fromN = fromN.nextNote();
		if (fromN.sameNoteAs(toN)) {
			finished = true;
		}
	}
	return buildReturned;
}

module.exports = tabNotes;
