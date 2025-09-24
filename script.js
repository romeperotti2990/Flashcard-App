// Load flashcards from localStorage
function getFlashcards() {
    return JSON.parse(localStorage.getItem('flashcards') || '[]');
}

function saveFlashcards(flashcards) {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

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

function deleteFlashcard(idx) {
    const flashcards = getFlashcards();
    flashcards.splice(idx, 1);
    saveFlashcards(flashcards);
    renderFlashcards();
}

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

// Initial render
renderFlashcards();