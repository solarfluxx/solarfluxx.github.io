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
