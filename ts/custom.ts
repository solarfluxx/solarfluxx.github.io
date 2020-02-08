interface SelectOption {
    element: Element,
    text: String
}

class Input {
	constructor() {}

	static Select = class {
        elements: {select: any;};
        menu: {
            categorys: any[];
            options: SelectOption[];
            getOption: Function;
        };
        parentElement: any;
		constructor(element: HTMLElement) {
			this.elements = {
				select: element.querySelector('cc-select')
			};
			this.menu = {
				categorys: [],
				options: [],
				getOption: (arg: HTMLElement) => {
                    let index: number;
                    let callbackOption: SelectOption;
                    this.menu.options.forEach(option => {
                        if (option.element = arg) callbackOption = option;
                        index++;
                    });
                    
					if (index >= 0) return {
						option: callbackOption,
						index: index
					}; else return false;
				}
			};

			element.querySelectorAll('cc-select-category').forEach(category => {
				let options = [];
				category.querySelectorAll('cc-option').forEach(option => {
					let optionPacket: SelectOption = {
						element: option,
						text: option.getAttribute('text')
					};
					options.push(optionPacket);
					this.menu.options.push(optionPacket);
				});
				this.menu.categorys.push({
					element: category,
					name: category.getAttribute('text'),
					options: options
				});
			});

			this.elements.select.addEventListener('click', (() => {
				// var option = this.parentElement.querySelector('cc-select-menu').querySelector('cc-option[text="'+this.getAttribute('selection')+'"]');
				// if (option != null) option.classList.add('selected');
				// tempOpen(this, option);

				// this.
			}).bind(this));
			this.elements.select.addEventListener('mousedown', this.clickStart);
			this.elements.select.addEventListener('mouseout', this.clickEnd);
			this.elements.select.addEventListener('touchstart', this.clickStart);
			this.elements.select.addEventListener('touchend', this.clickEnd);
			this.elements.select.addEventListener('touchcancel', this.clickEnd);

			console.log(this);
			
		}

		clickStart() {
			this.parentElement.classList.add('downfocus');
		}
		clickEnd() {
			this.parentElement.classList.remove('downfocus');
		}
	}
}