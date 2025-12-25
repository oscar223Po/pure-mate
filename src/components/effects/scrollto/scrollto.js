// Enabling functionality
import { isMobile, gotoBlock, getHash, FLS, bodyUnlock } from "@js/common/functions.js";

// Smooth page navigation
export function pageNavigation() {
	// We work by clicking on the item
	document.addEventListener("click", pageNavigationAction);
	// If scrollWatcher is enabled, highlight the current menu item
	document.addEventListener("watcherCallback", pageNavigationAction);
	// Main function
	function pageNavigationAction(e) {
		if (e.type === "click") {
			const targetElement = e.target;
			if (targetElement.closest('[data-fls-scrollto]')) {
				const gotoLink = targetElement.closest('[data-fls-scrollto]');
				const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : '';
				const noHeader = gotoLink.hasAttribute('data-fls-scrollto-header') ? true : false;
				const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
				const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
				if (window.fullpage) {
					const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest('[data-fls-fullpage-section]');
					const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
					if (fullpageSectionId !== null) {
						window.fullpage.switchingSection(fullpageSectionId);
						// Close the menu if it is open
						if (document.documentElement.hasAttribute("data-fls-menu-open")) {
							bodyUnlock()
							document.documentElement.removeAttribute("data-fls-menu-open")
						}
					}
				} else {
					gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
				}
				e.preventDefault();
			}
		} else if (e.type === "watcherCallback" && e.detail) {
			const entry = e.detail.entry;
			const targetElement = entry.target;
			// Processing navigation items. if the navigator value is specified, highlight the current menu item
			if (targetElement.dataset.flsWatcher === 'navigator') {
				const navigatorActiveItem = document.querySelector(`[data-fls-scrollto].--navigator-active`);
				let navigatorCurrentItem;
				if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
					navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
				} else if (targetElement.classList.length) {
					for (let index = 0; index < targetElement.classList.length; index++) {
						const element = targetElement.classList[index];
						if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
							navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
							break;
						}
					}
				}
				if (entry.isIntersecting) {
					// We see the object
					// navigatorActiveItem ? navigatorActiveItem.classList.remove('--navigator-active') : null;
					navigatorCurrentItem ? navigatorCurrentItem.classList.add('--navigator-active') : null;
					//const activeItems = document.querySelectorAll('.--navigator-active');
					//activeItems.length > 1 ? chooseOne(activeItems) : null
				} else {
					// We don't see the object
					navigatorCurrentItem ? navigatorCurrentItem.classList.remove('--navigator-active') : null;
				}
			}
		}
	}
	function chooseOne(activeItems) { }
	// Scroll through the hash
	if (getHash()) {
		let goToHash;
		if (document.querySelector(`#${getHash()}`)) {
			goToHash = `#${getHash()}`;
		} else if (document.querySelector(`.${getHash()}`)) {
			goToHash = `.${getHash()}`;
		}
		goToHash ? gotoBlock(goToHash) : null;
	}
}

document.querySelector('[data-fls-scrollto]') ?
	window.addEventListener('load', pageNavigation) : null