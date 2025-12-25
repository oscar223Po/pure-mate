// Enabling functionality
import { gotoBlock, FLS } from "@js/common/functions.js";
import { formValidate } from "../_functions.js";

import './form.scss'

function formInit() {
	// Sending forms
	function formSubmit() {
		const forms = document.forms;
		if (forms.length) {
			for (const form of forms) {
				// Removing the built-in validation
				!form.hasAttribute('data-fls-form-novalidate') ? form.setAttribute('novalidate', true) : null
				// Sending event
				form.addEventListener('submit', function (e) {
					const form = e.target;
					formSubmitAction(form, e);
				});
				// Cleaning event
				form.addEventListener('reset', function (e) {
					const form = e.target;
					formValidate.formClean(form);
				});
			}
		}
		async function formSubmitAction(form, e) {
			const error = formValidate.getErrors(form)
			if (error === 0) {
				if (form.dataset.flsForm === 'ajax') { // If ajax mode
					e.preventDefault();
					const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
					const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
					const formData = new FormData(form);
					form.classList.add('--sending');
					const response = await fetch(formAction, {
						method: formMethod,
						body: formData
					});
					if (response.ok) {
						let responseResult = await response.json()
						form.classList.remove('--sending')
						formSent(form, responseResult)
					} else {
						FLS("_FLS_FORM_AJAX_ERR")
						form.classList.remove('--sending')
					}
				} else if (form.dataset.flsForm === 'dev') {	// If the development mode
					e.preventDefault()
					formSent(form)
				}
			} else {
				e.preventDefault();
				if (form.querySelector('.--form-error') && form.hasAttribute('data-fls-form-gotoerr')) {
					const formGoToErrorClass = form.dataset.flsFormGotoerr ? form.dataset.flsFormGotoerr : '.--form-error';
					gotoBlock(formGoToErrorClass);
				}
			}
		}
		// Actions after submitting the form
		function formSent(form, responseResult = ``) {
			// Creating a form submission event
			document.dispatchEvent(new CustomEvent("formSent", {
				detail: {
					form: form
				}
			}));
			// Showing popup if the popup module is enabled
			setTimeout(() => {
				if (window.flsPopup) {
					const popup = form.dataset.flsFormPopup;
					popup ? window.flsPopup.open(popup) : null;
				}
			}, 0);
			// Clearing the form
			formValidate.formClean(form);
			// Sending messages to the console
			FLS(`_FLS_FORM_SEND`);
		}
	}
	// Working with form fields
	function formFieldsInit() {
		document.body.addEventListener("focusin", function (e) {
			const targetElement = e.target;
			if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
				if (!targetElement.hasAttribute('data-fls-form-nofocus')) {
					targetElement.classList.add('--form-focus');
					targetElement.parentElement.classList.add('--form-focus');
				}
				targetElement.hasAttribute('data-fls-form-validatenow') ? formValidate.removeError(targetElement) : null;
			}
		});
		document.body.addEventListener("focusout", function (e) {
			const targetElement = e.target;
			if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
				if (!targetElement.hasAttribute('data-fls-form-nofocus')) {
					targetElement.classList.remove('--form-focus');
					targetElement.parentElement.classList.remove('--form-focus');
				}
				// Instant validation
				targetElement.hasAttribute('data-fls-form-validatenow') ? formValidate.validateInput(targetElement) : null;
			}
		});
	}
	formSubmit()
	formFieldsInit()
}
document.querySelector('[data-fls-form]') ?
	window.addEventListener('load', formInit) : null