var calendar = {
  container: "text",
  items: [],
  date: {
    full: new Date(),
    year: this.calendar
  },
  populate: function(date) {
    var days_in_month = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    for (i = 1; i <= days_in_month; i++) {
      var div = document.createElement("div");
      div.setAttribute("class", "day");
      div.innerHTML = i;
      calendar.container.appendChild(div);
    }
  },
  populateShifts: function() {
    for (i = 0; i < this.items.length; i++) {
      if (i == 9) {
        // createAccept(i, "2");
        // createDecline(i, "4");
        // createUnconfirm(i, "2");

        calendar.createItem.accept(i, "2");
        calendar.createItem.decline(i, "4");
        calendar.createItem.unconfirm(i, "2");
        this.items[i].setAttribute("class", "day has-info");
      }

      if (i == 24) {
        // createAccept(i, "5");
        // createDecline(i, "2");
        // createUnconfirm(i, "7");
        this.items[i].setAttribute("class", "day has-info");
      }
    }
  },
  createItem: {
    accept: function(item, count) {
      var secL = document.createElement("section");
      var secS = document.createElement("section");
      secL.setAttribute("class", "task accept large");
      secS.setAttribute("class", "task accept small");
      secL.innerHTML = count + " Accepted";
      secS.innerHTML = count;
      calendar.items[item].appendChild(secL);
      calendar.items[item].appendChild(secS);
    },
    decline: function(item, count) {
      var secL = document.createElement("section");
      var secS = document.createElement("section");
      secL.setAttribute("class", "task decline large");
      secS.setAttribute("class", "task decline small");
      secL.innerHTML = count + " Declined";
      secS.innerHTML = count;
      calendar.items[item].appendChild(secL);
      calendar.items[item].appendChild(secS);
    },
    unconfirm: function(item, count) {
      var secL = document.createElement("section");
      var secS = document.createElement("section");
      secL.setAttribute("class", "task unconfirm large");
      secS.setAttribute("class", "task unconfirm small");
      secL.innerHTML = count + " Unconfirmed";
      secS.innerHTML = count;
      calendar.items[item].appendChild(secL);
      calendar.items[item].appendChild(secS);
    }
  }
}
