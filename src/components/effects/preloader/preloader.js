import './preloader.scss'

(function preloader() {
	const html = document.documentElement

	// Включаем сразу
	html.setAttribute('data-fls-preloader-loading', '')
	html.setAttribute('data-fls-scrolllock', '')

	const template = `
		<div class="fls-preloader">
			<div class="fls-preloader__body">
				<div class="fls-preloader__counter">0%</div>
				<div class="fls-preloader__line"><span></span></div>
			</div>
		</div>
	`

	document.body.insertAdjacentHTML('beforeend', template)

	const counterEl = document.querySelector('.fls-preloader__counter')
	const lineEl = document.querySelector('.fls-preloader__line span')

	let progress = 0
	let fakeTimer = null

	function setProgress(value) {
		counterEl.textContent = `${value}%`
		lineEl.style.width = `${value}%`
	}

	// Фейковая анимация до 90%
	fakeTimer = setInterval(() => {
		if (progress < 90) {
			progress++
			setProgress(progress)
		}
	}, 20)

	// ЖДЁМ РЕАЛЬНУЮ ЗАГРУЗКУ СТРАНИЦЫ
	window.addEventListener('load', () => {
		clearInterval(fakeTimer)
		progress = 100
		setProgress(progress)

		// Небольшая пауза, чтобы 100% было видно
		setTimeout(() => {
			html.setAttribute('data-fls-preloader-loaded', '')
			html.removeAttribute('data-fls-preloader-loading')
			html.removeAttribute('data-fls-scrolllock')
		}, 300)
	})
})()
