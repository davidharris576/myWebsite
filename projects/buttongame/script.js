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

const leaderboard =
    document.getElementById("leaderboard");


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
    GET START OF THIS WEEK

    Week starts Monday at midnight
    in the visitor's local timezone.
*/

function getStartOfWeek() {

    const now =
        new Date();

    const startOfWeek =
        new Date(now);

    const day =
        now.getDay();

    const daysSinceMonday =
        day === 0
            ? 6
            : day - 1;


    startOfWeek.setDate(
        now.getDate() - daysSinceMonday
    );


    startOfWeek.setHours(
        0,
        0,
        0,
        0
    );


    return startOfWeek;

}


/*
    CHECK WEEKLY QUALIFICATION
*/

async function qualifiesForWeeklyLeaderboard(score) {

    const startOfWeek =
        getStartOfWeek();


    const { data, error } =
        await supabaseClient
            .from("scores")
            .select("time_ms")
            .gte(
                "created_at",
                startOfWeek.toISOString()
            )
            .order(
                "time_ms",
                {
                    ascending: false
                }
            )
            .limit(10);


    if (error) {

        console.error(error);

        /*
            If Supabase has a temporary
            problem, still let the player
            enter a name rather than
            blocking the score.
        */

        return true;

    }


    /*
        If there are fewer than 10 scores,
        there is automatically room.
    */

    if (data.length < 10) {

        return true;

    }


    /*
        data[9] is the current #10 score.

        The new score must BEAT it.
    */

    return score > data[9].time_ms;

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

async function endGame(event) {

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


    /*
        CHECK IF SCORE MADE
        THIS WEEK'S TOP 10
    */

    const qualified =
        await qualifiesForWeeklyLeaderboard(
            Math.floor(elapsedTime)
        );


    if (qualified) {

        showScoreEntry();

    } else {

        await showFailedLeaderboard();

    }

}


/*
    SHOW NAME ENTRY
*/

function showScoreEntry() {

    const failedBoard =
        document.getElementById(
            "failedLeaderboard"
        );


    if (failedBoard) {

        failedBoard.remove();

    }


    document
        .querySelector(".name-section")
        .classList.remove(
            "hidden"
        );


    submitButton.classList.remove(
        "hidden"
    );


    submitButton.disabled = false;

    submitButton.textContent =
        "SUBMIT SCORE";


    playAgainButton.classList.remove(
        "hidden"
    );


    submitMessage.classList.add(
        "hidden"
    );


    playerName.value = "";

    characterCount.textContent =
        "0 / 10";


    playerName.focus();

}


/*
    SHOW WEEKLY LEADERBOARD
    WHEN PLAYER DOES NOT QUALIFY
*/

async function showFailedLeaderboard() {

    document
        .querySelector(".name-section")
        .classList.add(
            "hidden"
        );


    submitButton.classList.add(
        "hidden"
    );


    submitMessage.classList.add(
        "hidden"
    );


    const startOfWeek =
        getStartOfWeek();


    const { data, error } =
        await supabaseClient
            .from("scores")
            .select(
                "name, time_ms"
            )
            .gte(
                "created_at",
                startOfWeek.toISOString()
            )
            .order(
                "time_ms",
                {
                    ascending: false
                }
            )
            .limit(10);


    if (error) {

        console.error(error);

        return;

    }


    let failedBoard =
        document.getElementById(
            "failedLeaderboard"
        );


    if (!failedBoard) {

        failedBoard =
            document.createElement(
                "div"
            );


        failedBoard.id =
            "failedLeaderboard";


        playAgainButton.before(
            failedBoard
        );

    }


    failedBoard.innerHTML = `
        <p class="eyebrow">
            THIS WEEK'S LEADERBOARD
        </p>

        <div class="failed-leaderboard">

            ${
                data.map(
                    (score, index) => `
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
                    `
                ).join("")
            }

        </div>
    `;


    playAgainButton.classList.remove(
        "hidden"
    );

}


/*
    DIFFICULTY
*/

function updateDifficulty() {

    const seconds =
        elapsedTime / 1000;


    /*
        10 SECONDS
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
    NAME FILTER
*/

function isNameAllowed(name) {

    let cleaned =
        name
            .toLowerCase()
            .replace(/0/g, "o")
            .replace(/1/g, "i")
            .replace(/3/g, "e")
            .replace(/4/g, "a")
            .replace(/5/g, "s")
            .replace(/7/g, "t")
            .replace(/@/g, "a")
            .replace(/\$/g, "s")
            .replace(/[^a-z]/g, "");


    const blockedWords = [

        // Basic profanity
        "fuck",
        "fucker",
        "fucking",
        "shit",
        "bitch",
        "bastard",
        "asshole",
        "dick",
        "cunt",
        "pussy",

        // Common racial / ethnic slurs
        "nigger",
        "nigga",
        "chink",
        "spic",
        "kike",
        "wetback",

        // Common anti-LGBTQ slurs
        "faggot",
        "fag",
        "tranny"

    ];


    return !blockedWords.some(
        word => cleaned.includes(word)
    );

}

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

if (!isNameAllowed(name)) {

    submitMessage.textContent =
        "THAT NAME ISN'T ALLOWED.";

    submitMessage.classList.remove(
        "hidden"
    );

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
                        time_ms:
                            Math.floor(
                                elapsedTime
                            )
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
            weeklyTab.classList.contains(
                "active"
            )
                ? "weekly"
                : "allTime"
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


        /*
            REMOVE THE SMALL LEADERBOARD
            FROM A FAILED ATTEMPT
        */

        const failedBoard =
            document.getElementById(
                "failedLeaderboard"
            );


        if (failedBoard) {

            failedBoard.remove();

        }


        /*
            RESTORE SCORE ENTRY
            FOR THE NEXT ATTEMPT
        */

        document
            .querySelector(".name-section")
            .classList.remove(
                "hidden"
            );


        submitButton.classList.remove(
            "hidden"
        );


        submitButton.disabled = false;

        submitButton.textContent =
            "SUBMIT SCORE";


        submitMessage.classList.add(
            "hidden"
        );


        playerName.value = "";

        characterCount.textContent =
            "0 / 10";

    }
);


/*
    LEADERBOARD
*/

async function loadLeaderboard(
    type = "weekly"
) {

    leaderboard.innerHTML =
        `<div class="empty-leaderboard">
            <p>Loading scores...</p>
        </div>`;


    let query =
        supabaseClient
            .from("scores")
            .select(
                "name, time_ms, created_at"
            )
            .order(
                "time_ms",
                {
                    ascending: false
                }
            );


    if (type === "weekly") {

        const startOfWeek =
            getStartOfWeek();


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


/*
    DISPLAY LEADERBOARD
*/

function displayLeaderboard(scores) {

    if (!scores.length) {

        leaderboard.innerHTML =
            `<div class="empty-leaderboard">

                <div class="trophy">
                    🏆
                </div>

                <h3>
                    No survivors yet.
                </h3>

                <p>
                    Be the first on the leaderboard.
                </p>

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


/*
    ESCAPE PLAYER NAMES
*/

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/*
    LEADERBOARD TABS
*/

weeklyTab.addEventListener(
    "click",
    () => {

        weeklyTab.classList.add(
            "active"
        );


        allTimeTab.classList.remove(
            "active"
        );


        loadLeaderboard(
            "weekly"
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


        loadLeaderboard(
            "allTime"
        );

    }
);


/*
    LOAD WEEKLY LEADERBOARD
    WHEN PAGE OPENS
*/

loadLeaderboard(
    "weekly"
);