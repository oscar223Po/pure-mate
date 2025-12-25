// Enabling functionality
import { FLS, isMobile } from "@js/common/functions.js"

import './fullpage.scss'

// FullPage class
class FullPage {
	constructor(element, options) {
		let config = {
			//===============================
			// Selector where swipe / wheel events are disabled
			noEventSelector: '[data-fls-fullpage-noevent]',
			//===============================
			// Wrapper configuration
			// Class added on plugin initialization
			classInit: '--fullpage-init',
			// Class added to wrapper during section switching
			wrapperAnimatedClass: '--fullpage-switching',
			//===============================
			// Sections configuration
			// Sections selector
			selectorSection: '[data-fls-fullpage-section]',
			// Active section class
			activeClass: '--fullpage-active-section',
			// Previous section class
			previousClass: '--fullpage-previous-section',
			// Next section class
			nextClass: '--fullpage-next-section',
			// Initial active section ID
			idActiveSection: 0,
			//===============================
			// Additional settings
			// Mouse swipe simulation
			// touchSimulator: false,
			//===============================
			// Effects
			// Available effects: fade, cards, slider
			mode: element.dataset.flsFullpageEffect ? element.dataset.flsFullpageEffect : 'slider',
			//===============================
			// Bullets
			// Enable bullets
			bullets: element.hasAttribute('data-fls-fullpage-bullets') ? true : false,
			// Bullets container class
			bulletsClass: '--fullpage-bullets',
			// Bullet class
			bulletClass: '--fullpage-bullet',
			// Active bullet class
			bulletActiveClass: '--fullpage-bullet-active',
			//===============================
			// Events
			// Initialization callback
			onInit: function () { },
			// Section switching callback
			onSwitching: function () { },
			// Destroy callback
			onDestroy: function () { },
		}
		this.options = Object.assign(config, options);
		// Parent wrapper element
		this.wrapper = element;
		this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
		// Active section
		this.activeSection = false;
		this.activeSectionId = false;
		// Previous section
		this.previousSection = false;
		this.previousSectionId = false;
		// Next section
		this.nextSection = false;
		this.nextSectionId = false;
		// Bullets container
		this.bulletsWrapper = false;
		// Helper flag
		this.stopEvent = false;
		if (this.sections.length) {
			// Initialize plugin
			this.init();
		}
	}
	//===============================
	// Initial setup
	init() {
		if (this.options.idActiveSection > (this.sections.length - 1)) return
		// Assign section IDs
		this.setId();
		this.activeSectionId = this.options.idActiveSection;
		// Apply effect classes
		this.setEffectsClasses();
		// Apply section classes
		this.setClasses();
		// Apply styles
		this.setStyle();
		// Setup bullets
		if (this.options.bullets) {
			this.setBullets();
			this.setActiveBullet(this.activeSectionId);
		}
		// Bind events
		this.events();
		// Add initialization class
		setTimeout(() => {
			FLS('_FLS_FULLPAGE_START', this.sections.length)

			document.documentElement.classList.add(this.options.classInit);
			// Dispatch custom initialization event
			this.options.onInit(this);
			document.dispatchEvent(new CustomEvent("fpinit", {
				detail: {
					fp: this
				}
			}));
		}, 0);
	}
	//===============================
	// Destroy plugin
	destroy() {
		// Remove events
		this.removeEvents();
		// Remove section classes
		this.removeClasses();
		// Remove initialization class
		document.documentElement.classList.remove(this.options.classInit);
		// Remove animation class
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		// Remove effect classes
		this.removeEffectsClasses();
		// Remove z-index values
		this.removeZIndex();
		// Remove styles
		this.removeStyle();
		// Remove section IDs
		this.removeId();
		// Dispatch destroy event
		this.options.onDestroy(this);
		document.dispatchEvent(new CustomEvent("fpdestroy", {
			detail: {
				fp: this
			}
		}));
	}
	//===============================
	// Assign IDs to sections
	setId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.setAttribute('data-fls-fullpage-id', index);
		}
	}
	//===============================
	// Remove section IDs
	removeId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.removeAttribute('data-fls-fullpage-id');
		}
	}
	//===============================
	// Set classes for previous, active and next sections
	setClasses() {
		// Store previous section ID (if exists)
		this.previousSectionId = (this.activeSectionId - 1) >= 0 ?
			this.activeSectionId - 1 : false;

		// Store next section ID (if exists)
		this.nextSectionId = (this.activeSectionId + 1) < this.sections.length ?
			this.activeSectionId + 1 : false;

		// Assign active section and class
		this.activeSection = this.sections[this.activeSectionId];
		this.activeSection.classList.add(this.options.activeClass);

		for (let index = 0; index < this.sections.length; index++) {
			document.documentElement.classList.remove(`--fullpage-section-${index}`);
		}
		document.documentElement.classList.add(`--fullpage-section-${this.activeSectionId}`);

		// Assign previous section and class
		if (this.previousSectionId !== false) {
			this.previousSection = this.sections[this.previousSectionId];
			this.previousSection.classList.add(this.options.previousClass);
		} else {
			this.previousSection = false;
		}

		// Assign next section and class
		if (this.nextSectionId !== false) {
			this.nextSection = this.sections[this.nextSectionId];
			this.nextSection.classList.add(this.options.nextClass);
		} else {
			this.nextSection = false;
		}
	}
	//===============================
	// Remove effect-related classes
	removeEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.remove('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.remove('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.remove('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	//===============================
	// Apply effect-related classes
	setEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.add('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.add('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.add('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	//===============================
	// Scroll direction locking
	//===============================
	// Apply styles
	setStyle() {
		switch (this.options.mode) {
			case 'slider':
				this.styleSlider();
				break;

			case 'cards':
				this.styleCards();
				break;

			case 'fade':
				this.styleFade();
				break;
			default:
				break;
		}
	}
	// Slider mode styles
	styleSlider() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			} else if (index > this.activeSectionId) {
				section.style.transform = 'translate3D(0,100%,0)';
			}
		}
	}
	// Cards mode styles
	styleCards() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index >= this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			}
		}
	}
	// Fade mode styles
	styleFade() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.opacity = '1';
				section.style.pointerEvents = 'all';
			} else {
				section.style.opacity = '0';
				section.style.pointerEvents = 'none';
			}
		}
	}
	//===============================
	// Remove inline styles
	removeStyle() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.opacity = '';
			section.style.visibility = '';
			section.style.transform = '';
		}
	}
	//===============================
	// Check if element scroll is fully completed
	checkScroll(yCoord, element) {
		this.goScroll = false;

		// Validate element and event availability
		if (!this.stopEvent && element) {
			this.goScroll = true;
			// If section height differs from viewport height
			if (this.haveScroll(element)) {
				this.goScroll = false;
				const position = Math.round(element.scrollHeight - element.scrollTop);
				// Check if section scroll is at edge
				if (
					((Math.abs(position - element.scrollHeight) < 2) && yCoord <= 0) ||
					((Math.abs(position - element.clientHeight) < 2) && yCoord >= 0)
				) {
					this.goScroll = true;
				}
			}
		}
	}
	//===============================
	// Check scroll height
	haveScroll(element) {
		return element.scrollHeight !== window.innerHeight
	}
	//===============================
	// Remove section classes
	removeClasses() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.classList.remove(this.options.activeClass);
			section.classList.remove(this.options.previousClass);
			section.classList.remove(this.options.nextClass);
		}
	}
	//===============================
	// Events registry
	events() {
		this.events = {
			// Mouse wheel
			wheel: this.wheel.bind(this),

			// Touch gestures
			touchdown: this.touchDown.bind(this),
			touchup: this.touchUp.bind(this),
			touchmove: this.touchMove.bind(this),
			touchcancel: this.touchUp.bind(this),

			// Transition end
			transitionEnd: this.transitionend.bind(this),

			// Bullet click
			click: this.clickBullets.bind(this),
		}
		if (isMobile.iOS()) {
			document.addEventListener('touchmove', (e) => {
				e.preventDefault();
			});
		}
		this.setEvents();
	}
	setEvents() {
		// Mouse wheel event
		this.wrapper.addEventListener('wheel', this.events.wheel);
		// Touch start event
		this.wrapper.addEventListener('touchstart', this.events.touchdown);
		// Bullet click event
		if (this.options.bullets && this.bulletsWrapper) {
			this.bulletsWrapper.addEventListener('click', this.events.click);
		}
	}
	removeEvents() {
		this.wrapper.removeEventListener('wheel', this.events.wheel);
		this.wrapper.removeEventListener('touchdown', this.events.touchdown);
		this.wrapper.removeEventListener('touchup', this.events.touchup);
		this.wrapper.removeEventListener('touchcancel', this.events.touchup);
		this.wrapper.removeEventListener('touchmove', this.events.touchmove);
		if (this.bulletsWrapper) {
			this.bulletsWrapper.removeEventListener('click', this.events.click);
		}
	}
	//===============================
	// Bullet click handler
	clickBullets(e) {
		// Clicked bullet
		const bullet = e.target.closest(`.${this.options.bulletClass}`);
		if (bullet) {
			// All bullets array
			const arrayChildren = Array.from(this.bulletsWrapper.children);

			// Clicked bullet ID
			const idClickBullet = arrayChildren.indexOf(bullet)

			// Switch section
			this.switchingSection(idClickBullet)
		}
	}
	//===============================
	// Set active bullet styles
	setActiveBullet(idButton) {
		if (!this.bulletsWrapper) return
		// All bullets
		const bullets = this.bulletsWrapper.children;

		for (let index = 0; index < bullets.length; index++) {
			const bullet = bullets[index];
			if (idButton === index) bullet.classList.add(this.options.bulletActiveClass);
			else bullet.classList.remove(this.options.bulletActiveClass);
		}
	}
	//===============================
	// Touch / pen / cursor down event
	touchDown(e) {
		// Swipe start position
		this._yP = e.changedTouches[0].pageY;
		this._eventElement = e.target.closest(`.${this.options.activeClass}`);
		if (this._eventElement) {
			// Bind touch move and release events
			this._eventElement.addEventListener('touchend', this.events.touchup);
			this._eventElement.addEventListener('touchcancel', this.events.touchup);
			this._eventElement.addEventListener('touchmove', this.events.touchmove);
			// Touch initiated
			this.clickOrTouch = true;

			//==============================
			if (isMobile.iOS()) {
				if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
					if (this._eventElement.scrollTop === 0) {
						this._eventElement.scrollTop = 1;
					}
					if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
						this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
					}
				}
				this.allowUp = this._eventElement.scrollTop > 0;
				this.allowDown = this._eventElement.scrollTop < (this._eventElement.scrollHeight - this._eventElement.clientHeight);
				this.lastY = e.changedTouches[0].pageY;
			}
			//===============================
		}
	}
	//===============================
	// Touch / pen / cursor move event
	touchMove(e) {
		// Get active section element
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		//===============================
		if (isMobile.iOS()) {
			let up = e.changedTouches[0].pageY > this.lastY;
			let down = !up;
			this.lastY = e.changedTouches[0].pageY;
			if (targetElement) {
				if ((up && this.allowUp) || (down && this.allowDown)) {
					e.stopPropagation();
				} else if (e.cancelable) {
					e.preventDefault();
				}
			}
		}
		//===============================
		// Check animation state and non-interactive blocks
		if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return
		// Get movement direction
		let yCoord = this._yP - e.changedTouches[0].pageY;
		// Is transition allowed
		this.checkScroll(yCoord, targetElement);
		// Perform transition
		if (this.goScroll && Math.abs(yCoord) > 20) {
			this.choiceOfDirection(yCoord);
		}
	}
	//===============================
	// Touch / pen / cursor release event
	touchUp(e) {
		// Remove events
		this._eventElement.removeEventListener('touchend', this.events.touchup);
		this._eventElement.removeEventListener('touchcancel', this.events.touchup);
		this._eventElement.removeEventListener('touchmove', this.events.touchmove);
		return this.clickOrTouch = false;
	}
	//===============================
	// Transition completion handler
	transitionend(e) {
		this.stopEvent = false;
		document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
	}
	//===============================
	// Mouse wheel handler
	wheel(e) {
		// Ignore non-interactive blocks
		if (e.target.closest(this.options.noEventSelector)) return
		// Get scroll direction
		const yCoord = e.deltaY;
		// Get active section element
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		// Is transition allowed
		this.checkScroll(yCoord, targetElement);
		// Perform transition
		if (this.goScroll) this.choiceOfDirection(yCoord);
	}
	//===============================
	// Direction resolver
	choiceOfDirection(direction) {
		// Set target section ID
		if (direction > 0 && this.nextSection !== false) {
			this.activeSectionId = (this.activeSectionId + 1) < this.sections.length ?
				++this.activeSectionId : this.activeSectionId;
		} else if (direction < 0 && this.previousSection !== false) {
			this.activeSectionId = (this.activeSectionId - 1) >= 0 ?
				--this.activeSectionId : this.activeSectionId;
		}
		// Switch section
		this.switchingSection(this.activeSectionId, direction);
	}
	//===============================
	// Section switching handler
	switchingSection(idSection = this.activeSectionId, direction) {
		if (!direction) {
			if (idSection < this.activeSectionId) {
				direction = -100;
			} else if (idSection > this.activeSectionId) {
				direction = 100;
			}
		}
		this.activeSectionId = idSection;

		// Lock events
		this.stopEvent = true;
		// Allow events on edge sections
		if (((this.previousSectionId === false) && direction < 0) || ((this.nextSectionId === false) && direction > 0)) {
			this.stopEvent = false;
		}

		if (this.stopEvent) {
			// Apply animation state
			document.documentElement.classList.add(this.options.wrapperAnimatedClass);
			this.wrapper.classList.add(this.options.wrapperAnimatedClass);
			// Remove old classes
			this.removeClasses();
			// Apply new classes
			this.setClasses();
			// Update styles
			this.setStyle();
			// Update bullets
			if (this.options.bullets) this.setActiveBullet(this.activeSectionId);

			// Apply direction delay
			let delaySection;
			if (direction < 0) {
				delaySection = this.activeSection.dataset.flsFullpageDirectionUp ? parseInt(this.activeSection.dataset.flsFullpageDirectionUp) : 500;
				document.documentElement.classList.add('--fullpage-up');
				document.documentElement.classList.remove('--fullpage-down');
			} else {
				delaySection = this.activeSection.dataset.flsFullpageDirectionDown ? parseInt(this.activeSection.dataset.flsFullpageDirectionDown) : 500;
				document.documentElement.classList.remove('--fullpage-up');
				document.documentElement.classList.add('--fullpage-down');
			}

			FLS('_FLS_FULLPAGE_GOTO', idSection)

			setTimeout(() => {
				this.events.transitionEnd();
			}, delaySection);

			// Dispatch switching event
			this.options.onSwitching(this);
			document.dispatchEvent(new CustomEvent("fpswitching", {
				detail: {
					fp: this
				}
			}));
		}
	}
	//===============================
	// Initialize bullets
	setBullets() {
		// Find bullets container
		this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);

		// Create container if not exists
		if (!this.bulletsWrapper) {
			const bullets = document.createElement('div');
			bullets.classList.add(this.options.bulletsClass);
			this.wrapper.append(bullets);
			this.bulletsWrapper = bullets;
		}

		// Create bullets
		if (this.bulletsWrapper) {
			for (let index = 0; index < this.sections.length; index++) {
				const span = document.createElement('span');
				span.classList.add(this.options.bulletClass);
				this.bulletsWrapper.append(span);
			}
		}
	}
	//===============================
	// Z-index handling
	setZIndex() {
		let zIndex = this.sections.length
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = zIndex;
			--zIndex;
		}
	}
	removeZIndex() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = ''
		}
	}
}
// Initialize and expose module
if (document.querySelector('[data-fls-fullpage]')) {
	window.addEventListener('load', () => window.flsFullpage = new FullPage(document.querySelector('[data-fls-fullpage]')))
}
