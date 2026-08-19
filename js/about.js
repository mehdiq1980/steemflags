// js/about.js

document.addEventListener("DOMContentLoaded", () => {

    const translations = {
        en: {
            title: "About Steem Flags",
            text: `
                Steem Flags is a flag guessing game where players test their knowledge
                of world flags and earn SF rewards.
                <br><br>
                The game includes multiple languages, a leaderboard system,
                and a reward mechanism for active players.
                <br><br>
                Developed by Mehdi Q.
            `
        },

        fa: {
            title: "درباره Steem Flags",
            text: `
                Steem Flags یک بازی حدس پرچم است که بازیکنان در آن
                دانش خود درباره پرچم کشورهای جهان را آزمایش می‌کنند و SF دریافت می‌کنند.
                <br><br>
                این بازی دارای چند زبان، سیستم لیدربورد و سیستم پاداش برای بازیکنان فعال است.
                <br><br>
                توسعه‌دهنده: Mehdi Q.
            `
        },

        es: {
            title: "Acerca de Steem Flags",
            text: `
                Steem Flags es un juego de adivinar banderas donde los jugadores
                ponen a prueba sus conocimientos y reciben recompensas SF.
                <br><br>
                El juego incluye varios idiomas, tabla de clasificación
                y sistema de recompensas.
                <br><br>
                Desarrollado por Mehdi Q.
            `
        }
    };


    function loadLanguage() {

        const lang = localStorage.getItem("steemFlagsLanguage") || "en";

        const aboutTitle = document.getElementById("aboutTitle");
        const aboutText = document.getElementById("aboutText");

        if (aboutTitle && aboutText) {
            aboutTitle.innerHTML = translations[lang].title;
            aboutText.innerHTML = translations[lang].text;
        }
    }


    loadLanguage();


    // هماهنگی با تغییر زبان در صفحه
    document.querySelectorAll("[data-lang]").forEach(button => {

        button.addEventListener("click", () => {

            const lang = button.dataset.lang;

            localStorage.setItem("steemFlagsLanguage", lang);

            loadLanguage();

        });

    });

});
