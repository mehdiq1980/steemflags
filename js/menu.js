export async function loadMenu(){
    const container = document.getElementById("menuContainer");
    if(!container) return;

    const response = await fetch("./components/menu.html?v=20260820-07", {
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
        const willOpen = menu.hidden;
        menu.hidden = !willOpen;
        menuButton.setAttribute("aria-expanded", String(willOpen));
    };

    menu.addEventListener("click", async (event) => {
        const actionLink = event.target.closest("[data-action]");
        if(!actionLink) return;

        const action = actionLink.dataset.action;

        if(action === "new-game"){
            event.preventDefault();
            document.getElementById("newGameButton")?.click();
            closeMenu();
        }

        if(action === "resume-game"){
            event.preventDefault();
            document.getElementById("resumeGameButton")?.click();
            closeMenu();
        }

        if(action === "logout"){
            event.preventDefault();
            const { clearStoredUsername } = await import("./storage.js");
            clearStoredUsername();
            window.location.href = "./";
        }
    });

    document.addEventListener("click", (event) => {
        if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)){
            closeMenu();
        }
    });

    menu.addEventListener("click", (event) => {
        if(!event.target.closest("[data-action]")){
            event.stopPropagation();
        }
    });
}
