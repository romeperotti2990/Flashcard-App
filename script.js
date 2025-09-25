//#region Setup

// Use event delegation to handle clicks on dynamically created elements
document.addEventListener("click", function (e) {
    if (e.target.id === "home") {
        renderHomepage();
    } else if (e.target.id === "create") {
        renderCreatePage();
    } else if (e.target.id === "sets") {
        renderSetsPage();

    }
});

//#endregion

//#region Functions

// get witch page the user was last on
function getUserPage() {
    return JSON.parse(localStorage.getItem('flashcards') || '[]');
}

// Load flashcards from localStorage
function getFlashcards() {
    return JSON.parse(localStorage.getItem('flashcards') || '[]');
}

//set flashcards to local storage
function saveFlashcards(flashcards) {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

function renderHomepage() {
    document.getElementById("main").innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] w-full">
       <h1 class="text-3xl font-bold mb-4 text-blue-700">Welcome to 'Flashcard App!'</h1>
       <p class="mb-6 text-gray-700">
           I am making this for a college project, it uses local storage to make flashcards and sets. It's not too fancy,
           but it works!
       </p>
       <div class="flex flex-col sm:flex-row justify-center gap-4">
           <a href="#" id="create" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Get
               Started</a>
           <a href="#" id="sets" class="bg-gray-200 text-blue-700 px-6 py-2 rounded hover:bg-gray-300 transition">Browse My
               Flashcards</a>
           <a href="#" id="create" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition">Create New
               Set</a>
       </div>
       <p class="text-xs">
           (if you are some random stranger who found this, I don't care if you use this, the github repo is at: https://github.com/romeperotti2990/Flashcard-App)
       </p>
    </div>
    `;
    document.getElementById("home").className = "underline";
    document.getElementById("create").className = "hover:underline";
    document.getElementById("sets").className = "hover:underline";
}

function renderCreatePage() {
    document.getElementById("main").innerHTML = `

    <div class="w-full max-w-md bg-white rounded-lg shadow p-6 mt-28">

        <h1 class="text-2xl font-bold mb-4 text-center">Flashcard Maker</h1>

        <form id="flashcard-form" class="mb-6 space-y-2">

            <input id="question" type="text" placeholder="Question" class="w-full px-3 py-2 border rounded" required>
            <input id="answer" type="text" placeholder="Answer" class="w-full px-3 py-2 border rounded" required>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Add Flashcard</button>

        </form>

        <div id="flashcards" class="space-y-4"></div>

    </div>
    `;
    document.getElementById("home").className = "hover:underline";
    document.getElementById("create").className = "underline";
    document.getElementById("sets").className = "hover:underline";

    recreateForm();

    // Render existing flashcards
    renderFlashcards();
}

function renderSetsPage(){
    document.getElementById("main").innerHTML = `
        <div class="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-10">
            <h1 class="text-2xl font-bold mb-4 text-center text-blue-700">My Flashcard Sets</h1>
            <p class="mb-4 text-gray-700 text-center">All your flashcards are shown below. (Sets feature coming soon!)</p>
            <div id="all-flashcards" class="space-y-4"></div>
        </div>
    `;
    document.getElementById("home").className = "hover:underline";
    document.getElementById("create").className = "hover:underline";
    document.getElementById("sets").className = "underline";

    // Render all flashcards
    const flashcards = getFlashcards();
    const container = document.getElementById('all-flashcards');
    container.innerHTML = '';
    if (flashcards.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500">No flashcards yet.</div>`;
    } else {
        flashcards.forEach((card, idx) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = "bg-gray-50 border rounded p-4 flex justify-between items-center";
            cardDiv.innerHTML = `
                <div>
                    <div class="font-semibold">${card.question}</div>
                    <div class="text-gray-600 hidden" id="set-answer-${idx}">${card.answer}</div>
                </div>
                <div class="flex space-x-2">
                    <button class="text-blue-500 hover:underline" onclick="document.getElementById('set-answer-${idx}').classList.toggle('hidden')">Show</button>
                    <button class="text-red-500 hover:underline" onclick="deleteFlashcard(${idx}); renderSetsPage();">Delete</button>
                </div>
            `;
            container.appendChild(cardDiv);
        });
    }
}

// Re-attach form event listener after creating the form
function recreateForm() {
    document.getElementById('flashcard-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const question = document.getElementById('question').value.trim();
        const answer = document.getElementById('answer').value.trim();
        if (question && answer) {
            const flashcards = getFlashcards();
            flashcards.push({ question, answer });
            saveFlashcards(flashcards);
            renderFlashcards();
            this.reset();
        }
    });
}

// make the cards
function renderFlashcards() {
    const flashcards = getFlashcards();
    const container = document.getElementById('flashcards');
    container.innerHTML = '';
    flashcards.forEach((card, idx) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = "bg-gray-50 border rounded p-4 flex justify-between items-center";
        cardDiv.innerHTML = `
                    <div>
                        <div class="font-semibold">${card.question}</div>
                        <div class="text-gray-600 hidden" id="answer-${idx}">${card.answer}</div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-500 hover:underline" onclick="document.getElementById('answer-${idx}').classList.toggle('hidden')">Show</button>
                        <button class="text-red-500 hover:underline" onclick="deleteFlashcard(${idx})">Delete</button>
                    </div>
                `;
        container.appendChild(cardDiv);
    });
}

// i wonder what it do
function deleteFlashcard(idx) {
    const flashcards = getFlashcards();
    flashcards.splice(idx, 1);
    saveFlashcards(flashcards);
    renderFlashcards();
}

//#endregion

// Initial render
renderHomepage();