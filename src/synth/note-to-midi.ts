const accidentals = {
	"__": -2,
	"_": -1,
	"_/": -0.5,
	"=": 0,
	"": 0,
	"^/": 0.5,
	"^": 1,
	"^^": 2
}

const notesInOrder = ['C', '-', 'D', '-', 'E', 'F', '-', 'G', '-', 'A', '-', 'B', 'c', '-', 'd', '-', 'e', 'f', '-', 'g', '-', 'a', '-', 'b']

function noteToMidi(note) {
	const reg = note.match(/([_^\/]*)([ABCDEFGabcdefg])(,*)('*)/)
	if (reg && reg.length === 5) {
		const acc = accidentals[reg[1]]
		const pitch = notesInOrder.indexOf(reg[2])
		const octave = reg[4].length - reg[3].length
		return 48 + pitch + acc + octave * 12;
	}
	return 0;
}

function midiToNote(midi) {
	midi = parseInt(midi, 10) // TODO-PER: not sure how to handle quarter sharps and flats, so strip them for now.
	let octave = Math.floor(midi / 12)
	const pitch = midi % 12
	let name = notesInOrder[pitch]
	if (name === '-') {
		name = '^' + notesInOrder[pitch-1]
	}
	
	if (octave > 4) {
		name = name.toLowerCase()
		octave -= 5
		while (octave > 0) {
			name += "'"
			octave--
		}
	} else {
		while (octave < 4) {
			name += ','
			octave++
		}
	}	
	return name
}

module.exports = {noteToMidi: noteToMidi, midiToNote: midiToNote};
