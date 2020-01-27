// Any code for custom elements

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
	load: function() {
		var inputs = $('cc-input');
		
		inputs.each(function(index) {
			if (inputs[index].querySelector('cc-select') == null) var html_input = document.createElement('input');
			let hint_element = document.createElement('cc-hint');
			let error_element = document.createElement('cc-input-error');
		
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

class Form {
	constructor(id, button) {
		this.id = id;
		this.inputs = [];
		this.button = button;

		let inputs = document.querySelectorAll('cc-input[form-id='+id+']');
		if (inputs.length > 0) {
			let callbackInputs = this.inputs;
			inputs.forEach(function(input) {
				callbackInputs.push(input);
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
}

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
  load: function() {
	var selects = $('cc-select');
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

	  selects[index].addEventListener('click', (event) => {
		var option = this.parentElement.querySelector('cc-select-menu').querySelector('cc-option[text="'+this.getAttribute('selection')+'"]');
		if (option != null) option.classList.add('selected');
		tempOpen(this, option);
	  });
	  selects[index].addEventListener('mousedown', (event) => {
		this.parentElement.classList.add('downfocus');
	  });
	});

	$('cc-option').click(function(e) {
	  this.parentElement.parentElement.querySelector('cc-select').setAttribute('selection', this.getAttribute('text'));
	  if (this.parentElement.parentElement.getAttribute('write') != null) lStorage.setItem(this.parentElement.parentElement.getAttribute('write'), this.getAttribute('text'));
	  if (this.parentElement.parentElement.getAttribute('onselection') != null) {
		var text = this.getAttribute('text');
		eval(this.parentElement.parentElement.getAttribute('onselection'));
	  }

	  tempClose(this.parentElement);
	});

	$('cc-select-overlay').click(function(e) {
	  tempClose(this);
	});
  },
  open: function(element, option) {
	element.parentElement.classList.add('open');
	element.parentElement.classList.add('focus');
	element.parentElement.querySelector('cc-select-menu').style.setProperty('transform', 'translate(-8px, '+ (-38 + (-39 * ($(option).index()))) +'px)');
  },
  close: function(element) {
	element.parentElement.classList.remove('focus');
	element.parentElement.classList.remove('downfocus');
	setTimeout(function() {
	  $('cc-option').removeClass('selected');
	}, 200);
	if (element.parentElement.querySelector('cc-select').getAttribute('selection') == null) element.parentElement.classList.remove('open');
  }
}

selects.load();

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

// Prototype additions

HTMLElement.prototype.setError = function(message) {
	let error_element = this.querySelector('cc-input-error');
	error_element.innerText = message;
	this.classList.add("error");
}

HTMLElement.prototype.clearError = function() {
	this.classList.remove("error");
}

HTMLElement.prototype.getInputValue = function() {return this.querySelector('input').value;}
