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

function loadInputs() {
  var inputs = $("dl-input");

  inputs.each(function(index) {
    if (inputs[index].querySelector("dl-hint") == null) {
      if (inputs[index].querySelector("dl-select") == null) var html_input = document.createElement("input");
      var hint_element = document.createElement("dl-hint");

      if (inputs[index].getAttribute("hint") != null) {
        hint_element.innerHTML = inputs[index].getAttribute("hint");
        inputs[index].prepend(hint_element);
      }

      if (inputs[index].querySelector("dl-select") == null) {
        html_input.setAttribute("type", inputs[index].getAttribute("type"));
        if (inputs[index].getAttribute("disabled") != null) html_input.setAttribute("disabled", "");
        html_input.addEventListener('focus', (event) => {
          event.target.parentElement.classList.add("open");
          event.target.parentElement.classList.add("focus");
        });
        html_input.addEventListener('blur', (event) => {
          if (event.target.value == "") event.target.parentElement.classList.remove("open");
          event.target.parentElement.classList.remove("focus");
        });
        inputs[index].append(html_input);
      } else {
        inputs[index].classList.add("select");
      }

      if (inputs[index].querySelector("dl-select") == null && html_input.value != "") inputs[index].classList.add("open");
    }
  });
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

let generated_code = [];
let selector = "@a";

let line_generator = {
  generate: function() {
    document.querySelector("dl-code").innerHTML = "";
    document.querySelector("dl-editor-container").querySelectorAll("dl-editor-item").forEach(function(item) {
      let name = item.querySelector('[field="name"]').querySelector("dl-select").getAttribute("selection");
      let sentence = item.querySelector('[field="sentence"]').querySelector("input").value;

      let code_item = document.createElement("dl-code-item");
      code_item.innerHTML = 'tellraw '+selector+' {"rawtext":[{"translate":"<%%1> %%2", "with":["'+name+'", "'+sentence+'"]}]}';

      document.querySelector("dl-code").append(code_item);
    });
  },
  item: {
    create: function() {
      let item_container = document.createElement("dl-editor-item");
      let select_name = document.createElement("dl-input");
      let input_sentence = document.createElement("dl-input");
      let button_remove = document.createElement("dl-button");

      button_remove.innerHTML = "Remove";
      button_remove.setAttribute("onclick", "line_generator.item.remove(this);");

      select_name.setAttribute("field", "name");
      select_name.setAttribute("hint", "Name");

      let select_menu = document.createElement("dl-select-menu");
      let option_chris = document.createElement("dl-option");
      let option_bree = document.createElement("dl-option");
      let option_rai = document.createElement("dl-option");
      let option_custom = document.createElement("dl-option");

      option_chris.setAttribute("text", "Chris");
      option_bree.setAttribute("text", "Bree");
      option_rai.setAttribute("text", "RAI");
      option_custom.setAttribute("text", "Custom");

      select_menu.appendChild(option_chris);
      select_menu.appendChild(option_bree);
      select_menu.appendChild(option_rai);
      select_menu.appendChild(option_custom);

      select_name.appendChild(document.createElement("dl-select"));
      select_name.appendChild(document.createElement("dl-select-overlay"));
      select_name.appendChild(select_menu);

      input_sentence.setAttribute("field", "sentence");
      input_sentence.setAttribute("hint", "Sentence");
      input_sentence.setAttribute("type", "text");

      item_container.appendChild(select_name);
      item_container.appendChild(input_sentence);
      item_container.appendChild(button_remove);
      return item_container;
    },
    add: function() {
      document.querySelector("dl-editor").append(this.create());
      selects.load();
      loadInputs();
    },
    remove: function(element) {
      element.parentElement.remove();
    }
  }
};
