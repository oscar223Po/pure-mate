// FLS (Full Logging System)
export function FLS(text, vars = '') {
	if (flsLogging) {
		if (flsLang[text]) {
			if (Array.isArray(vars)) {
				let i = 0
				text = flsLang[text].replace(/@@/g, () => vars[i++])
			} else {
				text = text.replace(text, flsLang[text].replace('@@', vars))
			}
		}
		setTimeout(() => {
			if (text.startsWith('(!)')) {
				console.warn(text.replace('(!)', ''))
			} else if (text.startsWith('(!!)')) {
				console.error(text.replace('(!!)', ''))
			} else {
				console.log(text)
			}
		}, 0);
	}
}
/* Checking your mobile browser */
export const isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };
/* Adding a touch class for HTML if the browser is mobile */
export function addTouchAttr() {
	// Adding data-fls-touch for HTML if the browser is mobile
	if (isMobile.any()) document.documentElement.setAttribute('data-fls-touch', '')
}
// Adding loaded for HTML after the page is fully loaded
export function addLoadedAttr() {
	if (!document.documentElement.hasAttribute('data-fls-preloader-loading')) {
		window.addEventListener("load", function () {
			setTimeout(function () {
				document.documentElement.setAttribute('data-fls-loaded', '')
			}, 0);
		});
	}
}
// Getting a hash on the site address
export function getHash() {
	if (location.hash) { return location.hash.replace('#', ''); }
}
// Specifying the hash to the site address
export function setHash(hash) {
	hash = hash ? `#${hash}` : window.location.href.split('#')[0];
	history.pushState('', '', hash);
}
// Auxiliary modules for smooth opening and closing of an object
export let slideUp = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('--slide')) {
		target.classList.add('--slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = `${target.offsetHeight}px`;
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = !showmore ? true : false;
			!showmore ? target.style.removeProperty('height') : null;
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			!showmore ? target.style.removeProperty('overflow') : null;
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('--slide');
			// Creating an event
			document.dispatchEvent(new CustomEvent("slideUpDone", {
				detail: {
					target: target
				}
			}));
		}, duration);
	}
}
export let slideDown = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('--slide')) {
		target.classList.add('--slide');
		target.hidden = target.hidden ? false : null;
		showmore ? target.style.removeProperty('height') : null;
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('--slide');
			// Creating an event
			document.dispatchEvent(new CustomEvent("slideDownDone", {
				detail: {
					target: target
				}
			}));
		}, duration);
	}
}
export let slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return slideDown(target, duration);
	} else {
		return slideUp(target, duration);
	}
}
// Auxiliary scroll and jump lock modules
export let bodyLockStatus = true
export let bodyLockToggle = (delay = 500) => {
	if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
		bodyUnlock(delay)
	} else {
		bodyLock(delay)
	}
}
export let bodyUnlock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
		setTimeout(() => {
			lockPaddingElements.forEach(lockPaddingElement => {
				lockPaddingElement.style.paddingRight = ''
			});
			document.body.style.paddingRight = ''
			document.documentElement.removeAttribute("data-fls-scrolllock")
		}, delay)
		bodyLockStatus = false
		setTimeout(function () {
			bodyLockStatus = true
		}, delay)
	}
}
export let bodyLock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-fls-lp]")
		const lockPaddingValue = window.innerWidth - document.body.offsetWidth + 'px'
		lockPaddingElements.forEach(lockPaddingElement => {
			lockPaddingElement.style.paddingRight = lockPaddingValue
		});

		document.body.style.paddingRight = lockPaddingValue
		document.documentElement.setAttribute("data-fls-scrolllock", '')

		bodyLockStatus = false
		setTimeout(function () {
			bodyLockStatus = true
		}, delay)
	}
}
// Get a name by value in an object
export function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}
// Get numbers from a string
export function getDigFromString(item) {
	return parseInt(item.replace(/[^\d]/g, ''))
}
// Formatting digits like 100,000,000
export function getDigFormat(item, sepp = ' ') {
	return item.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${sepp}`);
}
// Remove class from all array elements
export function removeClasses(array, className) {
	for (var i = 0; i < array.length; i++) {
		array[i].classList.remove(className);
	}
}
// Array unicalization
export function uniqArray(array) {
	return array.filter((item, index, self) => self.indexOf(item) === index)
}
// Function for getting an index inside the parent element
export function indexInParent(parent, element) {
	const array = Array.prototype.slice.call(parent.children);
	return Array.prototype.indexOf.call(array, element);
};
// The function checks whether the object is visible
export function isHidden(el) {
	return (el.offsetParent === null)
}
// Processing media requests from attributes
export function dataMediaQueries(array, dataSetValue) {
	const media = Array.from(array)
		.filter(item => item.dataset[dataSetValue])
		.map(item => {
			const [value, type = 'max'] = item.dataset[dataSetValue].split(',');
			return { value, type, item };
		});

	if (media.length === 0) return [];

	// We get unique breakpoints
	const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
	const uniqueQueries = [...new Set(breakpointsArray)];

	return uniqueQueries.map(query => {
		const [mediaQuery, mediaBreakpoint, mediaType] = query.split(',');
		const matchMedia = window.matchMedia(mediaQuery);

		// Filtering objects with the desired conditions
		const itemsArray = media.filter(item => item.value === mediaBreakpoint && item.type === mediaType);

		return { itemsArray, matchMedia }
	});
}
// Smooth proctutka module to the block
export const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
	const targetBlockElement = document.querySelector(targetBlock);
	if (targetBlockElement) {
		let headerItem = '';
		let headerItemHeight = 0;
		if (noHeader) {
			headerItem = 'header.header';
			const headerElement = document.querySelector(headerItem);
			if (!headerElement.classList.contains('--header-scroll')) {
				headerElement.style.cssText = `transition-duration: 0s;`;
				headerElement.classList.add('--header-scroll');
				headerItemHeight = headerElement.offsetHeight;
				headerElement.classList.remove('--header-scroll');
				setTimeout(() => {
					headerElement.style.cssText = ``;
				}, 0);
			} else {
				headerItemHeight = headerElement.offsetHeight;
			}
		}
		// Close the menu if it is open
		if (document.documentElement.hasAttribute("data-fls-menu-open")) {
			bodyUnlock()
			document.documentElement.removeAttribute("data-fls-menu-open")
		}
		// Scrolling using standard tools
		let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
		targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
		targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
		window.scrollTo({
			top: targetBlockElementPosition,
			behavior: "smooth"
		});
		FLS(`_FLS_SCROLLTO_GOTO`, targetBlock);
	} else {
		FLS(`_FLS_SCROLLTO_WARN`, targetBlock);
	}
}
export function formatDate(date, sepp) {
	const d = new Date(date);
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}${sepp}${month}${sepp}${year}`;
}
