const container = document.getElementById('memo-text');
const sourceDisplay = document.getElementById('document-source'); 
const poemDisplay = document.getElementById('final-poem');
const revealBtn = document.getElementById('reveal-btn');
const resetBtn = document.getElementById('reset-btn');
const nextBtn = document.getElementById('next-btn'); // NEW
const headerLabel = document.querySelector('.header');

let currentText = "";
let originalTitle = ""; 
let currentSource = ""; 

// Helper function to spawn the dynamic cascade popup
function showTriggerPopup(count) {
    const container = document.getElementById('popup-container');
    if (!container) return;

    const popup = document.createElement('div');
    popup.className = 'glitch-popup';
    popup.innerHTML = `<span>⚡</span> YOUR CENSORSHIP HAS SPREAD TO OTHER WORDS.`;

    container.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('popup-fade-out');
        setTimeout(() => popup.remove(), 300); 
    }, 2500);
}

// 1. Load the JSON and pick a random document
async function loadRandomDocument() {
    try {
        const response = await fetch('texts.json');
        const data = await response.json();
        const docs = data.documents;
        
        const randomIndex = Math.floor(Math.random() * docs.length);
        const selectedDoc = docs[randomIndex];

        originalTitle = selectedDoc.title; 
        headerLabel.innerText = originalTitle;
        currentText = selectedDoc.content;
        currentSource = selectedDoc.source || 'Unknown Origin'; 
        
        if (sourceDisplay) {
            sourceDisplay.innerText = `Source: ${currentSource}`;
        }
        
        generateDocument();
    } catch (error) {
        console.error("Error loading texts:", error);
        container.innerText = "Error loading document. Please ensure texts.json is present.";
    }
}

// 2. Turn the text string into interactive spans
function generateDocument() {
    container.innerHTML = currentText.split(' ').map(word => 
        `<span class="word">${word}</span>`
    ).join(' ');

    const words = document.querySelectorAll('.word');
    words.forEach(word => {
        word.addEventListener('click', () => {
            word.classList.toggle('redacted');
            
            const isRedacting = word.classList.contains('redacted');
            const TRIGGER_CHANCE = 0.1;
                        
            if (isRedacting && Math.random() < TRIGGER_CHANCE) {
                const wordsToTriggerCount = Math.floor(Math.random() * 7) + 1;
                let actualTriggeredCount = 0; 
                
                for (let i = 0; i < wordsToTriggerCount; i++) {
                    const availableWords = Array.from(document.querySelectorAll('.word')).filter(w => {
                        return w !== word && !w.classList.contains('redacted');
                    });
                    
                    if (availableWords.length === 0) break;
                    
                    const randomIndex = Math.floor(Math.random() * availableWords.length);
                    availableWords[randomIndex].classList.add('redacted');
                    actualTriggeredCount++;
                }

                if (actualTriggeredCount > 0) {
                    showTriggerPopup(actualTriggeredCount);
                }
            }

            checkCensorshipLevel();
            
            document.getElementById('comparison-dashboard').style.display = 'none';
            poemDisplay.style.display = 'none';
        });
    });
}

// 3. Reveal logic with stats
function revealPoetry() {
    const words = document.querySelectorAll('.word');
    const dashboard = document.getElementById('comparison-dashboard');
    
    let poemWords = [];
    let redactedCount = 0;
    let totalCount = words.length;

    words.forEach(word => {
        if (!word.classList.contains('redacted')) {
            poemWords.push(word.innerText);
        } else {
            redactedCount++;
        }
    });

    const pct = ((redactedCount / totalCount) * 100).toFixed(1);

    document.getElementById('original-count').innerText = totalCount;
    document.getElementById('redacted-count').innerText = redactedCount;
    document.getElementById('censorship-pct').innerText = pct + "%";

    dashboard.style.gridTemplateColumns = 'repeat(3, 1fr)';
    dashboard.style.display = 'grid';
    
    if (poemWords.length === 0) {
        poemDisplay.innerText = "Absolute silence achieved.";
    } else {
        poemDisplay.innerText = `"${poemWords.join(' ')}"`;
    }
    
    poemDisplay.style.display = 'block';
    poemDisplay.scrollIntoView({ behavior: 'smooth' });
}

function checkCensorshipLevel() {
    const total = document.querySelectorAll('.word').length;
    const redacted = document.querySelectorAll('.word.redacted').length;
    const percentage = (redacted / total) * 100;
    const warningBox = document.getElementById('warning-box');

    if (percentage >= 35) {
        document.body.classList.add('glitch-active');
        headerLabel.innerText = "CRITICAL FAILURE: SYSTEM UNSTABLE";
        poemDisplay.style.color = "white";
        
        if (warningBox) warningBox.classList.remove('warning-hidden');
        if (sourceDisplay) sourceDisplay.style.opacity = "0.3"; 

        revealBtn.style.display = 'none';
        nextBtn.style.display = 'none'; 
    } else {
        document.body.classList.remove('glitch-active');
        headerLabel.innerText = originalTitle;
        
        if (warningBox) warningBox.classList.add('warning-hidden');
        if (sourceDisplay) sourceDisplay.style.opacity = "1";

        // Restore all buttons when stable
        revealBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
    }
}

// Clears layout but preserves text string data
function resetDoc() {
    // 1. Remove systemic glitch states
    document.body.classList.remove('glitch-active');
    headerLabel.innerText = originalTitle;
    if (sourceDisplay) {
        sourceDisplay.style.opacity = "1";
        sourceDisplay.innerText = `Source: ${currentSource}`;
    }

    // --- NEW: Force hide the warning box ---
    const warningBox = document.getElementById('warning-box');
    if (warningBox) {
        warningBox.classList.add('warning-hidden');
    }

    // 2. Regenerate the current text string from scratch
    generateDocument();
    
    // 3. Clear out metric dashboard values and reveal buttons
    revealBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    poemDisplay.style.display = 'none';
    document.getElementById('comparison-dashboard').style.display = 'none';
}

// NEW: Fetches a fresh text node completely
function loadNextDoc() {
    document.body.classList.remove('glitch-active');
    loadRandomDocument();
    poemDisplay.style.display = 'none';
    document.getElementById('comparison-dashboard').style.display = 'none';
}

// Event Listeners
revealBtn.addEventListener('click', revealPoetry);
resetBtn.addEventListener('click', resetDoc);
nextBtn.addEventListener('click', loadNextDoc); // NEW

// Initial Load
loadRandomDocument();