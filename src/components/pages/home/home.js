// Hero Gif Last Frame
/*
setTimeout(() => {
	document.getElementById('hero-gif').style.display = 'none'
	document.getElementById('hero-last-frame').hidden = false
}, 4100) // длительность гифки

setTimeout(() => {
	document.getElementById('why-gif').style.display = 'none'
	document.getElementById('why-last-frame').hidden = false
}, 3400) // длительность гифки
*/

const poster = document.querySelector('.poster')
const wrapper = document.querySelector('.page')

let isPlayed = false
let lockedScrollY = 0

const lockScrollAtPoster = () => {
	const posterTop = poster.offsetTop

	// 🔒 ЖЕСТКО ставим скролл ровно на начало секции
	window.scrollTo(0, posterTop)

	lockedScrollY = posterTop

	wrapper.style.position = 'fixed'
	wrapper.style.top = `-${lockedScrollY}px`
	wrapper.style.left = '0'
	wrapper.style.width = '100%'
	wrapper.style.zIndex = '1'
}

const unlockScroll = () => {
	wrapper.style.position = ''
	wrapper.style.top = ''
	wrapper.style.left = ''
	wrapper.style.width = ''

	window.scrollTo(0, lockedScrollY)
}

const goToNextSection = () => {
	const next = poster.nextElementSibling
	if (!next) return

	next.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	})
}

window.addEventListener('scroll', () => {
	if (isPlayed) return

	const rect = poster.getBoundingClientRect()

	// 🔑 ВАЖНО: срабатываем ДО того, как секция ушла вверх
	if (rect.top <= 0 && rect.bottom > window.innerHeight * 0.3) {
		isPlayed = true
		lockScrollAtPoster()

		const ANIMATION_TIME = 2800

		setTimeout(() => {
			unlockScroll()
			goToNextSection()

			// 🧼 корректно выводим poster из игры
			poster.removeAttribute('data-fls-watcher')
			poster.classList.add('poster-post')
		}, ANIMATION_TIME)
	}
})

// Animation For Pc Complex Section
const q = (root, sel) => root.querySelector(sel)
const SHOW = el => el && el.classList.remove('disable')
const HIDE = el => el && el.classList.add('disable')
function getPieces(root, prefix) {
	return {
		queen: q(root, `.${prefix}-queen`),
		pawn: q(root, `.${prefix}-pawn`),
		queen01: q(root, `.${prefix}-queen-01`),
		queen02: q(root, `.${prefix}-queen-02`),
		horse: q(root, `.${prefix}-horse`),
		horse01: q(root, `.${prefix}-horse-01`),
		elephant: q(root, `.${prefix}-elephant`)
	}
}
function resetBoard(p) {
	SHOW(p.queen)
	SHOW(p.pawn)

	HIDE(p.queen01)
	HIDE(p.queen02)
	HIDE(p.horse)
	HIDE(p.horse01)
	HIDE(p.elephant)
}
function playAnimation(root, prefix) {
	const p = getPieces(root, prefix)

	function loop() {
		resetBoard(p)

		setTimeout(() => {
			HIDE(p.pawn)
			HIDE(p.queen)
			SHOW(p.queen01)
		}, 800)

		setTimeout(() => {
			SHOW(p.horse)
		}, 1400)

		setTimeout(() => {
			HIDE(p.horse)
			SHOW(p.horse01)

			HIDE(p.queen01)
			SHOW(p.queen02)
		}, 2200)

		setTimeout(() => {
			HIDE(p.horse01)
			HIDE(p.queen02)
			SHOW(p.queen01)
		}, 3000)

		setTimeout(() => {
			SHOW(p.elephant)
		}, 3600)

		setTimeout(() => {
			HIDE(p.elephant)
			HIDE(p.queen01)
			SHOW(p.queen)
		}, 4400)

		setTimeout(loop, 5200)
	}

	loop()
}
playAnimation(document.querySelector('.complex__board--pc'), 'fm')
playAnimation(document.querySelector('.complex__board--mb'), 'sm')

// Our Step Section
const ourSection = document.querySelector('.our')
const ourItems = document.querySelectorAll('.our__section')
const ourSteps = ourItems.length
window.addEventListener('scroll', () => {
	const rect = ourSection.getBoundingClientRect()
	const viewport = window.innerHeight

	const progress = Math.min(
		Math.max(-rect.top / (rect.height - viewport), 0),
		1
	)

	let index = Math.floor(progress * ourSteps)

	// 🔒 фикс последнего элемента
	if (index >= ourSteps) {
		index = ourSteps - 1
	}

	ourItems.forEach((el, i) => {
		el.classList.toggle('is-active', i === index)
	})
})

// Add Atribut Spoller
const BREAKPOINT = 767.98
function handleSpollers() {
	if (window.innerWidth < BREAKPOINT) {
		// inner-spollers
		document.querySelectorAll('.inner-spollers').forEach(el => {
			el.setAttribute('data-fls-spollers', '')
		})

		// remove-open
		document.querySelectorAll('.remove-open').forEach(el => {
			el.removeAttribute('open')
		})

		// add-open (он один)
		const addOpenEl = document.querySelector('.add-open')
		if (addOpenEl) {
			addOpenEl.removeAttribute('open')
			addOpenEl.setAttribute('data-fls-spollers-open', '')
		}
	}
}
handleSpollers()
window.addEventListener('resize', handleSpollers)

// Cause Step Section
const causeSection = document.querySelector('.cause')
const causeItems = document.querySelectorAll('.cause__section')
const causeSteps = causeItems.length
window.addEventListener('scroll', () => {
	const rect = causeSection.getBoundingClientRect()
	const viewport = window.innerHeight

	const progress = Math.min(
		Math.max(-rect.top / (rect.height - viewport), 0),
		1
	)

	let index = Math.floor(progress * causeSteps)

	// 🔒 фикс последнего элемента
	if (index >= causeSteps) {
		index = causeSteps - 1
	}

	causeItems.forEach((el, i) => {
		el.classList.toggle('is-active', i === index)
	})
})

// Play Video In Showreel Section
document.addEventListener('DOMContentLoaded', () => {
	const section = document.querySelector('.showreel')
	if (!section) return

	const video = section.querySelector('.showreel__video')
	const button = section.querySelector('.showreel__button')

	if (!video || !button) return

	const showButton = () => {
		button.classList.remove('is-hidden')
	}

	const hideButton = () => {
		button.classList.add('is-hidden')
	}

	// Старт видео по кнопке
	button.addEventListener('click', () => {
		hideButton()
		video.currentTime = 0
		video.play()
	})

	// Пауза по клику на видео
	video.addEventListener('click', () => {
		if (!video.paused) {
			video.pause()
			showButton()
		}
	})

	// Когда видео закончилось
	video.addEventListener('ended', () => {
		showButton()
	})
})
