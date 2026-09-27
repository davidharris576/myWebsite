const SUPABASE_URL =
    "https://vfdsxenuwexzeirophvf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nYsfXpW1Os6hFSUkRXvXZQ_wrTE0Rj0";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
const holdButton =
    document.getElementById("holdButton");

const buttonText =
    document.getElementById("buttonText");

const timer =
    document.getElementById("timer");

const bestTime =
    document.getElementById("bestTime");

const message =
    document.getElementById("message");

const arena =
    document.getElementById("arena");

const gameScreen =
    document.getElementById("gameScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const finalTime =
    document.getElementById("finalTime");

const newBest =
    document.getElementById("newBest");

const playAgainButton =
    document.getElementById("playAgainButton");

const submitButton =
    document.getElementById("submitButton");

const submitMessage =
    document.getElementById("submitMessage");

const playerName =
    document.getElementById("playerName");

const characterCount =
    document.getElementById("characterCount");

const fakeWarning =
    document.getElementById("fakeWarning");

const fakeButton =
    document.getElementById("fakeButton");

const weeklyTab =
    document.getElementById("weeklyTab");

const allTimeTab =
    document.getElementById("allTimeTab");


let playing = false;

let startTime = 0;

let elapsedTime = 0;

let animationFrame = null;

let difficultyInterval = null;

let currentLevel = 0;


/*
    PERSONAL BEST

    This stays only in the user's browser.
*/

let personalBest =
    Number(
        localStorage.getItem(
            "dontLetGoBest"
        )
    ) || 0;


bestTime.textContent =
    formatTime(personalBest);


/*
    FORMAT MILLISECONDS

    Example:

    222681

    becomes:

    03:42.681
*/

function formatTime(milliseconds) {

    const totalSeconds =
        Math.floor(milliseconds / 1000);

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    const ms =
        Math.floor(milliseconds % 1000);


    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(seconds).padStart(2, "0")
        +
        "."
        +
        String(ms).padStart(3, "0")
    );

}


/*
    START GAME
*/

function startGame(event) {

    event.preventDefault();


    if (playing) {
        return;
    }


    playing = true;

    currentLevel = 0;

    elapsedTime = 0;

    startTime =
        performance.now();


    holdButton.classList.add(
        "holding"
    );


    buttonText.textContent =
        "DON'T LET GO";


    message.textContent =
        "Keep holding.";


    fakeWarning.classList.add(
        "hidden"
    );


    fakeButton.classList.add(
        "hidden"
    );


    arena.classList.remove(
        "shake"
    );


    resetButton();


    updateTimer();


    difficultyInterval =
        setInterval(
            updateDifficulty,
            1000
        );

}


/*
    TIMER
*/

function updateTimer() {

    if (!playing) {
        return;
    }


    elapsedTime =
        performance.now()
        -
        startTime;


    timer.textContent =
        formatTime(elapsedTime);


    animationFrame =
        requestAnimationFrame(
            updateTimer
        );

}


/*
    END GAME
*/

function endGame(event) {

    if (event) {
        event.preventDefault();
    }


    if (!playing) {
        return;
    }


    playing = false;


    cancelAnimationFrame(
        animationFrame
    );


    clearInterval(
        difficultyInterval
    );


    holdButton.classList.remove(
        "holding"
    );


    elapsedTime =
        performance.now()
        -
        startTime;


    finalTime.textContent =
        formatTime(elapsedTime);


    /*
        CHECK PERSONAL BEST
    */

    if (
        elapsedTime
        >
        personalBest
    ) {

        personalBest =
            elapsedTime;


        localStorage.setItem(
            "dontLetGoBest",
            personalBest
        );


        bestTime.textContent =
            formatTime(
                personalBest
            );


        newBest.classList.remove(
            "hidden"
        );

    } else {

        newBest.classList.add(
            "hidden"
        );

    }


    gameScreen.classList.add(
        "hidden"
    );


    gameOverScreen.classList.remove(
        "hidden"
    );


    submitMessage.classList.add(
        "hidden"
    );


    playerName.focus();

}


/*
    DIFFICULTY

    Every second this checks how long
    the player has survived.
*/

function updateDifficulty() {

    const seconds =
        elapsedTime / 1000;


    /*
        10 SECONDS

        Change message.
    */

    if (
        seconds >= 10
        &&
        currentLevel < 1
    ) {

        currentLevel = 1;

        message.textContent =
            "This seems easy.";

    }


    /*
        20 SECONDS

        Slightly shrink button.
    */

    if (
        seconds >= 20
        &&
        currentLevel < 2
    ) {

        currentLevel = 2;

        holdButton.style.width =
            "165px";

        holdButton.style.height =
            "165px";

        message.textContent =
            "Still holding?";

    }


    /*
        30 SECONDS

        Fake warning.
    */

    if (
        seconds >= 30
        &&
        currentLevel < 3
    ) {

        currentLevel = 3;

        fakeWarning.classList.remove(
            "hidden"
        );

        message.textContent =
            "Whatever you do...";

    }


    /*
        40 SECONDS

        Fake button.
    */

    if (
        seconds >= 40
        &&
        currentLevel < 4
    ) {

        currentLevel = 4;

        fakeButton.classList.remove(
            "hidden"
        );

        message.textContent =
            "...don't let go.";

    }


    /*
        50 SECONDS

        Shake arena.
    */

    if (
        seconds >= 50
        &&
        currentLevel < 5
    ) {

        currentLevel = 5;

        arena.classList.add(
            "shake"
        );

    }


    /*
        60 SECONDS

        Stop shaking.
        Move button slightly.
    */

    if (
        seconds >= 60
        &&
        currentLevel < 6
    ) {

        currentLevel = 6;

        arena.classList.remove(
            "shake"
        );


        moveButton();

    }


    /*
        AFTER 70 SECONDS

        Move every 5 seconds.
    */

    if (
        seconds >= 70
        &&
        Math.floor(seconds) % 5 === 0
    ) {

        moveButton();

    }

}


/*
    MOVE BUTTON

    Movement is intentionally limited
    so it stays inside the arena.
*/

function moveButton() {

    const arenaWidth =
        arena.clientWidth;

    const arenaHeight =
        arena.clientHeight;


    const buttonWidth =
        holdButton.offsetWidth;

    const buttonHeight =
        holdButton.offsetHeight;


    const maximumX =
        arenaWidth
        -
        buttonWidth
        -
        40;


    const maximumY =
        arenaHeight
        -
        buttonHeight
        -
        70;


    const x =
        Math.random()
        *
        maximumX
        -
        maximumX / 2;


    const y =
        Math.random()
        *
        maximumY
        -
        maximumY / 2;


    holdButton.style.transform =
        `translate(${x}px, ${y}px) scale(0.95)`;

}


/*
    RESET BUTTON POSITION
*/

function resetButton() {

    holdButton.style.width =
        "";

    holdButton.style.height =
        "";

    holdButton.style.transform =
        "";

}


/*
    DESKTOP CONTROLS
*/

holdButton.addEventListener(
    "mousedown",
    startGame
);


document.addEventListener(
    "mouseup",
    () => {

        if (playing) {
            endGame();
        }

    }
);


/*
    MOBILE CONTROLS
*/

holdButton.addEventListener(
    "touchstart",
    startGame,
    {
        passive: false
    }
);


document.addEventListener(
    "touchend",
    () => {

        if (playing) {
            endGame();
        }

    },
    {
        passive: false
    }
);


/*
    PREVENT CONTEXT MENU

    Useful when holding on mobile.
*/

holdButton.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


/*
    ARCADE NAME

    Only:

    A-Z
    0-9
    _
    -

    Maximum 10 characters.
*/

playerName.addEventListener(
    "input",
    () => {

        let cleaned =
            playerName.value
            .toUpperCase()
            .replace(
                /[^A-Z0-9_-]/g,
                ""
            )
            .slice(
                0,
                10
            );


        playerName.value =
            cleaned;


        characterCount.textContent =
            `${cleaned.length} / 10`;

    }
);


/*
    SUBMIT SCORE
*/

submitButton.addEventListener(
    "click",
    async () => {

        const name =
            playerName.value.trim();


        if (!name) {

            playerName.focus();

            return;

        }


        submitButton.disabled = true;

        submitButton.textContent =
            "SUBMITTING...";


        const { error } =
            await supabaseClient
                .from("scores")
                .insert([
                    {
                        name: name,
                        time_ms: Math.floor(elapsedTime)
                    }
                ]);


        if (error) {

            console.error(error);

            submitMessage.textContent =
                "Couldn't submit score. Try again.";

            submitMessage.classList.remove(
                "hidden"
            );

            submitButton.disabled = false;

            submitButton.textContent =
                "SUBMIT SCORE";

            return;

        }


        submitMessage.textContent =
            "SCORE SUBMITTED.";

        submitMessage.classList.remove(
            "hidden"
        );


        submitButton.textContent =
            "SUBMITTED";
        
        await loadLeaderboard(
            weeklyTab.classList.contains("active")
                ? "weekly"
                : "allTime"
);

    }
);

submitButton.addEventListener(
    "click",
    () => {

        const name =
            playerName.value.trim();


        if (!name) {

            playerName.focus();

            return;

        }


        submitMessage.classList.remove(
            "hidden"
        );

    }
);


/*
    PLAY AGAIN
*/

playAgainButton.addEventListener(
    "click",
    () => {

        gameOverScreen.classList.add(
            "hidden"
        );


        gameScreen.classList.remove(
            "hidden"
        );


        timer.textContent =
            "00:00.000";


        buttonText.textContent =
            "HOLD";


        message.textContent =
            "Hold the button to start.";


        fakeWarning.classList.add(
            "hidden"
        );


        fakeButton.classList.add(
            "hidden"
        );


        arena.classList.remove(
            "shake"
        );


        resetButton();

    }
);


/*
    LEADERBOARD
*/

const leaderboard =
    document.getElementById("leaderboard");


async function loadLeaderboard(type = "weekly") {

    leaderboard.innerHTML =
        `<div class="empty-leaderboard">
            <p>Loading scores...</p>
        </div>`;


    let query =
        supabaseClient
            .from("scores")
            .select("name, time_ms, created_at")
            .order("time_ms", {
                ascending: false
            });


    if (type === "weekly") {

        const now =
            new Date();

        const startOfWeek =
            new Date(now);

        const day =
            now.getDay();

        const daysSinceMonday =
            day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
            now.getDate() - daysSinceMonday
        );

        startOfWeek.setHours(
            0,
            0,
            0,
            0
        );


        query =
            query
                .gte(
                    "created_at",
                    startOfWeek.toISOString()
                )
                .limit(10);

    } else {

        query =
            query.limit(100);

    }


    const { data, error } =
        await query;


    if (error) {

        console.error(error);

        leaderboard.innerHTML =
            `<div class="empty-leaderboard">
                <p>Couldn't load scores.</p>
            </div>`;

        return;

    }


    displayLeaderboard(data);

}


function displayLeaderboard(scores) {

    if (!scores.length) {

        leaderboard.innerHTML =
            `<div class="empty-leaderboard">
                <div class="trophy">🏆</div>
                <h3>No survivors yet.</h3>
                <p>Be the first on the leaderboard.</p>
            </div>`;

        return;

    }


    leaderboard.innerHTML =
        scores
            .map(
                (score, index) => {

                    return `
                        <div class="leaderboard-row">

                            <span class="rank">
                                ${index + 1}
                            </span>

                            <span class="leaderboard-name">
                                ${escapeHTML(score.name)}
                            </span>

                            <span class="leaderboard-time">
                                ${formatTime(score.time_ms)}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


weeklyTab.addEventListener(
    "click",
    () => {

        weeklyTab.classList.add(
            "active"
        );

        allTimeTab.classList.remove(
            "active"
        );

        loadLeaderboard("weekly");

    }
);


allTimeTab.addEventListener(
    "click",
    () => {

        allTimeTab.classList.add(
            "active"
        );

        weeklyTab.classList.remove(
            "active"
        );

        loadLeaderboard("allTime");

    }
);


loadLeaderboard("weekly");

weeklyTab.addEventListener(
    "click",
    () => {

        weeklyTab.classList.add(
            "active"
        );


        allTimeTab.classList.remove(
            "active"
        );

    }
);


allTimeTab.addEventListener(
    "click",
    () => {

        allTimeTab.classList.add(
            "active"
        );


        weeklyTab.classList.remove(
            "active"
        );

    }
);