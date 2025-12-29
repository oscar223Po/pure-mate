/* ----- Animation For Pc Complex Section ----- */
const q = (root, sel) => root.querySelector(sel)
const qa = (root, sel) => [...root.querySelectorAll(sel)]
const SHOW = el => el && el.classList.remove('disable')
const HIDE = el => el && el.classList.add('disable')
// Pieces
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
// Pointer Drag Movement
let dragState = null
function enableQueenDrag(queen, board) {
	if (!queen) return

	queen.addEventListener('pointerdown', e => {
		if (queen.classList.contains('disable')) return

		e.preventDefault()

		const rect = queen.getBoundingClientRect()

		dragState = {
			el: queen,
			startX: rect.left,
			startY: rect.top,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			board
		}

		queen.setPointerCapture(e.pointerId)

		queen.classList.add('is-dragging')
		queen.style.position = 'fixed'
		queen.style.left = `${rect.left}px`
		queen.style.top = `${rect.top}px`
		queen.style.zIndex = '999'
		queen.style.pointerEvents = 'none'
	})
}
document.addEventListener('pointermove', e => {
	if (!dragState) return

	const { el, offsetX, offsetY, startX, startY } = dragState

	const x = e.clientX - offsetX
	const y = e.clientY - offsetY

	el.style.transform = `translate3d(
		${x - startX}px,
		${y - startY}px,
		0
	)`
})
document.addEventListener('pointerup', e => {
	if (!dragState) return

	const { el, board } = dragState

	el.releasePointerCapture(e.pointerId)
	el.classList.remove('is-dragging')

	const dropCell = document
		.elementFromPoint(e.clientX, e.clientY)
		?.closest('span')

	if (dropCell && board.__onDrop) {
		board.__onDrop(dropCell)
	}

	// Visual Return
	el.style.transform = 'translate3d(0,0,0)'

	setTimeout(() => {
		el.style.position = ''
		el.style.left = ''
		el.style.top = ''
		el.style.zIndex = ''
		el.style.pointerEvents = ''
	}, 0)

	dragState = null
})
// Board Logic
function initDnDBoard(root, prefix) {
	if (!root) return

	const p = getPieces(root, prefix)
	const cells = qa(root, 'span')
	let step = 0

	function reset() {
		SHOW(p.queen)
		SHOW(p.pawn)

		HIDE(p.queen01)
		HIDE(p.queen02)
		HIDE(p.horse)
		HIDE(p.horse01)
		HIDE(p.elephant)

		step = 0
		enableStep0()
	}

	/* Step 0 — queen eats pawn */
	function enableStep0() {
		root.__onDrop = cell => {
			if (cell !== cells[17]) return

			HIDE(p.pawn)
			HIDE(p.queen)
			SHOW(p.queen01)

			step = 1
			run()
		}
	}

	/* Step 1 — horse + queen move */
	function step1() {
		SHOW(p.horse)

		root.__onDrop = cell => {
			if (cell !== cells[4]) return

			HIDE(p.horse)
			SHOW(p.horse01)

			HIDE(p.queen01)
			SHOW(p.queen02)

			step = 2
			run()
		}
	}

	/* Step 2 — queen eats horse */
	function step2() {
		root.__onDrop = cell => {
			if (cell !== cells[17]) return

			HIDE(p.horse01)
			HIDE(p.queen02)
			SHOW(p.queen01)

			step = 3
			run()
		}
	}

	/* Step 3 — queen eats elephant */
	function step3() {
		SHOW(p.elephant)

		root.__onDrop = cell => {
			if (cell !== cells[10]) return

			HIDE(p.elephant)
			HIDE(p.queen01)
			SHOW(p.queen)

			reset()
		}
	}

	function run() {
		if (step === 1) step1()
		if (step === 2) step2()
		if (step === 3) step3()
	}

	// draggable only for queen’s
	enableQueenDrag(p.queen, root)
	enableQueenDrag(p.queen01, root)
	enableQueenDrag(p.queen02, root)

	reset()
}
// Initialisation
initDnDBoard(document.querySelector('.complex__board--pc'), 'fm')

/* ----- Add Atribut For Spoller ----- */
const BREAKPOINT = 767.98
let isMobile = null
function handleSpollers() {
	const nowMobile = window.innerWidth <= BREAKPOINT
	if (nowMobile === isMobile) return // doing nothing

	isMobile = nowMobile

	const innerSpollers = document.querySelectorAll('.inner-spollers')
	const removeOpen = document.querySelectorAll('.remove-open')
	const addOpen = document.querySelector('.add-open')

	if (nowMobile) {
		// Mobile
		innerSpollers.forEach(el => {
			el.setAttribute('data-fls-spollers', '')
		})

		removeOpen.forEach(el => {
			el.removeAttribute('open')
		})

		if (addOpen) {
			addOpen.removeAttribute('open')
			addOpen.setAttribute('data-fls-spollers-open', '')
		}
	} else {
		// Desktop
		innerSpollers.forEach(el => {
			el.removeAttribute('data-fls-spollers')
		})

		document.querySelectorAll('.inner-spollers__item').forEach(el => {
			el.setAttribute('open', '')
			el.removeAttribute('data-fls-spollers-open')
		})
	}
}
// Initialisation
handleSpollers()
window.addEventListener(
	'resize',
	() => {
		window.requestAnimationFrame(handleSpollers)
	},
	{ passive: true }
)

/* ----- Cause Step Section ----- */
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

	// Fixing the last element
	if (index >= causeSteps) {
		index = causeSteps - 1
	}

	causeItems.forEach((el, i) => {
		el.classList.toggle('is-active', i === index)
	})
})

/* ----- Play Video In Showreel Section ----- */
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

	// Start the video by clicking
	button.addEventListener('click', () => {
		hideButton()
		video.currentTime = 0
		video.play()
	})

	// Pause when a video is clicked on
	video.addEventListener('click', () => {
		if (!video.paused) {
			video.pause()
			showButton()
		}
	})

	// When the video ended
	video.addEventListener('ended', () => {
		showButton()
	})
})
