const workoutName = document.getElementById("workoutName");
const exerciseContainer = document.getElementById("exerciseContainer");
const addExerciseButton = document.getElementById("addExerciseButton");
const totalVolumeElement = document.getElementById("totalVolume");
const saveButton = document.getElementById("saveButton");
const pdfButton = document.getElementById("pdfButton");
const clearButton = document.getElementById("clearButton");
const statusMessage = document.getElementById("statusMessage");


let workout = {
    name: "",
    exercises: []
};


function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


function createSet() {
    return {
        id: createId(),
        weight: "",
        reps: ""
    };
}


function createExercise() {
    return {
        id: createId(),
        name: "",
        sets: [
            createSet()
        ]
    };
}


function createStarterWorkout() {
    workout = {
        name: "",
        exercises: [
            createExercise()
        ]
    };
}


function getSetVolume(set) {
    const weight = Number(set.weight) || 0;
    const reps = Number(set.reps) || 0;

    return weight * reps;
}


function calculateTotalVolume() {
    let total = 0;

    workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            total += getSetVolume(set);
        });
    });

    totalVolumeElement.textContent =
        total.toLocaleString();
}


function render() {
    exerciseContainer.innerHTML = "";

    workoutName.value = workout.name;

    workout.exercises.forEach(exercise => {
        const exerciseCard =
            buildExercise(exercise);

        exerciseContainer.appendChild(
            exerciseCard
        );
    });

    calculateTotalVolume();
}


function buildExercise(exercise) {
    const card =
        document.createElement("article");

    card.className = "exercise";


    /* EXERCISE HEADER */

    const top =
        document.createElement("div");

    top.className = "exercise-top";


    const nameInput =
        document.createElement("input");

    nameInput.className = "exercise-name";
    nameInput.type = "text";
    nameInput.placeholder =
        "Exercise name — Bench Press";
    nameInput.value = exercise.name;


    nameInput.addEventListener(
        "input",
        function () {
            exercise.name = nameInput.value;
        }
    );


    const removeExerciseButton =
        document.createElement("button");

    removeExerciseButton.className =
        "remove-exercise";

    removeExerciseButton.type = "button";
    removeExerciseButton.textContent =
        "remove";


    removeExerciseButton.addEventListener(
        "click",
        function () {
            workout.exercises =
                workout.exercises.filter(
                    item =>
                        item.id !== exercise.id
                );

            render();
        }
    );


    top.appendChild(nameInput);
    top.appendChild(removeExerciseButton);


    /* SET HEADERS */

    const setHeader =
        document.createElement("div");

    setHeader.className = "set-header";

    setHeader.innerHTML = `
        <span>SET</span>
        <span>WEIGHT</span>
        <span>REPS</span>
        <span>VOLUME</span>
        <span></span>
    `;


    /* SET CONTAINER */

    const setContainer =
        document.createElement("div");


    exercise.sets.forEach(
        (set, index) => {

            const setRow =
                buildSet(
                    exercise,
                    set,
                    index
                );

            setContainer.appendChild(
                setRow
            );
        }
    );


    /* ADD SET BUTTON */

    const addSetButton =
        document.createElement("button");

    addSetButton.className =
        "add-button add-set";

    addSetButton.type = "button";

    addSetButton.innerHTML = `
        <span>+</span>
        ADD SET
    `;


    addSetButton.addEventListener(
        "click",
        function () {

            exercise.sets.push(
                createSet()
            );

            render();
        }
    );


    card.appendChild(top);
    card.appendChild(setHeader);
    card.appendChild(setContainer);
    card.appendChild(addSetButton);


    return card;
}


function buildSet(
    exercise,
    set,
    index
) {
    const row =
        document.createElement("div");

    row.className = "set-row";


    /* SET NUMBER */

    const number =
        document.createElement("span");

    number.className = "set-number";
    number.textContent = index + 1;


    /* WEIGHT */

    const weightInput =
        document.createElement("input");

    weightInput.className = "set-input";
    weightInput.type = "number";
    weightInput.inputMode = "decimal";
    weightInput.min = "0";
    weightInput.step = "0.5";
    weightInput.placeholder = "0";
    weightInput.value = set.weight;


    /* REPS */

    const repsInput =
        document.createElement("input");

    repsInput.className = "set-input";
    repsInput.type = "number";
    repsInput.inputMode = "numeric";
    repsInput.min = "0";
    repsInput.step = "1";
    repsInput.placeholder = "0";
    repsInput.value = set.reps;


    /* VOLUME */

    const volume =
        document.createElement("span");

    volume.className = "set-volume";


    function updateSet() {
        set.weight = weightInput.value;
        set.reps = repsInput.value;

        const setVolume =
            getSetVolume(set);

        volume.textContent =
            setVolume.toLocaleString()
            + " lb";

        calculateTotalVolume();
    }


    weightInput.addEventListener(
        "input",
        updateSet
    );

    repsInput.addEventListener(
        "input",
        updateSet
    );


    /* REMOVE SET */

    const removeSetButton =
        document.createElement("button");

    removeSetButton.className =
        "remove-set";

    removeSetButton.type = "button";
    removeSetButton.textContent = "×";


    removeSetButton.addEventListener(
        "click",
        function () {

            exercise.sets =
                exercise.sets.filter(
                    item =>
                        item.id !== set.id
                );

            render();
        }
    );


    row.appendChild(number);
    row.appendChild(weightInput);
    row.appendChild(repsInput);
    row.appendChild(volume);
    row.appendChild(removeSetButton);

    updateSet();

    return row;
}


/* WORKOUT NAME */

workoutName.addEventListener(
    "input",
    function () {
        workout.name =
            workoutName.value;
    }
);


/* ADD EXERCISE */

addExerciseButton.addEventListener(
    "click",
    function () {

        const newExercise =
            createExercise();

        workout.exercises.push(
            newExercise
        );

        render();
    }
);


/* SAVE */

saveButton.addEventListener(
    "click",
    function () {

        localStorage.setItem(
            "workoutBuilderDataV2",
            JSON.stringify(workout)
        );

        showStatus(
            "workout saved on this device ✓"
        );
    }
);


/* PDF */

pdfButton.addEventListener(
    "click",
    function () {
        window.print();
    }
);


/* CLEAR */

clearButton.addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Clear this workout and start over?"
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            "workoutBuilderDataV2"
        );

        createStarterWorkout();

        render();

        showStatus(
            "workout cleared"
        );
    }
);


function showStatus(message) {
    statusMessage.textContent = message;

    setTimeout(
        function () {
            statusMessage.textContent = "";
        },
        2500
    );
}


/* LOAD SAVED WORKOUT */

function loadWorkout() {
    const saved =
        localStorage.getItem(
            "workoutBuilderDataV2"
        );

    if (!saved) {
        createStarterWorkout();
        return;
    }

    try {
        const parsed =
            JSON.parse(saved);

        if (
            parsed &&
            Array.isArray(
                parsed.exercises
            )
        ) {
            workout = parsed;
        } else {
            createStarterWorkout();
        }

    } catch (error) {
        createStarterWorkout();
    }
}


/* START */

loadWorkout();
render();