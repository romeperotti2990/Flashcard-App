//#region Setup

// Use event delegation to handle clicks on dynamically created elements
document.addEventListener("click", function (e) {
    if (e.target.id === "home") {
        renderHomePage();
    } else if (e.target.id === "create" || e.target.textContent.includes("Get Started")) {
        // Check if there are any sets, if not create a default one
        const sets = getSets();
        if (sets.length === 0) {
            const setId = createNewSet("My First Set");
            setCurrentSetId(setId);
        } else {
            // If there are sets but no current set, go to sets page
            const currentSetId = getCurrentSetId();
            if (!currentSetId) {
                renderSetsPage();
                return;
            }
        }
        renderCreatePage();
    } else if (e.target.id === "sets") {
        renderSetsPage();
    } else if (e.target.id === "create-new-set") {
        const setName = prompt("Enter a name for your new set:");
        if (setName && setName.trim()) {
            const setId = createNewSet(setName.trim());
            setCurrentSetId(setId);
            renderCreatePage();
        }
    } else if (e.target.classList.contains("rename-set")) {
        e.stopPropagation(); // Prevent triggering set-card click
        const setId = e.target.dataset.setId;
        const currentName = e.target.dataset.setName;
        const newName = prompt("Enter new name for the set:", currentName);
        if (newName && newName.trim() && newName.trim() !== currentName) {
            renameSet(setId, newName.trim());
            renderSetsPage();
        }
    } else if (e.target.classList.contains("delete-set")) {
        e.stopPropagation(); // Prevent triggering set-card click
        const setId = e.target.dataset.setId;
        const setName = e.target.dataset.setName;
        if (confirm(`Are you sure you want to delete the set "${setName}"? This action cannot be undone.`)) {
            deleteSet(setId);
            renderSetsPage();
        }
    } else if ((e.target.classList.contains("set-card") || e.target.closest(".set-card")) && !e.target.classList.contains("delete-set") && !e.target.classList.contains("rename-set")) {
        // Handle clicks on set cards or their child elements, but not on delete buttons
        const setCard = e.target.classList.contains("set-card") ? e.target : e.target.closest(".set-card");
        const setId = setCard.dataset.setId;
        setCurrentSetId(setId);
        renderCreatePage();
    }
});

let page = localStorage.getItem("page") || "home";

//#endregion

//#region Classes

class CardSet {
    constructor(name) {
        this.name = name;
        this.cards = [];
    }

    addCard(question, answer) {
        this.cards.push({ question, answer });
    }

    removeCard(index) {
        this.cards.splice(index, 1);
    }

    getCards() {
        return this.cards;
    }
}

//#endregion

//#region Functions
// If there is no comment before a function, just read the name of the function. I asume you are not stupid.

// sets localstorage for what page the user was last on.
function updateUserPage(pageName) {
    page = pageName;
    localStorage.setItem("page", page);
}

// Load flashcards from localStorage
function getFlashcards() {
    return JSON.parse(localStorage.getItem('flashcards') || '[]');
}

//set flashcards to local storage
function saveFlashcards(flashcards) {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

// Load sets from localStorage
function getSets() {
    return JSON.parse(localStorage.getItem('cardSets') || '[]');
}

// Save sets to localStorage
function saveSets(sets) {
    localStorage.setItem('cardSets', JSON.stringify(sets));
}

// Get current active set ID
function getCurrentSetId() {
    return localStorage.getItem('currentSetId') || null;
}

// Set current active set ID
function setCurrentSetId(setId) {
    localStorage.setItem('currentSetId', setId);
}

// Create a new set
function createNewSet(setName) {
    const sets = getSets();
    const newSet = {
        id: Date.now().toString(), // Simple ID generation
        name: setName,
        cards: []
    };
    sets.push(newSet);
    saveSets(sets);
    return newSet.id;
}

// Get a specific set by ID
function getSetById(setId) {
    const sets = getSets();
    return sets.find(set => set.id === setId) || null;
}

// Add card to specific set
function addCardToSet(setId, question, answer) {
    const sets = getSets();
    const setIndex = sets.findIndex(set => set.id === setId);
    if (setIndex !== -1) {
        sets[setIndex].cards.push({ question, answer });
        saveSets(sets);
        return true;
    }
    return false;
}

// Delete card from specific set
function deleteCardFromSet(setId, cardIndex) {
    const sets = getSets();
    const setIndex = sets.findIndex(set => set.id === setId);
    if (setIndex !== -1 && sets[setIndex].cards[cardIndex]) {
        sets[setIndex].cards.splice(cardIndex, 1);
        saveSets(sets);
        return true;
    }
    return false;
}

// Rename a set
function renameSet(setId, newName) {
    const sets = getSets();
    const setIndex = sets.findIndex(set => set.id === setId);
    if (setIndex !== -1) {
        sets[setIndex].name = newName;
        saveSets(sets);
        return true;
    }
    return false;
}

// Delete entire set
function deleteSet(setId) {
    const sets = getSets();
    const filteredSets = sets.filter(set => set.id !== setId);
    saveSets(filteredSets);
}

// Delete card from current set (for onclick handlers)
function deleteCardFromCurrentSet(cardIndex) {
    const currentSetId = getCurrentSetId();
    if (currentSetId) {
        deleteCardFromSet(currentSetId, cardIndex);
        renderFlashcards();
    }
}

function renderHomePage() {
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

    updateUserPage("home");
}

function renderCreatePage() {
    const currentSetId = getCurrentSetId();
    const currentSet = currentSetId ? getSetById(currentSetId) : null;
    
    if (!currentSet) {
        // No set selected, redirect to sets page
        renderSetsPage();
        return;
    }
    
    document.getElementById("main").innerHTML = `
    <div class="w-full max-w-2xl">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold text-blue-700" id="set-title">${currentSet.name}</h1>
                <button id="back-to-sets" class="text-blue-500 hover:underline">← Back to Sets</button>
            </div>

            <form id="flashcard-form" class="mb-6 space-y-2">
                <input id="question" type="text" placeholder="Question" class="w-full px-3 py-2 border rounded" required>
                <input id="answer" type="text" placeholder="Answer" class="w-full px-3 py-2 border rounded" required>
                <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Add Flashcard</button>
            </form>

            <div id="flashcards" class="space-y-4"></div>
        </div>
    </div>
    `;
    document.getElementById("home").className = "hover:underline";
    document.getElementById("create").className = "underline";
    document.getElementById("sets").className = "hover:underline";

    // Add back button functionality
    document.getElementById('back-to-sets').addEventListener('click', () => {
        setCurrentSetId(null);
        renderSetsPage();
    });

    recreateForm();

    updateUserPage("create");

    // Render existing flashcards
    renderFlashcards();
}

function renderSetsPage() {
    document.getElementById("main").innerHTML = `
        <div class="w-full max-w-4xl">
            <h1 class="text-2xl font-bold mb-4 text-center text-blue-700">My Flashcard Sets</h1>
            <div class="mb-6 text-center">
                <button id="create-new-set" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition">Create New Set</button>
            </div>
            <div id="sets-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        </div>
    `;
    document.getElementById("home").className = "hover:underline";
    document.getElementById("create").className = "hover:underline";
    document.getElementById("sets").className = "underline";

    updateUserPage("sets");

    // Render all sets
    const sets = getSets();
    const container = document.getElementById('sets-container');
    container.innerHTML = '';
    
    if (sets.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center text-gray-500 py-8">No sets created yet. Create your first set!</div>`;
    } else {
        sets.forEach((set) => {
            const setDiv = document.createElement('div');
            setDiv.className = "set-card bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow";
            setDiv.dataset.setId = set.id;
            setDiv.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-semibold text-blue-700">${set.name}</h3>
                    <div class="flex flex-col space-y-1">
                        <button class="rename-set text-blue-500 hover:text-blue-700 text-sm" data-set-id="${set.id}" data-set-name="${set.name}">Rename</button>
                        <button class="delete-set text-red-500 hover:text-red-700 text-sm" data-set-id="${set.id}" data-set-name="${set.name}">Delete</button>
                    </div>
                </div>
                <div class="text-gray-600">
                    <p>${set.cards.length} card${set.cards.length !== 1 ? 's' : ''}</p>
                    <p class="text-sm mt-2">Click to edit</p>
                </div>
            `;
            container.appendChild(setDiv);
        });
    }
}

function renderUserPage() {
    if (page === "home") {
        renderHomePage();
    } else if (page === "create") {
        renderCreatePage();
    } else if (page === "sets") {
        renderSetsPage();
    } else {
        // Default to home page if no valid page is found
        renderHomePage();
    }
}

// Re-attach form event listener after creating the form
function recreateForm() {
    document.getElementById('flashcard-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const question = document.getElementById('question').value.trim();
        const answer = document.getElementById('answer').value.trim();
        const currentSetId = getCurrentSetId();
        
        if (question && answer && currentSetId) {
            addCardToSet(currentSetId, question, answer);
            renderFlashcards();
            this.reset();
        }
    });
}

// make the cards
function renderFlashcards() {
    const currentSetId = getCurrentSetId();
    if (!currentSetId) return;
    
    const currentSet = getSetById(currentSetId);
    if (!currentSet) return;
    
    const container = document.getElementById('flashcards');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (currentSet.cards.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 py-4">No cards in this set yet. Add your first card above!</div>`;
        return;
    }
    
    currentSet.cards.forEach((card, idx) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = "bg-gray-50 border rounded p-4 flex justify-between items-center";
        cardDiv.innerHTML = `
            <div>
                <div class="font-semibold">${card.question}</div>
                <div class="text-gray-600 hidden" id="answer-${idx}">${card.answer}</div>
            </div>
            <div class="flex space-x-2">
                <button class="text-blue-500 hover:underline" onclick="document.getElementById('answer-${idx}').classList.toggle('hidden')">Show</button>
                <button class="text-red-500 hover:underline" onclick="deleteCardFromCurrentSet(${idx})">Delete</button>
            </div>
        `;
        container.appendChild(cardDiv);
    });
}

// Legacy function - kept for compatibility but should use deleteCardFromCurrentSet instead
function deleteFlashcard(idx) {
    const flashcards = getFlashcards();
    flashcards.splice(idx, 1);
    saveFlashcards(flashcards);
    renderFlashcards();
}

//#endregion

// Initial render
renderUserPage();