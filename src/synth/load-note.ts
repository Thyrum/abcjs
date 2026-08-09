// Load one mp3 file for one note.
// url = the base url for the soundfont
// instrument = the instrument name (e.g. "acoustic_grand_piano")
// name = the pitch name (e.g. "A3")
const soundsCache = require("./sounds-cache");

const getNote = function (url, instrument, name, audioContext) {
	if (!soundsCache[instrument]) soundsCache[instrument] = {};
	const instrumentCache = soundsCache[instrument];

	if (!instrumentCache[name])
		instrumentCache[name] = new Promise(function (resolve, reject) {
			const xhr = new XMLHttpRequest();
			const noteUrl = url + instrument + "-mp3/" + name + ".mp3";
			xhr.open("GET", noteUrl, true);
			xhr.responseType = "arraybuffer";
			xhr.onload = function () {
				if (xhr.status !== 200) {
					reject(Error("Can't load sound at " + noteUrl + ' status=' + xhr.status));
					return
				}
				const noteDecoded = function(audioBuffer) {
					resolve({instrument: instrument, name: name, status: "loaded", audioBuffer: audioBuffer})
				}
				const maybePromise = audioContext.decodeAudioData(xhr.response, noteDecoded, function () {
					reject(Error("Can't decode sound at " + noteUrl));
				});
				// In older browsers `BaseAudioContext.decodeAudio()` did not return a promise
				if (maybePromise && typeof maybePromise.catch === "function") maybePromise.catch(reject);
			};
			xhr.onerror = function () {
				reject(Error("Can't load sound at " + noteUrl));
			};
			xhr.send();
		})
			.catch(err => {
				console.error("Didn't load note", instrument, name, ":", err.message);
				throw err;
			});

	return instrumentCache[name];
};

module.exports = getNote;
