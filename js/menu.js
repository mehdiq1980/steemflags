export async function loadMenu(){
    const container = document.getElementById("menuContainer");
    if(!container) return;

    const response = await fetch("./components/menu.html?v=20260828-menu-logout-01", { cache:"no-store" });
    if(!response.ok) throw new Error(`Unable to load menu: ${response.status}`);
    container.innerHTML = await response.text();

    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");
    if(!menuButton || !menu) return;

    const logoutLink = menu.querySelector('[data-action="logout"]');
    if(logoutLink){
        try{
            const session = JSON.parse(localStorage.getItem("steemFlagsAuthSession") || "null");
            logoutLink.hidden = !(session && session.username);
        }catch{
            logoutLink.hidden = true;
        }
    }

    function positionElements(){
        const rtl = document.documentElement.dir === "rtl";
        const edge = "max(12px, 4vw)";

        menuButton.style.setProperty("position", "absolute", "important");
        menuButton.style.setProperty("left", rtl ? "auto" : edge, "important");
        menuButton.style.setProperty("right", rtl ? edge : "auto", "important");
        menuButton.style.setProperty("top", "50%", "important");
        menuButton.style.setProperty("transform", "translateY(-50%)", "important");
        menuButton.style.setProperty("z-index", "110", "important");

        menu.style.setProperty("position", "fixed", "important");
        menu.style.setProperty("left", rtl ? "auto" : edge, "important");
        menu.style.setProperty("right", rtl ? edge : "auto", "important");
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
            return;
        }

        if(action === "resume-game"){
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("steemflags:resume-game"));
            closeMenu();
            return;
        }

        if(action === "logout"){
            event.preventDefault();
            try{
                localStorage.removeItem("steemFlagsAuthSession");
                localStorage.removeItem("steemFlagsPendingRewards");
                sessionStorage.removeItem("steemFlagsSponsorContext");
            }catch{}
            closeMenu();
            window.dispatchEvent(new CustomEvent("steemflags:logout"));
            window.location.replace("./index.html");
        }
    });

    document.addEventListener("click", (event) => {
        if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });

    window.addEventListener("languagechange", positionElements);
    window.addEventListener("resize", positionElements);
}
