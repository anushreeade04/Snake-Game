    const playBoard = document.querySelector(".play-board");
    const scoreElement = document.querySelector(".score");
    const highScoreElement = document.querySelector(".high-score");
    const controls = document.querySelectorAll(".controls button");
    const pauseBtn = document.querySelector("#pauseResume");
    const gameModeSelect = document.getElementById("gameMode");
    const speedInput = document.getElementById("speed");
    const snakeColorInput = document.getElementById("snakeColor");
    const darkModeToggle = document.getElementById("dark-mode");


    let gameOver = false;
    let isPaused = false;
    let foodX, foodY;
    let snakeX = 5, snakeY = 5;
    let velocityX = 0, velocityY = 0;
    let snakeBody = [];
    let setIntervalId;
    let score = 0;
    let gameMode = localStorage.getItem("game-mode") || "classic"; // Default to classic

    // Load sound effects
    const foodSound = new Audio("bite.mp3");
    const gameOverSound = new Audio("gameover.wav");
    const clickSound = new Audio("buttonclick.mp3");

    // Function to enable dark mode
    const enableDarkMode = () => {
        document.body.classList.add("dark-mode");
        localStorage.setItem("dark-mode", "enabled");
    };

    // Function to disable dark mode
    const disableDarkMode = () => {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("dark-mode", "disabled");
    };

    // Check dark mode preference on page load
    if (localStorage.getItem("dark-mode") === "enabled") {
        enableDarkMode();
        darkModeToggle.checked = true;  // Set toggle to ON state
    }

    // Toggle dark mode when the switch is clicked
    darkModeToggle.addEventListener("change", () => {
        if (darkModeToggle.checked) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    });

    // Change game mode
    gameModeSelect.addEventListener("change", (e) => {
        gameMode = e.target.value;
        localStorage.setItem("game-mode", gameMode);
    });

    // Change game speed
    speedInput.addEventListener("input", (e) => {
        gameSpeed = parseInt(e.target.value);
        clearInterval(setIntervalId);
        setIntervalId = setInterval(initGame, gameSpeed);
    });

    // Get high score from local storage
    let highScore = localStorage.getItem("high-score") || 0;
    highScoreElement.innerText = `High Score: ${highScore}`;

    // Get saved snake color from localStorage (Default: Light Blue)
    let snakeColor = localStorage.getItem("snake-color") || "#60CBFF";
    snakeColorInput.value = snakeColor;

    // Play sound function
    const playSound = (sound) => {
        sound.currentTime = 0;
        sound.play();
    };

    // Update food position
    const updateFoodPosition = () => {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
    };

    // Update leaderboard
    const updateLeaderboard = (newScore) => {
        let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        leaderboard.push(newScore);
        leaderboard.sort((a, b) => b - a);
        leaderboard = leaderboard.slice(0, 5);
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
        displayLeaderboard();
    };

    // Display leaderboard
    const displayLeaderboard = () => {
        let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        let leaderboardList = document.getElementById("leaderboardList");
        leaderboardList.innerHTML = leaderboard.length === 0 ? "<li>No scores yet</li>"
            : leaderboard.map((score, index) => `<li>#${index + 1} - Score: ${score}</li>`).join("");
    };

    // Handle game over
    const handleGameOver = () => {
        clearInterval(setIntervalId);
        playSound(gameOverSound);

        setTimeout(() => {
            updateLeaderboard(score);
            alert(`Game Over! Your Score: ${score}\nPress OK to Restart.`);
            location.reload();
        }, 200);
    };

    // Load leaderboard on page load
    document.addEventListener("DOMContentLoaded", displayLeaderboard);

    // Change direction
    const changeDirection = (e) => {
        if (isPaused) return;

        if (e.key === "ArrowUp" && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        } else if (e.key === "ArrowDown" && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (e.key === "ArrowLeft" && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        } else if (e.key === "ArrowRight" && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        }
    };

    // Add click sound to buttons
    document.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => playSound(clickSound));
    });

    // Pause/Resume the game
    const togglePause = () => {
        if (gameOver) return;  // Don't allow pause after game over

        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(setIntervalId);
            pauseBtn.innerText = "Resume";
        } else {
            setIntervalId = setInterval(initGame, 100);
            pauseBtn.innerText = "Pause";
        }
    };


    // Update snake color
    snakeColorInput.addEventListener("input", (e) => {
        snakeColor = e.target.value;
        localStorage.setItem("snake-color", snakeColor);
    });



    // Start the game loop
    const initGame = () => {
        if (gameOver) return handleGameOver();
        if (isPaused) return;

        let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

        // Check if snake eats food
        if (snakeX === foodX && snakeY === foodY) {
            playSound(foodSound);
            updateFoodPosition();
            snakeBody.push([...snakeBody[snakeBody.length - 1] || [snakeX, snakeY]]); // Grow at the last part
            score++;
            highScore = Math.max(score, highScore);
            localStorage.setItem("high-score", highScore);
            scoreElement.innerText = `Score: ${score}`;
            highScoreElement.innerText = `High Score: ${highScore}`;
        }

        // Move snake
        snakeX += velocityX;
        snakeY += velocityY;

        // Classic Mode (Wall Collision)
        if (gameMode === "classic") {
            if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
                gameOver = true;
            }
        }
        // No Wall Collision Mode
        else if (gameMode === "no-wall") {
            if (snakeX < 1) snakeX = 30;
            else if (snakeX > 30) snakeX = 1;
            if (snakeY < 1) snakeY = 30;
            else if (snakeY > 30) snakeY = 1;
        }

        // Update snake body positions (Fixed version)
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = [...snakeBody[i - 1]];  // Correctly copying previous part
        }
        snakeBody[0] = [snakeX, snakeY]; // Head position update

        // Check self-collision
        for (let i = 1; i < snakeBody.length; i++) {
            if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
                gameOver = true;
            }
        }

        // Render snake and food
        snakeBody.forEach((part) => {
            html += `<div class="head" style="grid-area: ${part[1]} / ${part[0]}; background: ${snakeColor};"></div>`;
        });

        playBoard.innerHTML = html;
    };


    // Event listeners
    updateFoodPosition();
    setIntervalId = setInterval(initGame, 100);
    document.addEventListener("keyup", changeDirection);
    pauseBtn.addEventListener("click", togglePause);
    controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

    document.querySelectorAll(".mobile-controls button").forEach(button => {
        button.addEventListener("touchstart", () => {
            changeDirection({ key: button.dataset.key });
        });
    });

