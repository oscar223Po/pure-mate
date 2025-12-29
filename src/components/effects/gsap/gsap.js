// Enabling functionality
// Docs: https://www.npmjs.com/package/gsap
import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const initAnimations = () => {
	const mm = gsap.matchMedia()

	// Desktop only
	mm.add('(min-width: 767.98px)', () => {
		/* ----- Our ----- */
		const our = document.querySelector('.our')
		if (!our) return

		const head = our.querySelector('.our__head')
		const circle = our.querySelector('.our__circle')
		const sections = our.querySelectorAll('.our__section')
		const total = sections.length

		// Working with chars ------------------------
		const targetWord = our.querySelector('.target-word')
		// If there is no element, just log out so as not to break the site
		if (!targetWord) {
			console.warn('GSAP Warning: Element .target-word not found inside .our')
			return
		}
		// We break the text into letters and mark the targets for jumping
		const chars = targetWord.textContent.split('')
		targetWord.textContent = '' // Clearing the old text
		chars.forEach((char, index) => {
			const span = document.createElement('span')
			span.textContent = char
			span.style.display = 'inline-block'
			span.style.position = 'relative'

			// Logic: "Design" -> D(0), e(1), s(2), i(3), g(4), n(5)
			if (index === 0 || index === 1 || index === 3) {
				span.classList.add('jump-target') // Adding a class for goals
			}

			targetWord.appendChild(span)
		})
		const jumpTargets = our.querySelectorAll('.jump-target')

		// State
		gsap.set(circle, {
			top: '100%',
			left: '50%',
			xPercent: -50,
			yPercent: 0,
			x: 0,
			y: 0,
			scale: 1,
			position: 'absolute',
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

		// Timeline
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

		// Circle Animation
		tl.to(circle, {
			top: '50%',
			scale: 20,
			yPercent: -50,
			duration: 1.2,
			ease: 'power3.out'
		}).to(circle, {
			scale: 1,
			duration: 1,
			ease: 'power3.inOut'
		})

		// Title Animation (Up -> Down -> Fix)
		tl.to(head, {
			top: '50%',
			opacity: 1,
			duration: 1,
			yPercent: 50,
			ease: 'power3.out'
		})
			// Push Effect
			.to(head, {
				top: '+=100',
				duration: 0.3,
				ease: 'power2.inOut'
			})
			.to(head, {
				top: '50%',
				duration: 1,
				yPercent: -50,
				ease: 'power3.out'
			})
		// Circle Lift
		tl.to(
			circle,
			{
				scale: 0.1,
				duration: 0.5,
				yPercent: -170,
				ease: 'power3.inOut'
			},
			'<'
		)

		// Chars
		if (jumpTargets.length >= 3) {
			// Coordinate calculation function
			const getCord = targetEl => {
				const pRect = our.getBoundingClientRect()
				const tRect = targetEl.getBoundingClientRect()

				return {
					x: tRect.left - pRect.left + tRect.width / 2 - pRect.width / 2,
					y: tRect.top - pRect.top + tRect.height / 2 - pRect.height / 2
				}
			}

			// 1. Jump to the letter "D" (target 0)
			const posD = () => getCord(jumpTargets[0])

			tl.to(circle, {
				x: () => posD().x,
				y: () => posD().y - 120,
				duration: 0.6,
				ease: 'power2.in', // Fall
				yPercent: 0 // Resetting the percentage offset
			})

			// 2. Jump to the letter "e" (target 1)
			const posE = () => getCord(jumpTargets[1])

			// Sideways movement (linear)
			tl.to(
				circle,
				{
					x: () => posE().x,
					duration: 0.4,
					ease: 'power1.inOut'
				},
				'jump-to-e'
			)

			// Up-and-down movement (arc)
			tl.to(
				circle,
				{
					keyframes: {
						'0%': { y: () => posD().y - 120 },
						'50%': { y: () => posD().y - 200 }, // Jump height
						'100%': { y: () => posE().y - 110 } // Landing
					},
					duration: 0.4,
					ease: 'sine.inOut'
				},
				'jump-to-e'
			)

			// 3. Jump to the letter "i" (target 2)
			const posI = () => getCord(jumpTargets[2])

			// Sideways movement
			tl.to(
				circle,
				{
					x: () => posI().x,
					duration: 0.4,
					ease: 'power1.inOut'
				},
				'jump-to-i'
			)

			// Up-and-down movement (arc) + accurate spot-on
			tl.to(
				circle,
				{
					keyframes: {
						'0%': { y: () => posE().y - 110 },
						'50%': { y: () => posE().y - 200 },
						'100%': { y: () => posI().y - 107 } // The position of the point above the i
					},
					duration: 0.4,
					ease: 'sine.inOut'
				},
				'jump-to-i'
			)

			// 4. Final: Disappearance
			tl.to(circle, {
				scale: 0,
				duration: 0.2,
				ease: 'power3.out'
				// ease: 'back.in(2)'
			})
		}

		// Head leaves
		tl.to(head, {
			top: '50%',
			duration: 1,
			yPercent: -50,
			ease: 'power3.out'
		}).to(head, {
			top: 100,
			duration: 0.6,
			yPercent: 0,
			ease: 'power3.out'
		})
		tl.set(head, {
			top: 0,
			position: 'relative'
		})

		// Sections Animations
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

		/* ----- Poster ----- */
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
