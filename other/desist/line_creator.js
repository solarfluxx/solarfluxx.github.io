function Ripple(event) {
  var x = event.clientX - event.target.getBoundingClientRect().left;
  var y = event.clientY - event.target.getBoundingClientRect().top;

  this.element = document.createElement("cc-ripple");
  this.scaleRange = [1, 1.6];
  this.pixelRange = [1, 27];

  this.scale = Math.abs(((event.target.offsetLeft+(event.target.clientWidth/2)) - event.pageX))+1;
  this.scale = (((this.scale - this.pixelRange[0]) * (this.scaleRange[1] - this.scaleRange[0])) / (this.pixelRange[1] - this.pixelRange[0])) + this.scaleRange[0];

  this.element.setAttribute("size", this.scale);
  this.element.setAttribute("left", x + "px");
  this.element.setAttribute("top", y + "px");
  this.element.setAttribute("width", (event.target.offsetWidth + (event.target.offsetHeight/4))  + "px");

  var rip = this.element;
  setTimeout(function() {
    $(rip).addClass("clicked");
    $(rip).attr("style", "transform: translate(-50%, -50%) scale(" + rip.getAttribute("size") + ") !important; left: " + rip.getAttribute("left") + "; top: " + rip.getAttribute("top") + "; width: " + rip.getAttribute("width") + "; height: " + rip.getAttribute("width"));
  }, 15);
  setTimeout(function() {
    rip.remove();
  }, 415);
}

function loadInputs(input) {
  var inputs = $("dl-input");

  if (input == null || input == undefined) {
    inputs.each(function(index) {
      loadInput(inputs[index]);
    });
  } else {
    loadInput(input);
  }

  function loadInput(input) {
    if (input.querySelector("dl-hint") == null) {
      if (input.querySelector("dl-select") == null) var html_input = document.createElement("input");
      var hint_element = document.createElement("dl-hint");

      if (input.getAttribute("hint") != null) {
        hint_element.innerHTML = input.getAttribute("hint");
        input.prepend(hint_element);
      }

      if (input.querySelector("dl-select") == null) {
        html_input.setAttribute("type", input.getAttribute("type"));
        if (input.getAttribute("disabled") != null) html_input.setAttribute("disabled", "");
        html_input.addEventListener('focus', (event) => {
          event.target.parentElement.classList.add("open");
          event.target.parentElement.classList.add("focus");
        });
        html_input.addEventListener('blur', (event) => {
          if (event.target.value == "") event.target.parentElement.classList.remove("open");
          event.target.parentElement.classList.remove("focus");
        });
        input.append(html_input);
      } else {
        input.classList.add("select");
      }

      if (input.querySelector("dl-select") == null && html_input.value != "") input.classList.add("open");
    }
  }
}
loadInputs();

var selects = {
  load: function() {
    var selects = $("dl-select");
    var tempOpen = this.open;
    var tempClose = this.close;

    selects.each(function(index) {
      if (selects[index].parentElement.getAttribute("write") != null) {
        var writeData = lStorage.getItem(selects[index].parentElement.getAttribute("write"));

        if (writeData == null) {
          lStorage.setItem(selects[index].parentElement.getAttribute("write"), selects[index].parentElement.querySelector("dl-select-menu").querySelector("dl-option[default]").getAttribute("text"));
          writeData = lStorage.getItem(selects[index].parentElement.getAttribute("write"));
        }
        selects[index].setAttribute("selection", writeData);
        selects[index].parentElement.classList.add("open");
      }

      selects[index].addEventListener("click", (event) => {
        var option = this.parentElement.querySelector("dl-select-menu").querySelector("dl-option[text='"+this.getAttribute("selection")+"']");
        if (option != null) option.classList.add("selected");
        tempOpen(this, option);
      });
      selects[index].addEventListener("mousedown", (event) => {
        this.parentElement.classList.add("downfocus");
      });
    });

    $("dl-option").click(function(e) {
      this.parentElement.parentElement.querySelector("dl-select").setAttribute("selection", this.getAttribute("text"));
      if (this.parentElement.parentElement.getAttribute("write") != null) lStorage.setItem(this.parentElement.parentElement.getAttribute("write"), this.getAttribute("text"));
      if (this.parentElement.parentElement.getAttribute("onselection") != null) {
        var text = this.getAttribute("text");
        eval(this.parentElement.parentElement.getAttribute("onselection"));
      }

      tempClose(this.parentElement);
    });

    $("dl-select-overlay").click(function(e) {
      tempClose(this);
    });
  },
  open: function(element, option) {
    element.parentElement.classList.add("open");
    element.parentElement.classList.add("focus");
    element.parentElement.querySelector("dl-select-menu").style.setProperty("transform", "translate(-8px, "+ (-38 + (-39 * ($(option).index()))) +"px)");
  },
  close: function(element) {
    element.parentElement.classList.remove("focus");
    element.parentElement.classList.remove("downfocus");
    setTimeout(function() {
      $("dl-option").removeClass("selected");
    }, 200);
    if (element.parentElement.querySelector("dl-select").getAttribute("selection") == null) element.parentElement.classList.remove("open");
  }
}
selects.load();

let buttons = document.querySelectorAll("dl-button");
buttons.forEach(function(button) {
  button.addEventListener("mousedown", function(event) {
    event.target.appendChild(new Ripple(event).element);
  });
});

let lines = [];
let selector = "@a";
let names = [
  "Chris",
  "Bree",
  "RAI",
  "Computer",
  "Custom"
];

function Line() {
  this.name = function(name) {
    if (name != null && name != undefined) select_name.setValue(name);
    return this.select.getAttribute("selection");
  }

  this.sentence = function(sentence) {
    if (sentence != null && sentence != undefined) this.input_sentence.setValue(sentence);
    return this.input_sentence.querySelector("input").value;
  }


  this.element = document.createElement("dl-editor-item");
  this.input_sentence = document.createElement("dl-input");

  let select_name = document.createElement("dl-input");
  let button_remove = document.createElement("dl-remove");
  let item_handle = document.createElement("dl-handle");

  let handle_icon = document.createElement("i");
  let remove_icon = document.createElement("i");
  handle_icon.classList.add("material-icons");
  remove_icon.classList.add("material-icons");
  handle_icon.innerHTML = 'unfold_more';
  remove_icon.innerHTML = 'remove';

  item_handle.appendChild(handle_icon);
  button_remove.appendChild(remove_icon);
  button_remove.setAttribute("onclick", "line_generator.item.remove(this);");

  select_name.setAttribute("field", "name");
  select_name.setAttribute("hint", "Name");

  let select_menu = document.createElement("dl-select-menu");
  names.forEach(function(name) {
    let option = document.createElement("dl-option");
    option.setAttribute("text", name);
    select_menu.appendChild(option);
  });

  this.select = document.createElement("dl-select");
  select_name.appendChild(this.select);
  select_name.appendChild(document.createElement("dl-select-overlay"));
  select_name.appendChild(select_menu);

  this.input_sentence.setAttribute("field", "sentence");
  this.input_sentence.setAttribute("hint", "Sentence");
  this.input_sentence.setAttribute("type", "text");

  loadInputs(select_name);
  loadInputs(this.input_sentence);

  this.element.appendChild(item_handle);
  this.element.appendChild(select_name);
  this.element.appendChild(this.input_sentence);
  this.element.appendChild(button_remove);
}

var chaptersRef = firebase.database().ref('desist/line_generator/chapters/');

HTMLElement.prototype.setValue = function(value) {
  var type;
  if (this.querySelector("dl-select") != null) type = "select";

  if (type == "select") {
    this.querySelector("dl-select").setAttribute("selection", value);
  } else {
    this.querySelector("input").value = value;
  }

  this.classList.add("open");
}

HTMLElement.prototype.getValue = function() {
  var type;
  if (this.querySelector("dl-select") != null) type = "select";

  if (type == "select") {
    let value = this.querySelector("dl-select").getAttribute("selection");
    if (value == null) value = "";
    return value;
  } else {
    return this.querySelector("input").value;
  }
}

let line_generator = {
  generate: function() {
    document.querySelector("dl-code").innerHTML = "";
    let time = 0;
    packery.getItemElements().forEach(function(item) {
      let name = item.querySelector('[field="name"]').getValue();
      let sentence = item.querySelector('[field="sentence"]').getValue();
      let code_item = document.createElement("dl-code-item");

      code_item.innerHTML = 'execute @p[scores={timer='+time+'}] ~ ~ ~ tellraw '+selector+' {"rawtext":[{"translate":"<%%1> %%2", "with":["'+name+'", "'+sentence+'"]}]}';
      time = time + Math.round((20 *((((sentence.length / 16) + ((sentence.match(/,/g) || []).length) * 0.4) + 0.2))));

      document.querySelector("dl-code").append(code_item);
    });
  },
  item: {
    add: function(name, sentence) {
      let line = new Line();
      lines.push(line);

      if (name != null && name != undefined) line.name(name);
      if (sentence != null && sentence != undefined) line.sentence(sentence);

      let element = line.element;
      document.querySelector("dl-editor").append(element);
      selects.load();
      var draggie = new Draggabilly(element, {
        axis: 'y',
        handle: 'dl-handle',
        containment: 'dl-editor'
      });

      if (packery != null) {
        packery.bindDraggabillyEvents(draggie);
        packery.appended(element);
        packery.shiftLayout();
      }
    },
    remove: function(element) {
      lines.splice($(element.parentElement).index(), 1);
      packery.remove(element.parentElement);
      packery.shiftLayout();
    }
  },
  upload: function() {
    var chapter_number = prompt("Enter the chapter number. WARNING: If you put a number in of a chapter that already exists it will be overridden.", 0);
    let items = [];

    packery.getItemElements().forEach(function(item) {
      let name = item.querySelector('[field="name"]').getValue();
      let sentence = item.querySelector('[field="sentence"]').getValue();

      items.push({
        name: name,
        sentence: sentence
      });
    });

    if (chapter_number != null) {
      chapter_number--;
      chaptersRef.child(chapter_number).set(items);
    }
  }
};

line_generator.item.add();

var drag_container = document.querySelector('dl-editor');
var drag_item_size = getSize(document.querySelector('dl-editor-item'));
var packery = new Packery(drag_container, {
  rowHeight: -56
});

var drag_items = packery.getItemElements();
for (var i=0, len = drag_items.length; i < len; i++) {
  var drag_item = drag_items[i];
  var draggie = new Draggabilly(drag_item, {
    axis: 'y',
    handle: 'dl-handle',
    containment: 'dl-editor'
  });

  packery.bindDraggabillyEvents(draggie);
}

chaptersRef.on('value', function(snapshot) {
  document.querySelector("dl-chapters").innerHTML = "";
  document.querySelector("dl-loader-container").classList.add("show");
  snapshot.forEach(function(childSnapshot) {
    let chapter_text = document.createElement("dl-chapter-item");
    chapter_text.setAttribute("ref", childSnapshot.key);
    chapter_text.innerHTML = "Chapter " + (parseInt(childSnapshot.key)+1);
    document.querySelector("dl-chapters").appendChild(chapter_text);
    document.querySelector("dl-loader-container").classList.remove("show");

    chapter_text.addEventListener("click", (event) => {
      document.querySelector("dl-loader-container").classList.add("show");

      chaptersRef.child(event.target.getAttribute("ref")).once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          line_generator.item.add(childSnapshot.val().name, childSnapshot.val().sentence);
        });
      }).then(function() {
          document.querySelector("dl-loader-container").classList.remove("show");
      });
    });
  });
});
