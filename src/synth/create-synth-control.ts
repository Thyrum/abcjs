const supportsAudio = require('./supports-audio');
const registerAudioContext = require('./register-audio-context');
const activeAudioContext = require('./active-audio-context');

const loopImage = require('./images/loop.svg.js');
const playImage = require('./images/play.svg.js');
const pauseImage = require('./images/pause.svg.js');
const loadingImage = require('./images/loading.svg.js');
const resetImage = require('./images/reset.svg.js');

function CreateSynthControl(parent, options) {
	const self = this;
	// parent is either an element or a selector.
	if (typeof parent === "string") {
		const selector = parent;
		parent = document.querySelector(selector);
		if (!parent)
			throw new Error("Cannot find element \"" + selector + "\" in the DOM.");
	} else if (!(parent instanceof HTMLElement))
		throw new Error("The first parameter must be a valid element or selector in the DOM.");

	self.parent = parent;
	self.options = {};
	if (options)
		self.options = Object.assign({},options);

	// This can be called in the following cases:
	// AC already registered and not suspended
	// AC already registered and suspended
	// AC not registered and not passed in
	// AC not registered but passed in (but suspended)
	// AC not registered but passed in (not suspended)
	// If the AC is already registered, then just use it - ignore what is passed in
	// Create the AC if necessary if there isn't one already.
	// We don't care right now if the AC is suspended - whenever a button is clicked then we check it.
	if (self.options.ac)
		registerAudioContext(self.options.ac);
	buildDom(self.parent, self.options);
	attachListeners(self);

	self.disable = function(isDisabled) {
		const el = self.parent.querySelector(".abcjs-inline-audio");
		if (isDisabled)
			el.classList.add("abcjs-disabled");
		else
			el.classList.remove("abcjs-disabled");
	};
	self.setWarp = function(tempo, warp) {
		const el = self.parent.querySelector(".abcjs-midi-tempo");
		el.value = Math.round(warp);
		self.setTempo(tempo)
	};
	self.setTempo = function(tempo) {
		const el = self.parent.querySelector(".abcjs-midi-current-tempo");
		if (el)
			el.innerHTML = Math.round(tempo);
	};
	self.resetAll = function() {
		const pushedButtons = self.parent.querySelectorAll(".abcjs-pushed");
		for (let i = 0; i < pushedButtons.length; i++) {
			const button = pushedButtons[i];
			button.classList.remove("abcjs-pushed");
		}
	};
	self.pushPlay = function(push) {
		const startButton = self.parent.querySelector(".abcjs-midi-start");
		if (!startButton)
			return;
		if (push)
			startButton.classList.add("abcjs-pushed");
		else
			startButton.classList.remove("abcjs-pushed");
	};
	self.pushLoop = function(push) {
		const loopButton = self.parent.querySelector(".abcjs-midi-loop");
		if (!loopButton)
			return;
		if (push)
			loopButton.classList.add("abcjs-pushed");
		else
			loopButton.classList.remove("abcjs-pushed");
	};

	self.setProgress = function (percent, totalTime) {
		const progressBackground = self.parent.querySelector(".abcjs-midi-progress-background");
		const progressThumb = self.parent.querySelector(".abcjs-midi-progress-indicator");
		if (!progressBackground || !progressThumb)
			return;
		const width = progressBackground.clientWidth;
		const left = width * percent;
		progressThumb.style.left = left + "px";

		const clock = self.parent.querySelector(".abcjs-midi-clock");
		if (clock) {
			const totalSeconds = (totalTime * percent) / 1000;
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = Math.floor(totalSeconds % 60);
			const secondsFormatted = seconds < 10 ? "0" + seconds : seconds;
			clock.innerHTML = minutes + ":" + secondsFormatted;
		}
	};

	if (self.options.afterResume) {
		let isResumed = false;
		if (self.options.ac) {
			isResumed = self.options.ac.state !== "suspended";
		} else if (activeAudioContext()) {
			isResumed = activeAudioContext().state !== "suspended";
		}
		if (isResumed)
			self.options.afterResume();
	}
}

function buildDom(parent, options) {
	const hasLoop = !!options.loopHandler;
	const hasRestart = !!options.restartHandler;
	const hasPlay = !!options.playHandler || !!options.playPromiseHandler;
	const hasProgress = !!options.progressHandler;
	const hasWarp = !!options.warpHandler;
	const hasClock = options.hasClock !== false;

	let html = '<div class="abcjs-inline-audio">\n';
	if (hasLoop) {
		const repeatTitle = options.repeatTitle ? options.repeatTitle : "Click to toggle play once/repeat.";
		const repeatAria = options.repeatAria ? options.repeatAria : repeatTitle;
		html += '<button type="button" class="abcjs-midi-loop abcjs-btn" title="' + repeatTitle + '" aria-label="' + repeatAria + '">' + loopImage + '</button>\n';
	}
	if (hasRestart) {
		const restartTitle = options.restartTitle ? options.restartTitle : "Click to go to beginning.";
		const restartAria = options.restartAria ? options.restartAria : restartTitle;
		html += '<button type="button" class="abcjs-midi-reset abcjs-btn" title="' + restartTitle + '" aria-label="' + restartAria + '">' + resetImage + '</button>\n';
	}
	if (hasPlay) {
		const playTitle = options.playTitle ? options.playTitle : "Click to play/pause.";
		const playAria = options.playAria ? options.playAria : playTitle;
		html += '<button type="button" class="abcjs-midi-start abcjs-btn" title="' + playTitle + '" aria-label="' + playAria + '">' + playImage + pauseImage + loadingImage + '</button>\n';
	}
	if (hasProgress) {
		const randomTitle = options.randomTitle ? options.randomTitle : "Click to change the playback position.";
		const randomAria = options.randomAria ? options.randomAria : randomTitle;
		html += '<button type="button" class="abcjs-midi-progress-background" title="' + randomTitle + '" aria-label="' + randomAria + '"><span class="abcjs-midi-progress-indicator"></span></button>\n';
	}
	if (hasClock) {
		html += '<span class="abcjs-midi-clock"></span>\n';
	}
	if (hasWarp) {
		const warpTitle = options.warpTitle ? options.warpTitle : "Change the playback speed.";
		const warpAria = options.warpAria ? options.warpAria : warpTitle;
		const bpm = options.bpm ? options.bpm : "BPM";
		html += '<span class="abcjs-tempo-wrapper"><label><input class="abcjs-midi-tempo" type="number" min="1" max="300" value="100" title="' + warpTitle + '" aria-label="' + warpAria + '">%</label><span>&nbsp;(<span class="abcjs-midi-current-tempo"></span> ' + bpm + ')</span></span>\n';
	}
	html += '<div class="abcjs-css-warning" style="font-size: 12px;color:red;border: 1px solid red;text-align: center;width: 300px;margin-top: 4px;font-weight: bold;border-radius: 4px;">CSS required: load abcjs-audio.css</div>';
	html += '</div>\n';
	parent.innerHTML = html;
}

function acResumerMiddleWare(next, ev, playBtn, afterResume, isPromise) {
	let needsInit = true;
	if (!activeAudioContext()) {
		registerAudioContext();
	} else {
		needsInit = activeAudioContext().state === "suspended";
	}
	if (!supportsAudio()) {
		throw { status: "NotSupported", message: "This browser does not support audio."};
	}

	if ((needsInit || isPromise) && playBtn)
		playBtn.classList.add("abcjs-loading");

	if (needsInit) {
		activeAudioContext().resume().then(function () {
			if (afterResume) {
				afterResume().then(function (response) {
					doNext(next, ev, playBtn, isPromise);
				});
			} else {
				doNext(next, ev, playBtn, isPromise);
			}
		});
	} else {
		doNext(next, ev, playBtn, isPromise);
	}
}

function doNext(next, ev, playBtn, isPromise) {
	if (isPromise) {
		next(ev).then(function() {
			if (playBtn)
				playBtn.classList.remove("abcjs-loading");
		});
	} else {
		next(ev);
		if (playBtn)
			playBtn.classList.remove("abcjs-loading");
	}
}

function attachListeners(self) {
	const hasLoop = !!self.options.loopHandler;
	const hasRestart = !!self.options.restartHandler;
	const hasPlay = !!self.options.playHandler || !!self.options.playPromiseHandler;
	const hasProgress = !!self.options.progressHandler;
	const hasWarp = !!self.options.warpHandler;
	const playBtn = self.parent.querySelector(".abcjs-midi-start");

	if (hasLoop)
		self.parent.querySelector(".abcjs-midi-loop").addEventListener("click", function(ev){acResumerMiddleWare(self.options.loopHandler, ev, playBtn, self.options.afterResume)});
	if (hasRestart)
		self.parent.querySelector(".abcjs-midi-reset").addEventListener("click", function(ev){acResumerMiddleWare(self.options.restartHandler, ev, playBtn, self.options.afterResume)});
	if (hasPlay)
		playBtn.addEventListener("click", function(ev){
			acResumerMiddleWare(
				self.options.playPromiseHandler || self.options.playHandler,
				ev,
				playBtn,
				self.options.afterResume,
				!!self.options.playPromiseHandler)
		});
	if (hasProgress)
		self.parent.querySelector(".abcjs-midi-progress-background").addEventListener("click", function(ev){acResumerMiddleWare(self.options.progressHandler, ev, playBtn, self.options.afterResume)});
	if (hasWarp)
		self.parent.querySelector(".abcjs-midi-tempo").addEventListener("change", function(ev){acResumerMiddleWare(self.options.warpHandler, ev, playBtn, self.options.afterResume)});
}
module.exports = CreateSynthControl;
