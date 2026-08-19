export async function loadMenu(){
    const container = document.getElementById("menuContainer");
    if(!container) return;

    const response = await fetch("./components/menu.html?v=20260820-08", {
        cache:"no-store"
    });

    container.innerHTML = await response.text();

    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");

    if(!menuButton || !menu) return;

    function closeMenu(){
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.onclick = (event) => {
        event.stopPropagation();
        menu.hidden = !menu.hidden;
        menuButton.setAttribute("aria-expanded", String(!menu.hidden));
    };

    menu.addEventListener("click", (event) => {
        const actionLink = event.target.closest("[data-action]");
        if(!actionLink) return;

        const action = actionLink.dataset.action;

        if(action === "new-game"){
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("steemflags:new-game"));
            closeMenu();
        }

        if(action === "resume-game"){
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("steemflags:resume-game"));
            closeMenu();
        }

        if(action === "logout"){
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("steemflags:logout"));
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {
        if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)){
            closeMenu();
        }
    });
}
