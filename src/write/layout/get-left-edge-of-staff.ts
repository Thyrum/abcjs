function getLeftEdgeOfStaff(renderer, getTextSize, voices, brace, bracket) {
	let x = renderer.padding.left;

	// find out how much space will be taken up by voice headers
	let voiceheaderw = 0;
	let i;
	let size;
	for (i = 0; i < voices.length; i++) {
		if (voices[i].header) {
			size = getTextSize.calc(voices[i].header, 'voicefont', '');
			voiceheaderw = Math.max(voiceheaderw, size.width);
		}
	}
	voiceheaderw = addBraceSize(voiceheaderw, brace, getTextSize);
	voiceheaderw = addBraceSize(voiceheaderw, bracket, getTextSize);

	if (voiceheaderw) {
		// Give enough spacing to the right - we use the width of an A for the amount of spacing.
		const sizeW = getTextSize.calc("A", 'voicefont', '');
		voiceheaderw += sizeW.width;
	}
	x += voiceheaderw;

	let ofs = 0;
	ofs = setBraceLocation(brace, x, ofs);
	ofs = setBraceLocation(bracket, x, ofs);
	return x + ofs;
}

function addBraceSize(voiceheaderw, brace, getTextSize) {
	if (brace) {
		for (let i = 0; i < brace.length; i++) {
			if (brace[i].header) {
				const size = getTextSize.calc(brace[i].header, 'voicefont', '');
				voiceheaderw = Math.max(voiceheaderw, size.width);
			}
		}
	}
	return voiceheaderw;
}

function setBraceLocation(brace, x, ofs) {
	if (brace) {
		for (let i = 0; i < brace.length; i++) {
			setLocation(x, brace[i]);
			ofs = Math.max(ofs, brace[i].getWidth());
		}
	}
	return ofs;
}

function setLocation(x, element) {
	element.x = x;
}

module.exports = getLeftEdgeOfStaff;
