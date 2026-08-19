export async function loadMenu(){

    const container =
        document.getElementById("menuContainer");


    if(!container) return;


    const response = await fetch(
        "./components/menu.html?v=20260820-01",
        {
            cache:"no-store"
        }
    );


    container.innerHTML =
        await response.text();



    const menuButton =
        document.getElementById("menuButton");


    const menu =
        document.getElementById("menu");



    if(menuButton && menu){

        menuButton.addEventListener(
            "click",
            ()=>{

                const opened =
                    menu.hidden;


                menu.hidden = opened;


                menuButton.setAttribute(
                    "aria-expanded",
                    String(opened)
                );

            }
        );

    }

}
