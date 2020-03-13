// var buttons = document.getElementsByTagName("cc-tut-button");
// for (var i = 0; i < buttons.length; i++) {
// 	buttons[i].addEventListener("mousedown", function(event) {
// 		event.target.appendChild(new Ripple(event).element);
// 	});
// }

document.querySelectorAll('cc-tut-button').forEach(element => new EasyRipple(element, {unbounded: true}));

var skip_button = document.querySelector("cc-tut-button[skip]");
if (skip_button != null) {
	skip_button.addEventListener("click", function(event) {
		event.target.parentElement.parentElement.classList.add("hideTut");
		setTimeout(function() {
			event.target.parentElement.parentElement.remove();
			var snack = new Snackbar("You can view the tutorial by going to Profile &#129046; Play Tutorial", preset.snackbar.length.long, true);
			snack.click(function() {
				controller.page.goto("profile", ['to="tutorial"']);
			});
			snack.show();
		}, 200);
	});
}

class Tutorial {
	constructor(type) {
		this.type = type;
		this.stages = [];

		Tutorial.list = [];
		Tutorial.list.push(this);
	}
	/**
	 * @param {object} stage
	 */
	createStage(stage) {
		this.stages.push(stage);
	}
	show() {
		this.stages.forEach(function(stage) {
			if (stage.type == 'info') {
				let tut_container = document.createElement('cc-tut');
				if (typeof stage.text == 'object') {
					stage.text.forEach(function(snapshot) {
						let text_element = document.createElement('p');
						text_element.innerHTML = snapshot;
						tut_container.appendChild(text_element);
					});
				} else {
					let text_element = document.createElement('p');
					text_element.innerHTML = stage.text;
					tut_container.appendChild(text_element);
				}

				if (Array.isArray(stage.button)) {
					stage.button.forEach(function(snapshot) {
						let text_element = document.createElement('p');
						text_element.innerHTML = snapshot;
						tut_container.appendChild(text_element);
					});
				} else {
					let text_element = document.createElement('cc-tut-button');
					text_element.innerHTML = stage.button;
					tut_container.appendChild(text_element);
				}
				
				document.body.appendChild(tut_container);
			}
		});
	}
}
