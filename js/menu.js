export async function loadMenu(){
    const container = document.getElementById("menuContainer");
    if(!container) return;

    const response = await fetch("./components/menu.html?v=20260820-04", {
        cache:"no-store"
    });

    container.innerHTML = await response.text();

    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");

    if(!menuButton || !menu) return;

    // Prevent duplicate listeners when pages reload or components are reused.
    menuButton.onclick = () => {
        const willOpen = menu.hidden;
        menu.hidden = !willOpen;
        menuButton.setAttribute("aria-expanded", String(willOpen));
    };
}
