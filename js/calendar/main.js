const getMonthName = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

var date = {
  full: new Date(),
  year: null,
  month: null,
  day: null,
  days: null,
  first: null,
};
date.year = date.full.getFullYear();
date.month = date.full.getMonth();
date.day = date.full.getDate();
date.days = new Date(date.year, date.month+1, 0).getDate();
date.first = new Date(date.year, date.month, 1).getDay();

var calendar = {
  container: "text",
  items: [],
  allitems: [],
  setDate: function(inputDate) {
    date.full = inputDate;
    date.year = date.full.getFullYear();
    date.month = date.full.getMonth();
    date.day = date.full.getDate();
    date.days = new Date(date.year, date.month+1, 0).getDate();
    date.first = new Date(date.year, date.month, 1).getDay();
  },
  populateDates: function() {
    calendar.items = calendar.container.getElementsByClassName('day');
    calendar.allitems = calendar.container.getElementsByTagName("div");
    for (var i = calendar.allitems.length - 1; i >= 0; --i) {
      calendar.allitems[i].remove();
    }
    for (i = 1; i <= date.first; i++) {
      var div = document.createElement("div");
      div.setAttribute("class", "day--disabled");
      if (i == date.first) {
        div.style.setProperty("border-right", "1px solid rgba(166,168,179,0.12)");
      }
      calendar.container.appendChild(div);
    }
    for (i = 1; i <= date.days; i++) {
      var div = document.createElement("div");
      if (i == date.day) {
        div.setAttribute("class", "day current");
      } else {
        div.setAttribute("class", "day");
      }
      div.innerHTML = i;
      calendar.container.appendChild(div);
    }
    var leftover = 7 - calendar.allitems.length % 7;
    if (leftover < 7) {
      for (i = 0; i < leftover; i++) {
        var div = document.createElement("div");
        div.setAttribute("class", "day--disabled");
        calendar.container.appendChild(div);
      }
    }
    document.getElementById("month_button").innerHTML = getMonthName[date.month] + " ▾"

    var week_days = calendar.container.getElementsByClassName("day-name");
    for (i = 0; i < week_days.length; i++) {
      if (i == date.full.getDay()) {
        week_days[i].setAttribute("class", "day-name current");
      } else {
        week_days[i].setAttribute("class", "day-name");
      }
    }
  },
  populateShifts: function() {
    for (i = 0; i < this.items.length; i++) {
      if (i == 9) {
        calendar.createItem.accept(i, "2");
        calendar.createItem.decline(i, "4");
        calendar.createItem.unconfirm(i, "2");
        if (calendar.items[i].getAttribute("class").includes("current")) {
          this.items[i].setAttribute("class", "day current has-info");
        } else {
          this.items[i].setAttribute("class", "day has-info");
        }
      }
    }
  },
  populate: function() {
    calendar.populateDates();
    calendar.populateShifts();
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
