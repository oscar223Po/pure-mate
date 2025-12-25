/*
Work documentation in the template: 
Slider documentation: https://swiperjs.com/
Snippet (HTML): swiper
*/

// Connecting the Swiper slider with node_modules
// If necessary, we connect additional slider modules by specifying them in {} separated by commas
// Example: { Navigation, Autoplay }
import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
/*
Main slider modules:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
For more information, see https://swiperjs.com/
*/

// Swiper Styles
// Connecting basic styles
import "./slider.scss"
// Full set of styles with node_modules
// import 'swiper/css/bundle';

// Initializing sliders
function initSliders() {
	// List of sliders
	// Check if there is a slider on the page
	if (document.querySelector('.swiper')) {
		// Creating a slider
		new Swiper('.swiper', {
			// Connecting slider modules
			// for a specific case
			modules: [Navigation],
			observer: true,
			observeParents: true,
			slidesPerView: 2.7,
			spaceBetween: 5,
			//autoHeight: true,
			speed: 800,

			//touchRatio: 0,
			//simulateTouch: false,
			//loop: true,
			//preloadImages: false,
			//lazy: true,

			/*
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			*/

			/*
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			*/

			/*
			scrollbar: {
				el: '.swiper-scrollbar',
				draggable: true,
			},
			*/

			navigation: {
				prevEl: '.swiper-button-prev',
				nextEl: '.swiper-button-next',
			},
			/*
			breakpoints: {
				640: {
					slidesPerView: 1,
					spaceBetween: 0,
					autoHeight: true,
				},
				768: {
					slidesPerView: 2,
					spaceBetween: 20,
				},
				992: {
					slidesPerView: 3,
					spaceBetween: 20,
				},
				1268: {
					slidesPerView: 4,
					spaceBetween: 30,
				},
			},
			*/
			// Events
			on: {

			}
		});
	}
}
document.querySelector('[data-fls-slider]') ?
	window.addEventListener("load", initSliders) : null