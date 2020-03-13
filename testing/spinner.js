function spinnerAnimation(amount, size) {
	let circle_size = Math.ceil(size);
	let keyframes = [];

	let keyframe_count = amount + 1;
	let rotate = 360 / amount;
	let offset = {
		default: circle_size / amount,
		full: circle_size - (circle_size / amount)
	}

	let offset_type = 0;
	for (let index = 0; index < keyframe_count; index++) {
		let keyframe = {
			strokeDashoffset: offset_type == 0 && offset.default || offset_type == 1 && offset.full || offset_type == 2 && -offset.default,
			transform: `rotate(${index != 0 && rotate * (index-1) || 0}deg)`,
			offset: (1 / amount) * index
		}
		keyframes.push(keyframe);

		if (index != 0 && keyframe_count - index != 1) {
			let second_keyframe = {
				strokeDashoffset: offset_type == 1 && -offset.full || offset_type == 2 && offset.default,
				transform: `rotate(${rotate * index}deg)`,
				offset: ((1 / amount) * index) + 0.000001
			}

			keyframes.push(second_keyframe);
		}

		if (offset_type >= 2) offset_type = 1; else offset_type++;
	}

	return keyframes;
}

SVGCircleElement.prototype.spinAnimation = function() {
	this.style.setProperty('stroke-dasharray', this.getTotalLength());
	this.animate(spinnerAnimation(8, this.getTotalLength()), {
		duration: 4000,
		easing: 'linear',
		iterations: Infinity,
	});
}

// document.querySelector('circle').spinAnimation();
