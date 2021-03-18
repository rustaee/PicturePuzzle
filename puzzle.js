let PUZZLE_DIFFICULTY = 4;
const PUZZLE_HOVER_TINT = '#3a5743';

var _canvas;
var _stage;

var _img;
var _imgWidth;
var _imgHeight;
var _pieces;
var _puzzleWidth;
var _puzzleHeight;
var _pieceWidth;
var _pieceHeight;
var _currentPiece;
var _currentDropPiece;

var _mouse;




//Load the image
function init(){
    let puzzleContainer = document.querySelector('.puzzle');
     _imgWidth = puzzleContainer.offsetWidth;
 _imgHeight = puzzleContainer.offsetHeight;
    _img = new Image();
    _img.addEventListener('load', onImage, false);
    _img.src = `https://source.unsplash.com/random/${_imgWidth}x${_imgHeight}`;
    
    //Show the orignal picture as guidance    
    let imgDiv = document.querySelector('.image');
    imgDiv.appendChild(_img);

    //Add event listener on radio buttons
    const modes = document.querySelectorAll('input[type=radio][name="mode"]');
    modes.forEach(mode => mode.addEventListener('change', () => changeMode(mode)))
}

//change the game difficulty
function changeMode(e){
    PUZZLE_DIFFICULTY = e.value;
    onImage();
}

//Defining size of puzzle and pieces
function onImage(){
    const loading = document.getElementById('loading');
    loading.style.display = 'none';
    _pieceWidth = Math.floor(_imgWidth / PUZZLE_DIFFICULTY);
    _pieceHeight = Math.floor(_imgHeight / PUZZLE_DIFFICULTY);
    _puzzleWidth = _pieceWidth * PUZZLE_DIFFICULTY;
    _puzzleHeight = _pieceHeight * PUZZLE_DIFFICULTY;
    setCanvas();
    initPuzzle();
}

//Setting up the Canvas
function setCanvas(){
    _canvas = document.getElementById('canvas');
    _stage = _canvas.getContext('2d');
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
}

//Initialize the Puzzle
function initPuzzle(){
    _pieces = [];
    _mouse = {x:0, y:0};
    _currentPiece = null;
    _currentDropPiece = null;
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
    createTitle("Click to start puzzle");
    buildPieces();
}

//Create the message to show at the begining
function createTitle(msg){
   _stagefillStyle="#000000";
   _stage.globalAlpha= 0.4;
   _stage.fillRect(100, _puzzleHeight-40, _puzzleWidth-200, 40);
   _stage.fillStyle="#ffffff";
   _stage.globalAlpha=1;
   _stage.textAlign="center";
   _stage.textBaseline="middle";
   _stage.font="20px Arial";
   _stage.fillText(msg, _puzzleWidth/2, _puzzleHeight-20); 
}

//build the puzzle
function buildPieces(){
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0; i < PUZZLE_DIFFICULTY * PUZZLE_DIFFICULTY; i++){
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        _pieces.push(piece);
        xPos += _pieceWidth;
        if(xPos >= _puzzleWidth){
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
    _canvas.onmousedown = shufflePuzzle;
}

//Disordered Puzzle at the begining
function shufflePuzzle(){
    _pieces = shuffleArray(_pieces);
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i =0; i < _pieces.length; i++){
        piece = _pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
        _stage.strokeStyle = '#912f56';
        _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
        xPos += _pieceWidth;
        if(xPos >= _puzzleWidth){
            xPos = 0;
            yPos += _pieceHeight;
        }
        _canvas.onmousedown = onPuzzleClick;
    }
}

//Shuffling the array
function shuffleArray(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i),  x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

//When a pieace is selected
function onPuzzleClick(e){
    //current mouse position in canvas
    if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX;
        _mouse.y = e.layerY;
    }
    else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX;
        _mouse.y = e.offsetY;
    }
    _currentPiece = checkPieceClicked();
    if(_currentPiece != null ){
        //clear the selected piece slot
        _stage.clearRect(_currentPiece.xPos, _currentPiece.yPos, _pieceWidth, _pieceHeight);
        _stage.save();
        //draw the piace with 0.9 opacity with the center of mouse position
        _stage.globalAlpha = 0.9;
        _stage.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2) , _pieceWidth, _pieceHeight);
        _stage.restore();
        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDroped;
    }
}

//return the selected piece
function checkPieceClicked(){
    var i;
    var piece;
    for(i = 0; i < _pieces.length; i ++){
        piece = _pieces[i];
        if(_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)){
          // This Piece is not selected  
        }else{
            return piece;
        }
    }
    return null;
}

//When dragging the piece
function updatePuzzle(e){
    _currentDropPiece = null;
    //Current Mouse position in canvas
    if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX;
        _mouse.y = e.layerY;
    }
    else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX;
        _mouse.y = e.offsetY;
    }

    //clear the canvas and draw the pieces again
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var i;
    var piece;
    for(i =0; i < _pieces.length; i++){
        piece = _pieces[i];
        if(piece == _currentPiece){
            //to keep the current spot empty
            continue;
        }
        _stage.drawImage(_img,piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);

        if(_currentDropPiece == null){
            if(_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)){
                // Mouse is not over this piece
            }else{
                _currentDropPiece = piece;
                _stage.save();
                _stage.globalAlpha = 0.5;
                _stage.fillStyle = PUZZLE_HOVER_TINT;
                _stage.fillRect(_currentDropPiece.xPos, _currentDropPiece.yPos, _pieceWidth, _pieceHeight);
                _stage.restore();

            }
        }
    }
    _stage.save();
    _stage.globalAlpha = 0.6;
    _stage.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2) , _pieceWidth, _pieceHeight);
    _stage.restore();
    _stage.strokeRect(_mouse.x - (_pieceWidth / 2 ), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
}

//When drop the piece
function pieceDroped(){
    document.onmousemove = null;
    document.onmouseup = null;
    if(_currentDropPiece != null){
        var tmp = {xPos: _currentPiece.xPos, yPos: _currentPiece.yPos};
        _currentPiece.xPos =  _currentDropPiece.xPos;
        _currentPiece.yPos = _currentDropPiece.yPos;
        _currentDropPiece.xPos = tmp.xPos;
        _currentDropPiece.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
}

//Check if Puzzle is done!
function resetPuzzleAndCheckWin(){
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0; i < _pieces.length; i ++){
        piece = _pieces[i];
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        if(piece.xPos != piece.sx || piece.yPos != piece.sy){
            gameWin = false;
        }
    }
    if(gameWin){
        setTimeout(gameOver, 500);
    }
}

//Game Over
function gameOver(){
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    _stage.clearRect(0,0, _puzzleWidth, _puzzleHeight);
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
    const fireWork =document.querySelector('.firework');
    
    fireWork.style.display = 'block';
    setTimeout(function(){
        fireWork.style.background = '#000';
        const btn =document.querySelector('.firework button');
        btn.style.display = 'block';
    }, 3000)
}

