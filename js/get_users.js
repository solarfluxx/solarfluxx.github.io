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
    $("body").css("overflow", "hidden");
  },
  close: function() {
    $("cc-popup[use='users']").removeClass("show");
    $("cc-popup[use='shifts']").removeClass("show");
    $("body").removeAttr("style");
    promiseBroken(true);
  },
  getUser: function(type) {
    this.open(type);
    return new Promise(function(kept, broken) {
      promiseKept = kept;
      promiseBroken = broken;
    });
  }
};

$("button#addUser").click(function() {
  user_popup.getUser("users").then(function(value) {
    var selectedUser = value;

    user_popup.getUser("shifts").then(function(value) {
      console.log(value);
      var state = cUser.location.substring(0,2),
      city = cUser.location.substring(3),
      addUserRef = firebase.database().ref("shifts/"+state+"/"+city+"/"+date.year+"/"+(date.month+1)+"/"+(date.selected+1)+"/"+getQueryVariable("location")+"/"+value.shift_index+"/");
      addUserRef.push({
        id: selectedUser.id,
        state: 0
      });

    }).catch(function(e) {
      console.log("No shift chosen");

    });
  }).catch(function(e) {
    console.log("No user chosen");

  });
});
