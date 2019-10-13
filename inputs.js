function setError(value) {
  document.getElementById('error_text').innerHTML = value;
}

function changePage(page) {
  var offline = window.location.href;
  var final_page;
  if (offline.includes("file:///")) final_page = "/Users/robbi/OneDrive/Cart%20Scheduler/" + page; else final_page = "/" + page;
  window.location = final_page;
}
