function Item(id, firstname, lastname, index) {
  var container_element = document.createElement("cc-item");
  var text_element = document.createElement("p");
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
        var item = new Item(data.key, data.val().firstname, data.val().lastname, users_list.length);
        users_list.push(item);
        $("cc-users").append(item.element);
      });
      $("cc-item").click(function(data) {
        console.log(users_list[data.target.getAttribute("index")]);
        console.log($(data.target.parentElement.parentElement));

        user_editor_tools.openEditPage(data);
        $("cc-user-text").attr("edit-name", users_list[data.target.getAttribute("index")].name_full);
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
