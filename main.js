let gameState = {
    phase: 'setup',
    puzzleString: '',
    brackets: [],
    currentBracketIndex: 0,
    answerKey: {},
    solvedBrackets: {},
    currentString: '',
    availableBrackets: [],
    selectedBracket: null
};

function findAllBracketsWithPositions(s) {
    const result = [];
    const stack = [];
    
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '[') {
            stack.push(i);
        } else if (s[i] === ']') {
            if (stack.length > 0) {
                const start = stack.pop();
                result.push([s.substring(start, i + 1), start, i + 1]);
            }
        }
    }
    
    return result;
}

function findLeafBracketsWithPositions(s) {
    const result = [];
    const stack = [];
    
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '[') {
            stack.push(i);
        } else if (s[i] === ']') {
            if (stack.length > 0) {
                const start = stack.pop();
                const bracketContent = s.substring(start + 1, i);
                const hasEmbeddedBrackets = bracketContent.includes('[');
                
                if (!hasEmbeddedBrackets) {
                    result.push([s.substring(start, i + 1), start, i + 1]);
                }
            }
        }
    }
    
    return result;
}

function findMatchingAnswer(bracket, answerKey) {
    if (answerKey[bracket]) {
        return answerKey[bracket];
    }
    
    const bracketContent = bracket.substring(1, bracket.length - 1);
    
    if (bracketContent.includes('[')) {
        for (const [pattern, answer] of Object.entries(answerKey)) {
            if (pattern.startsWith('[') && pattern.endsWith(']')) {
                const patternContent = pattern.substring(1, pattern.length - 1);
                
                if (bracketContent === patternContent) {
                    return answer;
                }
            }
        }
    }
    
    return '';
}

function collapseBracketWithAnswer(s, bracketText, answer) {
    return s.replace(bracketText, answer, 1);
}

function validateAnswer(userAnswer, correctAnswer) {
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}

function getBracketLevel(bracket) {
    return bracket.count('[') - 1;
}

function showPhase(phase) {
    document.querySelectorAll('.phase').forEach(el => el.classList.remove('active'));
    document.getElementById(phase + 'Phase').classList.add('active');
}

function startKeyCreation() {
    const puzzleString = document.getElementById('puzzleString').value.trim();
    if (!puzzleString) {
        showError('setupError', 'Please enter a puzzle string!');
        return;
    }
    gameState.puzzleString = puzzleString;
    gameState.brackets = [];
    gameState.currentBracketIndex = 0;
    gameState.answerKey = {};
    gameState.solvedBrackets = {};
    gameState.currentString = '';
    gameState.availableBrackets = [];
    gameState.selectedBracket = null;
    document.getElementById('setupError').style.display = 'none';
    const allBrackets = findAllBracketsWithPositions(puzzleString);
    const bracketLevels = [];
    for (const [bracket, start, end] of allBrackets) {
        let level = 0;
        for (let i = 0; i < bracket.length; i++) {
            if (bracket[i] === '[') level++;
        }
        bracketLevels.push({
            text: bracket,
            start: start,
            end: end,
            level: level
        });
    }
    bracketLevels.sort((a, b) => a.level - b.level);
    gameState.brackets = bracketLevels;
    gameState.currentBracketIndex = 0;
    showPhase('keyCreation');
    updateKeyCreationDisplay();
}

function updateKeyCreationDisplay() {
    if (gameState.currentBracketIndex >= gameState.brackets.length) {
        startGame();
        return;
    }
    const currentBracket = gameState.brackets[gameState.currentBracketIndex];
    const progress = ((gameState.currentBracketIndex + 1) / gameState.brackets.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
        `${gameState.currentBracketIndex + 1} of ${gameState.brackets.length} brackets`;
    let displayBracket = currentBracket.text;
    const sortedSolved = Object.entries(gameState.solvedBrackets)
        .sort(([a], [b]) => b.length - a.length);
    for (const [solvedBracket, answer] of sortedSolved) {
        if (displayBracket.includes(solvedBracket)) {
            displayBracket = displayBracket.replace(solvedBracket, answer);
        }
    }
    document.getElementById('currentBracketTitle').textContent = 
        `Current Bracket (Level ${currentBracket.level}):`;
    document.getElementById('currentBracketText').textContent = displayBracket;
    document.getElementById('originalBracketText').textContent = 
        `Original: ${currentBracket.text}`;
    document.getElementById('bracketDisplay').style.display = 'block';
    updateBracketsPreview();
    document.getElementById('answerInput').focus();
}

function updateBracketsPreview() {
    const container = document.getElementById('bracketsList');
    container.innerHTML = '';
    gameState.brackets.forEach((bracket, index) => {
        const item = document.createElement('div');
        item.className = `bracket-preview-item ${index === gameState.currentBracketIndex ? 'current' : ''} ${index < gameState.currentBracketIndex ? 'completed' : ''}`;
        item.innerHTML = `
            <span class="bracket-level">Level ${bracket.level}</span>
            <span class="bracket-content">${bracket.text}</span>
            ${index < gameState.currentBracketIndex ? 
                `<span class="bracket-answer">→ ${gameState.answerKey[bracket.text] || '(skipped)'}</span>` : ''}
        `;
        container.appendChild(item);
    });
    document.getElementById('bracketsPreview').style.display = 'block';
}

function submitAnswer() {
    const answer = document.getElementById('answerInput').value.trim();
    if (!answer) {
        alert('Please enter an answer!');
        return;
    }
    const currentBracket = gameState.brackets[gameState.currentBracketIndex];
    const answerLower = answer.toLowerCase();
    gameState.answerKey[currentBracket.text] = answerLower;
    gameState.solvedBrackets[currentBracket.text] = answerLower;
    document.getElementById('answerInput').value = '';
    gameState.currentBracketIndex++;
    updateKeyCreationDisplay();
}

function skipAnswer() {
    const currentBracket = gameState.brackets[gameState.currentBracketIndex];
    gameState.answerKey[currentBracket.text] = '';
    gameState.solvedBrackets[currentBracket.text] = '';
    document.getElementById('answerInput').value = '';
    gameState.currentBracketIndex++;
    updateKeyCreationDisplay();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
}

function startGame() {
    gameState.currentString = gameState.puzzleString;
    showPhase('game');
    updateGameDisplay();
    setTimeout(() => {
        initializeTypingBar();
    }, 100);
}

function updateGameDisplay() {
    const leafBrackets = findLeafBracketsWithPositions(gameState.currentString);
    gameState.availableBrackets = [];
    for (const [bracket, start, end] of leafBrackets) {
        const matchingAnswer = findMatchingAnswer(bracket, gameState.answerKey);
        if (matchingAnswer) {
            gameState.availableBrackets.push({
                text: bracket,
                start: start,
                end: end,
                answer: matchingAnswer
            });
        }
    }
    let displayString = gameState.currentString;
    const sortedLeafBrackets = leafBrackets.sort((a, b) => b[1] - a[1]);
    sortedLeafBrackets.forEach(([bracket, start, end], index) => {
        const before = displayString.substring(0, start);
        const after = displayString.substring(end);
        const highlightedBracket = `<span class="leaf-bracket" data-bracket-index="${index}">${bracket}</span>`;
        displayString = before + highlightedBracket + after;
    });
    document.getElementById('currentStringDisplay').innerHTML = displayString;
    document.querySelectorAll('.leaf-bracket').forEach(element => {
        element.onclick = () => {
            const bracketIndex = parseInt(element.dataset.bracketIndex);
            const bracket = sortedLeafBrackets[bracketIndex][0];
            const availableIndex = gameState.availableBrackets.findIndex(b => b.text === bracket);
            if (availableIndex !== -1) {
                selectBracket(gameState.availableBrackets[availableIndex], availableIndex);
            }
        };
    });
    const container = document.getElementById('availableBrackets');
    container.innerHTML = '';
    if (gameState.availableBrackets.length === 0) {
        if (gameState.currentString.includes('[')) {
            document.getElementById('bracketsList').style.display = 'none';
            document.getElementById('noBrackets').style.display = 'block';
            document.getElementById('noBrackets').innerHTML = '<p>No more brackets with answer keys available!</p>';
        } else {
            document.getElementById('bracketsList').style.display = 'none';
            document.getElementById('noBrackets').style.display = 'block';
            document.getElementById('finalResult').style.display = 'block';
            document.getElementById('finalResultText').textContent = gameState.currentString;
        }
        return;
    }
    gameState.availableBrackets.forEach((bracket, index) => {
        const item = document.createElement('div');
        item.className = 'bracket-item';
        item.onclick = () => selectBracket(bracket, index);
        item.innerHTML = `
            <span class="bracket-text">${bracket.text}</span>
            <span class="bracket-number">${index + 1}</span>
        `;
        container.appendChild(item);
    });
    document.getElementById('bracketsList').style.display = 'block';
    document.getElementById('noBrackets').style.display = 'none';
}

function selectBracket(bracket, index) {
    gameState.selectedBracket = bracket;
    document.querySelectorAll('.bracket-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.bracket-item').classList.add('selected');
    document.querySelectorAll('.leaf-bracket').forEach(element => {
        element.classList.remove('selected');
    });
    document.querySelectorAll('.leaf-bracket').forEach(element => {
        if (element.textContent === bracket.text) {
            element.classList.add('selected');
        }
    });
    document.getElementById('selectedBracketDisplay').textContent = bracket.text;
    document.getElementById('answerInputSection').style.display = 'block';
    document.getElementById('gameAnswerInput').focus();
}

function submitGameAnswer() {
    const answer = document.getElementById('gameAnswerInput').value.trim();
    if (!answer) {
        alert('Please enter an answer!');
        return;
    }
    const isCorrect = validateAnswer(answer, gameState.selectedBracket.answer);
    if (isCorrect) {
        const originalString = gameState.currentString;
        const bracketText = gameState.selectedBracket.text;
        const newString = originalString.replace(bracketText, answer);
        gameState.currentString = newString;
        updateAnswerKeyAfterReplacement(bracketText, answer);
        showFeedback('Correct! The bracket has been replaced.', 'success');
        updateGameDisplayWithHighlight(answer);
    } else {
        showFeedback('Incorrect. Try again! ✗', 'error');
    }
    document.getElementById('gameAnswerInput').value = '';
    document.getElementById('answerInputSection').style.display = 'none';
    gameState.selectedBracket = null;
    document.querySelectorAll('.bracket-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.leaf-bracket').forEach(element => {
        element.classList.remove('selected');
    });
}

function cancelGameAnswer() {
    document.getElementById('gameAnswerInput').value = '';
    document.getElementById('answerInputSection').style.display = 'none';
    gameState.selectedBracket = null;
    document.querySelectorAll('.bracket-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.leaf-bracket').forEach(element => {
        element.classList.remove('selected');
    });
}

function handleGameKeyPress(event) {
    if (event.key === 'Enter') {
        submitGameAnswer();
    } else if (event.key === 'Escape') {
        cancelGameAnswer();
    }
}

function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

        function showHints() {
            const hintSection = document.getElementById('hintSection');
            const hintsList = document.getElementById('hintsList');
            const hintsButton = document.querySelector('button[onclick="showHints()"]');
            
            if (hintSection.style.display === 'block') {
                hintSection.style.display = 'none';
                hintsButton.textContent = 'Show Hints';
            } else {
                updateHintsDisplay();
                hintSection.style.display = 'block';
                hintsButton.textContent = 'Hide Hints';
            }
        }

        function updateHintsDisplay() {
            const hintsList = document.getElementById('hintsList');
            hintsList.innerHTML = '';
            
            if (gameState.availableBrackets.length === 0) {
                if (gameState.currentString.includes('[')) {
                    const hintItem = document.createElement('div');
                    hintItem.textContent = 'No more brackets with answer keys available!';
                    hintsList.appendChild(hintItem);
                } else {
                    const hintItem = document.createElement('div');
                    hintItem.textContent = '🎉 Puzzle Complete! All brackets have been solved.';
                    hintsList.appendChild(hintItem);
                }
            } else {
                gameState.availableBrackets.forEach((bracket, index) => {
                    const hintItem = document.createElement('div');
                    hintItem.textContent = `Bracket ${index + 1}: ${bracket.text} → Answer length: ${bracket.answer.length} characters`;
                    hintsList.appendChild(hintItem);
                });
            }
        }

        function updateHintsIfVisible() {
            const hintSection = document.getElementById('hintSection');
            if (hintSection.style.display === 'block') {
                updateHintsDisplay();
            }
        }

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        gameState = {
            phase: 'setup',
            puzzleString: '',
            brackets: [],
            currentBracketIndex: 0,
            answerKey: {},
            solvedBrackets: {},
            currentString: '',
            availableBrackets: [],
            selectedBracket: null
        };
        document.getElementById('puzzleString').value = '';
        showPhase('setup');
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function initializeTypingBar() {
    const typingInput = document.getElementById('typingInput');
    if (typingInput) {
        typingInput.addEventListener('keypress', handleTypingKeyPress);
        typingInput.addEventListener('input', clearTypingError);
    }
}

function handleTypingKeyPress(event) {
    if (event.key === 'Enter') {
        const answer = event.target.value.trim();
        if (answer) {
            checkTypingAnswer(answer);
            event.target.value = '';
        }
    }
}

function clearTypingError() {
    const errorElement = document.getElementById('typingError');
    errorElement.style.display = 'none';
}

function checkTypingAnswer(userAnswer) {
    const leafBrackets = findLeafBracketsWithPositions(gameState.currentString);
    let foundMatch = false;
    let matchedBracket = null;
    let matchedAnswer = '';
    for (const [bracketText, start, end] of leafBrackets) {
        const bracketContent = bracketText.substring(1, bracketText.length - 1);
        if (gameState.answerKey[bracketText]) {
            const correctAnswer = gameState.answerKey[bracketText];
            if (validateAnswer(userAnswer, correctAnswer)) {
                foundMatch = true;
                matchedBracket = bracketText;
                matchedAnswer = correctAnswer;
                break;
            }
        }
    }
    if (foundMatch) {
        const originalString = gameState.currentString;
        const newString = originalString.replace(matchedBracket, matchedAnswer);
        gameState.currentString = newString;
        updateAnswerKeyAfterReplacement(matchedBracket, matchedAnswer);
        updateGameDisplayWithHighlight(matchedAnswer);
        clearTypingError();
    } else {
        const errorElement = document.getElementById('typingError');
        errorElement.style.display = 'block';
    }
}

function updateGameDisplayWithHighlight(replacedAnswer) {
    const allBrackets = findAllBracketsWithPositions(gameState.currentString);
    const leafBrackets = findLeafBracketsWithPositions(gameState.currentString);
                if (leafBrackets.length === 0) {
                let displayString = gameState.currentString;
                if (replacedAnswer && replacedAnswer.trim()) {
                    const lastIndex = displayString.lastIndexOf(replacedAnswer);
                    if (lastIndex !== -1) {
                        const before = displayString.substring(0, lastIndex);
                        const after = displayString.substring(lastIndex + replacedAnswer.length);
                        const beforeChar = lastIndex > 0 ? displayString[lastIndex - 1] : ' ';
                        const afterChar = lastIndex + replacedAnswer.length < displayString.length ? displayString[lastIndex + replacedAnswer.length] : ' ';
                        const hasSpaceBefore = beforeChar === ' ' || beforeChar === '\n' || beforeChar === '\t';
                        const hasSpaceAfter = afterChar === ' ' || afterChar === '\n' || afterChar === '\t';
                        const highlightClass = (hasSpaceBefore && hasSpaceAfter) ? 'correct-answer' : 'correct-answer-compact';
                        displayString = before + `<span class="${highlightClass}">${replacedAnswer}</span>` + after;
                    }
                }
                document.getElementById('currentStringDisplay').innerHTML = displayString;
                document.getElementById('bracketsList').style.display = 'none';
                document.getElementById('noBrackets').style.display = 'block';
                document.getElementById('finalResult').style.display = 'block';
                document.getElementById('finalResultText').textContent = gameState.currentString;
                
                updateHintsIfVisible();
                return;
            }
    let displayString = gameState.currentString;
    const sortedLeafBrackets = leafBrackets.sort((a, b) => b[1] - a[1]);
    sortedLeafBrackets.forEach(([bracket, start, end], index) => {
        const before = displayString.substring(0, start);
        const after = displayString.substring(end);
        const highlightedBracket = `<span class="leaf-bracket" data-bracket-index="${index}">${bracket}</span>`;
        displayString = before + highlightedBracket + after;
    });
    const answerIndex = displayString.indexOf(replacedAnswer);
    const beforeChar = answerIndex > 0 ? displayString[answerIndex - 1] : ' ';
    const afterChar = answerIndex + replacedAnswer.length < displayString.length ? displayString[answerIndex + replacedAnswer.length] : ' ';
    const hasSpaceBefore = beforeChar === ' ' || beforeChar === '\n' || beforeChar === '\t';
    const hasSpaceAfter = afterChar === ' ' || afterChar === '\n' || afterChar === '\t';
    const highlightClass = (hasSpaceBefore && hasSpaceAfter) ? 'correct-answer' : 'correct-answer-compact';
    displayString = displayString.replace(
        replacedAnswer, 
        `<span class="${highlightClass}">${replacedAnswer}</span>`
    );
    document.getElementById('currentStringDisplay').innerHTML = displayString;
    document.querySelectorAll('.leaf-bracket').forEach(element => {
        element.onclick = () => {
            const bracketIndex = parseInt(element.dataset.bracketIndex);
            const bracket = sortedLeafBrackets[bracketIndex][0];
            const availableIndex = gameState.availableBrackets.findIndex(b => b.text === bracket);
            if (availableIndex !== -1) {
                selectBracket(gameState.availableBrackets[availableIndex], availableIndex);
            }
        };
    });
    updateAvailableBrackets();
    
    updateHintsIfVisible();
}

function updateAvailableBrackets() {
    const leafBrackets = findLeafBracketsWithPositions(gameState.currentString);
    gameState.availableBrackets = [];
    leafBrackets.forEach(([bracketText, start, end]) => {
        if (gameState.answerKey[bracketText]) {
            gameState.availableBrackets.push({
                text: bracketText,
                answer: gameState.answerKey[bracketText],
                start: start,
                end: end
            });
        }
    });
    const container = document.getElementById('availableBrackets');
    container.innerHTML = '';
    if (gameState.availableBrackets.length === 0) {
        if (gameState.currentString.includes('[')) {
            document.getElementById('bracketsList').style.display = 'none';
            document.getElementById('noBrackets').style.display = 'block';
            document.getElementById('noBrackets').innerHTML = '<p>No more brackets with answer keys available!</p>';
        } else {
            document.getElementById('bracketsList').style.display = 'none';
            document.getElementById('noBrackets').style.display = 'block';
            document.getElementById('finalResult').style.display = 'block';
            document.getElementById('finalResultText').textContent = gameState.currentString;
        }
        return;
    }
    gameState.availableBrackets.forEach((bracket, index) => {
        const item = document.createElement('div');
        item.className = 'bracket-item';
        item.onclick = () => selectBracket(bracket, index);
        item.innerHTML = `
            <span class="bracket-text">${bracket.text}</span>
            <span class="bracket-number">${index + 1}</span>
        `;
        container.appendChild(item);
    });
    document.getElementById('bracketsList').style.display = 'block';
    document.getElementById('noBrackets').style.display = 'none';
}

function updateAnswerKeyAfterReplacement(oldBracket, newAnswer) {
    const allBrackets = findAllBracketsWithPositions(gameState.currentString);
    allBrackets.forEach(([bracketText, start, end]) => {
        const bracketContent = bracketText.substring(1, bracketText.length - 1);
        if (bracketContent.includes(newAnswer)) {
            for (const [pattern, answer] of Object.entries(gameState.answerKey)) {
                if (pattern.startsWith('[') && pattern.endsWith(']')) {
                    const patternContent = pattern.substring(1, pattern.length - 1);
                    let transformedPattern = patternContent;
                    if (transformedPattern.includes(oldBracket)) {
                        transformedPattern = transformedPattern.replace(oldBracket, newAnswer);
                    }
                    if (bracketContent === transformedPattern) {
                        gameState.answerKey[bracketText] = answer;
                        break;
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTypingBar();
}); 