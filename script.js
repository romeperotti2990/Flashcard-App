//#region Setup

// Use event delegation to handle clicks on dynamically created elements
document.addEventListener('click', e => {
    const el = e.target;
    const actionEl = (el.closest && el.closest('[data-action]')) || el;
    const action = actionEl && actionEl.dataset && (actionEl.dataset.action || actionEl.id);

    const go = (pageName, setId = null) => {
        if (setId) setCurrentSetId(setId);
        updateUserPage(pageName);
        renderUserPage();
    };

    const createSetFlow = () => {
        const name = prompt('Enter a name for your new set:');
        if (name && name.trim()) {
            setCurrentSetId(createNewSet(name.trim()));
            go('create');
        }
    };

    // Action handlers map
    const handlers = {
        quiz: () => { const id = getCurrentSetId(); if (id) startQuiz(id); },
        home: () => go('home'),
        'get-started': () => {
            const sets = getSets();
            if (!sets.length) {
                const name = prompt('Enter a name for your first set:');
                if (name && name.trim()) { setCurrentSetId(createNewSet(name.trim())); go('create'); }
            } else go('sets');
        },
        create: createSetFlow,
        'create-new-set': createSetFlow,
        'create-new-set-home': createSetFlow,
        sets: () => go('sets')
    };

    if (action && handlers[action]) {
        e.preventDefault();
        handlers[action]();
        return;
    }

    // Per-element class handlers
    const renameBtn = el.closest && el.closest('.rename-set');
    if (renameBtn) {
        e.stopPropagation();
        const id = renameBtn.dataset.setId, cur = renameBtn.dataset.setName || '';
        const n = prompt('Enter new name for the set:', cur);
        if (n && n.trim() && n.trim() !== cur) { renameSet(id, n.trim()); renderSetsPage(); }
        return;
    }

    const deleteBtn = el.closest && el.closest('.delete-set');
    if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.dataset.setId, nm = deleteBtn.dataset.setName || '';
        if (confirm(`Are you sure you want to delete the set "${nm}"?`)) { deleteSet(id); renderSetsPage(); }
        return;
    }

    // Clicking a set card opens it
    const card = el.closest && el.closest('.set-card');
    if (card) {
        setCurrentSetId(card.dataset.setId);
        go('create');
    }
});

let page = localStorage.getItem("page") || "home";

// quizState holds the active quiz
let quizState = null;

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
    let sets = JSON.parse(localStorage.getItem('cardSets') || '[]');
    // Migrate old cards with single answer to answers array
    sets.forEach(set => {
        set.cards.forEach(card => {
            if (typeof card.answer === 'string') {
                card.answers = [card.answer];
                delete card.answer;
            }
        });
    });
    // Save migrated data
    localStorage.setItem('cardSets', JSON.stringify(sets));
    return sets;
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
function addCardToSet(setId, question, answers) {
    const sets = getSets();
    const setIndex = sets.findIndex(set => set.id === setId);
    if (setIndex !== -1) {
        sets[setIndex].cards.push({ question, answers });
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

// Delete card from current set (adds the event listener)
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
       <h1 class="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-300">Welcome to 'Flashcard App!'</h1>
       <p class="mb-6 text-gray-700 dark:text-gray-300">
           I am making this for a college project, it uses local storage to make flashcards and sets. It's not too fancy,
           but it works!
       </p>
       <div class="flex flex-col sm:flex-row justify-center gap-4">
           <a href="#" id="get-started" class="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition">Get
               Started</a>
           <a href="#" id="sets" class="bg-gray-200 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-6 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">Browse My
               Flashcards</a>
           <a href="#" id="create-new-set-home" class="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700 transition">Create New
               Set</a>
       </div>
       <p class="text-xs text-gray-500 dark:text-gray-400">
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
    <div class="w-full px-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
            <div class="flex justify-between items-center mb-4 ">
                <h1 class="text-2xl font-bold text-blue-700 dark:text-blue-300" id="set-title">${currentSet.name}</h1>
                <button id="quiz" class="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-800">Quiz Set</button>
                <button id="back-to-sets" class="text-blue-500 dark:text-blue-400 hover:underline">← Back to Sets</button>
            </div>

            <form id="flashcard-form" class="mb-6 space-y-2" autocomplete="off">
                <input id="question" type="text" placeholder="Question" class="w-full min-w-96 px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded" required>
                <div id="answers-container">
                    <div class="answer-input flex space-x-2">
                        <input type="text" placeholder="Answer 1" class="answer-field flex-1 min-w-64 px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded" required>
                        <button type="button" class="remove-answer text-red-500 dark:text-red-400 hover:underline" style="display:none;">Remove</button>
                    </div>
                </div>
                <button type="button" id="add-answer" class="text-blue-500 dark:text-blue-400 hover:underline">+ Add Another Answer</button>
                <button type="submit" class="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700">Add Flashcard</button>
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
            <h1 class="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">My Flashcard Sets</h1>
            <div class="mb-6 text-center">
                <button id="create-new-set" class="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700 transition">Create New Set</button>
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
        container.innerHTML = `<div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">No sets created yet. Create your first set!</div>`;
    } else {
        sets.forEach((set) => {
            const setDiv = document.createElement('div');
            setDiv.className = "set-card bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow";
            setDiv.dataset.setId = set.id;
            setDiv.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300">${set.name}</h3>
                    <div class="flex flex-col space-y-1">
                        <button class="rename-set text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm" data-set-id="${set.id}" data-set-name="${set.name}">Rename</button>
                        <button class="delete-set text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm" data-set-id="${set.id}" data-set-name="${set.name}">Delete</button>
                    </div>
                </div>
                <div class="text-gray-600 dark:text-gray-400">
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
    } else if (page === "quiz") {
        const currentSetId = getCurrentSetId();
        if (currentSetId) { startQuiz(currentSetId); }
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
        const answerInputs = document.querySelectorAll('.answer-field');
        const answers = Array.from(answerInputs).map(input => input.value.trim()).filter(ans => ans);
        const currentSetId = getCurrentSetId();

        if (question && answers.length > 0 && currentSetId) {
            addCardToSet(currentSetId, question, answers);
            renderFlashcards();
            this.reset();
            // Reset to single answer input
            const container = document.getElementById('answers-container');
            container.innerHTML = `
                <div class="answer-input flex space-x-2">
                    <input type="text" placeholder="Answer 1" class="answer-field flex-1 min-w-64 px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded" required>
                    <button type="button" class="remove-answer text-red-500 dark:text-red-400 hover:underline" style="display:none;">Remove</button>
                </div>
            `;
        }
    });

    // Handle add answer button
    document.getElementById('add-answer').addEventListener('click', function () {
        const container = document.getElementById('answers-container');
        const count = container.querySelectorAll('.answer-input').length + 1;
        const div = document.createElement('div');
        div.className = 'answer-input flex space-x-2';
        div.innerHTML = `
            <input type="text" placeholder="Answer ${count}" class="answer-field flex-1 min-w-64 px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded">
            <button type="button" class="remove-answer text-red-500 dark:text-red-400 hover:underline">Remove</button>
        `;
        container.appendChild(div);
    });

    // Handle remove answer buttons (event delegation)
    document.getElementById('answers-container').addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-answer')) {
            e.target.closest('.answer-input').remove();
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
        container.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 py-4">No cards in this set yet. Add your first card above!</div>`;
        return;
    }

    currentSet.cards.forEach((card, idx) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = "bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded p-4 flex justify-between items-center";
        const answersHtml = card.answers.map(ans => escapeHtml(ans)).join('<br>');
        cardDiv.innerHTML = `
            <div>
                <div class="font-semibold text-gray-900 dark:text-white">${escapeHtml(card.question)}</div>
                <div class="text-gray-600 dark:text-gray-300 hidden" id="answer-${idx}">${answersHtml}</div>
            </div>
            <div class="flex space-x-2">
                <button class="text-blue-500 dark:text-blue-400 hover:underline" onclick="document.getElementById('answer-${idx}').classList.toggle('hidden')">Show</button>
                <button class="text-red-500 dark:text-red-400 hover:underline" onclick="deleteCardFromCurrentSet(${idx})">Delete</button>
            </div>
        `;
        container.appendChild(cardDiv);
    });
}

function getFlashcards() {
    const currentSetId = getCurrentSetId();
    if (!currentSetId) return [];
    const currentSet = getSetById(currentSetId);
    return currentSet ? currentSet.cards : [];
}

// Legacy function - kept for compatibility but should use deleteCardFromCurrentSet instead
function deleteFlashcard(idx) {
    const flashcards = getFlashcards();
    flashcards.splice(idx, 1);
    saveFlashcards(flashcards);
    renderFlashcards();
}

// Simple shuffle (Fisher–Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start a quiz for a set id
function startQuiz(setId) {
    updateUserPage("quiz");
    const set = getSetById(setId);
    if (!set) {
        alert('Set not found.');
        return;
    }
    if (!set.cards || set.cards.length === 0) {
        alert('This set has no cards.');
        return;
    }

    // build a shuffled order of indexes
    const order = shuffle(Array.from({ length: set.cards.length }, (_, i) => i));
    quizState = {
        setId,
        order,
        idx: 0,        // current position in order
        score: 0,
        answers: []    // optionally store results
    };

    renderQuiz(); // render the quiz UI into #main
}

// Render current quiz question
function renderQuiz() {
    if (!quizState) return;
    const set = getSetById(quizState.setId);
    if (!set) return;

    const cardIndex = quizState.order[quizState.idx];
    const card = set.cards[cardIndex];
    const progress = `${quizState.idx + 1} / ${quizState.order.length}`;

    document.getElementById('main').innerHTML = `
    <div class="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Quiz: ${escapeHtml(set.name)}</h2>
        <div class="text-sm text-gray-500 dark:text-gray-400">${progress}</div>
      </div>

      <div id="quiz-question" class="mb-4">
        <div class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Question</div>
        <div class="mb-4 text-gray-900 dark:text-white">${escapeHtml(card.question)}</div>
      </div>

      <form id="quiz-form" class="mb-2">
        <input id="quiz-answer" autocomplete="off" class="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded" placeholder="Type your answer" />
        <div class="flex gap-2 mt-3">
          <button type="submit" class="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700">Submit</button>
          <button type="button" id="show-answer" class="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded">Show answer</button>
        </div>
      </form>

      <div id="quiz-feedback" class="mt-4"></div>

      <div class="mt-4 flex justify-between">
        <button id="quiz-back" class="text-blue-500 dark:text-blue-400 hover:underline">Back to Set</button>
        <div id="quiz-progress"></div>
      </div>
    </div>
  `;

    // attach handlers (simple)
    document.getElementById('quiz-form').addEventListener('submit', function (e) {
        e.preventDefault();
        submitAnswer();
    });

    document.getElementById('show-answer').addEventListener('click', function () {
        const feedback = document.getElementById('quiz-feedback');
        const answersHtml = card.answers.map(ans => escapeHtml(ans)).join('<br>');
        feedback.innerHTML = `<div class="text-sm text-gray-700">Answer(s): <strong>${answersHtml}</strong></div>`;
    });

    document.getElementById('quiz-back').addEventListener('click', function () {
        setCurrentSetId(quizState.setId);
        quizState = null;
        renderCreatePage(); // go back to editing/viewing that set (use your existing function)
    });

    updateQuizProgress();
}

// Submit the user's answer for current question
function submitAnswer() {
    if (!quizState) return;
    const set = getSetById(quizState.setId);
    const cardIndex = quizState.order[quizState.idx];
    const card = set.cards[cardIndex];

    const input = document.getElementById('quiz-answer');
    const user = (input && input.value || '').trim();

    const correct = card.answers.some(ans => normalizeAnswer(user) === normalizeAnswer(ans));

    // store result
    quizState.answers.push({ idx: cardIndex, user, correct });
    if (correct) quizState.score++;

    // show feedback and next button
    const fb = document.getElementById('quiz-feedback');
    if (correct) {
        fb.innerHTML = `<div class="text-green-600 dark:text-green-400 font-semibold">Correct!</div>`;
    } else {
        fb.innerHTML = `<div class="text-red-600 dark:text-red-400 font-semibold">Incorrect.</div>
                    <div class="text-sm mt-1 text-gray-900 dark:text-white">Answer(s): <strong>${card.answers.map(ans => escapeHtml(ans)).join(', ')}</strong></div>`;
    }

    // disable input and show Next or Finish button
    if (input) input.disabled = true;
    const controls = document.createElement('div');
    controls.className = 'mt-3';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'bg-blue-600 text-white px-3 py-1 rounded';
    if (quizState.idx + 1 < quizState.order.length) {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
            quizState.idx++;
            renderQuiz();
        });
    } else {
        nextBtn.textContent = 'Finish';
        nextBtn.addEventListener('click', () => {
            endQuiz();
        });
    }
    fb.appendChild(controls);
    controls.appendChild(nextBtn);
}

// End quiz and show summary
function endQuiz() {
    if (!quizState) return;
    const set = getSetById(quizState.setId);
    const total = quizState.order.length;
    const score = quizState.score;

    // optionally persist last result: localStorage.setItem('lastQuiz', JSON.stringify({...}))
    document.getElementById('main').innerHTML = `
    <div class="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow text-center">
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Complete</h2>
      <p class="text-lg mb-4 text-gray-900 dark:text-white">You scored ${score} / ${total}</p>
      <div class="flex justify-center gap-3">
        <button id="quiz-retry" class="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700">Retry</button>
        <button id="quiz-back-to-set" class="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded">Back to Set</button>
      </div>
    </div>
  `;

    document.getElementById('quiz-retry').addEventListener('click', () => {
        // restart: reshuffle and reset counters
        startQuiz(quizState.setId);
    });
    document.getElementById('quiz-back-to-set').addEventListener('click', () => {
        setCurrentSetId(quizState.setId);
        quizState = null;
        renderCreatePage();
    });
}

// small helpers
function normalizeAnswer(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Escape HTML for safe output
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

// update progress text (optional)
function updateQuizProgress() {
    const p = document.getElementById('quiz-progress');
    if (!p || !quizState) return;
    p.textContent = `Score: ${quizState.score}, Q: ${quizState.idx + 1}/${quizState.order.length}`;
}

// Dark mode toggle
function initDarkMode() {

    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return; // Safety check

    // Check localStorage for saved preference and apply on load
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        toggleButton.textContent = '☀️'; // Sun icon for light mode
    } else {
        toggleButton.textContent = '🌙'; // Moon icon for dark mode
    }

    // Toggle button click handler
    toggleButton.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark'); // Toggle the 'dark' class on <html>
        localStorage.setItem('darkMode', isDark); // Save preference
        toggleButton.textContent = isDark ? '☀️' : '🌙'; // Update icon
    });

}

//#endregion

// Initial render
initDarkMode();
renderUserPage();