var darkMode = false;
var darkThemeMode = window.localStorage.darkmode;
var preferedTheme = window.matchMedia("(prefers-color-scheme: dark)");
function themeChanged(e) {
	preferedTheme = e;
	toggleDarkMode(darkThemeMode);
}
preferedTheme.addListener(themeChanged);

if (darkThemeMode == undefined) window.localStorage.setItem("darkmode", "Device Theme");

toggleDarkMode(darkThemeMode);

function toggleDarkMode(mode) {
	if (mode == null) {
		if (darkMode == false) on(); else off();
	} else {
		switch (mode) {
			case "Light":
				off();
				break;
			case "Dark":
				on();
				break;
			case "Time of Day":
				if (new Date().getHours() >= 19 || new Date().getHours() <= 6) on(); else off();
				break;
			case "Device Theme":
				if (preferedTheme.matches) on(); else off();
				break;
		}
	}


	function on() {
		document.documentElement.style.setProperty('--selected-text', getComputedStyle(document.documentElement).getPropertyValue('--selected-text-dark'));
		document.documentElement.style.setProperty('--semi-primary', getComputedStyle(document.documentElement).getPropertyValue('--semi-primary-dark'));
		document.documentElement.style.setProperty('--background', getComputedStyle(document.documentElement).getPropertyValue('--background-dark'));
		document.documentElement.style.setProperty('--text-dec', getComputedStyle(document.documentElement).getPropertyValue('--text-light-dec'));
		document.documentElement.style.setProperty('--hover-20', getComputedStyle(document.documentElement).getPropertyValue('--hover-20-dark'));
		document.documentElement.style.setProperty('--shadow', getComputedStyle(document.documentElement).getPropertyValue('--shadow-dark'));
		document.documentElement.style.setProperty('--border', getComputedStyle(document.documentElement).getPropertyValue('--border-dark'));
		document.documentElement.style.setProperty('--text', getComputedStyle(document.documentElement).getPropertyValue('--full-light'));
		document.documentElement.style.setProperty('--semi', getComputedStyle(document.documentElement).getPropertyValue('--semi-dark'));
		document.documentElement.style.setProperty('--full', getComputedStyle(document.documentElement).getPropertyValue('--full-dark'));
		$(".calendar").addClass("dark");
		darkMode = true;
	}

	function off() {
		document.documentElement.style.setProperty('--selected-text', getComputedStyle(document.documentElement).getPropertyValue('--selected-text-light'));
		document.documentElement.style.setProperty('--semi-primary', getComputedStyle(document.documentElement).getPropertyValue('--semi-primary-light'));
		document.documentElement.style.setProperty('--background', getComputedStyle(document.documentElement).getPropertyValue('--background-light'));
		document.documentElement.style.setProperty('--hover-20', getComputedStyle(document.documentElement).getPropertyValue('--hover-20-light'));
		document.documentElement.style.setProperty('--text-dec', getComputedStyle(document.documentElement).getPropertyValue('--text-dark-dec'));
		document.documentElement.style.setProperty('--shadow', getComputedStyle(document.documentElement).getPropertyValue('--shadow-light'));
		document.documentElement.style.setProperty('--border', getComputedStyle(document.documentElement).getPropertyValue('--border-light'));
		document.documentElement.style.setProperty('--semi', getComputedStyle(document.documentElement).getPropertyValue('--semi-light'));
		document.documentElement.style.setProperty('--full', getComputedStyle(document.documentElement).getPropertyValue('--full-light'));
		document.documentElement.style.setProperty('--text', getComputedStyle(document.documentElement).getPropertyValue('--full-dark'));
		$(".calendar").removeClass("dark");
		darkMode = false;
	}
}

var sw;
var endpoint;
const applicationServerPublicKey = 'BIdvwzdWMw6JP7kFkQUUmDbhWjJ6AjOeHYYpLCl831vZnz3oR6iutk6LvTWtAkrWObLpQxPV5jvcAzqO9vrRfIY';

function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js').then(function(registration) {
			console.log('ServiceWorker registration successful with scope: ', registration.scope);

			sw = registration;

			const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
			registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: applicationServerKey
			}).then(function(subscription) {
				console.log('User is subscribed.', subscription);
				endpoint = subscription;
			}).catch(function(error) {
				console.log('Failed to subscribe the user: ', error);
			});

		}, function(error) {
			console.log('ServiceWorker registration failed: ', error);
		});
	});
}

$("body").addClass("con_show");

if (document.querySelector(".main_container") != null) {
	setTimeout(function() {
		document.querySelector(".main_container").style.setProperty("transform", "scale(0.95)");
		setTimeout(function() {
			document.querySelector(".main_container").style.setProperty("transition", "transform 0.5s");
			document.querySelector(".main_container").style.setProperty("transform", "");
			setTimeout(function() {
				document.querySelector(".main_container").style.setProperty("transition", "var(--navbar-transition)");
			}, 500);
		}, 300);
	}, 100);
}

var controller = {
	page: {
		goto: function(page, query) {
			$("body").addClass("con_hide");
			setTimeout(function() {
				var current_page = window.location.href;
				var final_page;
				if (current_page.includes("file:///")) {
					final_page = "/GitHub/solarfluxx.github.io/" + page;
					if (!final_page.includes(".html")) final_page = final_page + ".html";
				} else final_page = "/" + page;

				if (typeof query != "undefined") {
					var query_out = "";
					query.forEach(function(snapshot) {
						var out = "&" + snapshot;
						query_out = query_out+out;
						console.log(out);
					});
					query_out = query_out.replace("&", "?");
					final_page = final_page + query_out;
				}

				window.location = final_page;
			}, 200);
			return false;
		}
	}
};

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

function Password(password) {
	var requirements = [
		password.length >= 6,
		(/[A-Z]/.test(password)),
		(/[a-z]/.test(password)),
		(/[0-9]/.test(password))
	];

	this.requirements = requirements;
	this.password = password;
	this.auth = requirements.every(Boolean);

	if (this.requirements[0] == false) {
		this.message = "Password must be at least 6 characters"
	}
	if (this.requirements[1] == false) {
		this.message = "Password must contain an uppercase letter"
	}
	if (this.requirements[2] == false) {
		this.message = "Password must contain a lowercase letter"
	}
	if (this.requirements[3] == false) {
		this.message = "Password must contain a number"
	}

	return this.auth;
}


function disableScroll() {
	const main_container = document.body.querySelector('.main_container');

	main_container.style.top = `-${window.scrollY}px`;
	main_container.style.position = 'fixed';
	main_container.style.overflow = 'unset';
	document.body.classList.add('noscroll');
}
function enableScroll() {
	const main_container = document.body.querySelector('.main_container');
	const scrollY = main_container.style.top;

	main_container.style.top = '';
	main_container.style.position = '';
	main_container.style.overflow = '';
	document.body.classList.remove('noscroll');
	window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
        $(".navbar").addClass("shadow");
    }
    else {
        if (!document.body.classList.contains('noscroll')) $(".navbar").removeClass("shadow");
    }
});
