/* ----- Animation For Pc Complex Section ----- */
const q = (root, sel) => root.querySelector(sel)
const qa = (root, sel) => [...root.querySelectorAll(sel)]
const isQueenPiece = el =>
	el && [...el.classList].some(cls => cls.includes('queen'))
const SHOW = el => {
	if (!el) return
	const wasDisabled = el.classList.contains('disable')
	el.classList.remove('disable')

	if (!wasDisabled || isQueenPiece(el)) return

	el.classList.remove('is-entering')
	window.requestAnimationFrame(() => {
		el.classList.add('is-entering')
		el.addEventListener(
			'animationend',
			() => {
				el.classList.remove('is-entering')
			},
			{ once: true }
		)
	})
}
const HIDE = el => el && el.classList.add('disable')
const restartCrosses = board => {
	if (!board) return
	board.classList.remove('is-cross-restart')
	void board.offsetWidth
	board.classList.add('is-cross-restart')
}
const HOVER_LOCK_MS = 100
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

	const hoverTarget = document.elementFromPoint(e.clientX, e.clientY)
	const hoverQueen = hoverTarget?.closest('img[class*="queen"]')
	if (
		hoverQueen &&
		!hoverQueen.classList.contains('disable') &&
		!board.classList.contains('is-hover-lock')
	) {
		const complex = hoverQueen.closest('.complex')
		const hoverBoard = hoverQueen.closest('.complex__board')
		if (complex) {
			complex.classList.remove('is-hover')
			complex.classList.add('is-queen-hover')
		}
		restartCrosses(hoverBoard)
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
	const complex = root.closest('.complex')
	let step = 0
	let hoverLockTimer = null

	function lockHover() {
		if (!complex) return
		root.classList.add('is-hover-lock')
		complex.classList.remove('is-queen-hover')
		clearTimeout(hoverLockTimer)
		hoverLockTimer = setTimeout(() => {
			root.classList.remove('is-hover-lock')
		}, HOVER_LOCK_MS)
	}

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
			lockHover()
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
			lockHover()
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
			lockHover()
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

			lockHover()
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

// Complex Hover Attention
function initComplexHoverAttention() {
	const complex = document.querySelector('.complex')
	if (!complex) return

	const add = () => complex.classList.add('is-hover')
	const remove = () => complex.classList.remove('is-hover')

	complex.addEventListener('mouseenter', add)
	complex.addEventListener('mouseleave', remove)
}
initComplexHoverAttention()
function initQueenHoverState() {
	const queens = document.querySelectorAll(
		'.complex__board img[class*="queen"]'
	)
	if (!queens.length) return

	queens.forEach(queen => {
		const complex = queen.closest('.complex')
		const board = queen.closest('.complex__board')
		if (!complex) return

		queen.addEventListener('mouseenter', () => {
			if (board?.classList.contains('is-hover-lock')) return
			complex.classList.remove('is-hover')
			complex.classList.add('is-queen-hover')
			restartCrosses(board)
		})

		queen.addEventListener('mouseleave', () => {
			complex.classList.remove('is-queen-hover')
			if (complex.matches(':hover')) {
				complex.classList.add('is-hover')
			}
		})
	})
}
initQueenHoverState()

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

/* ----- Calendar ----- */
document.addEventListener('DOMContentLoaded', () => {
	const calendarRoot = document.querySelector('[data-calendar]')
	if (!calendarRoot) return

	const titleEl = calendarRoot.querySelector('[data-calendar-title]')
	const gridEl = calendarRoot.querySelector('[data-calendar-grid]')
	const prevBtn = calendarRoot.querySelector('[data-calendar-prev]')
	const nextBtn = calendarRoot.querySelector('[data-calendar-next]')
	const timeList = document.querySelector('[data-time-slots]')
	const timeEmpty = document.querySelector('[data-time-empty]')

	if (!titleEl || !gridEl || !prevBtn || !nextBtn || !timeList || !timeEmpty)
		return

	const state = {
		selectedDate: null,
		selectedTime: null,
		viewDate: new Date()
	}

	state.viewDate.setDate(1)

	const monthFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		year: 'numeric'
	})

	const startOfDay = date => {
		const next = new Date(date)
		next.setHours(0, 0, 0, 0)
		return next
	}

	const today = startOfDay(new Date())

	const isSameDay = (a, b) => {
		if (!a || !b) return false
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		)
	}

	const formatDateKey = date => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const setSelectedDate = date => {
		state.selectedDate = date
		state.selectedTime = null
		renderCalendar()
		renderTimeSlots()
	}

	const setSelectedTime = time => {
		state.selectedTime = time
		updateTimeActiveState()
	}

	const renderCalendar = () => {
		titleEl.textContent = monthFormatter.format(state.viewDate)
		gridEl.innerHTML = ''

		const year = state.viewDate.getFullYear()
		const month = state.viewDate.getMonth()
		const firstDay = new Date(year, month, 1)
		const startWeekday = firstDay.getDay()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		for (let i = 0; i < startWeekday; i += 1) {
			const blank = document.createElement('span')
			blank.className = 'day day--disabled'
			blank.setAttribute('aria-hidden', 'true')
			gridEl.appendChild(blank)
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			const date = new Date(year, month, day)
			const dayButton = document.createElement('button')
			dayButton.type = 'button'
			dayButton.className = 'day'
			dayButton.textContent = String(day)
			dayButton.dataset.date = formatDateKey(date)

			const isWeekend = date.getDay() === 0 || date.getDay() === 6
			const isPast = startOfDay(date) < today

			if (isWeekend || isPast) {
				dayButton.classList.add('day--disabled')
				dayButton.disabled = true
			}

			if (isSameDay(date, state.selectedDate)) {
				dayButton.classList.add('day--selected')
				dayButton.setAttribute('aria-pressed', 'true')
			}

			gridEl.appendChild(dayButton)
		}
	}

	const buildTimeSlots = () => {
		const slots = []
		const startMinutes = 12 * 60
		const endMinutes = 18 * 60 + 30

		for (let mins = startMinutes; mins <= endMinutes; mins += 30) {
			const hours = String(Math.floor(mins / 60)).padStart(2, '0')
			const minutes = String(mins % 60).padStart(2, '0')
			slots.push(`${hours}:${minutes}`)
		}

		return slots
	}

	const updateTimeActiveState = () => {
		const buttons = [...timeList.querySelectorAll('.time-slot')]
		buttons.forEach(button => {
			const isActive = button.dataset.time === state.selectedTime
			button.classList.toggle('time-slot--active', isActive)
			button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
		})
	}

	const renderTimeSlots = () => {
		timeList.innerHTML = ''

		if (!state.selectedDate) {
			timeList.hidden = true
			timeEmpty.hidden = false
			return
		}

		timeEmpty.hidden = true
		timeList.hidden = false

		const slots = buildTimeSlots()
		slots.forEach(time => {
			const button = document.createElement('button')
			button.type = 'button'
			button.className = 'time-slot'
			button.textContent = time
			button.dataset.time = time
			timeList.appendChild(button)
		})

		updateTimeActiveState()
	}

	gridEl.addEventListener('click', event => {
		event.stopPropagation()
		const button = event.target.closest('button.day')
		if (!button || button.disabled) return

		const dateString = button.dataset.date
		if (!dateString) return

		const [year, month, day] = dateString.split('-').map(Number)
		setSelectedDate(new Date(year, month - 1, day))
	})

	timeList.addEventListener('click', event => {
		event.stopPropagation()
		const button = event.target.closest('.time-slot')
		if (!button) return
		setSelectedTime(button.dataset.time || null)
	})

	prevBtn.addEventListener('click', () => {
		state.viewDate.setMonth(state.viewDate.getMonth() - 1)
		state.viewDate.setDate(1)
		renderCalendar()
	})

	nextBtn.addEventListener('click', () => {
		state.viewDate.setMonth(state.viewDate.getMonth() + 1)
		state.viewDate.setDate(1)
		renderCalendar()
	})

	renderCalendar()
	renderTimeSlots()
})
