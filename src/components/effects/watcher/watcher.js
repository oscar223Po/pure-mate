// Enabling functionality
import { isMobile, uniqArray, FLS } from "@js/common/functions.js";

class ScrollWatcher {
	constructor(props) {
		let defaultConfig = {
			logging: true,
		}
		this.config = Object.assign(defaultConfig, props);
		this.observer;

		!document.documentElement.hasAttribute('data-fls-watch') ? this.scrollWatcherRun() : null;
	}
	// Updating the ad builder
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	// Launching the ad builder
	scrollWatcherRun() {
		// document.documentElement.classList.add('watcher');
		document.documentElement.setAttribute('data-fls-watch', '')
		this.scrollWatcherConstructor(document.querySelectorAll('[data-fls-watcher]'));
	}
	// Observer constructor
	scrollWatcherConstructor(items) {
		if (items.length) {
			FLS(`_FLS_WATCHER_START_WATCH`, items.length);
			// Unify parameters
			let uniqParams = uniqArray(Array.from(items).map(function (item) {
				// Calculating automatic Threshold
				if (item.dataset.flsWatcher === 'navigator' && !item.dataset.flsWatcherThreshold) {
					let valueOfThreshold;
					if (item.clientHeight > 2) {
						valueOfThreshold =
							window.innerHeight / 2 / (item.clientHeight - 1);
						if (valueOfThreshold > 1) {
							valueOfThreshold = 1;
						}
					} else {
						valueOfThreshold = 1;
					}
					item.setAttribute(
						'data-fls-watcher-threshold',
						valueOfThreshold.toFixed(2)
					);
				}
				return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : '0px'}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
			}));
			// We get groups of objects with the same parameters,
			// creating settings and initializing the Observer
			uniqParams.forEach(uniqParam => {
				let uniqParamArray = uniqParam.split('|');
				let paramsWatch = {
					root: uniqParamArray[0],
					margin: uniqParamArray[1],
					threshold: uniqParamArray[2]
				}
				let groupItems = Array.from(items).filter(function (item) {
					let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
					let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : '0px';
					let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
					if (
						String(watchRoot) === paramsWatch.root &&
						String(watchMargin) === paramsWatch.margin &&
						String(watchThreshold) === paramsWatch.threshold
					) {
						return item;
					}
				});

				let configWatcher = this.getScrollWatcherConfig(paramsWatch);

				// Initializing the observer with its own settings
				this.scrollWatcherInit(groupItems, configWatcher);
			});
		} else {
			FLS("_FLS_WATCHER_SLEEP")
		}
	}
	// Function for creating settings
	getScrollWatcherConfig(paramsWatch) {
		// Creating settings
		let configWatcher = {}
		// The parent who is being monitored
		if (document.querySelector(paramsWatch.root)) {
			configWatcher.root = document.querySelector(paramsWatch.root);
		} else if (paramsWatch.root !== 'null') {
			FLS(`_FLS_WATCHER_NOPARENT`, paramsWatch.root)
		}
		// Trigger indent
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
			FLS(`_FLS_WATCHER_WARN_MARGIN`)
			return
		}
		// Trigger points
		if (paramsWatch.threshold === 'prx') {
			// Parallax mode
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1.0; i += 0.005) {
				paramsWatch.threshold.push(i);
			}
		} else {
			paramsWatch.threshold = paramsWatch.threshold.split(',');
		}
		configWatcher.threshold = paramsWatch.threshold;
		return configWatcher;
	}
	// Function for creating a new observer with your own settings
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	// Observer initialization function with its own settings
	scrollWatcherInit(items, configWatcher) {
		// Creating a new observer with your own settings
		this.scrollWatcherCreate(configWatcher);
		// Passing elements to the Observer
		items.forEach(item => this.observer.observe(item));
	}
	// Function for processing basic actions of trigger points
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) {
			// We see the object
			// Adding a class
			!targetElement.classList.contains('--watcher-view') ? targetElement.classList.add('--watcher-view') : null;
			FLS(`_FLS_WATCHER_VIEW`, targetElement.classList[0]);
		} else {
			// We don't see the object
			// Picking up a class
			targetElement.classList.contains('--watcher-view') ? targetElement.classList.remove('--watcher-view') : null;
			FLS(`_FLS_WATCHER_NOVIEW`, targetElement.classList[0]);
		}
	}
	// Function for disabling object tracking
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
		FLS(`_FLS_WATCHER_STOP_WATCH`, targetElement.classList[0]);
	}
	// Surveillance processing function
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		// Processing basic actions of trigger points
		this.scrollWatcherIntersecting(entry, targetElement);
		// If there is a data-watch-once attribute, remove tracking
		targetElement.hasAttribute('data-fls-watcher-once') && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
		// Creating your own feedback event
		document.dispatchEvent(new CustomEvent("watcherCallback", {
			detail: {
				entry: entry
			}
		}));

		/*
		// Selecting the desired objects
		if (targetElement.dataset.flsWatcher === 'some value') {
			// we write unique specifics
		}
		if (entry.isIntersecting) {
			// We see the object
		} else {
			// We don't see the object
		}
		*/
	}
}
document.querySelector('[data-fls-watcher]') ?
	window.addEventListener('load', () => new ScrollWatcher({})) : null