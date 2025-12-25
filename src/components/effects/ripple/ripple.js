// Enabling functionality
import { FLS } from "@js/common/functions.js";

import './ripple.scss';

export function rippleEffect() {
	// Button click event
	document.addEventListener("click", function (e) {
		const targetItem = e.target;
		if (targetItem.closest('[data-fls-ripple]')) {
			// Constants
			const button = targetItem.closest('[data-fls-ripple]');
			const ripple = document.createElement('span');
			const diameter = Math.max(button.clientWidth, button.clientHeight);
			const radius = diameter / 2;

			// Creating an element
			ripple.style.width = ripple.style.height = `${diameter}px`;
			ripple.style.left = `${e.pageX - (button.getBoundingClientRect().left + scrollX) - radius}px`;
			ripple.style.top = `${e.pageY - (button.getBoundingClientRect().top + scrollY) - radius}px`;
			ripple.classList.add('--ripple');

			// Deleting an existing element (optional)
			button.dataset.ripple === 'once' && button.querySelector('--ripple') ?
				button.querySelector('--ripple').remove() : null;

			// Adding an element
			button.appendChild(ripple);

			// Getting the animation action time
			const timeOut = getAnimationDuration(ripple);

			// Deleting an item
			setTimeout(() => {
				ripple ? ripple.remove() : null;
			}, timeOut);

			// Function for getting the animation action time
			function getAnimationDuration() {
				const aDuration = window.getComputedStyle(ripple).animationDuration;
				return aDuration.includes('ms') ?
					aDuration.replace("ms", '') : aDuration.replace("s", '') * 1000;
			}
		}
	});
}
document.querySelector('[data-fls-ripple]') ?
	window.addEventListener('load', rippleEffect) : null