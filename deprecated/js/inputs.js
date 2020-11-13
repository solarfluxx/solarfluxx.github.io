function setError(value) {
  document.getElementById('error_text').innerHTML = value;
  document.getElementById('error_text').style.setProperty("color", "#da893b");
}
function setSuccess(value) {
  document.getElementById('error_text').innerHTML = value;
  document.getElementById('error_text').style.setProperty("color", "#35bb00");
}
