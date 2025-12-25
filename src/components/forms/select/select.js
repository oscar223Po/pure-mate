// Enabling functionality
import { FLS, slideToggle, slideUp } from "@js/common/functions.js"

import { formValidate } from "../_functions.js"

import "./select.scss"

// Class for building the Select
class SelectConstructor {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
			speed: 150
		}
		this.config = Object.assign(defaultConfig, props);
		// CSS Module Classes
		this.selectClasses = {
			classSelect: "select", // Main block
			classSelectBody: "select__body", // Select body
			classSelectTitle: "select__title", // Title
			classSelectValue: "select__value", // Value in the title
			classSelectLabel: "select__label", // Label
			classSelectInput: "select__input", // Input field
			classSelectText: "select__text", // Text data wrapper
			classSelectLink: "select__link", // Link in the element
			classSelectOptions: "select__options", // Dropdown list
			classSelectOptionsScroll: "select__scroll", // Scroll wrapper
			classSelectOption: "select__option", // Item
			classSelectContent: "select__content", // Content wrapper in title
			classSelectRow: "select__row", // Row
			classSelectData: "select__asset", // Additional data
			classSelectDisabled: "--select-disabled", // Disabled
			classSelectTag: "--select-tag", // Tag class
			classSelectOpen: "--select-open", // List is open
			classSelectActive: "--select-active", // List is selected
			classSelectFocus: "--select-focus", // List is focused
			classSelectMultiple: "--select-multiple", // Multiple selection
			classSelectCheckBox: "--select-checkbox", // Checkbox style
			classSelectOptionSelected: "--select-selected", // Selected item
			classSelectPseudoLabel: "--select-pseudo-label", // Pseudo-label
		}
		this._this = this;
		// Running initialization
		if (this.config.init) {
			// Getting all select on the page
			const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll('select[data-fls-select]');
			if (selectItems.length) {
				this.selectsInit(selectItems);
				FLS(`_FLS_SELECT_START`, selectItems.length)
			} else {
				FLS('_FLS_SELECT_SLEEP')
			}
		}
	}
	// CSS class constructor
	getSelectClass(className) {
		return `.${className}`;
	}
	// Getter of pseudo-select elements
	getSelectElement(selectItem, className) {
		return {
			originalSelect: selectItem.querySelector('select'),
			selectElement: selectItem.querySelector(this.getSelectClass(className)),
		}
	}
	// All selection initialization function
	selectsInit(selectItems) {
		selectItems.forEach((originalSelect, index) => {
			this.selectInit(originalSelect, index + 1);
		});
		// Event handlers...
		document.addEventListener('click', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...when you press a key
		document.addEventListener('keydown', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...when focusing
		document.addEventListener('focusin', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...if you lose focus
		document.addEventListener('focusout', function (e) {
			this.selectsActions(e);
		}.bind(this));
	}
	// Select-specific initialization function
	selectInit(originalSelect, index) {
		// Assign a unique ID
		index ? originalSelect.dataset.flsSelectId = index : null;
		// If there are elements we continue
		if (originalSelect.options.length) {
			const _this = this;
			// Creating a wrapper
			let selectItem = document.createElement("div");
			selectItem.classList.add(this.selectClasses.classSelect);
			// Displaying the wrapper before the original selection
			originalSelect.parentNode.insertBefore(selectItem, originalSelect);
			// Putting the original selection in the wrapper
			selectItem.appendChild(originalSelect);
			// Hiding the original selection
			originalSelect.hidden = true;

			// Working with the placeholder
			if (this.getSelectPlaceholder(originalSelect)) {
				// Remembering the placeholder
				originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
				// If label mode is enabled
				if (this.getSelectPlaceholder(originalSelect).label.show) {
					const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
					selectItemTitle.insertAdjacentHTML('afterbegin', `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
				}
			}
			// Constructor of main elements
			selectItem.insertAdjacentHTML('beforeend', `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
			// Launch the pseudo-select constructor
			this.selectBuild(originalSelect);

			// Remember the speed
			originalSelect.dataset.flsSelectSpeed = originalSelect.dataset.flsSelectSpeed ? originalSelect.dataset.flsSelectSpeed : this.config.speed;
			this.config.speed = +originalSelect.dataset.flsSelectSpeed

			// Event when the original select changes
			originalSelect.addEventListener('change', function (e) {
				_this.selectChange(e);
			});
		}
	}
	// Pseudo-select constructor
	selectBuild(originalSelect) {
		const selectItem = originalSelect.parentElement;
		// Transfer the ID attribute of the select
		if (originalSelect.id) {
			selectItem.id = originalSelect.id
			originalSelect.removeAttribute('id')
		}
		// Add the select ID
		selectItem.dataset.flsSelectId = originalSelect.dataset.flsSelectId;
		// Get the class of the original select, create a modifier and add it
		originalSelect.dataset.flsSelectModif ? selectItem.classList.add(`select--${originalSelect.dataset.flsSelectModif}`) : null;
		// If multiple selection, add class
		originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
		// Styling elements as checkboxes (only for multiple)
		originalSelect.hasAttribute('data-fls-select-checkbox') && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
		// Setter for the select title value
		this.setSelectTitleValue(selectItem, originalSelect);
		// Setter for list items (options)
		this.setOptions(selectItem, originalSelect);
		// If the search option data-search is enabled, launch the handler
		originalSelect.hasAttribute('data-fls-select-search') ? this.searchActions(selectItem) : null;
		// If the data-open setting is specified, open the select
		originalSelect.hasAttribute('data-fls-select-open') ? this.selectAction(selectItem) : null;
		// Disabled handler
		this.selectDisabled(selectItem, originalSelect);
	}
	// Function for handling events
	selectsActions(e) {
		const t = e.target, type = e.type;
		const isSelect = t.closest(this.getSelectClass(this.selectClasses.classSelect));
		const isTag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
		if (!isSelect && !isTag) return this.selectsСlose();

		const selectItem = isSelect || document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${isTag.dataset.flsSelectId}"]`);
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		if (originalSelect.disabled) return;

		if (type === 'click') {
			const tag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
			const title = t.closest(this.getSelectClass(this.selectClasses.classSelectTitle));
			const option = t.closest(this.getSelectClass(this.selectClasses.classSelectOption));
			if (tag) {
				const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${tag.dataset.flsSelectId}"] .select__option[data-fls-select-value="${tag.dataset.flsSelectValue}"]`);
				this.optionAction(selectItem, originalSelect, optionItem);
			} else if (title) {
				this.selectAction(selectItem);
			} else if (option) {
				this.optionAction(selectItem, originalSelect, option);
			}
		} else if (type === 'focusin' || type === 'focusout') {
			if (isSelect) selectItem.classList.toggle(this.selectClasses.classSelectFocus, type === 'focusin');
		} else if (type === 'keydown' && e.code === 'Escape') {
			this.selectsСlose();
		}
	}
	// Function to close all selects
	selectsСlose(selectOneGroup) {
		const selectsGroup = selectOneGroup ? selectOneGroup : document;
		const selectActiveItems = selectsGroup.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
		if (selectActiveItems.length) {
			selectActiveItems.forEach(selectActiveItem => {
				this.selectСlose(selectActiveItem);
			});
		}
	}
	// Function to close a specific select
	selectСlose(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		if (!selectOptions.classList.contains('_slide')) {
			selectItem.classList.remove(this.selectClasses.classSelectOpen);
			slideUp(selectOptions, originalSelect.dataset.flsSelectSpeed);
			setTimeout(() => {
				selectItem.style.zIndex = '';
			}, originalSelect.dataset.flsSelectSpeed);
		}
	}
	// Function to open/close a specific select
	selectAction(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
		const selectOpenzIndex = originalSelect.dataset.flsSelectZIndex ? originalSelect.dataset.flsSelectZIndex : 3;


		// Determine where to display the dropdown list
		this.setOptionsPosition(selectItem);

		// If selects are placed in an element with the data attribute data-one-select
		// close all open selects
		if (originalSelect.closest('[data-fls-select-one]')) {
			const selectOneGroup = originalSelect.closest('[data-fls-select-one]');
			this.selectsСlose(selectOneGroup);
		}

		setTimeout(() => {
			if (!selectOptions.classList.contains('--slide')) {
				selectItem.classList.toggle(this.selectClasses.classSelectOpen);
				slideToggle(selectOptions, originalSelect.dataset.flsSelectSpeed);

				if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
					selectItem.style.zIndex = selectOpenzIndex;
				} else {
					setTimeout(() => {
						selectItem.style.zIndex = '';
					}, originalSelect.dataset.flsSelectSpeed);
				}
			}
		}, 0);
	}
	// Setter for the select title value
	setSelectTitleValue(selectItem, originalSelect) {
		const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
		const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
		if (selectItemTitle) selectItemTitle.remove();
		selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
		// If the search option data-search is enabled, launch the handler
		originalSelect.hasAttribute('data-fls-select-search') ? this.searchActions(selectItem) : null;
	}
	// Constructor for the title value
	getSelectTitleValue(selectItem, originalSelect) {
		// Get selected text values
		let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
		// Processing multiple selection values
		// If tag mode is enabled (data-fls-select-tags setting specified)
		if (originalSelect.multiple && originalSelect.hasAttribute('data-fls-select-tags')) {
			selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map(option => `<span role="button" data-fls-select-id="${selectItem.dataset.flsSelectId}" data-fls-select-value="${option.value}" class="--select-tag">${this.getSelectElementContent(option)}</span>`).join('');
			// If tags are output to an external block
			if (originalSelect.dataset.flsSelectTags && document.querySelector(originalSelect.dataset.flsSelectTags)) {
				document.querySelector(originalSelect.dataset.flsSelectTags).innerHTML = selectTitleValue;
				if (originalSelect.hasAttribute('data-fls-select-search')) selectTitleValue = false;
			}
		}
		// Value or placeholder
		selectTitleValue = selectTitleValue.length ? selectTitleValue : (originalSelect.dataset.flsSelectPlaceholder || '')

		if (!originalSelect.hasAttribute('data-fls-select-tags')) {
			selectTitleValue = selectTitleValue ? selectTitleValue.map(item => item.replace(/"/g, '&quot;')) : ''
		}

		// If pseudo mode is enabled
		let pseudoAttribute = '';
		let pseudoAttributeClass = '';
		if (originalSelect.hasAttribute('data-fls-select-pseudo-label')) {
			pseudoAttribute = originalSelect.dataset.flsSelectPseudoLabel ? ` data-fls-select-pseudo-label="${originalSelect.dataset.flsSelectPseudoLabel}"` : ` data-fls-select-pseudo-label="Fill the attribute"`;
			pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
		}
		// If there is a value, add a class
		this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
		// Return input field for search or text
		if (originalSelect.hasAttribute('data-fls-select-search')) {
			// Output the input field for search
			return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-fls-select-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
		} else {
			// If an element with its own class is selected
			const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass}` : '';
			// Output text value
			return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
		}
	}
	// Constructor for data for the title value
	getSelectElementContent(selectOption) {
		// If the element specifies output of an image or text, rebuild the structure
		const selectOptionData = selectOption.dataset.flsSelectAsset ? `${selectOption.dataset.flsSelectAsset}` : '';
		const selectOptionDataHTML = selectOptionData.indexOf('img') >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
		let selectOptionContentHTML = ``;
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : '';
		selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : '';
		selectOptionContentHTML += selectOption.textContent;
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		return selectOptionContentHTML;
	}
	// Get placeholder data
	getSelectPlaceholder(originalSelect) {
		const selectPlaceholder = Array.from(originalSelect.options).find(option => !option.value);
		if (selectPlaceholder) {
			return {
				value: selectPlaceholder.textContent,
				show: selectPlaceholder.hasAttribute("data-fls-select-show"),
				label: {
					show: selectPlaceholder.hasAttribute("data-fls-select-label"),
					text: selectPlaceholder.dataset.flsSelectLabel
				}
			}
		}
	}
	// Get data from selected elements
	getSelectedOptionsData(originalSelect, type) {
		// Get all selected objects from select
		let selectedOptions = [];
		if (originalSelect.multiple) {
			// If multiple selection
			// Remove placeholder, get the rest of selected elements
			selectedOptions = Array.from(originalSelect.options).filter(option => option.value).filter(option => option.selected);
		} else {
			// If single selection
			selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
		}
		return {
			elements: selectedOptions.map(option => option),
			values: selectedOptions.filter(option => option.value).map(option => option.value),
			html: selectedOptions.map(option => this.getSelectElementContent(option))
		}
	}
	// Constructor for list items
	getOptions(originalSelect) {
		// Scroll settings for items
		const selectOptionsScroll = originalSelect.hasAttribute('data-fls-select-scroll') ? `` : '';
		const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? +originalSelect.dataset.flsSelectScroll : null;
		// Get list items
		let selectOptions = Array.from(originalSelect.options);
		if (selectOptions.length > 0) {
			let selectOptionsHTML = ``;
			// If the data-fls-select-show setting is specified, show the placeholder in the list
			if ((this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show) || originalSelect.multiple) {
				selectOptions = selectOptions.filter(option => option.value);
			}
			// Build and output the main structure
			selectOptionsHTML += `<div ${selectOptionsScroll} ${selectOptionsScroll ? `style="max-height: ${customMaxHeightValue}px"` : ''} class="${this.selectClasses.classSelectOptionsScroll}">`;
			selectOptions.forEach(selectOption => {
				// Get the structure of a specific list item
				selectOptionsHTML += this.getOption(selectOption, originalSelect);
			});
			selectOptionsHTML += `</div>`;
			return selectOptionsHTML;
		}
	}
	// Constructor for a specific list item
	getOption(selectOption, originalSelect) {
		// If the element is selected and multiple selection mode is enabled, add class
		const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : '';
		// If the element is selected and there is no data-fls-select-show-selected setting, hide the element
		const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute('data-fls-select-show-selected') && !originalSelect.multiple ? `hidden` : ``;
		// If a class is specified for the element, add it
		const selectOptionClass = selectOption.dataset.flsSelectClass ? ` ${selectOption.dataset.flsSelectClass}` : '';
		// If link mode is specified
		const selectOptionLink = selectOption.dataset.flsSelectHref ? selectOption.dataset.flsSelectHref : false;
		const selectOptionLinkTarget = selectOption.hasAttribute('data-fls-select-href-blank') ? `target="_blank"` : '';
		// Build and return the item structure
		let selectOptionHTML = ``;
		selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-fls-select-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-fls-select-value="${selectOption.value}" type="button">`;
		selectOptionHTML += this.getSelectElementContent(selectOption);
		selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
		return selectOptionHTML;
	}
	// Setter for list items (options)
	setOptions(selectItem, originalSelect) {
		// Get the pseudo-select body object
		const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		// Launch the constructor for list items (options) and add to the pseudo-select body
		selectItemOptions.innerHTML = this.getOptions(originalSelect)
	}
	// Determine where to display the dropdown list
	setOptionsPosition(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectItemScroll = this.getSelectElement(selectItem, this.selectClasses.classSelectOptionsScroll).selectElement;
		const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? `${+originalSelect.dataset.flsSelectScroll}px` : ``;
		const selectOptionsPosMargin = +originalSelect.dataset.flsSelectOptionsMargin ? +originalSelect.dataset.flsSelectOptionsMargin : 10;

		if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
			selectOptions.hidden = false;
			const selectItemScrollHeight = selectItemScroll.offsetHeight ? selectItemScroll.offsetHeight : parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue('max-height'));
			const selectOptionsHeight = selectOptions.offsetHeight > selectItemScrollHeight ? selectOptions.offsetHeight : selectItemScrollHeight + selectOptions.offsetHeight;
			const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
			selectOptions.hidden = true;

			const selectItemHeight = selectItem.offsetHeight;
			const selectItemPos = selectItem.getBoundingClientRect().top;
			const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
			const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);

			if (selectItemResult < 0) {
				const newMaxHeightValue = selectOptionsHeight + selectItemResult;
				if (newMaxHeightValue < 100) {
					selectItem.classList.add('select--show-top');
					selectItemScroll.style.maxHeight = selectItemPos < selectOptionsHeight ? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px` : customMaxHeightValue;
				} else {
					selectItem.classList.remove('select--show-top');
					selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
				}
			}
		} else {
			setTimeout(() => {
				selectItem.classList.remove('select--show-top');
				selectItemScroll.style.maxHeight = customMaxHeightValue;
			}, +originalSelect.dataset.flsSelectSpeed);
		}
	}
	// Handler for clicking on a list item
	optionAction(selectItem, originalSelect, optionItem) {
		const optionsBox = selectItem.querySelector(this.getSelectClass(this.selectClasses.classSelectOptions));
		if (optionsBox.classList.contains('--slide')) return;

		if (originalSelect.multiple) {
			optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
			const selectedEls = this.getSelectedOptionsData(originalSelect).elements;
			for (const el of selectedEls) {
				el.removeAttribute('selected');
			}
			const selectedUI = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
			for (const el of selectedUI) {
				const val = el.dataset.flsSelectValue;
				const opt = originalSelect.querySelector(`option[value="${val}"]`);
				if (opt) opt.setAttribute('selected', 'selected');
			}
		} else {
			if (!originalSelect.hasAttribute('data-fls-select-show-selected')) {
				setTimeout(() => {
					const hiddenOpt = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`);
					if (hiddenOpt) hiddenOpt.hidden = false;
					optionItem.hidden = true;
				}, this.config.speed);
			}
			originalSelect.value = optionItem.dataset.flsSelectValue || optionItem.textContent;
			this.selectAction(selectItem);
		}
		this.setSelectTitleValue(selectItem, originalSelect);
		this.setSelectChange(originalSelect);
	}
	// Reaction to change of the original select
	selectChange(e) {
		const originalSelect = e.target;
		this.selectBuild(originalSelect);
		this.setSelectChange(originalSelect);
	}
	// Handler for change in select
	setSelectChange(originalSelect) {
		// Instant validation of the select
		if (originalSelect.hasAttribute('data-fls-select-validate')) {
			formValidate.validateInput(originalSelect)
		}
		// When the select changes, submit the form
		if (originalSelect.hasAttribute('data-fls-select-submit') && originalSelect.value) {
			let tempButton = document.createElement("button");
			tempButton.type = "submit";
			originalSelect.closest('form').append(tempButton);
			tempButton.click();
			tempButton.remove();
		}
		const selectItem = originalSelect.parentElement;
		// Call callback function
		this.selectCallback(selectItem, originalSelect);
	}
	// Disabled handler
	selectDisabled(selectItem, originalSelect) {
		if (originalSelect.disabled) {
			selectItem.classList.add(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
		} else {
			selectItem.classList.remove(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
		}
	}
	// Handler for searching through list items
	searchActions(selectItem) {
		const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;

		selectInput.addEventListener("input", () => {
			const inputValue = selectInput.value.toLowerCase();
			const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);

			selectOptionsItems.forEach(item => {
				const itemText = item.textContent.toLowerCase();
				item.hidden = !itemText.includes(inputValue);
			});

			// Open the list if it is closed
			if (selectOptions.hidden) {
				this.selectAction(selectItem);
			}
		});
	}
	// Callback function
	selectCallback(selectItem, originalSelect) {
		document.dispatchEvent(new CustomEvent("selectCallback", {
			detail: {
				select: originalSelect
			}
		}));
	}
}
document.querySelector('select[data-fls-select]') ?
	window.addEventListener('load', () => window.flsSelect = new SelectConstructor({})) : null