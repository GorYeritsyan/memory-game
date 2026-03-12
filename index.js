const cardsWrapper = document.getElementById("cards-wrapper");

const closeBtn = document.getElementById("close-btn");
const playBtn = document.getElementById("play-btn");
const modal = document.getElementById("modal");
const header = document.getElementById("header");

const selectForm = document.getElementById("select-form");

// All Game Modes
const gameModes = {
    "easy": {
        columns: 3,
        rows: 4,
    },
    "medium": {
        columns: 4,
        rows: 5,
    },
    "hard": {
        columns: 5,
        rows: 6,
    }
};

// All Images
const images = [
    {
        id: "apple",
        url: "apple.jpg"
    },
    {
        id: "iphone",
        url: "iphone.jpg"
    },
    {
        id: "airpods",
        url: "airpods.avif"
    },
    {
        id: "macbook",
        url: "macbook.webp"
    },
    {
        id: "rome",
        url: "rome.png"
    },
    {
        id: "mango",
        url: "mango.png"
    },
    {
        id: "headphone",
        url: "headphones.webp"
    },
    {
        id: "gaming-mouse",
        url: "gaming-mouse.png"
    },
    {
        id: "boat",
        url: "boat.webp"
    },
    {
        id: "home",
        url: "home.png"
    },
    {
        id: "soccer-ball",
        url: "soccer-ball.webp"
    },
    {
        id: "banana",
        url: "banana.png"
    },
    {
        id: "clock",
        url: "clock.png"
    },
    {
        id: "watermelon",
        url: "watermelon.png"
    },
    {
        id: "blueberry",
        url: "blueberry.webp"
    }
];

// Variables to store first and second cards when selected
let firstCard;
let secondCard;
let isLocked = false;

// Render Select tag from Game Modes
window.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("select");

    Object.keys(gameModes).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = `${key} (${gameModes[key].rows}x${gameModes[key].columns})`;
        select.appendChild(option);
    });
});

// Add event listener to handle select form submit
selectForm.addEventListener("submit", handleSelectFormSubmit);

// Event listener to Close Modal when clicked the outside of modal
modal.addEventListener("click", (e) => {
    if (e.target.id === "modal") {
        closeModal();
    }
});

// Event listener to Close modal when clicked close button
closeBtn.addEventListener("click", closeModal);

// Reload page to play again
playBtn.addEventListener("click", () => {
    closeModal();
    resetGame();
});

// Select Form Submit Handler
function handleSelectFormSubmit(e) {
    e.preventDefault();

    // Get game mode from form data
    const formData = new FormData(e.target);
    const mode = formData.get("mode");

    const gameColumns = gameModes[mode]?.columns;
    const gameRows = gameModes[mode]?.rows;

    // Change grid columns and rows
    changeCardsLayout(gameColumns, gameRows);

    // Render new random images
    renderRandomImages(gameColumns, gameRows);

    // Remove Select form
    selectForm.remove();

    // Add Reset button to reset game
    const resetButton = document.createElement("button");
    resetButton.id = "reset-btn";
    resetButton.className = "px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-semibold rounded-sm w-fit self-center";
    resetButton.textContent = "Reset Game";
    resetButton.addEventListener("click", resetGame);

    header.appendChild(resetButton)
}

// Function to change grid columns and rows
function changeCardsLayout(columns = 3, rows = 4) {
    cardsWrapper.className = "grid gap-5";

    // Dynamic change grid columns and rows
    cardsWrapper.style.gridTemplateColumns = `repeat(${columns},minmax(140px,1fr))`;
    cardsWrapper.style.gridTemplateRows = `repeat(${rows},180px)`;
}

// Function to remove all cards and render new random images
function renderRandomImages(columns, rows) {
    // Shuffle All images
    const shuffledImages = shuffle(images);

    // Get Game images based on columns and rows
    const gameImages = shuffledImages.slice(0, columns * rows / 2);

    // Get duplicated random images from game images
    const randomImages = shuffle([...gameImages, ...gameImages]);

    // Render new random images
    randomImages.forEach(image => {
        renderCard(image.id, image.url);
    });
}

// Function to render cards based on image url
function renderCard(imageId, imageUrl) {
    const cardWrapper = document.createElement("div");
    cardWrapper.dataset.id = imageId;
    cardWrapper.className = "bg-transparent perspective-midrange rounded-md w-full cursor-pointer";
    cardWrapper.addEventListener("click", handleCardFlip);

    const card = document.createElement("div");
    card.className = "relative w-full h-full rounded-md text-center transform-3d shadow shadow-[0_0_8px_2px_gray] rounded-xl transition-all duration-500";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "absolute w-full h-full backface-hidden p-3 bg-white overflow-hidden rounded-xl rotate-y-180";

    const image = document.createElement("img");
    image.className = "size-full object-contain";
    image.src = "./images/" + imageUrl;

    imageWrapper.appendChild(image);

    const backfaceWrapper = document.createElement("div");
    backfaceWrapper.className = "absolute w-full h-full flex justify-center items-center backface-hidden bg-green text-white overflow-hidden rounded-xl";
    const backfaceImage = document.createElement("img");
    backfaceImage.className = "h-full w-full object-contain";
    backfaceImage.src = "./images/card-backface.jpg";

    backfaceWrapper.appendChild(backfaceImage);

    card.append(imageWrapper, backfaceWrapper)

    cardWrapper.appendChild(card);

    cardsWrapper.appendChild(cardWrapper);
}

function handleCardFlip(e) {
    const cardWrapper = e.currentTarget;
    const card = cardWrapper.firstElementChild;

    // If is locked or already rotated then don't do anything
    if (isLocked || card.classList.contains("flipped")) return;

    // Rotate card
    card.classList.toggle("flipped");

    // If there is no first card
    if (!firstCard) {
        firstCard = cardWrapper;
        return;
    }

    // In case when first card already selected
    secondCard = cardWrapper;
    isLocked = true;

    // Rotate selected cards if first and second cards don't matching
    if (firstCard.dataset.id !== secondCard.dataset.id) {
        setTimeout(() => {
            firstCard.firstElementChild.classList.remove("flipped");
            secondCard.firstElementChild.classList.remove("flipped");

            reset();
        }, 500);

        return;
    }

    reset();

    // Check if every card is already rotated or not
    // If rotated then show modal
    const isAllFlipped = [...cardsWrapper.children].every(elem => {
        return elem.firstElementChild.classList.contains("flipped");
    });

    if (isAllFlipped) {
        modal.classList.remove("hidden");
    }
}

// Reset selected first and second cards to select again
function reset() {
    firstCard = undefined;
    secondCard = undefined;
    isLocked = false;
}

// Function to close modal
function closeModal() {
    modal.classList.add("hidden");
}

// Function to reset game
function resetGame() {
    const resetButton = document.getElementById("reset-btn");
    resetButton.remove();
    cardsWrapper.innerHTML = "";
    cardsWrapper.className = "";

    header.appendChild(selectForm);
}

// Function to shuffle given array
function shuffle(array) {
    return array.toSorted(() => Math.random() - 0.5);
}