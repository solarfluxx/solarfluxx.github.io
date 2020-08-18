//#region Classes

class EasyRipple {
	/**
	 * Adds ripple effect to an element
	 * @param {HTMLElement} element Ripple will be added to this element
	 * @param {{transparency: number, color: number, anim_time: number, centered: boolean, unbounded: boolean, scale: number}} options Ripple options
	 */
	constructor(element, options) {
		//#region Varible Declaration
		this.colors = ['var(--text-dec)', '255, 255, 255'];
		this.ripple = null;
		this.rippleList = [];
		this.options = options;
		this.container_element = element;
		this.element = this.options.element || this.container_element;

		this.options.color = this.colors[this.options.color] || this.colors[0];
		this.options.anim_time = this.options.anim_time || 0.2;
		//#endregion Varible Declaration

		// Callbacks
		let tempclass = this,
			start = event => tempclass.clickStart(event),
			end = event => tempclass.clickEnd(event);

		// Event Listeners
		this.container_element.addEventListener('mousedown', start);
		this.container_element.addEventListener('mouseup', end);
		this.container_element.addEventListener('mouseout', end);
		this.container_element.addEventListener('touchstart', start, {passive: true});
		this.container_element.addEventListener('touchend', end, {passive: true});
		this.container_element.addEventListener('touchcancel', end, {passive: true});
	}
	clickStart(event) {
		if (event.targetTouches != undefined) event = event.targetTouches['0'];
		this.ripple = new EasyRipple.Ripple(event, this);
		this.rippleList.push(this.ripple);
		this.element.appendChild(this.ripple.element);
		this.element.style.setProperty('position', 'relative');
		if (!this.options.unbounded) this.element.style.setProperty('overflow', 'hidden');
	}
	clickEnd(event) {
		let endRipple = false;
		endRipple = event.type == 'mouseup';
		endRipple = endRipple || event.relatedTarget && !event.relatedTarget.getParents().includes(this.element) && event.relatedTarget != this.element;
		if (endRipple) {
			this.rippleList.forEach(ripple => {
				if (ripple != undefined) {
					if (ripple.timeoutOver) {
						ripple.hide();
					}
					ripple.mouseup = true;
				}
			});
			setTimeout(() => {
				if (!this.element.querySelector('cc-ripple')) {
					this.element.style.setProperty('position', '');
					this.element.style.setProperty('overflow', '');
				}
			}, 401);
		}
	}
	static Ripple = class {
		constructor(event, that) {
			let x = event.clientX - that.element.getBoundingClientRect().left,
				y = event.clientY - that.element.getBoundingClientRect().top,
				scaleRange = [1, 1.5],
				pixelRange = [1, that.element.clientWidth/4];

			if (that.options.centered) {
				x = that.element.clientWidth/2;
				y = that.element.clientHeight/2;
			}
			let scale = (((Math.abs((that.element.clientWidth/2) - x) + Math.abs((that.element.clientHeight/2) - y) - pixelRange[0]) * (scaleRange[1] - scaleRange[0])) / (pixelRange[1] - pixelRange[0])) + scaleRange[0];
			if (that.options.scale) scale = scale * that.options.scale;

			this.element = document.createElement('cc-ripple');
			this.element.setAttribute('size', scale);
			this.element.setAttribute('left', x + 'px');
			this.element.setAttribute('top', y + 'px');
			this.element.setAttribute('width', (that.element.clientWidth+5)  + 'px');
			this.element.setAttribute('height', (that.element.clientHeight+(that.element.clientWidth/2))  + 'px');
			this.timeoutOver = false;
			this.mouseup = false;
			this.that = that;
			this.timeoutTime = (that.options.anim_time*1000);
			this.timeout = setTimeout((() => {
				this.timeoutEnd();
			}).bind(this), this.timeoutTime);

			let temp_ripple = this.element;
			setTimeout(function() {
				if (that.options.anim_time != null && that.options.anim_time >= 0) temp_ripple.style.setProperty('transition', `transform ${that.options.anim_time}s cubic-bezier(0, 0, 0, 1), opacity 0.4s`);
				if (that.options.transparency != null && that.options.transparency >= 0) temp_ripple.style.setProperty('background-color', `rgba(${that.options.color}, ${that.options.transparency})`);
				temp_ripple.style.setProperty('transform', `translate(-50%, -50%) scale(${temp_ripple.getAttribute('size')})`);
				temp_ripple.style.setProperty('left', temp_ripple.getAttribute('left'));
				temp_ripple.style.setProperty('top', temp_ripple.getAttribute('top'));
				temp_ripple.style.setProperty('width', temp_ripple.getAttribute('width'));
				temp_ripple.style.setProperty('height', temp_ripple.getAttribute('width'));
			}, 15);
		}
		hide() {
			this.element.classList.add('clicked');
			setTimeout((() => {
				this.element.remove();
				let index = this.that.rippleList.indexOf(this);
				if (index >= 0) this.that.rippleList.splice(index, 1);
			}).bind(this), 400);
		}
		timeoutEnd() {
			if (this.mouseup) this.hide();
			this.timeoutOver = true;
		}
	}
}

class Form {
	constructor(id, button) {
		this.id = id;
		this.inputs = [];
		this.inputValidations = [];
		this.button = button;

		let inputs = document.querySelectorAll('cc-input[form-id='+id+']');
		let callback_inputChanged = event => this.inputChanged(event);
		let callback_inputLeave = event => this.inputLeave(event);
		if (inputs.length > 0) {
			let callbackInputs = this.inputs;
			inputs.forEach(function(input) {
				callbackInputs.push(input);

				input.addEventListener('input', callback_inputChanged);
				input.querySelector('input').addEventListener('blur', callback_inputLeave);
			});
		}

		if (Form.list == undefined) Form.list = [];
		Form.list.push(this);
	}
	static get(id) {
		let callbackForm;
		Form.list.forEach(function(form) {if (form.id == id) callbackForm = form;});
		return callbackForm;
	}
	set submissionEvent(Function) {
		this.clearSubmissionEvent();
		this.onSubmission = Function;
		this.button.addEventListener('click', () => this.onSubmission());
	}

	clearSubmissionEvent() {
		this.button.removeEventListener('click', this.onSubmission);
	}
	checkForChanges() {
		let enable = false;
		let fail = false;
		this.inputs.forEach((function(input) {
			if (input.getInputValue() != cUser[input.getAttribute('fb-update')]) enable = true;
			if (input.classList.contains('error')) fail = true;

			this.inputValidations.forEach(function(validation) {
				if (validation.input == event.target.parentElement) {
					let check = validation.valid_require(validation.input.getInputValue());
					if (check.repair != undefined && input.getInputValue() != check.repair()) enable = false;
				}
			});
		}).bind(this));

		if (enable && !fail) this.enableSubmission(); else this.disableSubmission();
	}
	preventLeave() {return 'Any changes you made wont be saved.'}
	enableSubmission() {
		this.button.removeAttribute('disabled');
		window.onbeforeunload = this.preventLeave;
	}
	disableSubmission() {
		this.button.setAttribute('disabled', '');
		window.onbeforeunload = null;
	}
	addInputValidation(input, validation_requirements) {
		let validation = {
			input: input,
			valid_require: validation_requirements
		}
		this.inputValidations.push(validation);
	}
	inputChanged(event) {
		this.inputValidations.forEach(function(validation) {
			if (validation.input == event.target.parentElement) {
				let check = validation.valid_require(validation.input.getInputValue());
				let vaild = {failed: false, message: ''};
				check.require.forEach((state, index) => {if (!state) vaild = {failed: true, message: check.messages[index]}});
				if (vaild.failed) validation.input.setError(`This field ${vaild.message}.`); else validation.input.clearError();
			}
		});
		Form.get(event.target.parentElement.getAttribute('form-id')).checkForChanges();
	}
	inputLeave(event) {
		this.inputValidations.forEach(function(validation) {
			if (validation.input == event.target.parentElement) {
				let check = validation.valid_require(validation.input.getInputValue());
				let vaild = {failed: false, message: ''};

				if (check.repair != undefined && check.repair() != undefined) {
					validation.input.querySelector('input').value = check.repair();
					check = validation.valid_require(validation.input.getInputValue());
				}

				check.require.forEach((state, index) => {if (!state) vaild = {failed: true, message: check.messages[index]}});
				if (vaild.failed) validation.input.setError(`This field ${vaild.message}.`); else validation.input.clearError();
			}
		});
		Form.get(event.target.parentElement.getAttribute('form-id')).checkForChanges();
	}
}

class Prompt {
	constructor(id, options, extra) {
		this.id = id;
		this.options = options;
		this.reference = this.createPromptElements();
		this.extra = extra || '';

		// Add this prompt to array for searching
		if (Prompt.list == undefined) Prompt.list = [];
		Prompt.list.push(this);
	}
	/**
	 * @param {() => void} Function
	 */
	set negitiveEvent(Function) {
		this.reference.querySelector('cc-button[type="negative"]').removeEventListener('click', this.negitive);
		this.negitive = Function;
		this.reference.querySelector('cc-button[type="negative"]').addEventListener('click', this.negitive);
	}

	createPromptElements() {
		this.prompt = [
			document.createElement('cc-popup'),
			document.createElement('cc-blocker'),
			document.createElement('cc-prompt'),
			document.createElement('title'),
			document.createElement('content'),
			document.createElement('cc-button'),
			document.createElement('cc-button'),
			[]
		];

		this.prompt[1].addEventListener('click', () => {
			let inputs = this.reference.querySelectorAll('cc-input');
			let closePrompt = true;
			inputs.forEach(input => {
				if (input.classList.contains('open')) {
					input.inputData.close();
					closePrompt = false;
				}
			});
			if (closePrompt) this.close();
		});

		this.prompt[3].innerText = setDefaultVal(this.options.title, 'Prompt');
		this.prompt[5].innerText = setDefaultVal(this.options.positive && this.options.positive.text, 'Okay');
		this.prompt[6].innerText = setDefaultVal(this.options.negitive && this.options.negitive.text, 'Cancel');

		this.prompt[5].addEventListener('click', () => this.positive());
		this.prompt[6].addEventListener('click', () => this.negitive());
		this.prompt[5].setAttribute('type', 'positive');
		this.prompt[6].setAttribute('type', 'negative');

		new EasyRipple(this.prompt[5], {
			transparency: 0.4,
			color: 1
		});
		new EasyRipple(this.prompt[6], {
			transparency: 0.1
		});

		if (this.options.content.constructor.name == 'SimplePromise') {
			let spinner = document.createElement('cc-progress-spinner');
			this.prompt[4].appendChild(spinner);

			this.options.content.promise.then((content) => {
				this.prompt[4].innerHTML = '';
				this.prompt[4].appendChild(content);
			});
		} else this.prompt[4].appendChild(this.options.content);

		this.prompt[0].appendChild(this.prompt[1]);
		this.prompt[0].appendChild(this.prompt[2]);
		this.prompt[2].appendChild(this.prompt[3]);
		
		if (this.options.messages) {
			this.options.messages.forEach(snapshot => {
				let element = document.createElement('message');
				element.innerText = setDefaultVal(snapshot.message, '');
				element.setAttribute(snapshot.type, '');
				this.prompt[7].push(element);
				this.prompt[2].appendChild(element);
			});
		}

		this.prompt[2].appendChild(this.prompt[4]);
		this.prompt[2].appendChild(this.prompt[5]);
		this.prompt[2].appendChild(this.prompt[6]);

		let append = document.body.appendChild(this.prompt[0]);
		new Spinner(this.prompt[4].querySelector('cc-progress-spinner'));

		return append;
	}
	open() {
		disableScroll();
		setTimeout(function() {
			this.reference.classList.add('show');
		}.bind(this), 50);
	}
	close() {
		enableScroll();
		this.reference.classList.remove('show');
	}
	positive() {
		this.close();
		this.options.processing(this.reference.querySelector('content'), this.extra);
	}
	negitive() {
		this.close();
	}
}

class SimplePromise {
	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

class Input {
	constructor(options) {
		this.options = options || {};
		let input = this.options.template && '' || `<input type="${this.options.type || 'text'}">`

		this.element = new HTMLBuilder(`
			<cc-hint></cc-hint>
			${input}
			<cc-input-line></cc-input-line>
			<cc-input-error></cc-input-error>
		`, document.createElement('cc-input')).html;

		this.elements = {
			hint: this.element.querySelector('cc-hint'),
			input: this.element.querySelector('input'),
			line: this.element.querySelector('cc-input-line'),
			error: this.element.querySelector('cc-input-error')
		}

		this.element.setAttribute('type', this.options.type || 'text');
		if (this.options.hint) this.element.setAttribute('hint', this.options.hint);

		if (this.options.type) this.elements.input.setAttribute('type', this.options.type);
		if (this.options.name) this.elements.input.setAttribute('name', this.options.name);
	}

	static Select = class {
		constructor(element, options) {
			// Declare Variables
			this.options = options;
			this.values = options.values;
			this.elements = {
				input: element,
				select: element.querySelector('cc-select'),
				menu: element.querySelector('cc-select-menu'),
				options_container: element.querySelector('cc-select-container'),
				overlay: element.querySelector('cc-select-overlay'),
			};
			this.menu = {
				categorys: false,
				options: [],
				selection: [],
				getOption: (element) => {
                    let index = 0;
                    let callbackOption;
                    this.menu.options.forEach(option => {
                        if (option.element == element) callbackOption = option;
						index++;
					});
                    
					if (callbackOption != undefined) return {
						option: callbackOption,
						index: index
					}; else return false;
				},
				getIndex: (object) => {
					let category = object.element.tagName == 'CC-SELECT-CATEGORY';
					if (category) return this.menu.categorys.indexOf(object); else return this.menu.options.indexOf(object);
				},
				setSelection: (option) => {
					if (String(this.elements.menu.getAttribute('checkbox')) == 'true') {
						let offsetTop = option.element.offsetTop - this.elements.options_container.scrollTop;
						let offsetBottom = option.element.offsetTop - (this.elements.options_container.scrollTop+256-45);
						if (offsetTop < 0) this.elements.options_container.scrollTop = this.elements.options_container.scrollTop + offsetTop;
						if (offsetBottom > 0) this.elements.options_container.scrollTop = this.elements.options_container.scrollTop + offsetBottom;

						let checkbox = option.element.querySelector('cc-checkbox');
						if (String(checkbox.getAttribute('checked')) == 'true') {
							option.element.classList.remove('selected');
							checkbox.removeAttribute('checked');
						} else {
							option.element.classList.add('selected');
							checkbox.setAttribute('checked', 'true');
						}
						let option_index = this.menu.getIndex(option);
						let index = this.menu.selection.indexOf(option_index);
						if (index >= 0) this.menu.selection.splice(index, 1); else this.menu.selection.push(option_index);
						this.menu.selection.sort();
						updateText(this);
					} else {
						this.elements.input.querySelectorAll('cc-option').forEach(snapshot => snapshot.classList.remove('selected'));
						option.element.classList.add('selected');
						this.menu.selection = [this.menu.getIndex(option)];
						updateText(this);
						this.close();
					}

					function updateText(select) {
						let text_selection = '';
						select.menu.selection.forEach(index => {
							if (text_selection == '') text_selection = select.menu.options[index].text; else text_selection = text_selection + ', ' + select.menu.options[index].text;
						});
						select.elements.select.setAttribute('selection', text_selection);
					}

					if (this.elements.input.getAttribute('write') != undefined) {
						lStorage.setItem(this.elements.input.getAttribute('write'), option.text);
					}

					if (this.elements.input.getAttribute('onselection') != null) {
						let text = option.text;
						eval(this.elements.input.getAttribute('onselection'));
					}
				}
			};

			// Get options and category's and add them to this.menu
			let categorys = this.elements.options_container.querySelectorAll('cc-select-category');
			if (categorys.length > 0) {
				this.menu.categorys = [];
				categorys.forEach(category => {
					let options = [];
					category.querySelectorAll('cc-option').forEach(option => {
						let optionPacket = new Input.Select.Option(this, option, category);
						options.push(optionPacket);
						this.menu.options.push(optionPacket);
					});
					this.menu.categorys.push({
						element: category,
						name: category.getAttribute('text'),
						options: options
					});
				});
			} else {
				this.elements.options_container.querySelectorAll('cc-option').forEach(option => {
					let optionPacket = new Input.Select.Option(this, option, undefined);
					this.menu.options.push(optionPacket);
				});
			}

			// Fill data
			let write_attr = this.elements.input.getAttribute('write');
			if (write_attr != null) {
				let write_data = lStorage.getItem(write_attr);
				let defaultElement = this.elements.menu.querySelector('cc-option[default]');
				if (write_data == null) {
					lStorage.setItem(write_attr, defaultElement.getAttribute('text'));
					write_data = lStorage.getItem(write_attr);

					if (defaultElement) {
						this.menu.setSelection(this.menu.getOption(defaultElement).option);
						this.elements.input.classList.add('hint');
					}
				} else {
					this.menu.setSelection(this.menu.getOption(this.elements.menu.querySelector(`cc-option[text="${write_data}"]`)).option)
				}
			}

			// Click Listeners
			this.elements.overlay.addEventListener('click', (() => {this.close()}).bind(this));
			this.elements.select.addEventListener('click', (() => {this.open()}).bind(this));

			this.elements.select.addEventListener('focus', (() => {this.clickStart()}).bind(this));
			this.elements.select.addEventListener('blur', (() => {this.clickEnd()}).bind(this));
			this.elements.select.addEventListener('mousedown', (() => {this.clickStart()}).bind(this));
			this.elements.select.addEventListener('mouseout', (() => {this.clickEnd()}).bind(this));
			this.elements.select.addEventListener('touchstart', (() => {this.clickStart()}).bind(this), {passive: true});
			this.elements.select.addEventListener('touchend', (() => {this.clickEnd()}).bind(this), {passive: true});
			this.elements.select.addEventListener('touchcancel', (() => {this.clickEnd()}).bind(this), {passive: true});

			// Bind this to element
			element.inputData = this;
		}

		get value() {
			let callback = [];
			this.menu.selection.forEach(selection => {
				callback.push(this.values[selection]);
			});
			return callback;
		}

		clickStart() {
			this.elements.input.classList.add('focus');
		}
		clickEnd() {
			this.elements.input.classList.remove('focus');
		}
		open() {
			let translation;
			let translation_origin;
			let option = this.menu.options[this.menu.selection[0]];
			let	right = ((option != undefined && option.element != undefined && (Number.parseInt(window.getComputedStyle(option.element, null).getPropertyValue('padding-left').replace( /[^\d]/g, '')))) || 13) + ((String(this.elements.menu.getAttribute('checkbox')) == 'true') && 24 || 0);
			let transform_index = this.menu.categorys && 2 || 1;
			let	height = this.menu.options[0].element.offsetHeight;
			let search_group = this.elements.options_container.querySelectorAll('cc-select-category, cc-option');

			search_group.forEach((element, index) => {if (option != undefined && element == option.element) transform_index = (index+1)});
			if (transform_index > 3 && search_group.length - transform_index >= 3) {
				if (option != undefined) this.elements.options_container.scrollTop = 29+(height*(transform_index-4));
				translation =  Math.round((this.elements.menu.offsetHeight/2)+(height/2));
				translation_origin =  Math.round(this.elements.menu.offsetHeight/2);
			} else if (transform_index > 3 && search_group.length - transform_index < 3) {
				if (option != undefined) this.elements.options_container.scrollTop = 29+(height*(transform_index-4));
				translation = Math.round(156 + 10 + Math.abs(height*(((search_group.length-2)-transform_index))));
				translation_origin = Math.round((translation-height)+(height/2));
				if (search_group.length - transform_index == 0) translation_origin = translation;
			} else {
				this.elements.options_container.scrollTop = 0;
				translation = transform_index*height;
				translation_origin = ((transform_index-1)*height)+(height/2);
			}
			
			// Change menu translation
			this.elements.menu.style.setProperty('transform', `translate(-${right}px, calc(${-translation}px + 10px))`);
			this.elements.options_container.style.setProperty('transform-origin', `50% ${translation_origin}px`);
			this.elements.menu.style.setProperty('width', `calc(100% + ${(right+16)}px)`);

			// Add open class
			this.elements.input.classList.add('open');
		}
		close() {
			this.elements.input.classList.remove('open');
			if (this.elements.select.getAttribute('selection') == null || this.elements.select.getAttribute('selection') == '') {
				this.elements.input.classList.remove('hint');
			} else {
				this.elements.input.classList.add('hint');
			}

			this.elements.menu.style.setProperty('width', `100%`);
		}

		static Option = class {
			constructor(select, element, category) {
				this.select = select;
				this.element = element;
				this.category = category;
				this.text = element.getAttribute('text');

				new EasyRipple(element, {
					transparency: 0.09,
					anim_time: 0.6
				});
				element.addEventListener('click', (event => {this.clicked()}).bind(this));
			}

			clicked() {
				this.select.menu.setSelection(this);
			}
		}
	}

	static Check = class {
		constructor(options) {
			this.options = options || {}
			this.element = document.createElement('cc-checkbox');
			this.box = document.createElement('box');

			this.element.inputData = this;
			if (this.options) {
				this.isChecked = this.options.checked || false;
				if (this.options.before) this.element.setAttribute('before', '');
				if (this.options.text) this.element.setAttribute('text', this.options.text);
				if (this.options.indicator) this.element.setAttribute('indicator',''); else {
					this.element.addEventListener('click', () => this.toggle());
					new EasyRipple(this.element, {element: this.box,unbounded: true, centered: true, scale: 3, transparency: 0.1});
				}
			}

			this.element.append(this.box);
		}

		toggle() {
			this.element.toggleAttribute('checked');
			this.isChecked = !this.isChecked;

			if (this.onclick) this.onclick(this.isChecked);
		}
		click(_function) {
			this.onclick = _function;
		}
		disabled(state) {
			if (state) this.element.setAttribute('disabled', ''); else this.element.removeAttribute('disabled');
		}
	}
}

class HTMLBuilder {
	constructor(html, container) {
		if (container instanceof HTMLElement) this.html = container; else this.html = document.createElement('container');
		this.html.insertAdjacentHTML('beforeend', html);
	}
}

class Spinner {
	constructor(element) {
		this.elements = {
			container: element,
			svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			circle: document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		}

		this.elements.circle.setAttribute('cx', '50%');
		this.elements.circle.setAttribute('cy', '50%');
		this.elements.circle.setAttribute('r', '10');

		this.elements.svg.appendChild(this.elements.circle);
		this.elements.container.appendChild(this.elements.svg);

		this.elements.container.spinner = this;
		spinAnimation(this.elements.circle)
	}
}

class Snackbar {
	constructor(text, options) {
		this.element = document.createElement('cc-snackbar');
		this.text = text;

		// Options
		this.options = options || {};
		this.options.duration = this.options.duration || 3;

		// Other
		this.element.setAttribute('text', this.text);
	}

	show() {
		document.body.appendChild(this.element);
	}
}

//#endregion Classes


//#region Other

function setDefaultVal(value, defaultValue){
	return (value === undefined) ? defaultValue : value;
}

function FormBuilder(elements, options) {
	let container = document.createElement('div');

	elements.forEach(function(snapshot) {
		let snap_element = snapshot[0];
		let snap_options = snapshot[1];
		let element;

		switch (snap_element) {
			case 'input':
				element = document.createElement('cc-input');
				element.setAttribute('hint', snap_options.hint);
				break;
			case 'select':
				let option_count = 0;
				element = document.createElement('cc-input');
				element.setAttribute('hint', snap_options.hint);
				if (snap_options.write != undefined) element.setAttribute('write', snap_options.write);
				if (snap_options.onselection != undefined) element.setAttribute('onselection', snap_options.onselection);

				let option_values = [];
				let select_menu = document.createElement('cc-select-menu');
				let select_conatiner = document.createElement('cc-select-container');
				element.appendChild(document.createElement('cc-select'));
				element.appendChild(document.createElement('cc-select-overlay'));

				if (snap_options.checkbox) select_menu.setAttribute('checkbox', 'true');

				if (snap_options.category) {
					snap_options.options.forEach(function(category) {
						let category_element = document.createElement('cc-select-category');
						category_element.setAttribute('text', category.name);
						if (Array.isArray(category.children)) {
							category.children.forEach(function(option) {
								appendOption(category_element, option, option_count);
								option_count++;
								option_values.push(option);
							});
						} else {
							category.children.text.forEach(function(option) {
								appendOption(category_element, option, option_count);
								option_count++;
							});
							category.children.value.forEach(function(value) {
								option_values.push(value);
							});
						}
						select_conatiner.appendChild(category_element);
					});
					select_menu.appendChild(select_conatiner);
					element.appendChild(select_menu);
				} else {
					snap_options.options.forEach(function(option) {
						appendOption(select_conatiner, option, option_count);
						option_count++;
						option_values.push(option);
					});
					select_menu.appendChild(select_conatiner);
					element.appendChild(select_menu);
				}

				element.appendChild(controller.createElement('cc-select-icon', {class: ['material-icons'], innerHTML: 'arrow_drop_down'}));
				element.appendChild(document.createElement('cc-select-line'));
				
				new Input.Select(element, option_values);
				break;
		}
		container.appendChild(element);

		function appendOption(container, option, count) {
			let option_element = document.createElement('cc-option');
			if (snap_options.checkbox) {
				option_element.prepend(new Input.Check({indicator: true}).element);
				option_element.setAttribute('checkbox', 'true');
			}
			option_element.setAttribute('text', option);
			if (count == snap_options.default) option_element.setAttribute('default', '');
			container.appendChild(option_element);
		}
	});

	if (options != undefined && options.padding != undefined) container.style.setProperty('padding', options.padding);
	custom_input.load(container);
	return container;
}

//#endregion


//#region Any code for custom elements

$('cc-blocker').click(function() {
	this.parentElement.classList.remove('show');
	enableScroll();
});

$("cc-button[type='negative']").click(function() {
	$(this).parent().parent().removeClass('show');
	$('body').removeAttr('style');
});

let sendnot_element = document.getElementById('sendNot');
if (sendnot_element) sendnot_element.addEventListener('click', () => {
	let prompt = new Prompt('sendnotification', {
		title: 'Send Notifications',
		messages: [{
			message: 'Send notifications to targeted users this month',
			type: 'info'
		}],
		positive: {text: 'Send'},
		content: new HTMLBuilder(`
		<cc-sendnot>
			<h1>Targeted users</h1>
			<users><cc-progress-spinner></cc-progress-spinner></users>
		</cc-sendnot>
		`).container,
		processing: (_content, options) => {
			let failed_emails = '';
			let users = options.users[options.user_group];
			users.forEach((snapshot, index) => {
				if (snapshot.user.email) {
					let user_data = {
						name: {
							prefix: 'Brother/Sister',
							first: snapshot.user.firstname,
							last: snapshot.user.lastname
						},
						location: {
							town: cUser.city.toTitleCase(),
							state: cUser.state.toUpperCase()
						},
						shift: {
							location: firebase_users[index].location.toTitleCase(),
							time: shift_names[snapshot.shift.shift_time],
							date: `${getMonthName[date.month]} ${snapshot.shift.day}`
						}
					}

					if (!snapshot.shift.notified) email();
					async function email() {
						if (lStorage.development == 'true') {
							console.log(user_data);
						} else {
							let personRef = firebase.database().ref(`shifts/${cUser.state}/${cUser.city}/${date.year}/${date.month+1}/${snapshot.shift.day}/${snapshot.shift.location.replace(' ','_')}/${snapshot.shift.shift_time}/${snapshot.shift.person}`);
							let email = await sendEmail('You\'ve been added to a shift.', [snapshot.user.email], 1, user_data);
							if (email.success) personRef.update({notified: true}); else failed_emails = failed_emails == '' && `${snapshot.user.email}` || `${failed_emails}, ${snapshot.user.email}`;
						}
					}
				}
			});

			if (failed_emails != '') new Snackbar(`Could not send emails to: ${failed_emails}`, preset.snackbar.length.long).show();
		}
	});

	let targeted_users = [];
	let all_users = [];
	let checkbox = new Input.Check({text: 'Target Notified Users'});
	checkbox.click(state => {
		if (state) prompt.extra.user_group = 1; else prompt.extra.user_group = 0;
		if (prompt.extra.users) promptDisplayUsers(prompt.extra.users[prompt.extra.user_group]);
	});
	prompt.options.content.querySelector('cc-sendnot>h1').append(checkbox.element);
	prompt.open();

	firebase.database().ref('users').on('value', snapshot => {
		let snaphot_users = snapshot.val();
		prompt.options.content.querySelector('users').innerHTML = '';

		firebase_users.forEach(shift => {
			if (!shift.notified) targeted_users.push({shift: shift,user: snaphot_users[shift.id]});
			all_users.push({shift: shift, user: snaphot_users[shift.id]});
		});

		promptDisplayUsers(targeted_users);
		prompt.extra = {user_group: 0, users: [targeted_users, all_users]};

		if (targeted_users.length == all_users.length) {
			checkbox.disabled(true);
		}
	});

	function promptDisplayUsers(targeted_users) {
		let shown_users = [];
		prompt.options.content.querySelector('users').innerHTML = '';
		targeted_users.forEach(snapshot => {
			let user_text = document.createElement('user');
			let name = `${snapshot.user.firstname} ${snapshot.user.lastname}`;
			if (!shown_users.includes(name)) {
				user_text.innerHTML = name;
				prompt.options.content.querySelector('users').append(user_text);
			}
			
			shown_users.push(name);
		});

		if (targeted_users.length == 0) {
			let element = document.createElement('p');
			element.innerHTML = 'There are no targeted users this month.';
			prompt.options.content.querySelector('users').append(element);
		}
	}
});

var noti_list,
snackbar_list = [],
lStorage = window.localStorage;

var eventTest;

function Ripple(event) {
	var x = event.clientX - event.target.getBoundingClientRect().left;
	var y = event.clientY - event.target.getBoundingClientRect().top;

	this.element = document.createElement('cc-ripple');
	this.scaleRange = [1, 1.6];
	this.pixelRange = [1, 27];

	this.scale = Math.abs(((event.target.offsetLeft+(event.target.clientWidth/2)) - event.pageX))+1;
	this.scale = (((this.scale - this.pixelRange[0]) * (this.scaleRange[1] - this.scaleRange[0])) / (this.pixelRange[1] - this.pixelRange[0])) + this.scaleRange[0];

	this.element.setAttribute('size', this.scale);
	this.element.setAttribute('left', x + 'px');
	this.element.setAttribute('top', y + 'px');
	this.element.setAttribute('width', (event.target.offsetWidth + (event.target.offsetHeight/4))  + 'px');

	var rip = this.element;
	setTimeout(function() {
	$(rip).addClass('clicked');
	$(rip).attr('style', 'transform: translate(-50%, -50%) scale(' + rip.getAttribute('size') + ') !important; left: ' + rip.getAttribute('left') + '; top: ' + rip.getAttribute('top') + '; width: ' + rip.getAttribute('width') + '; height: ' + rip.getAttribute('width'));
	}, 15);
	// setTimeout(function() {
	//   rip.remove();
	// }, 415);
}

function FAB(element, event) {
	let x = event.clientX - element.getBoundingClientRect().left;
	let y = event.clientY - element.getBoundingClientRect().top;

	this.scaleRange = [1, 1.5];
	this.pixelRange = [1, element.clientWidth/4];

	this.scale = Math.abs((element.clientWidth/2) - x) + Math.abs((element.clientHeight/2) - y);
	this.scale = (((this.scale - this.pixelRange[0]) * (this.scaleRange[1] - this.scaleRange[0])) / (this.pixelRange[1] - this.pixelRange[0])) + this.scaleRange[0];

	this.element = document.createElement('cc-ripple');
	this.element.setAttribute('size', this.scale);
	this.element.setAttribute('left', x + 'px');
	this.element.setAttribute('top', y + 'px');
	this.element.setAttribute('width', (element.clientWidth+5)  + 'px');

	setTimeout(function() {
	$(rip).attr('style', 'transform: translate(-50%, -50%) scale(' + rip.getAttribute('size') + ') !important; left: ' + rip.getAttribute('left') + '; top: ' + rip.getAttribute('top') + '; width: ' + rip.getAttribute('width') + '; height: ' + rip.getAttribute('width'));
	}, 15);

	var rip = this.element;
	this.hide = function() {
	$(rip).addClass('clicked');

	setTimeout(function() {
		rip.remove();
	}, 400);
	}
}

var preset = {
	snackbar: {
		length: {
			short: 3000,
			long: 10000
		}
	}
};

var lastestNew;
var newChanges;
firebase.database().ref('new').on('value', function(snapshot) {
	lastestNew = snapshot.val().version;
	newChanges = snapshot.val().content;
	whatsNew(snapshot.val());
});

function whatsNew(changes) {
	if (lStorage.currentNew != lastestNew) {
	var div = document.createElement('div');
	changes.content.forEach(function(change) {
		var header = document.createElement('h2');
		if (change.title == undefined) {
		header.innerHTML = change;
		div.appendChild(header);
		} else {
		var container = document.createElement('div');
		container.appendChild(header);
		header.innerHTML = change.title;

		change.sub_content.forEach(function(sub_change, index, list) {
			var sub_text = document.createElement('p');
			sub_text.innerHTML = sub_change;

			if (sub_text.innerHTML.includes('&amp;upcheveron')) {
			var icon_element = document.createElement('i');
			icon_element.innerHTML = 'expand_less';
			icon_element.classList.add('material-icons');

			sub_text.innerHTML = sub_text.innerHTML.replace('&amp;upcheveron', icon_element.outerHTML);
			}
			if (sub_text.innerHTML.includes('&amp;uprightarrow')) {
			var icon_element = document.createElement('i');
			icon_element.innerHTML = 'call_made';
			icon_element.classList.add('material-icons');
			sub_text.innerHTML = sub_text.innerHTML.replace('&amp;uprightarrow', icon_element.outerHTML);
			}

			container.appendChild(sub_text);
		});
		div.appendChild(container);
		}
	});

	var snackbar = new Snackbar(changes.title, preset.snackbar.length.long)
	snackbar.content_element.appendChild(div);
	snackbar.show();
	}
}

var custom_input = {
	load: function(search_box) {
		var inputs = $(search_box.querySelectorAll('cc-input'));
		
		inputs.each(function(index) {
			let html_input;
			let hint_element;
			if (inputs[index].querySelector('cc-select') == null) html_input = document.createElement('input');
			if (inputs[index].querySelector('cc-hint') == null) hint_element = document.createElement('cc-hint');
			let error_element = document.createElement('cc-input-error');
			let line_element = document.createElement('cc-input-line');
		
			if (inputs[index].getAttribute('hint') != null && inputs[index].querySelector('cc-hint') == null) {
				hint_element.innerHTML = inputs[index].getAttribute('hint');
				inputs[index].prepend(hint_element);
			}
		
			if (inputs[index].querySelector('cc-select') == null) {
				html_input.setAttribute('type', inputs[index].getAttribute('type'));
				if (inputs[index].getAttribute('disabled') != null) html_input.setAttribute('disabled', '');
				html_input.addEventListener('focus', (event) => {
					event.target.parentElement.classList.add('open');
					event.target.parentElement.classList.add('focus');
				});
				html_input.addEventListener('blur', (event) => {
					if (event.target.value == '') event.target.parentElement.classList.remove('open');
					event.target.parentElement.classList.remove('focus');
				});
				inputs[index].append(html_input);
				inputs[index].append(line_element);
				inputs[index].append(error_element);
			} else {
				inputs[index].classList.add('select');
			}
		
			if (inputs[index].getAttribute('fill') == 'firstname') inputs[index].querySelector('input').value = cUser.firstName;
			if (inputs[index].getAttribute('fill') == 'lastname') inputs[index].querySelector('input').value = cUser.lastName;
			if (inputs[index].getAttribute('fill') == 'phonenumber' && cUser.phoneNumber != undefined) inputs[index].querySelector('input').value = cUser.phoneNumber;
			if (inputs[index].getAttribute('fill') == 'email') inputs[index].querySelector('input').value = cUser.email;
		
			if (inputs[index].querySelector('cc-select') == null && html_input.value != '') inputs[index].classList.add('open');
		});
	},
	changed: function(event) {
		let text = event.target.value;
		let type = event.target.parentElement.getAttribute('fb-update');
		let validation;
		
		if (type.includes('Name')) {
			let cleanedtype = type.replace(/(name)/gi, '');
			cleanedtype = cleanedtype.charAt(0).toUpperCase() + cleanedtype.slice(1);
			validation = new check_require.name(text, cleanedtype);
		} else if (type == 'phoneNumber') {
			validation = new check_require.phone(text);
			event.target.value = validation.fix;
		}

		if (validation.failed) event.target.parentElement.setError(validation.message); else event.target.parentElement.clearError();
		Form.get(event.target.parentElement.getAttribute('form-id')).checkForChanges();
	}
};

var check_require = {
	name: function(name, type) {
		let times_failed = 0,
			fail_message = '',
			requirements = [
				name.length>=1,
				/(^[A-z -]+$)/g.test(name) || name.length==0,
				(name.match(/ /g) || []).length<=1,
				(name.match(/-/g) || []).length<=1,
				!((name.match(/ /g) != null) && (name.match(/-/g) != null)),
				((name.match(/ /g) && (name.match(/([ ][A-z])/g) != null)) == null || (name.match(/ /g) && (name.match(/([ ][A-z])/g) != null)) == true),
				((name.match(/-/g) && (name.match(/([-][A-z])/g) != null)) == null || (name.match(/-/g) && (name.match(/([-][A-z])/g) != null)) == true),
				name.length<=50,
			],
			messages = [
				'is required',
				'must only contain A-Z characters',
				'may only contain 1 space',
				'may only contain 1 dash',
				'cannot contain a space and a dash',
				'cannot end with a space',
				'cannot end with a dash',
				'must be less than 50 characters',
		];

		requirements.forEach((value, index) => {
			if (!value) {
				switch (times_failed) {
					case 0:
						fail_message = type + ' name ' + messages[index] + '.';
						break;
					case 1:
						fail_message = fail_message + ' Also, it ' + messages[index] + '.';
						break;
					case 2:
						fail_message = fail_message + ' Additionally, it ' + messages[index] + '.';
						break;
					case 3:
						fail_message = fail_message + ' Furthermore, it ' + messages[index] + '.';
						break;
				}
				times_failed++;
			};
		});

		this.failed = false;
		this.fix = name;

		this.fix = this.fix.replace(/([^A-z -])/g, '');

		if (times_failed > 0) {
			this.failed = true;
			this.message = fail_message;
		};
	},
	phone: function(number) {
		this.fix = number;
		this.fix = this.fix.replace(/([^0-9- \+])/g, '');

		let times_failed = 0,
			fail_message = '',
			requirements = [
				this.fix.length>=10 || this.fix.length==0,
				(/\+/g.test(this.fix)) || /(^([0-9]{3}-?){3}[0-9]$)/g.test(this.fix) || this.fix.length==0,
				!(/\+/g.test(this.fix)) || (/(^\+[0-9]{1,3} ([0-9]{3}-?){3}[0-9]$)/g.test(this.fix)) || this.fix.length==0,
				!(/ /g.test(this.fix)) || /(^[+])/g.test(this.fix) || this.fix.length==0,
				(this.fix.match(/ /g) || []).length<=1,
				(this.fix.match(/\+/g) || []).length<=1,
				this.fix.length<=17,
			],
			messages = [
				'must be at least 10 characters long',
				'must be formated as 000-000-0000',
				'must be formated as +0 000-000-0000',
				'must have a + at the beginning',
				'may only contain 1 space',
				'may only contain 1 +',
				'must be less than 18 characters',
		];

		requirements.forEach((value, index) => {
			if (!value) {
				switch (times_failed) {
					case 0:
						fail_message = 'Phone number ' + messages[index] + '.';
						break;
					case 1:
						fail_message = fail_message + ' Also, it ' + messages[index] + '.';
						break;
					case 2:
						fail_message = fail_message + ' Additionally, it ' + messages[index] + '.';
						break;
					case 3:
						fail_message = fail_message + ' Furthermore, it ' + messages[index] + '.';
						break;
				}
				times_failed++;
			};
		});

		this.failed = false;

		if (times_failed > 0) {
			this.failed = true;
			this.message = fail_message;
		};
	}
};

var selects = {
	cache: [],
	load: function(search_box) {
		var selects = $(search_box.querySelectorAll('cc-select'));
		
		var tempOpen = this.open;
		var tempClose = this.close;

		selects.each(function(index) {
			if (selects[index].parentElement.getAttribute('write') != null) {
				var writeData = lStorage.getItem(selects[index].parentElement.getAttribute('write'));

				if (writeData == null) {
					lStorage.setItem(selects[index].parentElement.getAttribute('write'), selects[index].parentElement.querySelector('cc-select-menu').querySelector('cc-option[default]').getAttribute('text'));
					writeData = lStorage.getItem(selects[index].parentElement.getAttribute('write'));
				}
				selects[index].setAttribute('selection', writeData);
				selects[index].parentElement.classList.add('open');
			}

			selects[index].addEventListener('click', () => {
				var option = this.parentElement.querySelector('cc-select-menu').querySelector('cc-option[text="'+this.getAttribute('selection')+'"]');
				if (option != null) option.classList.add('selected');
				tempOpen(this, option);
			});
			selects[index].addEventListener('mousedown', clickStart);
			selects[index].addEventListener('mouseout', clickEnd);
			selects[index].addEventListener('touchstart', clickStart);
			selects[index].addEventListener('touchend', clickEnd);
			selects[index].addEventListener('touchcancel', clickEnd);

			function clickStart() {
				this.parentElement.classList.add('downfocus');
			}
			function clickEnd() {
				this.parentElement.classList.remove('downfocus');
			}
		});

		$(search_box.querySelectorAll('cc-option')).click(function(e) {
			let ref;
			if (this.parentElement.tagName == 'cc-select-category'.toUpperCase()) ref = this.parentElement.parentElement.parentElement.parentElement; else ref = this.parentElement.parentElement.parentElement;

			if (this.getAttribute('checkbox') == 'true') {
				let checkbox = this.querySelector('cc-checkbox');
				if (String(checkbox.getAttribute('checked')) == 'true') {
					checkbox.setAttribute('checked', 'false');
				} else {
					checkbox.setAttribute('checked', 'true');
				}
			} else {
				ref.querySelector('cc-select').setAttribute('selection', this.getAttribute('text'));
				if (ref.getAttribute('write') != null) lStorage.setItem(ref.getAttribute('write'), this.getAttribute('text'));
				if (ref.getAttribute('onselection') != null) {
					var text = this.getAttribute('text');
					eval(ref.getAttribute('onselection'));
				}

				tempClose(this.parentElement.parentElement);
			}
			
		});

		$(search_box.querySelectorAll('cc-select-overlay')).click(function(e) {tempClose(this);});

		search_box.querySelectorAll('cc-option').forEach(option => new EasyRipple(option, {transparency: 0.09,anim_time: 0.6}));
	},
	open: function(element, option) {
		let parent_element = $(element.parentElement).find('cc-select-category, cc-option');
		let hasCategory = $(element.parentElement).find('cc-select-category').length > 0;
		let option_index;
		let	right = (option != null && Number.parseInt(window.getComputedStyle(option, null).getPropertyValue('padding-left').replace( /[^\d]/g, ''))) || 16;
		let	height = 45;
		let translation;
		let translation_origin;

		if (hasCategory) option_index = 1; else option_index = 0;
		parent_element.each(function(index) {if (parent_element[index] == option) option_index = index;});

		if (option_index >= 3 && parent_element.length - option_index > 3) {
			option.scrollIntoView({block: 'center'});
			translation =  Math.round(-140);
			translation_origin =  Math.round(118.5);
			console.log('Less than greater than 3 more than 3 from end');
		} else if (parent_element.length - option_index <= 3) {
			option.scrollIntoView({block: 'center'});
			translation = Math.round(-156 + (-height*(-((parent_element.length-3)-option_index))));
			translation_origin = Math.round(148.5+(height*(-((parent_element.length-3)-option_index))))-2;
			console.log('Less than 3 from end');
		} else {
			element.parentElement.querySelector('cc-select-menu').scrollTop
			translation = (-height * option_index) + -35;
			translation_origin = (height * option_index) + (height/2);
			console.log('Other');
		}

		element.parentElement.querySelector('cc-select-menu').style.setProperty('transform', `translate(-${right}px, ${translation}px)`);
		element.parentElement.querySelector('cc-select-menu').style.setProperty('width', 'calc(100% + '+ (right*2) +'px)');
		element.parentElement.querySelector('cc-select-container').style.setProperty('transform-origin', '50% '+ translation_origin +'px');
		element.parentElement.classList.add('open');
		element.parentElement.classList.add('focus');
	},
	close: function(element) {
		let ref;
		if (element.querySelector('cc-select-category') != null) ref = element.parentElement.parentElement; else ref = element.parentElement;
		ref.classList.remove('focus');
		ref.classList.remove('downfocus');
		setTimeout(function() {
			$('cc-option').removeClass('selected');
		}, 200);
		
		
		if (ref.querySelector('cc-select').getAttribute('selection') == null) element.parentElement.classList.remove('open');
	}
}
// selects.load(document);

let fab = {
	load: function() {
		let fabs = document.querySelectorAll('cc-fab'),
			index = 0;

		fabs.forEach(function(fab) {
			let button = document.createElement('button'),
				fab_ripple,
				hint_timer,
				hint,
				icon = document.createElement('i');

			icon.classList.add('material-icons');
			icon.innerHTML = fab.getAttribute('icon');
			button.appendChild(icon);
			fab.appendChild(button);

			button.style.setProperty('z-index', (10+(fabs.length-index)));
			if (index != 0) fab.style.setProperty('button', (20+(index*(fab.clientHeight+10))) + 'px');
			if (fab.getAttribute('label') != null) {
				hint = document.createElement('cc-fab-hint');
				hint.innerText = fab.getAttribute('label');
				fab.appendChild(hint);
			}

			fab.addEventListener('mouseover', hoverStart);
			fab.addEventListener('mousedown', clickStart);
			fab.addEventListener('mouseup', clickEnd);
			fab.addEventListener('mouseout', hoverEnd);

			fab.addEventListener('touchstart', touchStart, {passive: true});
			fab.addEventListener('touchend', touchEnd, {passive: true});
			fab.addEventListener('touchcancel', touchEnd, {passive: true});

			function hoverStart() {
				if (hint != undefined) hint_timer = setTimeout(function() {
				hint.classList.add('show');
				}, 500);
			}

			function hoverEnd() {
				if (hint != undefined) {
				clearTimeout(hint_timer);
				hint.classList.remove('show');
				}
				clickEnd();
			}

			function clickStart(event) {
				if (event.targetTouches == undefined) fab_ripple = new FAB(button, event); else fab_ripple = new FAB(button, event.targetTouches['0']);
				button.appendChild(fab_ripple.element);
				if (hint != undefined) {
				clearTimeout(hint_timer);
				hint.classList.remove('show');
				}
			}

			function clickEnd() {
				if (fab_ripple != undefined) fab_ripple.hide();
			}

			function touchStart(event) {
				hoverStart();
				if (event.targetTouches == undefined) fab_ripple = new FAB(button, event); else fab_ripple = new FAB(button, event.targetTouches['0']);
				button.appendChild(fab_ripple.element);
			}

			function touchEnd() {
				hoverEnd();
				clickEnd();
			}

			index++;
		});
	}
}
fab.load();

document.querySelectorAll('[ripple]').forEach(element => new EasyRipple(element, {transparency: 0.1, anim_time: 0.1, centered: true, unbounded: true}));

//#endregion


//#region Prototype additions

HTMLElement.prototype.setError = function(message) {
	let error_element = this.querySelector('cc-input-error');
	error_element.innerText = message;
	this.classList.add('error');
}

HTMLElement.prototype.clearError = function() {
	this.classList.remove('error');
}

HTMLElement.prototype.getInputValue = function() {return this.querySelector('input').value;}

/* HTMLElement.prototype.getValue = function() {
	if (this.classList.contains('select')) {
		
	} else return this.querySelector('input').value;
} */

HTMLElement.prototype.getParents = function() {
	let parents = [];
	let element = this;
	for (element && element !== document; element = element.parentNode;) parents.push(element);
	return parents;
}

//#endregion
