const getMonthName = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];
const getDayName = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];
const getFullDayName = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
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
  container: null,
  items: [],
  allitems: [],
  firebase: {
    getShifts: null
  },
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
      var day = document.createElement("div");
      var div = document.createElement("div");
      var day_number = document.createElement("p");
      var day_name = document.createElement("p");

      day.setAttribute("class", "day");
      if (i == date.day) $(day).addClass("current selected");
      div.setAttribute("class", "day-text");
      day_number.setAttribute("class", "short");
      day_name.setAttribute("class", "long");

      day_number.innerHTML = i;
      day_name.innerHTML = getDayName[new Date(date.year, date.month, i).getDay()];

      div.appendChild(day_name);
      div.appendChild(day_number);
      day.appendChild(div);
      calendar.container.appendChild(day);
    }
    document.getElementById("month_button").innerHTML = getMonthName[date.month]

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
        calendar.createShift.accept(i, "2");
        calendar.createShift.decline(i, "4");
        calendar.createShift.unconfirm(i, "2");
        // if (calendar.items[i].getAttribute("class").includes("current")) {
        //   this.items[i].setAttribute("class", "day current has-info");
        // } else {
        //   this.items[i].setAttribute("class", "day has-info");
        // }
        $(this.items[i]).addClass("has-info");
      }
    }
  },
  populate: function() {
    calendar.populateDates();
    calendar.populateShifts();
  },
  deleteShift: {
    all: function(day) {
      if (day == null) return "Please enter a day";
      var shifts = calendar.items[day].getElementsByClassName("task");
      for (var i = shifts.length - 1; i >= 0; --i) {
        shifts[i].remove();
      }
    }
  },
  editShift: {
    all: function(day, accept_count, decline_count, unconfirm_count) {
      if (day == null) return "Please enter a day";
      if (accept_count == null) return "Please enter accept count, set to 0 for none";
      if (decline_count == null) return "Please enter decline count, set to 0 for none";
      if (unconfirm_count == null) return "Please enter unconfirm count, set to 0 for none";
      if (accept_count == 0) calendar.items[day].getElementsByClassName("task accept")[0].remove();
      if (decline_count == 0) calendar.items[day].getElementsByClassName("task decline")[0].remove();
      if (unconfirm_count == 0) calendar.items[day].getElementsByClassName("task unconfirm")[0].remove();

      if (accept_count != 0) calendar.items[day].getElementsByClassName("task accept large")[0].innerHTML = accept_count + " Accepted";
      if (accept_count != 0) calendar.items[day].getElementsByClassName("task accept small")[0].innerHTML = accept_count;
      if (decline_count != 0) calendar.items[day].getElementsByClassName("task decline large")[0].innerHTML = decline_count + " Declined";
      if (decline_count != 0) calendar.items[day].getElementsByClassName("task decline small")[0].innerHTML = decline_count;
      if (unconfirm_count != 0) calendar.items[day].getElementsByClassName("task unconfirm large")[0].innerHTML = unconfirm_count + " Unconfirmed";
      if (unconfirm_count != 0) calendar.items[day].getElementsByClassName("task unconfirm small")[0].innerHTML = unconfirm_count;
    }
  },
  createShift: {
    all: function(day, accept_count, decline_count, unconfirm_count) {
      if (day == null) return "Please enter a day";
      if (accept_count == null) return "Please enter accept count, set to 0 for none";
      if (decline_count == null) return "Please enter decline count, set to 0 for none";
      if (unconfirm_count == null) return "Please enter unconfirm count, set to 0 for none";

      if (accept_count != 0) calendar.createShift.accept(day, accept_count);
      if (decline_count != 0) calendar.createShift.decline(day, decline_count);
      if (unconfirm_count != 0) calendar.createShift.unconfirm(day, unconfirm_count);
    },
    accept: function(item, count) {
      var secL = document.createElement("section");
      var secS = document.createElement("section");
      secL.setAttribute("class", "task accept large");
      secS.setAttribute("class", "task accept small");
      secL.innerHTML = count + " Accepted";
      secS.innerHTML = count;
      calendar.items[item].appendChild(secL);
      calendar.items[item].appendChild(secS);
      $(calendar.items[item]).addClass("has-info");
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
      $(calendar.items[item]).addClass("has-info");
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
      $(calendar.items[item]).addClass("has-info");
    }
  }
};

var shifts = {
  create: function(day, location, shift_time, state) {
    var div = document.createElement("div");
    var p1 = document.createElement("p");
    var p2 = document.createElement("p");
    var p3 = document.createElement("p");
    var sec = document.createElement("section");
    var b1 = document.createElement("button");
    var b2 = document.createElement("button");
    var i1 = document.createElement("i");
    var i2 = document.createElement("i");

    switch (state) {
      case 0:
        sec.setAttribute("class", "task unconfirm");
        sec.innerHTML = "Unconfirmed";
        break;
      case 1:
        sec.setAttribute("class", "task accept");
        sec.innerHTML = "Accepted";
        break;
      case 2:
        sec.setAttribute("class", "task decline");
        sec.innerHTML = "Declined";
        break;
    }

    i1.setAttribute("class", "fas fa-check");
    i2.setAttribute("class", "fas fa-times");
    b1.setAttribute("class", "accept");
    b2.setAttribute("class", "decline");

    p1.innerHTML = getFullDayName[new Date(date.year, date.month, 14).getDay()] + ", " + getMonthName[date.month] + " " + day;
    p2.innerHTML = location;
    p3.innerHTML = shift_time;

    b1.innerHTML = "Accept";
    b2.innerHTML = "Decline";
    b1.prepend(i1);
    b2.prepend(i2);
    if (state == 1) $(b1).addClass("hide-button");
    if (state == 2) $(b2).addClass("hide-button");

    div.appendChild(p1);
    div.appendChild(p2);
    div.appendChild(p3);
    div.appendChild(sec);
    if (state == 1 || state == 0) {
      div.appendChild(b1);
      div.appendChild(b2);
    }
    if (state == 2) {
      div.appendChild(b2);
      div.appendChild(b1);
    }
    document.getElementById("shifts").appendChild(div);
  }
};
