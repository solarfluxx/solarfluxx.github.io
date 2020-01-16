let drag_container = document.getElementById("drag_container"),
    room_container = document.getElementById("room_container");
    mouse = {
    isDown: false,
    hasMoved: false,
    initalX: 0,
    initalY: 0,
    translationX: 0,
    translationY: 0,
    zoom: 1
}

let upListener = () => {mouse.isDown = false;}

let downListener = (event) => {
    mouse.isDown = true;
    mouse.initalX = event.screenX;
    mouse.initalY = event.screenY;
}

let moveListener = (event) => {
    if (mouse.isDown) {
        mouse.translationX =  mouse.translationX + (-mouse.initalX - -event.screenX);
        mouse.translationY = mouse.translationY + (-mouse.initalY - -event.screenY);

        mouse.initalX = event.screenX;
        mouse.initalY = event.screenY;

        room_container.style.setProperty("transform", "translate("+mouse.translationX+"px, "+mouse.translationY+"px) scale("+mouse.zoom+")");
    }
    
}

window.addEventListener("wheel", event => {
    const zoom_change = -Math.sign(event.deltaY) / 10;
    if (mouse.zoom + zoom_change >= 0.5 && mouse.zoom + zoom_change <= 4) mouse.zoom = mouse.zoom + zoom_change;
    room_container.style.setProperty("transform", "translate("+mouse.translationX+"px, "+mouse.translationY+"px) scale("+mouse.zoom+")");
});


drag_container.addEventListener('mouseup', upListener);
drag_container.addEventListener('mousedown', downListener);
drag_container.addEventListener('mousemove', moveListener);
