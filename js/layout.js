// js/layout.js

document.addEventListener("DOMContentLoaded", () => {

    const app = document.getElementById("app");

    if (!app) return;


    const header = document.createElement("header");

    header.className = "topBar";


    header.innerHTML = `

        <button id="menuButton" class="menuButton">
            ☰
        </button>


        <div class="logoArea">

            <img src="assets/logo.png"
                 class="logo"
                 alt="Steem Flags">

            <span>
                Steem Flags
            </span>

        </div>


        <div class="sfBalance">

            <span>
                SF:
            </span>

            <strong id="sfBalance">
                0
            </strong>

        </div>


        <nav id="sideMenu" class="sideMenu">

            <a href="index.html">
                Home
            </a>

            <a href="about.html">
                About
            </a>

        </nav>

    `;


    app.prepend(header);



    const menuButton =
        document.getElementById("menuButton");


    const sideMenu =
        document.getElementById("sideMenu");


    menuButton.addEventListener("click", () => {

        sideMenu.classList.toggle("open");

    });



    // خواندن SF ذخیره شده
    const username =
        localStorage.getItem("steemFlagsUsername");


    if (username) {

        const savedSF =
            localStorage.getItem(
                "steemFlagsSF_" + username
            ) || 0;


        document.getElementById("sfBalance")
            .textContent = savedSF;

    }


});
