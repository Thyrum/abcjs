//    abc_create_clef.js

const AbsoluteElement = require('./elements/absolute-element').default;
const glyphs = require('./glyphs');
const RelativeElement = require('./elements/relative-element').default;

const createClef = function (elem, tuneNumber) {
	let clef;
	let octave = 0;
	elem.el_type = "clef";
	const abselem = new AbsoluteElement(elem, 0, 10, 'staff-extra clef', tuneNumber);
	abselem.isClef = true;
	switch (elem.type) {
		case "treble": clef = "clefs.G"; break;
		case "tenor": clef = "clefs.C"; break;
		case "alto": clef = "clefs.C"; break;
		case "bass": clef = "clefs.F"; break;
		case 'treble+8': clef = "clefs.G"; octave = 1; break;
		case 'tenor+8': clef = "clefs.C"; octave = 1; break;
		case 'bass+8': clef = "clefs.F"; octave = 1; break;
		case 'alto+8': clef = "clefs.C"; octave = 1; break;
		case 'treble-8': clef = "clefs.G"; octave = -1; break;
		case 'tenor-8': clef = "clefs.C"; octave = -1; break;
		case 'bass-8': clef = "clefs.F"; octave = -1; break;
		case 'alto-8': clef = "clefs.C"; octave = -1; break;
		case 'none': return null;
		case 'perc': clef = "clefs.perc"; break;
		default: abselem.addFixed(new RelativeElement("clef=" + elem.type, 0, 0, undefined, { type: "debug" }));
	}
	// if (elem.verticalPos) {
	// pitch = elem.verticalPos;
	// }
	const dx = 5;
	if (clef) {
		const height = glyphs.symbolHeightInPitches(clef);
		const ofs = clefOffsets(clef);
		abselem.addRight(new RelativeElement(clef, dx, glyphs.getSymbolWidth(clef), elem.clefPos, { top: height + elem.clefPos + ofs, bottom: elem.clefPos + ofs }));

		if (octave !== 0) {
			const scale = 2 / 3;
			let adjustspacing = (glyphs.getSymbolWidth(clef) - glyphs.getSymbolWidth("8") * scale) / 2;
			let pitch = (octave > 0) ? abselem.top + 3 : abselem.bottom - 1;
			const top = (octave > 0) ? abselem.top + 3 : abselem.bottom - 3;
			const bottom = top - 2;
			if (elem.type === "bass-8") {
				// The placement for bass octave is a little different. It should hug the clef.
				pitch = 3;
				adjustspacing = 0;
			}
			abselem.addRight(new RelativeElement("8", dx + adjustspacing, glyphs.getSymbolWidth("8") * scale, pitch, {
				scalex: scale,
				scaley: scale,
				top: top,
				bottom: bottom
			}));
			//abselem.top += 2;
		}
	}
	return abselem;
};

function clefOffsets(clef) {
	switch (clef) {
		case "clefs.G": return -5;
		case "clefs.C": return -4;
		case "clefs.F": return -4;
		case "clefs.perc": return -2;
		default: return 0;
	}
}

module.exports = createClef;
