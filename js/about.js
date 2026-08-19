const $ = (id) => document.getElementById(id);


// Hamburger menu
const menuButton = $("menuButton");
const menu = $("menu");

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
  });
}


// Load stored SF
function loadSF() {
  try {
    const username = localStorage.getItem("steemFlagsUsername");

    if (!username) {
      $("sfValue").textContent = "0";
      return;
    }

    const data = JSON.parse(
      localStorage.getItem(`steemFlagsState_${username}`)
    );

    $("sfValue").textContent = data?.sf ?? 0;

  } catch {
    $("sfValue").textContent = "0";
  }
}


// Load STEEM balance placeholder
function loadSTEEM() {
  const el = $("steemValue");

  if (el) {
    el.textContent = "0";
  }
}


loadSF();
loadSTEEM();
