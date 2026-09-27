const projectCards = document.querySelectorAll(".main-project");

projectCards.forEach((card) => {

    card.addEventListener("mouseenter", () => {
        card.classList.add("active");
    });

    card.addEventListener("mouseleave", () => {
        card.classList.remove("active");
    });

});