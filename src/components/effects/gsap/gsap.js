// Enabling functionality
// Docs: https://www.npmjs.com/package/gsap
import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const initAnimations = () => {
	const mm = gsap.matchMedia()

	// Desktop only
	mm.add('(min-width: 767.98px)', () => {
		const our = document.querySelector('.our')
		if (!our) return

		const head = our.querySelector('.our__head')
		const circle = our.querySelector('.our__circle')
		const sections = our.querySelectorAll('.our__section')
		const total = sections.length

		// 1. State
		gsap.set(circle, {
			top: '100%',
			left: '50%',
			xPercent: -50,
			yPercent: 0,
			scale: 1,
			transformOrigin: '50% 50%'
		})
		gsap.set(head, {
			top: '100%',
			opacity: 0,
			yPercent: 0
		})
		gsap.set(sections, {
			opacity: 0,
			y: 40
		})

		// 2. Create Timeline
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: our,
				start: 'top top',
				end: () => `+=${window.innerHeight * (total + 1.5)}`,
				pin: true,
				scrub: 1,
				anticipatePin: 1
			}
		})

		// 3. Circle Animation
		tl.to(circle, {
			top: '50%',
			scale: 20,
			yPercent: -50,
			duration: 1.2,
			ease: 'power3.out'
		})
			.to(circle, {
				scale: 1,
				duration: 1,
				ease: 'power3.inOut'
			})
			.to(circle, {
				scale: 0,
				duration: 1,
				ease: 'power3.inOut'
			})

		// 4. Title Animation (Up -> Down -> Fix)
		tl.to(head, {
			top: '50%',
			opacity: 1,
			duration: 1,
			yPercent: -50,
			ease: 'power3.out'
		})
			.to(head, {
				top: '+=100',
				duration: 0.3,
				ease: 'power2.inOut'
			})
			.to(head, {
				top: 100,
				duration: 0.6,
				yPercent: 0,
				ease: 'power3.out'
			})
		tl.set(head, {
			top: 0,
			position: 'relative'
		})

		// 4. Section Animations
		sections.forEach((section, i) => {
			tl.to(section, {
				opacity: 1,
				y: 0,
				duration: 0.6,
				ease: 'power3.out',
				onStart: () => section.classList.add('is-active'),
				onReverseComplete: () => section.classList.remove('is-active')
			})

			if (i < total - 1) {
				tl.to(
					section,
					{
						opacity: 0,
						y: -40,
						duration: 0.4,
						ease: 'power2.in',
						onComplete: () => section.classList.remove('is-active')
					}
					// '+=0.5'
				) // Pause between sections
			}
		})

		// Poster
		const poster = document.querySelector('.poster')
		if (poster) {
			const posterImage = poster.querySelector('.poster__image')

			gsap
				.timeline({
					scrollTrigger: {
						trigger: poster,
						start: 'top top',
						end: '+=200%',
						pin: true,
						scrub: true
					}
				})
				.to(posterImage, {
					top: '50%',
					yPercent: -50,
					scale: 1,
					duration: 1,
					ease: 'none'
				})
				.to(posterImage, {
					scale: 15,
					duration: 1.5,
					ease: 'none'
				})
				.to(
					poster,
					{
						backgroundColor: '#0b26c5',
						duration: 2,
						ease: 'none'
					},
					'<'
				)
		}

		// Clean Resize
		return () => {
			tl.kill()
			ScrollTrigger.getAll().forEach(st => st.kill())
		}
	})
}

window.addEventListener('load', initAnimations)
