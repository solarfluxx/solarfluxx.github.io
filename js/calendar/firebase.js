var shiftsRef,
userId;

calendar.firebase = {
  getUserShifts: function(onlyThisUser) {
    var state = user.location.substring(0,2);
    var city = user.location.substring(3);
    var shift_count = 0;
    shifts.clear();
    shifts.create(true);
    shiftsRef = firebase.database().ref("shifts/"+state+"/"+city+"/"+date.year+"/"+(date.month+1)+"/");

    shiftsRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var state_un = 0,
            state_ac = 0,
            state_de = 0,
            loop_date = childSnapshot.key-1;
        childSnapshot.forEach(function(childSnapshot2) {
          var loop_location = childSnapshot2.key;
          childSnapshot2.forEach(function(childSnapshot3) {
            var loop_shift_time = childSnapshot3.key;
            childSnapshot3.forEach(function(childSnapshot4) {
              var loop_person = childSnapshot4.key;
              userId = childSnapshot4.val().id;

              if (onlyThisUser && userId == user.uid) doLoopStuff();
              if (!onlyThisUser) doLoopStuff();

              function doLoopStuff() {
                switch (childSnapshot4.val().state) {
                  case 0:
                    state_un++;
                    break;
                  case 1:
                    state_ac++;
                    break;
                  case 2:
                    state_de++;
                    break;
                }
                if (shift_count == 0) shifts.clear();
                shifts.create(false, (loop_date+1), toTitleCase(loop_location), loop_shift_time, childSnapshot4.val().state, loop_person);
                shift_count++;
              }
            });
          });
        });
        calendar.createShift.all(loop_date, state_ac, state_de, state_un);
      });
    });
  }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
