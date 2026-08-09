const glyphs = require('./glyphs');
const RelativeElement = require('./elements/relative-element').default;

const createNoteHead = function (abselem, c, pitchelem, options) {
	if (!options) options = {};
	const dir = (options.dir !== undefined) ? options.dir : null;
	const headx = (options.headx !== undefined) ? options.headx : 0;
	const extrax = (options.extrax !== undefined) ? options.extrax : 0;
	const flag = (options.flag !== undefined) ? options.flag : null;
	let dot = (options.dot !== undefined) ? options.dot : 0;
	const dotshiftx = (options.dotshiftx !== undefined) ? options.dotshiftx : 0;
	const scale = (options.scale !== undefined) ? options.scale : 1;
	const accidentalSlot = (options.accidentalSlot !== undefined) ? options.accidentalSlot : [];
	const shouldExtendStem = (options.shouldExtendStem !== undefined) ? options.shouldExtendStem : false;
	const printAccidentals = (options.printAccidentals !== undefined) ? options.printAccidentals : true;
	const chordPos = options.chordPos

	// TODO scale the dot as well
	const pitch = pitchelem.verticalPos;
	let notehead;
	let accidentalshiftx = 0;
	let newDotShiftX = 0;
	let extraLeft = 0;
	if (c === undefined)
		abselem.addFixed(new RelativeElement("pitch is undefined", 0, 0, 0, { type: "debug" }));
	else if (c === "") {
		notehead = new RelativeElement(null, 0, 0, pitch, {chordPos:chordPos});
	} else {
		let shiftheadx = headx;
		if (pitchelem.printer_shift) {
			const adjust = (pitchelem.printer_shift === "same") ? 1 : 0;
			shiftheadx = (dir === "down") ? -glyphs.getSymbolWidth(c) * scale + adjust : glyphs.getSymbolWidth(c) * scale - adjust;
		}
		const opts = { scalex: scale, scaley: scale, thickness: glyphs.symbolHeightInPitches(c) * scale, name: pitchelem.name, chordPos: chordPos };
		notehead = new RelativeElement(c, shiftheadx, glyphs.getSymbolWidth(c) * scale, pitch, opts);
		notehead.stemDir = dir;
		if (flag) {
			let pos = pitch + ((dir === "down") ? -7 : 7) * scale;
			// if this is a regular note, (not grace or tempo indicator) then the stem will have been stretched to the middle line if it is far from the center.
			if (shouldExtendStem) {
				if (dir === "down" && pos > 6)
					pos = 6;
				if (dir === "up" && pos < 6)
					pos = 6;
			}
			//if (scale===1 && (dir==="down")?(pos>6):(pos<6)) pos=6;
			const xdelta = (dir === "down") ? headx : headx + notehead.w - 0.6;
			abselem.addRight(new RelativeElement(flag, xdelta, glyphs.getSymbolWidth(flag) * scale, pos, { scalex: scale, scaley: scale, chordPos: chordPos }));
		}
		newDotShiftX = notehead.w + dotshiftx - 2 + 5 * dot;
		for (; dot > 0; dot--) {
			const dotadjusty = (1 - Math.abs(pitch) % 2); //PER: take abs value of the pitch. And the shift still happens on ledger lines.
			abselem.addRight(new RelativeElement("dots.dot", notehead.w + dotshiftx - 2 + 5 * dot, glyphs.getSymbolWidth("dots.dot"), pitch + dotadjusty, {chordPos:chordPos}));
		}
	}
	if (notehead)
		notehead.highestVert = pitchelem.highestVert;

	if (printAccidentals && pitchelem.accidental) {
		let symb;
		switch (pitchelem.accidental) {
			case "quartersharp":
				symb = "accidentals.halfsharp";
				break;
			case "dblsharp":
				symb = "accidentals.dblsharp";
				break;
			case "sharp":
				symb = "accidentals.sharp";
				break;
			case "quarterflat":
				symb = "accidentals.halfflat";
				break;
			case "flat":
				symb = "accidentals.flat";
				break;
			case "dblflat":
				symb = "accidentals.dblflat";
				break;
			case "natural":
				symb = "accidentals.nat";
		}
		// if a note is at least a sixth away, it can share a slot with another accidental
		let accSlotFound = false;
		let accPlace = extrax;
		for (let j = 0; j < accidentalSlot.length; j++) {
			if (pitch - accidentalSlot[j][0] >= 6) {
				accidentalSlot[j][0] = pitch;
				accPlace = accidentalSlot[j][1];
				accSlotFound = true;
				break;
			}
		}
		if (accSlotFound === false) {
			accPlace -= (glyphs.getSymbolWidth(symb) * scale + 2);
			accidentalSlot.push([pitch, accPlace]);
			accidentalshiftx = (glyphs.getSymbolWidth(symb) * scale + 2);
		}
		const h = glyphs.symbolHeightInPitches(symb);
		abselem.addExtra(new RelativeElement(symb, accPlace, glyphs.getSymbolWidth(symb), pitch, { scalex: scale, scaley: scale, top: pitch + h / 2, bottom: pitch - h / 2, chordPos: chordPos }));
		extraLeft = glyphs.getSymbolWidth(symb) / 2; // TODO-PER: We need a little extra width if there is an accidental, but I'm not sure why it isn't the full width of the accidental.
	}

	return { notehead: notehead, accidentalshiftx: accidentalshiftx, dotshiftx: newDotShiftX, extraLeft: extraLeft };

};

module.exports = createNoteHead;
