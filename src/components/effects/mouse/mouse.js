// Enabling functionality
import { isMobile, FLS } from "@js/common/functions.js";

/*
Specify the data-fls-mouse attribute for the object that will move behind the mouse

// =========
If you need additional settings, specify

Attribute											Default value
-------------------------------------------------------------------------------------------------------------------
data-fls-mouse-cx="ratio_х"					100							value greater-less offset percentage
data-fls-mouse-cy="ratio_y"					100							value greater-less offset percentage
data-fls-mouse-dxr																		against the X-axis
data-fls-mouse-dyr																		against the Y-axis
data-fls-mouse-a="speed_animation"				50								more value – more speed

// =========
If you want to read the mouse movement in the block-to the parent - then specify the attribute to the parent
data-fls-mouse-mouse-wrapper

If the image is in parallax, stretch it by >100%.
For example:
	width: 130%;
	height: 130%;
	top: -15%;
	left: -15%;
*/
class MousePRLX {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
		}
		this.config = Object.assign(defaultConfig, props);
		if (this.config.init) {
			const paralaxMouse = document.querySelectorAll('[data-fls-mouse]');
			if (paralaxMouse.length) {
				this.paralaxMouseInit(paralaxMouse);
				FLS(`_FLS_MOUSE_START`, paralaxMouse.length)
			} else {
				FLS(`_FLS_MOUSE_SLEEP`)
			}
		}
	}
	paralaxMouseInit(paralaxMouse) {
		paralaxMouse.forEach(el => {
			const paralaxMouseWrapper = el.closest('[data-fls-mouse-wrapper]');

			// Ratio. X 
			const paramСoefficientX = +el.dataset.flsMouseCx || 100;
			// Ratio. У 
			const paramСoefficientY = +el.dataset.flsMouseCy || 100;
			// Direction. Х
			const directionX = el.hasAttribute('data-fls-mouse-dxr') ? -1 : 1;
			// Direction. У
			const directionY = el.hasAttribute('data-fls-mouse-dyr') ? -1 : 1;
			// Animation speed
			const paramAnimation = el.dataset.prlxA ? +el.dataset.prlxA : 50;


			// Declaring variables
			let positionX = 0, positionY = 0;
			let coordXprocent = 0, coordYprocent = 0;

			setMouseParallaxStyle();

			// I check for the presence of a parent in which the mouse position will be read
			if (paralaxMouseWrapper) {
				mouseMoveParalax(paralaxMouseWrapper);
			} else {
				mouseMoveParalax();
			}

			function setMouseParallaxStyle() {
				const distX = coordXprocent - positionX;
				const distY = coordYprocent - positionY;
				positionX = positionX + (distX * paramAnimation / 1000);
				positionY = positionY + (distY * paramAnimation / 1000);
				el.style.cssText = `transform: translate3D(${directionX * positionX / (paramСoefficientX / 10)}%,${directionY * positionY / (paramСoefficientY / 10)}%,0) rotate(0.02deg);`;
				requestAnimationFrame(setMouseParallaxStyle);
			}
			function mouseMoveParalax(wrapper = window) {
				wrapper.addEventListener("mousemove", function (e) {
					const offsetTop = el.getBoundingClientRect().top + window.scrollY;
					if (offsetTop >= window.scrollY || (offsetTop + el.offsetHeight) >= window.scrollY) {
						// Getting the block width and height
						const parallaxWidth = window.innerWidth;
						const parallaxHeight = window.innerHeight;
						// Zero in the middle
						const coordX = e.clientX - parallaxWidth / 2;
						const coordY = e.clientY - parallaxHeight / 2;
						// We get interest
						coordXprocent = coordX / parallaxWidth * 100;
						coordYprocent = coordY / parallaxHeight * 100;
					}
				});
			}
		});
	}
}
// Launching it
document.querySelector('[data-fls-mouse]') ?
	window.addEventListener('load', new MousePRLX({})) : null




