const wageInput = document.getElementById("wage");
const priceInput = document.getElementById("price");
const calculateButton = document.getElementById("calculateButton");

const result = document.getElementById("result");
const hoursResult = document.getElementById("hoursResult");
const funResult = document.getElementById("funResult");


function calculateWork() {

    const wage = parseFloat(wageInput.value);
    const price = parseFloat(priceInput.value);

    if (
        isNaN(wage) ||
        isNaN(price) ||
        wage <= 0 ||
        price < 0
    ) {
        alert("Enter a valid hourly wage and price.");
        return;
    }


    const totalHours = price / wage;

    const hours = Math.floor(totalHours);

    let minutes = Math.round(
        (totalHours - hours) * 60
    );


    let finalHours = hours;

    if (minutes === 60) {
        finalHours++;
        minutes = 0;
    }


    let timeText = "";

    if (finalHours === 0) {

        timeText = `${minutes} minutes`;

    } else if (minutes === 0) {

        timeText =
            `${finalHours} ${finalHours === 1 ? "hour" : "hours"}`;

    } else {

        timeText =
            `${finalHours} ${finalHours === 1 ? "hour" : "hours"} ` +
            `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;

    }


    hoursResult.textContent = timeText;


    if (totalHours < 1) {

        funResult.textContent =
            "Not bad. That's less than an hour of work.";

    } else if (totalHours < 4) {

        funResult.textContent =
            "That's a few hours on the clock.";

    } else if (totalHours < 8) {

        funResult.textContent =
            "That's most of a full workday.";

    } else if (totalHours < 16) {

        funResult.textContent =
            "That's more than an entire 8-hour shift.";

    } else if (totalHours < 40) {

        funResult.textContent =
            "You'd be working for this one for a while.";

    } else {

        funResult.textContent =
            "That's more than a full 40-hour workweek.";

    }


    result.classList.remove("hidden");

}


calculateButton.addEventListener(
    "click",
    calculateWork
);


[wageInput, priceInput].forEach(input => {

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            calculateWork();
        }

    });

});