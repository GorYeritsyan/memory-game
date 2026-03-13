const CONFIG = {
    gameModes: {
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
    },
    images: [
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
    ]
}

class MemoryGame {
    constructor(config) {
        this.cardsWrapper = document.getElementById("cards-wrapper");
        this.modal = document.getElementById("modal");
        this.header = document.getElementById("header");
        this.playBtn = document.getElementById("play-btn");
        this.closeBtn = document.getElementById("close-btn");
        this.selectForm = document.getElementById("select-form");

        // State
        this.firstCard = null;
        this.secondCard = null;
        this.isLocked = false;
        this.currentMode = null;
        this.score = 0;
        this.moves = 0;

        // Config
        this.images = config.images;
        this.gameModes = config.gameModes;

        this.init();
    }

    init() {
        // Init Select Options
        this.renderSelectOptions();

        // Init Event Listeners
        this.initEventListeners();
    }

    // Method to shuffle given array
    shuffle(array) {
        return array.toSorted(() => Math.random() - 0.5);
    }

    // Render Select Options
    renderSelectOptions() {
        const select = document.getElementById("select");

        Object.keys(this.gameModes).forEach((key) => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = `${key} (${this.gameModes[key].rows}x${this.gameModes[key].columns})`;
            select.appendChild(option);
        });
    }

    // Init Event Listeners
    initEventListeners() {
        // Add event listener to handle select form submit
        this.selectForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Get game mode from form data
            const formData = new FormData(e.target);
            this.currentMode = formData.get("mode");

            this.startGame();
        });

        // Event listener to Close Modal when clicked the outside of modal
        this.modal.addEventListener("click", (e) => {
            if (e.target.id === "modal") {
                this.closeModal();
            }
        });

        // Event listener to Close modal when clicked close button
        this.closeBtn.addEventListener("click", () => this.closeModal());

        // Reload page to play again
        this.playBtn.addEventListener("click", () => {
            this.closeModal();
            this.resetGame();
        });
    }

    // Method to close modal
    closeModal() {
        this.modal.classList.add("hidden");
    }

    // Method to reset game
    resetGame() {
        this.cardsWrapper.innerHTML = "";
        this.cardsWrapper.className = "";
        this.currentMode = null;

        const resultWrapper = document.getElementById("result-wrapper");
        resultWrapper.classList.replace("flex", "hidden");

        this.header.appendChild(this.selectForm);

        this.score = 0;
        this.moves = 0;
    }

    // Start Game by selected game mode
    startGame() {
        const { columns, rows } = this.getCardsLayout();

        // Change grid columns and rows
        this.changeCardsLayout(columns, rows);

        // Render new random images
        this.renderRandomImages(columns, rows);

        // Remove Select form
        this.selectForm.remove();

        // Add Reset button to reset game
        const resetButton = document.getElementById("reset-btn");
        resetButton.addEventListener("click", () => this.resetGame());

        const resultWrapper = document.getElementById("result-wrapper");

        const score = document.getElementById("score")
        score.textContent = `${this.score}/${columns * rows / 2}`;

        const moves = document.getElementById("moves");
        moves.textContent = `${this.moves}`;

        resultWrapper.classList.replace("hidden", "flex");
    }

    // Increment Moves
    incrementMoves() {
        this.moves++;
        const moves = document.getElementById("moves");
        moves.textContent = `${this.moves}`;
    }

    // Increment Score
    incrementScore() {
        this.score++;
        const score = document.getElementById("score");
        const { columns, rows } = this.getCardsLayout();
        score.textContent = `${this.score}/${columns * rows / 2}`;
    }

    getCardsLayout() {
        return this.gameModes?.[this.currentMode];
    }

    // Function to change grid columns and rows
    changeCardsLayout(columns = 3, rows = 4) {
        this.cardsWrapper.className = "grid gap-5";

        // Dynamic change grid columns and rows
        this.cardsWrapper.style.gridTemplateColumns = `repeat(${columns},minmax(140px,1fr))`;
        this.cardsWrapper.style.gridTemplateRows = `repeat(${rows},180px)`;
    }

    // Function to remove all cards and render new random images
    renderRandomImages(columns, rows) {
        // Shuffle All images
        const shuffledImages = this.shuffle(this.images);

        // Get Game images based on columns and rows
        const gameImages = shuffledImages.slice(0, columns * rows / 2);

        // Get duplicated random images from game images
        const randomImages = this.shuffle([...gameImages, ...gameImages]);

        // Render new random images
        randomImages.forEach(image => {
            this.renderCard(image.id, image.url);
        });
    }

    // Method to render cards based on image url
    renderCard(imageId, imageUrl) {
        const cardTemplate = document.getElementById("card-template");

        const cardWrapper = cardTemplate.content.cloneNode(true).firstElementChild;
        cardWrapper.dataset.id = imageId;
        cardWrapper.addEventListener("click", (e) => {
            this.handleCardFlip(e);
        })

        const image = cardWrapper.querySelector("img");
        image.src = "./images/" + imageUrl;

        this.cardsWrapper.appendChild(cardWrapper);
    }

    // Method to flip cards
    handleCardFlip(e) {
        const cardWrapper = e.currentTarget;
        const card = cardWrapper.firstElementChild;

        // If is locked or already rotated then don't do anything
        if (this.isLocked || card.classList.contains("flipped")) return;

        // Rotate card
        card.classList.add("flipped");

        // If there is no first card
        if (!this.firstCard) {
            this.firstCard = cardWrapper;
            return;
        }

        // In case when first card already selected
        this.secondCard = cardWrapper;
        this.isLocked = true;

        this.incrementMoves();

        // Rotate selected cards if first and second cards don't matching
        if (this.firstCard.dataset.id !== this.secondCard.dataset.id) {
            setTimeout(() => {
                this.firstCard.firstElementChild.classList.remove("flipped");
                this.secondCard.firstElementChild.classList.remove("flipped");

                this.reset();
            }, 500);

            return;
        }

        this.incrementScore();

        this.reset();

        // Check if every card is already rotated or not
        // If rotated then show modal
       this.checkIsAllFlipped();
    }

    checkIsAllFlipped() {
        const { columns, rows } = this.getCardsLayout();

        // If All cards flipped then show modal
        if (this.score === (columns * rows / 2)) {
            this.modal.classList.remove("hidden");
        }
    }

    // Reset selected first and second cards to select again
    reset() {
        this.firstCard = null;
        this.secondCard = null;
        this.isLocked = false;
    }
}

new MemoryGame(CONFIG);