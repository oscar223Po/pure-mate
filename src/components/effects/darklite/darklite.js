// Enabling functionality
import { isMobile, FLS } from "@js/common/functions.js";

// Module styles
import './darklite.scss'

function getHours() {
	const now = new Date()
	const hours = now.getHours()
	return hours
}

function darkliteInit() {
	const htmlBlock = document.documentElement;

	// Getting the saved theme
	const saveUserTheme = localStorage.getItem('fls-user-theme');

	let userTheme;

	if (document.querySelector('[data-fls-darklite-time]')) {
		// User time interval
		let customRange = document.querySelector('[data-fls-darklite-time]').dataset.flsDarkliteTime
		customRange = customRange || '18,5'
		const timeFrom = +customRange.split(',')[0]
		const timeTo = +customRange.split(',')[1]
		console.log(timeFrom);
		// Working with time
		userTheme = getHours() >= timeFrom && getHours() <= timeTo ? 'dark' : 'light'
	} else {
		// Working with System Settings
		if (window.matchMedia) {
			userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			!saveUserTheme ? changeTheme() : null;
		});
	}

	// Changing the theme on a click
	const themeButton = document.querySelector('[data-fls-darklite-set]')
	const resetButton = document.querySelector('[data-fls-darklite-reset]')

	if (themeButton) {
		themeButton.addEventListener("click", function (e) {
			changeTheme(true);
		})
	}
	if (resetButton) {
		resetButton.addEventListener("click", function (e) {
			localStorage.setItem('fls-user-theme', '');
		})
	}
	// Function for adding a theme class
	function setThemeClass() {
		htmlBlock.setAttribute(`data-fls-darklite-${saveUserTheme ? saveUserTheme : userTheme}`, '')
	}
	// Adding a theme class
	setThemeClass();

	// Theme change function
	function changeTheme(saveTheme = false) {
		let currentTheme = htmlBlock.hasAttribute('data-fls-darklite-light') ? 'light' : 'dark';
		let newTheme;

		if (currentTheme === 'light') {
			newTheme = 'dark';
		} else if (currentTheme === 'dark') {
			newTheme = 'light';
		}
		htmlBlock.removeAttribute(`data-fls-darklite-${currentTheme}`)
		htmlBlock.setAttribute(`data-fls-darklite-${newTheme}`, '')
		saveTheme ? localStorage.setItem('fls-user-theme', newTheme) : null;
	}
}
document.querySelector('[data-fls-darklite]') ?
	window.addEventListener("load", darkliteInit) : null