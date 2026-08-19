document.addEventListener("DOMContentLoaded", () => {

    const translations = {

        en: {
            title: "About Steem Flags",
            text: `
            <p>
            Steem Flags is a flag guessing game where players
            test their knowledge of world flags and earn SF rewards.
            </p>

            <p>
            Players answer flag questions, collect points,
            and compete on the leaderboard.
            </p>

            <p>
            Developed by Mehdi Q.
            </p>
            `
        },


        fa: {
            title: "درباره Steem Flags",
            text: `
            <p>
            Steem Flags یک بازی حدس پرچم است که بازیکنان
            دانش خود درباره پرچم کشورهای جهان را آزمایش می‌کنند
            و SF دریافت می‌کنند.
            </p>

            <p>
            بازیکنان با پاسخ به سوالات، امتیاز جمع می‌کنند
            و در لیدربورد رقابت می‌کنند.
            </p>

            <p>
            توسعه‌دهنده: Mehdi Q.
            </p>
            `
        },


        es: {
            title: "Acerca de Steem Flags",
            text: `
            <p>
            Steem Flags es un juego de adivinar banderas
            donde los jugadores ganan recompensas SF.
            </p>

            <p>
            Los jugadores acumulan puntos y compiten
            en la tabla de clasificación.
            </p>

            <p>
            Desarrollado por Mehdi Q.
            </p>
            `
        }

    };


    function updateAbout() {

        const lang =
            localStorage.getItem("steemFlagsLanguage") || "en";


        document.documentElement.lang = lang;


        if (translations[lang]) {

            document.getElementById("aboutTitle").innerHTML =
                translations[lang].title;


            document.getElementById("aboutText").innerHTML =
                translations[lang].text;

        }

    }


    updateAbout();


});
