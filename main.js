const confetti = new JSConfetti();

let gameState = {
    phase: 'game',
    puzzleString: '[Sav____h Ba[reactive element often paired with Cl, abbr.]nas] and [____ Jessica [place to play catch]er] make it [city ____ (govern[____os (candy often paired with [anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s "___ of America" features 520 stores]y)]] person)] [The o[oil ___ (ocean drilling [art form where singers tell the story]tion)]inal 🙂]'
    ,
    brackets: [
        {end: 58, level: 1, start: 22, text: '[reactive element often paired with Cl, abbr.]'},
        {end: 102 , level: 1, start: 81, text: '[Something a student might have to defend]'},
        {end: 249, level: 1, start: 216, text: '[controversial Kendall Jenner ad]'},
        {end: 256, level: 1, start: 306, text: '[Minnesota\'s "___ of America" features 520 stores]'},
        {end: 390, level: 1, start: 351, text: '[art form where singers tell the story]'},
        {end: 62, level: 2, start: 0, text: '[Sav____h Ba[reactive element often paired with Cl, abbr.]nas]'},
        {end: 105, level: 2, start: 67, text: '[____ Jessica [place to play catch]er]'},
        {end: 396, level: 2, start: 326, text: '[oil ___ (ocean drilling [art form where singers tell the story]tion)]'},
        {end: 404, level: 3, start: 320, text: '[The o[oil ___ (ocean drilling [art form where singers tell the story]tion)]inal 🙂]'},
        {end: 309, level: 4, start: 165, text: '[anti[Something a student might have to defend] of…nesota\'s "___ of America" features 520 stores]y)]'},
        {end: 310, level: 5, start: 132, text: '[____os (candy often paired with [anti[Something a…esota\'s "___ of America" features 520 stores]y)]]'},
        {end: 319, level: 6, start: 114, text: '[city ____ (govern[____os (candy often paired with…___ of America" features 520 stores]y)]] person)]'}
    ],
    currentBracketIndex: 13,
    answerKey: {
        '[Minnesota\'s \"___ of America\" features 520 stores]': 'mall',
        '[Sav____h Ba[reactive element often paired with Cl, abbr.]nas]': 'Anna',
        '[Something a student might have to defend]': 'thesis',
        '[The o[oil ___ (ocean drilling [art form where singers tell the story]tion)]inal 🙂]': ':)',
        '[____ Jessica [place to play catch]er]': 'Sarah',
        '[____os (candy often paired with [anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s \"___ of America\" features 520 stores]y)]]': 'ment',
        '[anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s \"___ of America\" features 520 stores]y)]': 'coke',
        '[art form where singers tell the story]' : 'opera','[city ____ (govern[____os (candy often paired with [anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s \"___ of America\" features 520 stores]y)]] person)]': 'official',
        '[controversial Kendall Jenner ad]': 'pepsi',
        '[oil ___ (ocean drilling [art form where singers tell the story]tion)]': 'rig',
        '[place to play catch]' : 'park',
        '[reactive element often paired with Cl, abbr.]': 'na'
    },
    solvedBrackets: {
        '[Minnesota\'s \"___ of America\" features 520 stores]': 'mall',
        '[Sav____h Ba[reactive element often paired with Cl, abbr.]nas]': 'Anna',
        '[Something a student might have to defend]': 'thesis',
        '[The o[oil ___ (ocean drilling [art form where singers tell the story]tion)]inal 🙂]': ':)',
        '[____ Jessica [place to play catch]er]': 'Sarah',
        '[____os (candy often paired with [anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s \"___ of America\" features 520 stores]y)]]': 'ment',
        '[anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s \"___ of America\" features 520 stores]y)]': 'coke',
        '[art form where singers tell the story]' : 'opera','[city ____ (govern[____os (candy often paired with [anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s \"___ of America\" features 520 stores]y)]] person)]': 'official',
        '[controversial Kendall Jenner ad]': 'pepsi',
        '[oil ___ (ocean drilling [art form where singers tell the story]tion)]': 'rig',
        '[place to play catch]' : 'park',
        '[reactive element often paired with Cl, abbr.]': 'na'
    },
    currentString: '[Sav____h Ba[reactive element often paired with Cl, abbr.]nas] and [____ Jessica [place to play catch]er] make it [city ____ (govern[____os (candy often paired with [anti[Something a student might have to defend] of [controversial Kendall Jenner ad] (infor[Minnesota\'s "___ of America" features 520 stores]y)]] person)] [The o[oil ___ (ocean drilling [art form where singers tell the story]tion)]inal 🙂]\n',
    availableBrackets: [],
    selectedBracket: null, 
    score: 100
};

const initialState = {...gameState};

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

function validateAnswer(userAnswer, correctAnswer) {
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}

function startGame() {
    gameState.currentString = gameState.puzzleString;
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
}

function showHints() {
    const hintSection = document.getElementById('hintSection');
    const hintsButton = document.querySelector('button[onclick="showHints()"]');
    const myImage = document.getElementById("my-image");

    if (hintSection.style.display === 'block') {
        hintSection.style.display = 'none';
        hintsButton.textContent = 'Show Hints';
    } else {
        hintsButton.addEventListener("click", () => {
            myImage.style.display = 'block'; 
        })
        hintSection.style.display = 'block';
        hintsButton.textContent = 'Hide Hints';
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        gameState =  initialState;
        document.getElementById("currentStringDisplay").value = initialState.currentString;
        document.getElementById('dateString').style.display = 'none';

        document.querySelectorAll('.score-box').forEach(item => {
            item.style.display = 'none'
        });
        
        document.querySelectorAll('.typing-bar').forEach(item => {
            item.style.display = 'flex'
        });
        
        updateGameDisplay();
    }
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
            event.target.value = '';
            checkTypingAnswer(answer);
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
    for (const [bracketText] of leafBrackets) {
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
        gameState.score = gameState.score - 2;
        const errorElement = document.getElementById('typingError');
        errorElement.style.display = 'block';
    }
}

function updateGameDisplayWithHighlight(replacedAnswer) {
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
        confetti.addConfetti({
            emojis: ['🌈', '😼', '🍋', '👩🏻‍❤️‍💋‍👩🏼', '👩🏻‍❤️‍💋‍👩🏼', '👩🏻‍❤️‍💋‍👩🏼'],
            confettiNumber: 200
        });
        document.getElementById('currentStringDisplay').innerHTML = displayString;
        document.getElementById('dateString').style.display = 'inline';

        //remove typing input box
        document.querySelectorAll('.typing-bar').forEach(item => {
            item.style.display = 'none';
        });
        showScore();
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
    updateAvailableBrackets();
    clearTypingError();
}

function showScore() {
    const segmentEmoji = '🙂';
    const segments = 10;
    const filledSegments = Math.round((gameState.score / 100) * segments);
    const emptySegments = segments - filledSegments;

    document.getElementById('scoreLabel').style.display = 'block';
    document.getElementById('scoreLabel').style.display = 'inline';
    document.getElementById('gameScore').innerHTML = gameState.score;
    
    const progressBar = segmentEmoji.repeat(filledSegments) + '⚪'.repeat(emptySegments);
    document.getElementById('progressBar').innerHTML = progressBar;
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
}

function updateAnswerKeyAfterReplacement(oldBracket, newAnswer) {
    const allBrackets = findAllBracketsWithPositions(gameState.currentString);
    allBrackets.forEach(([bracketText]) => {
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
    startGame();
});
