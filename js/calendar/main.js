var calendar = {
  populate: function() {
    for (i = 0; i < items.length; i++) {
      if (i == 9) {
        createAccept(i, "2");
        createDecline(i, "4");
        createUnconfirm(i, "2");
        items[i].setAttribute("class", "day has-info");
      }

      if (i == 24) {
        createAccept(i, "5");
        // createDecline(i, "2");
        createUnconfirm(i, "7");
        items[i].setAttribute("class", "day has-info");
      }
    }
  }
}

function createAccept(item, count) {
  var secL = document.createElement("section");
  var secS = document.createElement("section");
  secL.setAttribute("class", "task accept large");
  secS.setAttribute("class", "task accept small");
  secL.innerHTML = count + " Accepted";
  secS.innerHTML = count;
  items[item].appendChild(secL);
  items[item].appendChild(secS);
}
function createDecline(item, count) {
  var secL = document.createElement("section");
  var secS = document.createElement("section");
  secL.setAttribute("class", "task decline large");
  secS.setAttribute("class", "task decline small");
  secL.innerHTML = count + " Declined";
  secS.innerHTML = count;
  items[item].appendChild(secL);
  items[item].appendChild(secS);
}
function createUnconfirm(item, count) {
  var secL = document.createElement("section");
  var secS = document.createElement("section");
  secL.setAttribute("class", "task unconfirm large");
  secS.setAttribute("class", "task unconfirm small");
  secL.innerHTML = count + " Unconfirmed";
  secS.innerHTML = count;
  items[item].appendChild(secL);
  items[item].appendChild(secS);
}
