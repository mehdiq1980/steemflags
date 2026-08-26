export async function loadMenu(){
    const container = document.getElementById("menuContainer");
    if(!container) return;

    const response = await fetch("./components/menu.html?v=20260826-menu-position-02", { cache:"no-store" });
    container.innerHTML = await response.text();

    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");
    if(!menuButton || !menu) return;

    function positionElements(){
        const rtl = document.documentElement.dir === "rtl";
        menuButton.style.position = "absolute";
        menuButton.style.left = rtl ? "auto" : "max(12px, 4vw)";
        menuButton.style.right = rtl ? "max(12px, 4vw)" : "auto";
        menuButton.style.top = "50%";
        menuButton.style.transform = "translateY(-50%)";
        menuButton.style.zIndex = "110";

        menu.style.position = "fixed";
        menu.style.left = rtl ? "auto" : "max(12px, 4vw)";
        menu.style.right = rtl ? "max(12px, 4vw)" : "auto";
    }

    positionElements();

    function closeMenu(){
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.onclick = (event) => {
        event.stopPropagation();
        menu.hidden = !menu.hidden;
        menuButton.setAttribute("aria-expanded", String(!menu.hidden));
        if(!menu.hidden) positionElements();
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
        if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });

    window.addEventListener("languagechange", positionElements);
    window.addEventListener("resize", positionElements);
}
