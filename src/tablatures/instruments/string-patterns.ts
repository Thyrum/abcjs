const { noteToMidi } = require('../../synth/note-to-midi');
const TabNote = require('./tab-note');
const tabNotes = require('./tab-notes');


function buildCapo(self) {
	let capoTuning = null;
	const tuning = self.tuning;
	if (self.capo > 0) {
		capoTuning = [];
		for (let iii = 0; iii < tuning.length; iii++) {
			let curNote = new TabNote(tuning[iii]);
			for (let jjj = 0; jjj < self.capo; jjj++) {
				curNote = curNote.nextNote();
			}
			capoTuning[iii] = curNote.emit();
		}
	}
	return capoTuning;
}

function buildPatterns(self) {
	const strings = [];
	let tuning = self.tuning;
	if (self.capo > 0) {
		tuning = self.capoTuning;
	}
	let pos = tuning.length - 1;
	for (let iii = 0; iii < tuning.length; iii++) {
		let nextNote = self.highestNote; // highest handled note
		if (iii != tuning.length - 1) {
			nextNote = tuning[iii + 1];
		}
		const stringNotes = tabNotes(tuning[iii], nextNote);
		if (stringNotes.error) {
			return stringNotes;
		}
		strings[pos--] = stringNotes;
	}
	return strings;
}


function buildSecond(first) {
	const seconds = [];
	seconds[0] = [];
	const strings = first.strings;
	for (let iii = 1; iii < strings.length; iii++) {
		seconds[iii] = strings[iii - 1];
	}
	return seconds;
}

function sameString(self, chord) {
	for (let jjjj = 0; jjjj < chord.length - 1; jjjj++) {
		let curPos = chord[jjjj];
		let nextPos = chord[jjjj + 1];
		if (curPos.str == nextPos.str) {
			// same String
			// => change lower pos 
			if (curPos.str == self.strings.length - 1) {
				// Invalid tab Chord position for instrument
				curPos.num = "?";
				nextPos.num = "?";
				return;
			}
			// change lower pitch on lowest string
			if (nextPos.num < curPos.num) {
				nextPos.str++;
				nextPos = noteToNumber(self,
					nextPos.note,
					nextPos.str,
					self.secondPos,
					self.strings[nextPos.str].length
				);
			} else {
				curPos.str++;
				curPos = noteToNumber(self,
					curPos.note,
					curPos.str,
					self.secondPos,
					self.strings[curPos.str].length
				);
			}
			// update table
			chord[jjjj] = curPos;
			chord[jjjj + 1] = nextPos;
		}
	}
	return null;
}

function handleChordNotes(self, notes) {
	const retNotes = [];
	for (let iiii = 0; iiii < notes.length; iiii++) {
		if (notes[iiii].endTie)
			continue;
		const note = new TabNote(notes[iiii].name, self.clefTranspose);
		note.checkKeyAccidentals(self.accidentals, self.measureAccidentals)
		const curPos = toNumber(self, note);
		retNotes.push(curPos);
	}
	sameString(self, retNotes);
	return retNotes;
}

function noteToNumber(self, note, stringNumber, secondPosition, firstSize) {
	let strings = self.strings;
	note.checkKeyAccidentals(self.accidentals, self.measureAccidentals);
	if (secondPosition) {
		strings = secondPosition;
	}
	const noteName = note.emitNoAccidentals();
	let num = strings[stringNumber].indexOf(noteName);
	let acc = note.acc;
	if (num != -1) {
		if (secondPosition) {
			num += firstSize;
		}
		if ((note.isFlat || note.acc == -1) && (num == 0)) {
			// flat on 0 pos => previous string 7th position
			const noteEquiv = note.getAccidentalEquiv();
			stringNumber++;
			num = strings[stringNumber].indexOf(noteEquiv.emit());
			acc = 0;
		}
		return {
			num: (num + acc),
			str: stringNumber,
			note: note
		};
	}
	return null;
}

function toNumber(self, note) {
	if (note.isAltered || note.natural) {
		let acc;
		if (note.isFlat) {
			if (note.isDouble)
				acc = "__"
			else
				acc = "_"
		} else if (note.isSharp) {
			if (note.isDouble)
				acc = "^^"
			else
				acc = "^"
		} else if (note.natural)
			acc = "="
		self.measureAccidentals[note.name.toUpperCase()] = acc
	}
	for (let i = self.stringPitches.length - 1; i >= 0; i--) {
		if (note.pitch + note.pitchAltered >= self.stringPitches[i]) {
			let num = note.pitch + note.pitchAltered - self.stringPitches[i]
			if (note.quarter === '^') num -= 0.5
			else if (note.quarter === "v") num += 0.5
			return {
				num: Math.round(num),
				str: self.stringPitches.length - 1 - i, // reverse the strings because string 0 is on the bottom
				note: note
			}
		}
	}
	return {
		num: "?",
		str: self.stringPitches.length - 1,
		note: note,
	};
}

StringPatterns.prototype.stringToPitch = function (stringNumber) {
	const startingPitch = 5.3;
	const bottom = this.strings.length - 1;
	return startingPitch + ((bottom - stringNumber) * this.linePitch);
};

function invalidNumber(retNotes, note) {
	const number = {
		num: "?",
		str: 0,
		note: note
	};
	retNotes.push(number);
	retNotes.error = note.emit() + ': unexpected note for instrument';
}

StringPatterns.prototype.notesToNumber = function (notes, graces) {
	let note;
	let number;
	let error = null;
	let retNotes = null;
	if (notes) {
		retNotes = [];
		if (notes.length > 1) {
			retNotes = handleChordNotes(this, notes);
			if (retNotes.error) {
				error = retNotes.error;
			}
		} else {
			if (!notes[0].endTie) {
				note = new TabNote(notes[0].name, this.clefTranspose);
				note.checkKeyAccidentals(this.accidentals, this.measureAccidentals)
				number = toNumber(this, note);
				if (number) {
					retNotes.push(number);
				} else {
					invalidNumber(retNotes, note);
					error = retNotes.error;
				}
			}
		}
	}
	if (error) return retNotes;
	let retGraces = null;
	if (graces) {
		retGraces = [];
		for (let iiii = 0; iiii < graces.length; iiii++) {
			note = new TabNote(graces[iiii].name, this.clefTranspose);
			note.checkKeyAccidentals(this.accidentals, this.measureAccidentals)
			number = toNumber(this, note);
			if (number) {
				retGraces.push(number);
			} else {
				invalidNumber(retGraces, note);
				error = retNotes.error;
			}
		}
	}

	return {
		notes: retNotes,
		graces: retGraces,
		error: error
	};
};

StringPatterns.prototype.toString = function () {
	const arr = []
	for (let i = 0; i < this.tuning.length; i++) {
		let str = this.tuning[i].replaceAll(',', '').replaceAll("'", '').toUpperCase();
		if (str[0] === '_') str = str[1] + 'b '
		else if (str[0] === '^') str = str[1] + "# "
		arr.push(str)
	}
	return arr.join('');
};

StringPatterns.prototype.tabInfos = function (plugin) {
	let name = plugin.params.label;
	if (name) {
		const tunePos = name.indexOf('%T');
		let tuning = "";
		if (tunePos != -1) {
			tuning = this.toString();
			if (plugin.capo > 0) {
				tuning += ' capo:' + plugin.capo;
			}
			name = name.replace('%T', tuning);
		}
		return name;
	}
	return '';
};

// MAE 27 Nov 2023
StringPatterns.prototype.suppress = function (plugin) {
	const suppress = plugin.params.suppress;
	if (suppress) {
		return true;
	}
	return false;
};
// MAE 27 Nov 2023 End

/**
 * Common patterns for all string instruments
 * @param {} plugin
 * @param {} tuning
 * @param {*} capo
 * @param {*} highestNote 
 */
function StringPatterns(plugin) {
	//console.log("INIT StringPatterns constructor")
	const tuning = plugin.tuning;
	const capo = plugin.capo;
	const highestNote = plugin.params.highestNote;
	this.linePitch = plugin.linePitch;
	this.highestNote = "a'";
	if (highestNote) {
		// override default
		this.highestNote = highestNote;
	}
	this.measureAccidentals = {}
	this.capo = 0;
	if (capo) {
		this.capo = parseInt(capo, 10);
	}
	this.transpose = plugin.transpose ? plugin.transpose : 0
	this.tuning = tuning;
	this.stringPitches = []
	for (let i = 0; i < this.tuning.length; i++) {
		const pitch = noteToMidi(this.tuning[i]) + this.capo
		this.stringPitches.push(pitch)
	}
	if (this.capo > 0) {
		this.capoTuning = buildCapo(this);
	}
	this.strings = buildPatterns(this);
	if (this.strings.error) {
		plugin.setError(this.strings.error);
		plugin.inError = true;
		return;
	}
	// second position pattern per string
	this.secondPos = buildSecond(this);
}



module.exports = StringPatterns;