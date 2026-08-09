const tunebook = require('../api/abc_tunebook');
const midiCreate = require('../midi/abc_midi_create');

const getMidiFile = function(source, options) {
	const params = {};
	if (options) {
		for (const key in options) {
			if (options.hasOwnProperty(key)) {
				params[key] = options[key];
			}
		}
	}
	params.generateInline = false;

	function callback(div, tune, index) {
		const downloadMidi = midiCreate(tune, params);
		switch (params.midiOutputType) {
			case "encoded":
				return downloadMidi;
			case "binary":
				var decoded = downloadMidi.replace("data:audio/midi,", "");
				decoded = decoded.replace(/MThd/g,"%4d%54%68%64");
				decoded = decoded.replace(/MTrk/g,"%4d%54%72%6b");
				var buffer = new ArrayBuffer(decoded.length/3);
				var output = new Uint8Array(buffer);
				for (let i = 0; i < decoded.length/3; i++) {
					const p = i*3+1;
					const d = parseInt(decoded.substring(p, p+2), 16);
					output[i] = d;
				}
				return output;
			case "link":
			default:
				return generateMidiDownloadLink(tune, params, downloadMidi, index);
		}
	}

	if (typeof source === "string")
		return tunebook.renderEngine(callback, "*", source, params);
	else
		return callback(null, source, 0);
};

function isFunction(functionToCheck) {
	const getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var generateMidiDownloadLink = function(tune, midiParams, midi, index) {
	const divClasses = ['abcjs-download-midi', 'abcjs-midi-' + index]
	if (midiParams.downloadClass)
		divClasses.push(midiParams.downloadClass)
	let html = '<div class="' + divClasses.join(' ') + '">';
	if (midiParams.preTextDownload)
		html += midiParams.preTextDownload;
	let title = tune.metaText && tune.metaText.title ? tune.metaText.title : 'Untitled';
	let label;
	if (midiParams.downloadLabel && isFunction(midiParams.downloadLabel))
		label = midiParams.downloadLabel(tune, index);
	else if (midiParams.downloadLabel)
		label = midiParams.downloadLabel.replace(/%T/, title);
	else
		label = "Download MIDI for \"" + title + "\"";
	title = title.toLowerCase().replace(/'/g, '').replace(/\W/g, '_').replace(/__/g, '_');
	const filename = (midiParams.fileName) ? midiParams.fileName :  title + '.midi';
	html += '<a download="' + filename + '" href="' + midi + '">' + label + '</a>';
	if (midiParams.postTextDownload)
		html += midiParams.postTextDownload;
	return html + "</div>";
};


module.exports = getMidiFile;
