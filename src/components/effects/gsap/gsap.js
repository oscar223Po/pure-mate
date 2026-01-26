// Enabling functionality
// Docs: https://www.npmjs.com/package/gsap
import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

/* ----- Helper Functions ----- */
const splitTextAndMarkTargets = (element, targetIndices) => {
	if (!element) return []
	const text = element.textContent
	element.textContent = ''

	const spans = text.split('').map((char, index) => {
		const span = document.createElement('span')
		span.textContent = char
		Object.assign(span.style, { display: 'inline-block', position: 'relative' })

		if (targetIndices.includes(index)) {
			span.classList.add('jump-target')
		}

		element.appendChild(span)
		return span
	})

	return element.querySelectorAll('.jump-target')
}
const getRelativeCenter = (targetEl, parentEl) => {
	const pRect = parentEl.getBoundingClientRect()
	const tRect = targetEl.getBoundingClientRect()
	return {
		x: tRect.left - pRect.left + tRect.width / 2 - pRect.width / 2,
		y: tRect.top - pRect.top + tRect.height / 2 - pRect.height / 2
	}
}

/* ----- Main Animations ----- */
const initOurAnimations = () => {
	const our = document.querySelector('.our')
	if (!our) return

	const ui = {
		head: our.querySelector('.our__head'),
		circle: our.querySelector('.our__circle'),
		sections: our.querySelectorAll('.our__section'),
		targetWord: our.querySelector('.target-word')
	}

	if (!ui.targetWord) {
		console.warn('GSAP Warning: .target-word not found')
		return
	}

	// D e ı g n  → прыжки по D, e, ı
	const jumpTargets = splitTextAndMarkTargets(ui.targetWord, [0, 1, 3])
	const iSpan = jumpTargets[2]
	const totalSections = ui.sections.length

	const mm = gsap.matchMedia()

	mm.add(
		{
			isDesktop: '(min-width: 992px)',
			isTablet: '(max-width: 991.98px) and (min-width: 768px)',
			isMobile: '(max-width: 767.98px)'
		},
		context => {
			const { isMobile, isTablet, isDesktop } = context.conditions

			// 1. Configuration
			const config = {
				circleStartWidth: isMobile ? 77 : isDesktop ? 150 : 115,
				jumpYOffset: isMobile ? -57 : isTablet ? -90 : -120,
				jumpHighPoint: isMobile ? -95 : isTablet ? -170 : -200,

				// The logic of landing:
				jumpLandingFix: isMobile ? -52 : isTablet ? -82 : -110
			}

			// -- Set Initial States --
			gsap.set(ui.circle, {
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
			gsap.set(ui.head, { top: '100%', opacity: 0, yPercent: 0 })
			gsap.set(ui.sections, { opacity: 0, y: 40 })

			// -- Pre-animation --
			gsap.fromTo(
				ui.circle,
				{ top: '100%', width: config.circleStartWidth, yPercent: 0 },
				{
					top: '50%',
					width: 3000,
					yPercent: -50,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: our,
						start: 'top 80%',
						end: 'top top',
						scrub: true
					}
				}
			)

			// -- Main Timeline --
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: our,
					start: 'top top',
					end: () => `+=${window.innerHeight * (totalSections + 0.8)}`,
					pin: true,
					scrub: 1,
					anticipatePin: 1
				}
			})

			tl.to(ui.circle, {
				width: config.circleStartWidth,
				duration: 0.5, // 1
				ease: 'power3.inOut'
			})

			// Head Animation
			tl.to(ui.head, {
				top: '50%',
				opacity: 1,
				duration: 0.5, // 1
				yPercent: 50,
				ease: 'power3.out'
			})
				.to(ui.head, {
					top: '+=100',
					duration: 0.15, // 0.3
					ease: 'power2.inOut'
				})
				.to(ui.head, {
					top: '50%',
					duration: 0.5, // 1
					yPercent: -50,
					ease: 'power3.out'
				})

			// Circle Lift
			tl.to(
				ui.circle,
				{
					scale: isMobile ? 0.06 : isDesktop ? 0.1 : 0.09,
					duration: 0.25, // 0.5
					yPercent: -170,
					ease: 'power3.inOut'
				},
				'<'
			)

			// Jumping Logic
			if (jumpTargets.length >= 3) {
				const getPos = index => getRelativeCenter(jumpTargets[index], our)

				// Jump to "D"
				tl.to(ui.circle, {
					x: () => getPos(0).x,
					y: () => getPos(0).y + config.jumpYOffset,
					duration: 0.3, // 0.6
					ease: 'power2.in',
					yPercent: 0
				})

				// Jump to "e"
				const posE = () => getPos(1)
				tl.to(
					ui.circle,
					{
						x: () => posE().x,
						duration: 0.2, // 0.4
						ease: 'power1.inOut'
					},
					'jump-to-e'
				)

				tl.to(
					ui.circle,
					{
						keyframes: {
							'0%': { y: () => getPos(0).y + config.jumpYOffset },
							'50%': { y: () => getPos(0).y + config.jumpHighPoint },
							'100%': { y: () => posE().y + config.jumpLandingFix }
						},
						duration: 0.2, // 0.4
						ease: 'sine.inOut'
					},
					'jump-to-e'
				)

				// Jump to "ı" (Change to i)
				const posI = () => getPos(2)

				tl.to(
					ui.circle,
					{
						x: () => posI().x,
						duration: 0.2, // 0.4
						ease: 'power1.inOut'
					},
					'jump-to-i'
				)

				tl.to(
					ui.circle,
					{
						keyframes: {
							'0%': { y: () => posE().y + config.jumpLandingFix },
							'50%': { y: () => posE().y + config.jumpHighPoint },
							'100%': { y: () => posI().y + (config.jumpLandingFix + 3) }
						},
						duration: 0.2, // 0.4
						ease: 'sine.inOut',

						// Immediately Reaction
						onUpdate: function () {
							// this.progress() return from 0 to 1.
							// If the progress is less than 1 (circle in flight or just started to break away when reversing)
							// and the letter is still 'i', we immediately change it back to 'a'.
							if (this.progress() < 1 && iSpan && iSpan.textContent === 'i') {
								iSpan.textContent = 'ı'
							}
						},
						// It is triggered only when the circle has landed completely (forward)
						onComplete: () => {
							if (iSpan) iSpan.textContent = 'i'
						}
					},
					'jump-to-i'
				)

				tl.to(ui.circle, { scale: 0, duration: 0.1, ease: 'power3.out' }) // duration 0.2
			}

			// Head Leaves
			tl.to(ui.head, {
				top: '50%',
				duration: 0.5, // 1
				yPercent: -50,
				ease: 'power3.out'
			}).to(ui.head, {
				top: 100,
				duration: 0.3, // 0.6
				yPercent: 0,
				ease: 'power3.out'
			})
			tl.set(ui.head, { top: 0, position: 'relative' })

			// Sections Sequence
			ui.sections.forEach((section, i) => {
				tl.to(section, {
					opacity: 1,
					y: 0,
					duration: 0.3, // 0.6
					ease: 'power3.out',
					onStart: () => section.classList.add('is-active'),
					onReverseComplete: () => section.classList.remove('is-active')
				})

				if (!isMobile && i < totalSections - 1) {
					tl.to(section, {
						opacity: 0,
						y: -40,
						duration: 0.2, // 0.4
						ease: 'power2.in',
						onComplete: () => section.classList.remove('is-active')
					})
				}
			})
		}
	)
}
const initCauseAnimations = () => {
	const cause = document.querySelector('.cause')
	if (!cause) return

	const sections = gsap.utils.toArray('.cause__section')

	// Making sure that everything is hidden except the first one
	gsap.set(sections, { autoAlpha: 0, zIndex: 0 })
	gsap.set(sections[0], { autoAlpha: 1, zIndex: 1 })

	sections.forEach((section, i) => {
		if (i === 0) return
		const text = section.querySelector('.cause__below')
		if (text) {
			gsap.set(text, { y: 30, autoAlpha: 0 })
		}
	})

	// 2. Create Timeline
	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: cause,
			start: 'top top',
			end: () => `+=${sections.length * 100}%`,
			pin: true,
			scrub: 0.5,
			anticipatePin: 1
		}
	})

	// Pause at the beginning so that the user can read the first slide.
	tl.to({}, { duration: 0.5 })

	// 3. Animation cycle
	sections.forEach((section, i) => {
		if (i === 0) return

		const prevSection = sections[i - 1]
		const currentText = section.querySelector('.cause__below')

		// Grouping animations so that they go in one step

		// A) Removing the previous section
		tl.to(prevSection, {
			autoAlpha: 0,
			duration: 0.1,
			ease: 'none'
		})

		// B) Showing the current section
		tl.to(
			section,
			{
				autoAlpha: 1,
				duration: 0.1,
				ease: 'none'
			},
			'<'
		)

		// C) Text animation
		if (currentText) {
			tl.to(
				currentText,
				{
					y: 0,
					autoAlpha: 1,
					duration: 0.5,
					ease: 'power2.out'
				},
				'<'
			)
		}

		// A short pause after the slide appears before changing the next one
		tl.to({}, { duration: 1 })
	})
}
const initPosterAnimations = () => {
	const mm = gsap.matchMedia()

	mm.add('(min-width: 768px)', () => {
		const poster = document.querySelector('.poster')
		if (!poster) return

		const posterImage = poster.querySelector('.poster__image')

		gsap.set(posterImage, {
			top: '100%',
			left: '50%',
			xPercent: -50,
			yPercent: 0,
			width: 995,
			position: 'absolute',
			transformOrigin: '50% 50%'
		})

		gsap.fromTo(
			posterImage,
			{ top: '100%', yPercent: 0 },
			{
				top: '50%',
				yPercent: -50,
				ease: 'none',
				scrollTrigger: {
					trigger: poster,
					start: 'top 80%',
					end: 'top top',
					scrub: true
				}
			}
		)

		ScrollTrigger.create({
			trigger: poster,
			start: 'top top',
			onEnter: () => gsap.set(posterImage, { top: '50%', yPercent: -50 })
		})

		const pl = gsap.timeline({
			scrollTrigger: {
				trigger: poster,
				start: 'top top',
				end: '+=200%',
				pin: true,
				scrub: true,
				anticipatePin: 1
			}
		})

		pl.to(posterImage, { width: 15000, ease: 'none' }).to(
			poster,
			{ backgroundColor: '#0b26c5', ease: 'none' },
			'<'
		)
	})
}

/* ----- Initialisation ----- */
window.addEventListener('load', () => {
	initOurAnimations()
	initCauseAnimations()
	initPosterAnimations()
})
