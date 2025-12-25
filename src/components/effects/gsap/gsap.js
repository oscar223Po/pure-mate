// Enabling functionality
// Docs: https://www.npmjs.com/package/gsap
import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

// Styles
// import './gsap.scss'

function posterScroll() {
	const poster = document.querySelector('.poster')
	const image = poster.querySelector('.poster__image')

	if (!poster || !image) {
		console.warn('Poster elements not found')
		return
	}

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: poster,
			start: 'top top',
			end: '+=200%', // long scroll
			pin: true, // fix section
			scrub: true, // scroll = timeline
			anticipatePin: 1
		}
	})

	// 1. Image from bottom to center
	tl.to(image, {
		top: '50%',
		translateY: '-50%',
		scale: 1,
		duration: 1,
		ease: 'none'
	})

	// 2. Effect scale + blur
	tl.to(image, {
		scale: 15,
		duration: 1.5,
		ease: 'none'
	})

	// 3. Background changing
	tl.to(
		poster,
		{
			backgroundColor: '#0b26c5',
			duration: 2,
			ease: 'none',
			delay: 0.3
		},
		'<'
	)
}

document.querySelector('[data-fls-gsap]')
	? window.addEventListener('load', posterScroll)
	: null

/*
	const chars = document.querySelectorAll('[data-fls-splittype][data-fls-gsap] .char')
	console.log(chars);
	gsap.from(chars, {
		opacity: 0,
		y: 20,
		duration: 0.5,
		stagger: { amount: 0.5 },
	})
*/
