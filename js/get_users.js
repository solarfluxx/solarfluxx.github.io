function UserPacket(id, firstname, lastname, index) {
	var container_element = document.createElement("cc-item"),
	text_element = document.createElement("p");
	container_element.appendChild(text_element);
	container_element.setAttribute("index", index);

	this.id = id;
	this.name_first = firstname;
	this.name_last = lastname;
	this.name_full = this.name_first + " " + this.name_last;
	this.element = container_element;
	this.text_element = text_element;

	new EasyRipple(this.element, 0.1, 0.4);

	text_element.innerHTML = this.name_full;
}
function ShiftPacket(shiftIndex, shiftTime, index) {
	var container_element = document.createElement("cc-item"),
	text_element = document.createElement("p");
	container_element.appendChild(text_element);
	container_element.setAttribute("index", index);

	this.shift_index = shiftIndex;
	this.shift_time = shiftTime;
	this.element = container_element;
	this.text_element = text_element;

	text_element.innerHTML = this.shift_time;
}

var edit_page_open = false;
var user_editor_tools = {
	openEditPage: function(data) {
		data.target.parentElement.parentElement.style.setProperty("height", data.target.parentElement.scrollHeight+"px");
		data.target.parentElement.parentElement.style.setProperty("height", data.target.parentElement.parentElement.getElementsByTagName("cc-users-edit")[0].scrollHeight+"px")
		$(data.target.parentElement.parentElement.getElementsByTagName("cc-users-edit")).addClass("edit_page");
		$("cc-user-text").addClass("edit_page");
		edit_page_open = true;
	},
	closeEditPage: function() {
		$("cc-users-edit").removeClass("edit_page");
		$("cc-user-text").removeClass("edit_page");
		$("cc-user-editor")[0].style.setProperty("height", $("cc-users")[0].clientHeight+"px");
		setTimeout(function() {
			$("cc-user-editor")[0].style.setProperty("height", "auto")
		}, 300);
		edit_page_open = false;
	}
};

var users_list = [],
users = {
	getAll: function() {
		firebase.database().ref().child('users').orderByChild('firstname').on("value", function(snapshot) {
			$("cc-users").html("");
			snapshot.forEach(function(data) {
				var item = new UserPacket(data.key, data.val().firstname, data.val().lastname, users_list.length);
				users_list.push(item);
				$("cc-users").append(item.element);
			});
			$("cc-item").click(function(data) {
				if ($("cc-user-editor").length == 0) {
					promiseKept(users_list[data.target.getAttribute("index")]);
					user_popup.close();
				} else {
					user_editor_tools.openEditPage(data);
					$("cc-user-text").attr("edit-name", users_list[data.target.getAttribute("index")].name_full);
				}
			});
			return users_list;
		});
	},
	search: function(search_text) {
		if (edit_page_open) {
			user_editor_tools.closeEditPage();
			setTimeout(function() {
				filter();
			}, 300);
		} else filter();

		function filter() {
			$("cc-users").children().each(function(index) {
				if ($("cc-users").children()[index].innerHTML.toUpperCase().indexOf(search_text.toUpperCase()) > -1) {
					$($("cc-users").children()[index]).removeClass("hide_item");
				} else {
					$($("cc-users").children()[index]).addClass("hide_item");
				}
			});
		}
	}
};

$("cc-user-text i").click(function() {
	user_editor_tools.closeEditPage();
});

var shifts_list = [],
choose_user_shift = {
	populate: function() {
		var state = cUser.location.substring(0,2),
				city = cUser.location.substring(3),
				allShiftsRef = firebase.database().ref("shifts/"+state+"/"+city+"/shifts");

		allShiftsRef.once('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				var item = new ShiftPacket(childSnapshot.key, childSnapshot.val(), shifts_list.length);
				shifts_list.push(item);
				$("cc-user-shift").append(item.element);
			});
			$("cc-item").click(function(data) {
				promiseKept(shifts_list[data.target.getAttribute("index")]);
				user_popup.close();
			});
		});
		return users_list;
	}
};

var promiseKept;
var promiseBroken;
var user_popup = {
	open: function(type) {
		if (type == "users") $("cc-popup[use='users']").addClass("show");
		if (type == "shifts") $("cc-popup[use='shifts']").addClass("show");
		disableScroll();
	},
	close: function() {
		$("cc-popup[use='users']").removeClass("show");
		$("cc-popup[use='shifts']").removeClass("show");
		promiseBroken(true);
		enableScroll();
	},
	getUser: function(type) {
		this.open(type);
		return new Promise(function(kept, broken) {
			promiseKept = kept;
			promiseBroken = broken;
		});
	}
};

let adduser_element = document.getElementById('addUser');
if (adduser_element) adduser_element.addEventListener('click', () => {
	let users = {names: [], ids: []};
	let shifts = {names: [], indexs: []};
	firebase.database().ref().child('users').orderByChild('firstname').once("value", function(snapshot) {
		snapshot.forEach(function(data) {
			users.names.push(`${data.val().firstname} ${data.val().lastname}`);
			users.ids.push(data.key);
		});
	}).then(() => {
		firebase.database().ref("shifts/"+cUser.state+"/"+cUser.city+"/shifts").once("value", function(snapshot) {
			snapshot.forEach(function(shift) {
				shifts.names.push(shift.val());
				shifts.indexs.push(shift.key);
			});
		}).then(showPrompt);
	});

	function showPrompt() {
		new Prompt('usershift', {
			title: 'Add user to shift',
			positive: {text: 'Add User'},
			content: FormBuilder([
					['select', {hint: 'Shift', category: true, options: [
						{name: 'Normal', children: {text: shifts.names.slice(0, 4), value: shifts.indexs.slice(0, 4)}},
						{name: 'Short', children: {text: shifts.names.slice(4), value: shifts.indexs.slice(4)}}
					]}],
					['select', {hint: 'User', category: true, checkbox: true, options: [
						{name: 'Available', children: {text: users.names, value: users.ids}}
					]}],
			], {padding: '0px'}),
			processing: content => {
				let userIds = content.querySelector('cc-input[hint="User"]').inputData.value;
				let shiftTime = content.querySelector('cc-input[hint="Shift"]').inputData.value[0];
	
				userIds.forEach(id => {
					addUserRef = firebase.database().ref("shifts/"+cUser.state+"/"+cUser.city+"/"+date.year+"/"+(date.month+1)+"/"+(date.selected+1)+"/"+getQueryVariable("location")+"/"+shiftTime+"/");
					addUserRef.push({
						id: id,
						state: 0
					});
				});
			}
		}).open();
	}
});
