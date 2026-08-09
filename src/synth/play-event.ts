const SynthSequence = require('./synth-sequence');
const CreateSynth = require('./create-synth');
const activeAudioContext = require("./active-audio-context");

function playEvent(midiPitches, midiGracePitches, millisecondsPerMeasure, soundFontUrl, debugCallback) {
	const sequence = new SynthSequence();

	for (let i = 0; i < midiPitches.length; i++) {
		const note = midiPitches[i];
		const trackNum = sequence.addTrack();
		sequence.setInstrument(trackNum, note.instrument);
		if (i === 0 && midiGracePitches) {
			for (let j = 0; j < midiGracePitches.length; j++) {
				const grace = midiGracePitches[j];
				sequence.appendNote(trackNum, grace.pitch, 1 / 64, grace.volume, grace.cents);
			}
		}
		sequence.appendNote(trackNum, note.pitch, note.duration, note.volume, note.cents);
	}

	const ac = activeAudioContext();
	if (ac.state === "suspended") {
		return ac.resume().then(function () {
			return doPlay(sequence, millisecondsPerMeasure, soundFontUrl, debugCallback);
		});
	} else {
		return doPlay(sequence, millisecondsPerMeasure, soundFontUrl, debugCallback);
	}
}

function doPlay(sequence, millisecondsPerMeasure, soundFontUrl, debugCallback) {
	const buffer = new CreateSynth();
	return buffer.init({
		sequence: sequence,
		millisecondsPerMeasure: millisecondsPerMeasure,
		options: { soundFontUrl: soundFontUrl },
		debugCallback: debugCallback,
	}).then(function () {
		return buffer.prime();
	}).then(function () {
		buffer.start();
		return Promise.resolve();
	});
}

module.exports = playEvent;
