//#region Classes

class EasyRipple {
	constructor(element, transparency, animation_time) {
		this.element = element;
		this.anim_time = animation_time;
		this.transparency = transparency;
		this.ripple = null;
		this.rippleList = [];

		// Callbacks
		let tempclass = this,
			start = event => tempclass.clickStart(event),
			end = () => tempclass.clickEnd();

		// Event Listeners
		this.element.addEventListener('mousedown', start);
		this.element.addEventListener('mouseup', end);
		this.element.addEventListener('mouseout', end);
		this.element.addEventListener('touchstart', start, false);
		this.element.addEventListener('touchend', end, false);
		this.element.addEventListener('touchcancel', end, false);
	}
	clickStart(event) {
		if (event.targetTouches != undefined) event = event.targetTouches['0']
		this.ripple = new EasyRipple.Ripple(event, this);
		this.rippleList.push(this.ripple);
		this.element.appendChild(this.ripple.element);
		this.element.style.setProperty('position', 'relative');
		this.element.style.setProperty('overflow', 'hidden');
	}
	clickEnd() {
		this.rippleList.forEach(ripple => {
			if (ripple != undefined) {
				if (ripple.timeoutOver) {
					ripple.hide();
				}
				ripple.mouseup = true;
			}
		});
	}
	static Ripple = class {
		constructor(event, that) {
			let x = event.clientX - that.element.getBoundingClientRect().left,
				y = event.clientY - that.element.getBoundingClientRect().top,
				scaleRange = [1, 1.5],
				pixelRange = [1, that.element.clientWidth/4],
				scale = (((Math.abs((that.element.clientWidth/2) - x) + Math.abs((that.element.clientHeight/2) - y) - pixelRange[0]) * (scaleRange[1] - scaleRange[0])) / (pixelRange[1] - pixelRange[0])) + scaleRange[0];

			this.element = document.createElement('cc-ripple');
			this.element.setAttribute('size', scale);
			this.element.setAttribute('left', x + 'px');
			this.element.setAttribute('top', y + 'px');
			this.element.setAttribute('width', (that.element.clientWidth+5)  + 'px');
			this.element.setAttribute('height', (that.element.clientHeight+(that.element.clientWidth/2))  + 'px');
			this.timeoutOver = false;
			this.mouseup = false;
			this.that = that;
			this.timeout = setTimeout((() => {
				this.timeoutEnd();
			}).bind(this), (that.anim_time*1000));

			let temp_ripple = this.element;
			setTimeout(function() {
				if (that.anim_time != null && that.anim_time >= 0) temp_ripple.style.setProperty('transition', `transform ${that.anim_time}s cubic-bezier(0, 0, 0, 1), opacity 0.4s`);
				if (that.transparency != null && that.transparency >= 0) temp_ripple.style.setProperty('background-color', `rgba(var(--text-dec), ${that.transparency})`);
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
			if (this.mouseup) {
				this.hide();
			}
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
		let callback_inputChanged = this.inputChanged;
		if (inputs.length > 0) {
			let callbackInputs = this.inputs;
			inputs.forEach(function(input) {
				callbackInputs.push(input);
				input.addEventListener('input', callback_inputChanged);
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
		this.button.addEventListener('click', this.onSubmission);
	}

	clearSubmissionEvent() {
		this.button.removeEventListener('click', this.onSubmission);
	}
	checkForChanges() {
		let enable = false;
		let fail = false;
		this.inputs.forEach(function(input) {
			if (input.getInputValue() != "" && input.getInputValue() != cUser[input.getAttribute('fb-update')]) enable = true;
			if (input.classList.contains('error')) fail = true;
		});

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
		// let text = event.target.value;
		// let type = event.target.parentElement.getAttribute('fb-update');

		inputValidations.forEach(function(validation) {
			if (validation.input == event.target) {
				console.log(`This is same input: ${validation}`);
				
			}
		});

		// let validation;

		// if (validation.failed) event.target.parentElement.setError(validation.message); else event.target.parentElement.clearError();
		// Form.get(event.target.parentElement.getAttribute('form-id')).checkForChanges();
	}
}

class Prompt {
	constructor(id, options) {
		this.id = id;
		this.options = options;
		this.reference = this.createPromptElements();

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
		let prompt = [
			document.createElement('cc-popup'),
			document.createElement('cc-blocker'),
			document.createElement('cc-prompt'),
			document.createElement('title'),
			document.createElement('content'),
			document.createElement('cc-button'),
			document.createElement('cc-button')
		];

		prompt[3].innerText = setDefaultVal(this.options.title, 'Prompt');
		prompt[5].innerText = setDefaultVal(this.options.positive && this.options.positive.text, 'Okay');
		prompt[6].innerText = setDefaultVal(this.options.negitive && this.options.negitive.text, 'Cancel');

		prompt[5].addEventListener('click', () => this.positive());
		prompt[6].addEventListener('click', () => this.negitive());
		
		prompt[5].setAttribute('type', 'positive');
		prompt[6].setAttribute('type', 'negative');
		
		new EasyRipple(prompt[5], 0.1, 0.2);
		new EasyRipple(prompt[6], 0.1, 0.2);

		prompt[4].appendChild(this.options.content);
		prompt[0].appendChild(prompt[1]);
		prompt[0].appendChild(prompt[2]);
		prompt[2].appendChild(prompt[3]);
		prompt[2].appendChild(prompt[4]);
		prompt[2].appendChild(prompt[5]);
		prompt[2].appendChild(prompt[6]);

		return document.body.appendChild(prompt[0]);
	}
	open() {
		disableScroll();
		setTimeout(function() {
			this.reference.classList.add('show');
		}.bind(this), 50);

		return new Promise((kept, broken) => {
			this.promise = {
				kept: kept,
				broken: broken
			}
		});
	}
	close() {
		enableScroll();
		this.reference.classList.remove('show');
	}
	positive() {
		this.close();
		this.promise.kept(true);
	}
	negitive() {
		this.close();
		this.promise.broken(true);
	}
}

class Input {
	constructor() {}

	static Select = class {
		constructor(element, values) {
			// Declare Variables
			this.values = values;
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
						let checkbox = option.element.querySelector('cc-checkbox');
						if (String(checkbox.getAttribute('checked')) == 'true') {
							option.element.classList.remove('selected');
							checkbox.setAttribute('checked', 'false');
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
				}
			};

			// Get options and category's and add them to this.menu
			let categorys = this.elements.input.querySelectorAll('cc-select-category');
			if (categorys.length >= 0) {
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
				this.elements.input.querySelectorAll('cc-option').forEach(option => {
					let optionPacket = new Input.Select.Option(this, option, undefined);
					this.menu.options.push(optionPacket);
				});
			}

			// Click Listeners
			this.elements.overlay.addEventListener('click', (() => {this.close()}).bind(this));
			this.elements.select.addEventListener('click', (() => {this.open()}).bind(this));
			this.elements.select.addEventListener('mousedown', (() => {this.clickStart()}).bind(this));
			this.elements.select.addEventListener('mouseout', (() => {this.clickEnd()}).bind(this));
			this.elements.select.addEventListener('touchstart', (() => {this.clickStart()}).bind(this));
			this.elements.select.addEventListener('touchend', (() => {this.clickEnd()}).bind(this));
			this.elements.select.addEventListener('touchcancel', (() => {this.clickEnd()}).bind(this));

			console.log(this);

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
			let	right = ((option != undefined && option.element != undefined && (Number.parseInt(window.getComputedStyle(option.element, null).getPropertyValue('padding-left').replace( /[^\d]/g, '')))) || 16) + ((String(this.elements.menu.getAttribute('checkbox')) == 'true') && 24 || 0);
			let transform_index = this.menu.categorys && 2 || 1;
			let	height = this.menu.options[0].element.offsetHeight;
			let search_group = this.elements.options_container.querySelectorAll('cc-select-category, cc-option');

			search_group.forEach((element, index) => {if (option != undefined && element == option.element) transform_index = (index+1)});
			if (transform_index > 3 && search_group.length - transform_index > 3) {
				if (option != undefined) option.element.scrollIntoView({block: 'center'});
				translation =  Math.round((this.elements.menu.offsetHeight/2)+(height/2));
				translation_origin =  Math.round(this.elements.menu.offsetHeight/2);
			} else if (search_group.length - transform_index <= 3) {
				if (option != undefined) option.element.scrollIntoView({block: 'center'});
				translation = Math.round(156 + 10 + Math.abs(height*(((search_group.length-2)-transform_index))));
				translation_origin = (translation-height)+(height/2);
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
			if (this.elements.select.getAttribute('selection') == null) {
				this.elements.input.classList.remove('hint');
			} else {
				this.elements.input.classList.add('hint');
			}
		}

		static Option = class {
			constructor(select, element, category) {
				this.select = select;
				this.element = element;
				this.category = category;
				this.text = element.getAttribute('text');

				new EasyRipple(element, 0.09, 0.6);
				element.addEventListener('click', (event => {this.clicked()}).bind(this));
			}

			clicked() {
				this.select.menu.setSelection(this);
			}
		}
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
				element = document.createElement('cc-input');
				element.setAttribute('hint', snap_options.hint);

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
						category.children.text.forEach(function(option) {
							appendOption(category_element, option);
						});
						category.children.value.forEach(function(value) {
							option_values.push(value);
						});
						select_conatiner.appendChild(category_element);
					});
					select_menu.appendChild(select_conatiner);
					element.appendChild(select_menu);
				} else {
					snap_options.options.forEach(function(option) {
						appendOption(select_conatiner, option);
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

		function appendOption(container, option) {
			let option_element = document.createElement('cc-option');
			if (snap_options.checkbox) {
				option_element.prepend(document.createElement('cc-checkbox'));
				option_element.setAttribute('checkbox', 'true');
			}
			option_element.setAttribute('text', option);
			container.appendChild(option_element);
		}
	});

	if (options.padding != undefined) container.style.setProperty('padding', options.padding);
	custom_input.load(container);
	// selects.load(container);
	return container;
}

//#endregion

//#region Any code for custom elements

$('cc-blocker').click(function() {
	$(this).parent().removeClass('show');
	$('body').removeAttr('style');
	enableScroll();
});

$("cc-button[type='negative']").click(function() {
	$(this).parent().parent().removeClass('show');
	$('body').removeAttr('style');
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

function Snackbar(text, length, persistant) {
	this.snackbar_element = document.createElement('cc-snackbar');
	this.container_element = document.createElement('div');
	this.text_element = document.createElement('p');
	this.content_element = document.createElement('div');

	this.text = text;
	this.length = length;
	this.persistant = persistant;

	this.text_element.innerHTML = this.text;

	this.snackbar_element.appendChild(this.container_element);
	this.container_element.appendChild(this.text_element);
	this.container_element.appendChild(this.content_element);

	this.click = function(fun) {
	this.container_element.classList.add('isClickable');
	this.icon_element = document.createElement('i');
	this.icon_element.innerHTML = 'call_made';
	this.icon_element.classList.add('material-icons');
	this.text_element.appendChild(this.icon_element);
	this.container_element.addEventListener('click', function(event) {
		fun();
	});
	};

	this.show = function() {
	if (document.querySelector('cc-snackbar') == null) {
		var tempSnack = this.snackbar_element,
		tempLength = this.length;
		tempEnd = this.end;
		document.querySelector('body').appendChild(this.snackbar_element);

		var disappearTimeout;

		if (this.content_element.children.length > 0) {
		this.icon_element = document.createElement('i');
		this.icon_element.innerHTML = 'expand_less';
		this.icon_element.classList.add('material-icons');
		this.text_element.appendChild(this.icon_element);

		this.container_element.classList.add('isClickable');

		var tempSnack = this.snackbar_element;
		var tempIcon = this.icon_element;
		this.text_element.addEventListener('click', function(event) {
			if (tempSnack.classList.contains('expand')) close(); else clearTimeout(disappearTimeout);
			tempSnack.classList.toggle('expand');
			tempIcon.classList.toggle('rotate');
			lStorage.currentNew = lastestNew;
		});
		}

		setTimeout(function() {
		tempSnack.classList.add('show');
		close();
		}, 15);

		function close() {
		disappearTimeout = setTimeout(function() {
			tempSnack.classList.remove('show');
			setTimeout(function() {
			tempSnack.remove();
			tempEnd();
			}, 200);
		}, tempLength);
		}
	} else {
		snackbar_list.push(this);
	}
	};

	this.end = function() {
	if (snackbar_list.length > 0) {
		snackbar_list[0].show();
		snackbar_list.splice(0, 1);
	}
	}

	// this.save = function() {
	//   var snackbar_data = {
	//     text: this.text
	//   }
	//
	//   if (lStorage.noti != undefined) noti_list = JSON.parse(lStorage.noti); else noti_list = [];
	//   noti_list.push(snackbar_data);
	//   lStorage.noti =  JSON.stringify(noti_list);
	// }
	//
	// if (persistant) this.save();
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
			if (inputs[index].querySelector('cc-select') == null) var html_input = document.createElement('input');
			let hint_element = document.createElement('cc-hint');
			let error_element = document.createElement('cc-input-error');
			let line_element = document.createElement('cc-input-line');
		
			if (inputs[index].getAttribute('hint') != null) {
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

		search_box.querySelectorAll('cc-option').forEach(option => new EasyRipple(option, 0.09, 0.6));
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
selects.load(document);

let fab = {
	load: function() {
		let fabs = document.querySelectorAll('cc-fab'),
			index = 0;

		fabs.forEach(function(fab) {
			if (index != 0) fab.style.setProperty('button', (20+(index*(fab.clientHeight+10))) + 'px');
			let button = document.createElement('button'),
				fab_ripple,
				hint_timer,
				hint,
				icon = document.createElement('i');

			icon.classList.add('material-icons');
			icon.innerHTML = fab.getAttribute('icon');
			button.appendChild(icon);
			fab.appendChild(button);


			if (fab.getAttribute('label') != null) {
				hint = document.createElement('cc-fab-hint');
				hint.innerText = fab.getAttribute('label');
				fab.appendChild(hint);
			}

			fab.addEventListener('mouseover', hoverStart);
			fab.addEventListener('mousedown', clickStart);
			fab.addEventListener('mouseup', clickEnd);
			fab.addEventListener('mouseout', hoverEnd);

			fab.addEventListener('touchstart', touchStart, false);
			fab.addEventListener('touchend', touchEnd, false);
			fab.addEventListener('touchcancel', touchEnd, false);

			function hoverStart() {
				if (hint != undefined) hint_timer = setTimeout(function() {
				hint.classList.add('show');
				}, 1000);
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

//#endregion
