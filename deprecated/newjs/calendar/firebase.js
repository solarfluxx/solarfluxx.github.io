var shiftsRef,
abc_array = [],
shift_names = [],
user_id;

calendar.firebase = {
  getShiftNames: function() {
    var state = cUser.location.substring(0,2),
        city = cUser.location.substring(3),
        shiftNamesRef = firebase.database().ref("shifts/"+state+"/"+city+"/shifts");

    shiftNamesRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        shift_names.push(childSnapshot.val());
      });
    });
  },
  getUserShifts: function() {
    var state = cUser.location.substring(0,2);
    var city = cUser.location.substring(3);
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
              user_id = childSnapshot4.val().id;

              if (user_id == cUser.id) doLoopStuff();

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
  },
  getAllUsersShifts: function() {
    var state = cUser.location.substring(0,2),
    city = cUser.location.substring(3),
    shift_count = 0;
    abc_array = [];
    $(".task").remove();
    shiftsRef = firebase.database().ref("shifts/"+state+"/"+city+"/"+date.year+"/"+(date.month+1)+"/");

    shiftsRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var state_un = 0,
            state_ac = 0,
            state_de = 0,
            loop_date = childSnapshot.key-1;
        childSnapshot.child("/" + getQueryVariable("location").replace(/_/g, " ")).forEach(function(childSnapshot2) {
          var loop_shift_time = childSnapshot2.key;
          childSnapshot2.forEach(function(childSnapshot3) {
            var loop_person = childSnapshot3.key;
            user_id = childSnapshot3.val().id;
            switch (childSnapshot3.val().state) {
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
            var abc_object = {
              date: loop_date,
              location: getQueryVariable("location").replace(/_/g, " "),
              shift_time: loop_shift_time,
              person: loop_person,
              state: childSnapshot3.val().state,
              id: user_id
            }
            abc_array.push(abc_object);
            shifts.create(false, (loop_date+1), toTitleCase(abc_object.location), abc_object.shift_time, abc_object.state, shift_time.person);
          });
        });
        calendar.createShift.all(loop_date, state_ac, state_de, state_un);
      });
    });
  }
}
