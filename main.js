// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDccM8NijKEohOCjqGQ0ikeyMpf8kI3tz4",
  authDomain: "jw-cart-scheduler.firebaseapp.com",
  databaseURL: "https://jw-cart-scheduler.firebaseio.com",
  projectId: "jw-cart-scheduler",
  storageBucket: "jw-cart-scheduler.appspot.com",
  messagingSenderId: "88108065951",
  appId: "1:88108065951:web:17aa36f528d6db6977aeaa",
  measurementId: "G-8J2DPL43FW"
};
var config = {
  apiKey: "AIzaSyDccM8NijKEohOCjqGQ0ikeyMpf8kI3tz4",
  authDomain: "jw-cart-scheduler.firebaseapp.com",
  databaseURL: "https://jw-cart-scheduler.firebaseio.com"
};
var secondaryApp = firebase.initializeApp(config, "Secondary");

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();

function changePage(page) {
  var offline = window.location.href;
  var final_page;
  if (offline.includes("file:///")) {
    final_page = "/Users/robbi/OneDrive/Documents/GitHub/solarfluxx.github.io/" + page;
    final_page = final_page + ".html";
  } else final_page = "/" + page;
  window.location = final_page;
}

function logout() {
  firebase.auth().signOut();
}
