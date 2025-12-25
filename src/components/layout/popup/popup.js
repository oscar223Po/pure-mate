// Enabling functionality
import { isMobile, bodyLockStatus, bodyLock, bodyUnlock, bodyLockToggle, FLS } from "@js/common/functions.js";

// Class Popup
class Popup {
	constructor(options) {
		let config = {
			logging: true,
			init: true,
			// For buttons
			attributeOpenButton: 'data-fls-popup-link',
			attributeCloseButton: 'data-fls-popup-close',
			// For third-party objects
			fixElementSelector: '[data-fls-lp]',
			// For the popup object
			attributeMain: 'data-fls-popup',
			youtubeAttribute: 'data-fls-popup-youtube',
			youtubePlaceAttribute: 'data-fls-popup-youtube-place',
			setAutoplayYoutube: true,
			// Changing classes
			classes: {
				popup: 'popup',
				// popupWrapper: 'popup__wrapper',
				popupContent: 'data-fls-popup-body',
				popupActive: 'data-fls-popup-active',
				bodyActive: 'data-fls-popup-open',
			},
			focusCatch: true,
			closeEsc: true,
			bodyLock: true,
			hashSettings: {
				location: true,
				goHash: true,
			},
			on: { // Events
				beforeOpen: function () { },
				afterOpen: function () { },
				beforeClose: function () { },
				afterClose: function () { },
			},
		}
		this.youTubeCode;
		this.isOpen = false;
		this.targetOpen = {
			selector: false,
			element: false,
		}
		this.previousOpen = {
			selector: false,
			element: false,
		}
		this.lastClosed = {
			selector: false,
			element: false,
		}
		this._dataValue = false;
		this.hash = false;

		this._reopen = false;
		this._selectorOpen = false;

		this.lastFocusEl = false;
		this._focusEl = [
			'a[href]',
			'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
			'button:not([disabled]):not([aria-hidden])',
			'select:not([disabled]):not([aria-hidden])',
			'textarea:not([disabled]):not([aria-hidden])',
			'area[href]',
			'iframe',
			'object',
			'embed',
			'[contenteditable]',
			'[tabindex]:not([tabindex^="-"])'
		];
		// this.options = Object.assign(config, options);
		this.options = {
			...config,
			...options,
			classes: {
				...config.classes,
				...options?.classes,
			},
			hashSettings: {
				...config.hashSettings,
				...options?.hashSettings,
			},
			on: {
				...config.on,
				...options?.on,
			}
		}
		this.bodyLock = false;
		this.options.init ? this.initPopups() : null
	}
	initPopups() {
		FLS(`_FLS_POPUP_START`)

		this.buildPopup();
		this.eventsPopup();
	}
	buildPopup() { }
	eventsPopup() {
		// Click on the entire document
		document.addEventListener("click", function (e) {
			// Click on the"open" button
			const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
			if (buttonOpen) {
				e.preventDefault();
				this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ?
					buttonOpen.getAttribute(this.options.attributeOpenButton) :
					'error';
				this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ?
					buttonOpen.getAttribute(this.options.youtubeAttribute) :
					null;
				if (this._dataValue !== 'error') {
					if (!this.isOpen) this.lastFocusEl = buttonOpen;
					this.targetOpen.selector = `${this._dataValue}`;
					this._selectorOpen = true;
					this.open();
					return;
				} else { FLS(`_FLS_POPUP_NOATTR`) }
				return;
			}
			
			const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
			if (buttonClose || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
		}.bind(this));
		// Closing ESC
		document.addEventListener("keydown", function (e) {
			if (this.options.closeEsc && e.which == 27 && e.code === 'Escape' && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
			if (this.options.focusCatch && e.which == 9 && this.isOpen) {
				this._focusCatch(e);
				return;
			}
		}.bind(this))

		// Opening by hash
		if (this.options.hashSettings.goHash) {
			// Checking the address bar change
			window.addEventListener('hashchange', function () {
				if (window.location.hash) {
					this._openToHash();
				} else {
					this.close(this.targetOpen.selector);
				}
			}.bind(this))

			if (window.location.hash) {
				this._openToHash()
			}
		}
	}
	open(selectorValue) {
		if (bodyLockStatus) {
			// If there was lock mode before opening popup
			this.bodyLock = document.documentElement.hasAttribute('data-fls-scrolllock') && !this.isOpen ? true : false;
			// If you enter the selector value (the selector is configured in options)
			if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
				this.targetOpen.selector = selectorValue;
				this._selectorOpen = true;
			}
			if (this.isOpen) {
				this._reopen = true;
				this.close();
			}
			if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
			if (!this._reopen) this.previousActiveElement = document.activeElement;

			this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);

			if (this.targetOpen.element) {
				// YouTube
				const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(`${this.options.youtubeAttribute}`)
				if (codeVideo) {
					const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`
					const iframe = document.createElement('iframe')
					const autoplay = this.options.setAutoplayYoutube ? 'autoplay;' : ''
					iframe.setAttribute('allowfullscreen', '')
					iframe.setAttribute('allow', `${autoplay}; encrypted-media`)
					iframe.setAttribute('src', urlVideo)
					if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
						this.targetOpen.element.querySelector('[data-fls-popup-content]').setAttribute(`${this.options.youtubePlaceAttribute}`, '')
					}
					this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe)
				}
				if (this.options.hashSettings.location) {
					// Getting the hash and setting it up
					this._getHash()
					this._setHash()
				}
				// Before opening
				this.options.on.beforeOpen(this);
				// Creating your own event after opening popup
				document.dispatchEvent(new CustomEvent("beforePopupOpen", {
					detail: {
						popup: this
					}
				}))
				this.targetOpen.element.setAttribute(this.options.classes.popupActive, '')
				document.documentElement.setAttribute(this.options.classes.bodyActive, '')

				if (!this._reopen) {
					!this.bodyLock ? bodyLock() : null;
				}
				else this._reopen = false;

				this.targetOpen.element.setAttribute('aria-hidden', 'false')

				// I remember that open window. It will be the last open one
				this.previousOpen.selector = this.targetOpen.selector
				this.previousOpen.element = this.targetOpen.element

				this._selectorOpen = false
				this.isOpen = true

				setTimeout(() => {
					this._focusTrap()
				}, 50)

				// After opening
				this.options.on.afterOpen(this)
				// Creating your own event after opening popup
				document.dispatchEvent(new CustomEvent("afterPopupOpen", {
					detail: {
						popup: this
					}
				}))
				FLS(`_FLS_POPUP_OPEN`, this.targetOpen.selector)
			} else {
				FLS(`_FLS_POPUP_NOPOPUP`)
			}
		}
	}
	close(selectorValue) {
		if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
			this.previousOpen.selector = selectorValue;
		}
		if (!this.isOpen || !bodyLockStatus) {
			return;
		}
		// Before closing
		this.options.on.beforeClose(this);
		// Creating your own event before closing popup
		document.dispatchEvent(new CustomEvent("beforePopupClose", {
			detail: {
				popup: this
			}
		}));
		// YouTube
		if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
			setTimeout(() => {
				this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = ''
			}, 500);
		}
		this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
		// aria-hidden
		this.previousOpen.element.setAttribute('aria-hidden', 'true');
		if (!this._reopen) {
			document.documentElement.removeAttribute(this.options.classes.bodyActive);
			!this.bodyLock ? bodyUnlock() : null;
			this.isOpen = false;
		}
		// Clearing the address bar
		this._removeHash();
		if (this._selectorOpen) {
			this.lastClosed.selector = this.previousOpen.selector;
			this.lastClosed.element = this.previousOpen.element;

		}
		// After closing
		this.options.on.afterClose(this);
		// Creating your own event after popup closes
		document.dispatchEvent(new CustomEvent("afterPopupClose", {
			detail: {
				popup: this
			}
		}));

		setTimeout(() => {
			this._focusTrap();
		}, 50);

		FLS(`_FLS_POPUP_CLOSE`, this.previousOpen.selector);
	}
	// Getting a hash
	_getHash() {
		if (this.options.hashSettings.location) {
			this.hash = `#${this.targetOpen.selector}`
		}
	}
	_openToHash() {
		let classInHash = window.location.hash.replace('#', '')

		const openButton = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`)
		if (openButton) {
			this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ?
				openButton.getAttribute(this.options.youtubeAttribute) :
				null
		}
		if (classInHash) this.open(classInHash);
	}
	// Installing the hash
	_setHash() {
		history.pushState('', '', this.hash);
	}
	_removeHash() {
		history.pushState('', '', window.location.href.split('#')[0])
	}
	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);

		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}
	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) {
			this.lastFocusEl.focus();
		} else {
			focusable[0].focus();
		}
	}
}
// Launching
document.querySelector('[data-fls-popup]') ?
	window.addEventListener('load', () => window.flsPopup = new Popup({})) : null
