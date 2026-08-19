export async function loadMenu(){
    const container = document.getElementById("menuContainer");
    if(!container) return;

    const response = await fetch("./components/menu.html?v=20260820-05", {
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

    document.addEventListener("click", (event) => {
        if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)){
            closeMenu();
        }
    });

    menu.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}
