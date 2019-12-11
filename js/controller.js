$("body").addClass("con_show");

var controller = {
  page: {
    goto: function(page) {
      $("body").addClass("con_hide");
      setTimeout(function() {
        var current_page = window.location.href;
        var final_page;
        if (current_page.includes("file:///")) {
          final_page = "/GitHub/solarfluxx.github.io/" + page;
          if (!final_page.includes(".html")) final_page = final_page + ".html";
        } else final_page = "/" + page;
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
