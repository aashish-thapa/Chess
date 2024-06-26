const chessboard = document.getElementById('chessboard');

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceImages = {
    'r': 'images/black_rook.png',
    'n': 'images/black_knight.png',
    'b': 'images/black_bishop.png',
    'q': 'images/black_queen.png',
    'k': 'images/black_king.png',
    'p': 'images/black_pawn.png',
    'R': 'images/white_rook.png',
    'N': 'images/white_knight.png',
    'B': 'images/white_bishop.png',
    'Q': 'images/white_queen.png',
    'K': 'images/white_king.png',
    'P': 'images/white_pawn.png'
};

let selectedPiece = null;
let turn = 'white';

function createBoard() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            const piece = initialBoard[row][col];
            if (piece) {
                const pieceElement = document.createElement('img');
                pieceElement.className = 'piece';
                pieceElement.src = pieceImages[piece];
                pieceElement.dataset.color = piece === piece.toUpperCase() ? 'white' : 'black';
                pieceElement.draggable = true;
                pieceElement.addEventListener('dragstart', onDragStart);
                pieceElement.addEventListener('touchstart', onTouchStart);
                square.appendChild(pieceElement);
            }
            square.addEventListener('click', onSquareClick);
            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
            square.addEventListener('touchstart', onTouchStart);
            square.addEventListener('touchmove', onTouchMove);
            square.addEventListener('touchend', onTouchEnd);
            chessboard.appendChild(square);
        }
    }
}

function onSquareClick(e) {
    const square = e.currentTarget;
    const piece = square.querySelector('.piece');

    if (selectedPiece) {
        movePiece(square);
    } else if (piece && piece.dataset.color === turn) {
        selectPiece(square, piece);
    }
}

function selectPiece(square, piece) {
    clearHighlights();
    selectedPiece = piece;
    square.classList.add('selected');
    highlightMoves(square, piece);
}

function movePiece(square) {
    const piece = square.querySelector('.piece');
    if (piece && piece.dataset.color === selectedPiece.dataset.color) {
        // Deselect if trying to select a piece of the same color
        selectedPiece.parentElement.classList.remove('selected');
        clearHighlights();
        selectedPiece = null;
        return;
    }
    if (canMove(selectedPiece.parentElement, square)) {
        const selectedSquare = selectedPiece.parentElement;
        if (piece) piece.remove();
        square.appendChild(selectedPiece);
        selectedSquare.classList.remove('selected');
        clearHighlights();
        selectedPiece = null;
        turn = turn === 'white' ? 'black' : 'white';
    } else {
        selectedPiece.parentElement.classList.remove('selected');
        clearHighlights();
        selectedPiece = null;
    }
}

function highlightMoves(square, piece) {
    const startRow = parseInt(square.dataset.row);
    const startCol = parseInt(square.dataset.col);
    const color = piece.dataset.color;
    const moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const endSquare = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            if (canMove(square, endSquare)) {
                moves.push(endSquare);
            }
        }
    }

    moves.forEach(move => move.classList.add('highlight'));
}

function clearHighlights() {
    const highlights = document.querySelectorAll('.highlight');
    highlights.forEach(square => square.classList.remove('highlight'));
}

function canMove(startSquare, endSquare) {
    const startRow = parseInt(startSquare.dataset.row);
    const startCol = parseInt(startSquare.dataset.col);
    const endRow = parseInt(endSquare.dataset.row);
    const endCol = parseInt(endSquare.dataset.col);
    const piece = startSquare.querySelector('.piece').src.split('/').pop().split('.')[0];
    const color = startSquare.querySelector('.piece').dataset.color;

    if (piece.includes('pawn')) return canMovePawn(startRow, startCol, endRow, endCol, color);
    if (piece.includes('rook')) return canMoveRook(startRow, startCol, endRow, endCol);
    if (piece.includes('knight')) return canMoveKnight(startRow, startCol, endRow, endCol);
    if (piece.includes('bishop')) return canMoveBishop(startRow, startCol, endRow, endCol);
    if (piece.includes('queen')) return canMoveQueen(startRow, startCol, endRow, endCol);
    if (piece.includes('king')) return canMoveKing(startRow, startCol, endRow, endCol);

    return false;
}

function canMovePawn(startRow, startCol, endRow, endCol, color) {
    const direction = color === 'white' ? -1 : 1;
    const startRank = color === 'white' ? 6 : 1;
    const endPiece = document.querySelector(`[data-row='${endRow}'][data-col='${endCol}'] .piece`);

    if (startCol === endCol) {
        if (!endPiece && startRow + direction === endRow) return true;
        if (!endPiece && startRow === startRank && startRow + 2 * direction === endRow) return true;
    } else if (Math.abs(startCol - endCol) === 1 && startRow + direction === endRow) {
        if (endPiece && endPiece.dataset.color !== color) return true;
    }

    return false;
}

function canMoveRook(startRow, startCol, endRow, endCol) {
    if (startRow !== endRow && startCol !== endCol) return false;

    const stepRow = startRow === endRow ? 0 : (endRow > startRow ? 1 : -1);
    const stepCol = startCol === endCol ? 0 : (endCol > startCol ? 1 : -1);

    for (let r = startRow + stepRow, c = startCol + stepCol; r !== endRow || c !== endCol; r += stepRow, c += stepCol) {
        if (document.querySelector(`[data-row='${r}'][data-col='${c}'] .piece`)) return false;
    }

    return true;
}

function canMoveKnight(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);

    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function canMoveBishop(startRow, startCol, endRow, endCol) {
    if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) return false;

    const stepRow = endRow > startRow ? 1 : -1;
    const stepCol = endCol > startCol ? 1 : -1;

    for (let r = startRow + stepRow, c = startCol + stepCol; r !== endRow; r += stepRow, c += stepCol) {
        if (document.querySelector(`[data-row='${r}'][data-col='${c}'] .piece`)) return false;
    }

    return true;
}

function canMoveQueen(startRow, startCol, endRow, endCol) {
    return canMoveRook(startRow, startCol, endRow, endCol) || canMoveBishop(startRow, startCol, endRow, endCol);
}

function canMoveKing(startRow, startCol, endRow, endCol) {
    return Math.abs(startRow - endRow) <= 1 && Math.abs(startCol - endCol) <= 1;
}

function onDragStart(e) {
    const piece = e.target;
    const square = piece.parentElement;

    if (piece.dataset.color !== turn) {
        e.preventDefault();
        return;
    }

    selectedPiece = piece;
    square.classList.add('selected');
    highlightMoves(square, piece);
}

function onDragOver(e) {
    e.preventDefault();
}

function onDrop(e) {
    const square = e.currentTarget;
    movePiece(square);
}

function onTouchStart(e) {
    const square = e.currentTarget;
    const piece = square.querySelector('.piece');

    if (piece && piece.dataset.color !== turn) {
        return;
    }

    if (selectedPiece) {
        movePiece(square);
    } else if (piece && piece.dataset.color === turn) {
        selectPiece(square, piece);
    }
}

function onTouchMove(e) {
    e.preventDefault();
}

function onTouchEnd(e) {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target.classList.contains('square')) {
        movePiece(target);
    }
}

createBoard();
