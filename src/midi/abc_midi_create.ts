//    abc_midi_create.js: Turn a linear series of events into a midi file.

const rendererFactory = require('../synth/abc_midi_renderer');

let create;

(function() {
	"use strict";

	const baseDuration = 480*4; // nice and divisible, equals 1 whole note

	create = function create(abcTune, options) {
		if (options === undefined) options = {};
		const commands = abcTune.setUpAudio(options);
		const midi = rendererFactory();
		let title = abcTune.metaText ? abcTune.metaText.title : undefined;
		if (title && title.length > 128) title = title.substring(0, 124) + '...';
		const key = abcTune.getKeySignature();
		const time = abcTune.getMeterFraction();

		// MAE 7 July 2024 - Fix for */8 meter tempos
		let tempo = commands.tempo;

		let beatsPerSecond = tempo / 60;

		// Fix tempo for compound meters
		if (time.den === 8 && time.num !== 5 && time.num !== 7){

			// Compute the tempo based on the actual milliseconds per measure, scaled by the number of eight notes and halved to get tempo in bpm.
			const msPerMeasure = abcTune.millisecondsPerMeasure();
			
			tempo = (60000 / (msPerMeasure/time.num)) / 2;
			
			beatsPerSecond = tempo/60;

		}

		//var beatLength = abcTune.getBeatLength();
		midi.setGlobalInfo(tempo, title, key, time);
		
		for (let i = 0; i < commands.tracks.length; i++) {
			midi.startTrack();
			const notePlacement = {};
			for (let j = 0; j < commands.tracks[i].length; j++) {
				const event = commands.tracks[i][j];
				switch (event.cmd) {
					case 'text':
						midi.setText(event.type, event.text);
						break;
					case 'program':
						var pan = 0;
						if (options.pan && options.pan.length > i)
							pan = options.pan[i];
						if (event.instrument === 128) {
							// If we're using the percussion voice, change to Channel 10
							midi.setChannel(9, pan);
							midi.setInstrument(0);
						} else {
							midi.setChannel(event.channel, pan);
							midi.setInstrument(event.instrument);
						}
						break;
					case 'note':
						var gapLengthInBeats = event.gap * beatsPerSecond;
						var start = event.start;
						// The staccato and legato are indicated by event.gap.
						// event.gap is in seconds but the durations are in whole notes.
						var end = start + event.duration - gapLengthInBeats;
						if (!notePlacement[start])
							notePlacement[start] = [];
						notePlacement[start].push({ pitch: event.pitch, volume: event.volume, cents: event.cents });
						if (!notePlacement[end])
							notePlacement[end] = [];
						notePlacement[end].push({ pitch: event.pitch, volume: 0 });
						break;
					default:
						console.log("MIDI create Unknown: " + event.cmd);
				}
			}
			addNotes(midi, notePlacement, baseDuration);
			midi.endTrack();
		}

		return midi.getData();
	};

	function addNotes(midi, notePlacement, baseDuration) {
		const times = Object.keys(notePlacement);
		for (let h = 0; h < times.length; h++)
			times[h] = parseFloat(times[h]);
		times.sort(function(a,b) {
			return a - b;
		});
		let lastTime = 0;
		for (let i = 0; i < times.length; i++) {
			const events = notePlacement[times[i]];
			if (times[i] > lastTime) {
				const distance = (times[i] - lastTime) * baseDuration;
				midi.addRest(distance);
				lastTime = times[i];
			}
			for (let j = 0; j < events.length; j++) {
				const event = events[j];
				if (event.volume) {
					midi.startNote(event.pitch, event.volume, event.cents);
				} else {
					midi.endNote(event.pitch);
				}
			}
		}
	}

})();

module.exports = create;
