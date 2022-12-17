//VARS
//CORE VARS & HTML ELEMENTS
var x = 630 / 8
var y = 630 / 8
var playing = false
const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.width = 630
canvas.height = 630
const gameInfo = document.getElementById("gameInfo")
gameInfo.style.visibility = 'collapse'
gameInfo.style.height = 0
const infoMoves = document.querySelector('.infoMoves')
const startButton = document.getElementById("startButton")
const loadInput = document.querySelector("#loadInput")

//INPUT
var btUp = false
var btDown = false
var btRight = false
var btLeft = false
var btShift = false
var btSpace = false
var btDelay = 0;

//TILES & LEVEL
var tileWidth = 630 / 4;
var tileHeight = 630 / 4;
var fGX;
var fGY;
var gridX;
var gridY;
var tilesArray = []
var startPos = {row:1, column:1}
var noThrough = ["3"]
var noMonkeyThrough = ["2","3","4","5","6","8"]
var loadArray = []
var levelArray
var levelSize
var levelElements = []
var levelModifiers = []
var settingsIndex
var modifierIndex
var levelSettings = {
    theme: 0,
    stayMove: 1
}
var monkeyArray = []
var oldCode = "Default;Casper;8;4;1;1;1;1;1;1;7;3;3;3;2;3;3;3;3;7;1;1;1;1;1;1;1;3;3;3;3;3;2;3;3;1;1;1;1;1;1;1;7;3;2;3;3;3;3;6;6;7;1;1;1;1;3;3;3;3;2;2;2;2;1;8;5;0;0;0;0;0;0;0;M1=3;M2=0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;M1=3;0;0;0;0;0;0;M3=0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1;1"
var levelName = "Default";
var levelCreator = "Casper"
var tileDrawMods;

//PLAYER VARS
var playerOpacity = 0;
var damageFlicker = 0;
var playerPosition
var playerRotation

//ANIMATION STUFF
var movAni = 0;
var movAniType;

//STATISTICS STUFF
var moves = 0;
var movAniLength = 20;
var timeSeconds
var timeMinutes
var startTime
var endTime
var timeMilliseconds
var deaths
var deathsDisp
var movesDisp
var monkeyThrows = 0
var monkeyThrowsDisp

//OTHER VARS
var winScreen = false;
var winStrokeSpeed = 1
var winStrokeBackSpeed = 1
var winTextOpacity
var monkeyThrowAniDistX
var monkeyThrowAniDistY
var monkeyCross = false
var bgX = 0
var bgY = 0

//LOAD SPRITES (spr)
//Player
var sprPlayer = new Image()
sprPlayer.src = 'assets/player.png'
//Tiles
var sprWater = new Image()
sprWater.src = 'assets/tiles/water.jpg'
var sprWall = new Image()
sprWall.src = 'assets/tiles/brick.png'
var sprStart = new Image()
sprStart.src = 'assets/tiles/flag.png'
var sprEnd = new Image()
sprEnd.src = 'assets/tiles/end.png'
var sprSpike = new Image()
sprSpike.src = 'assets/tiles/spike.png'
var sprMonkey = new Image()
sprMonkey.src = 'assets/tiles/monkey.png'
var sprButton = new Image()
sprButton.src = 'assets/tiles/button.png'
var sprWallOff = new Image()
sprWallOff.src = 'assets/tiles/brick_off.png'
var sprSpikeOff = new Image()
sprSpikeOff.src = 'assets/tiles/spike_off.png'
//Background themes
var bgGrass = new Image()
bgGrass.src = 'assets/backgrounds/grass.jpg'
var bgSnow = new Image()
bgSnow.src = 'assets/backgrounds/snow.webp'
var bgSand = new Image()
bgSand.src = 'assets/backgrounds/sand.jpg'

//LOAD AUDIO (aud)
var audStart = new Audio('assets/sfx/start.wav')
var audWin = new Audio('assets/sfx/win.wav')
var audMove = new Audio('assets/sfx/move.wav')
var audDeath = new Audio('assets/sfx/death.wav')
var audMonkey = new Audio('assets/sfx/monkeyThrow.wav')
var audSkip = new Audio('assets/sfx/moveSkip.wav')
var audButtonPress = new Audio('assets/sfx/buttonpress.wav')
var audButtonRelease = new Audio('assets/sfx/buttonrelease.wav')

class Background {
    constructor(theme) {
        this.theme = theme
    }
    draw() {
        ctx.imageSmoothingEnabled = false;
        bgX = 0
        bgY = 0
        for (var r = 1; r <= grid.size; r++) {
            for (var c = 1; c <= grid.size; c++) {
                if (this.theme == 1) {
                    ctx.drawImage(bgGrass, bgX, bgY, tileWidth, tileHeight)
                }
                if (this.theme == 2) {
                    ctx.drawImage(bgSnow, bgX, bgY, tileWidth, tileHeight)
                }
                if (this.theme == 3) {
                    ctx.drawImage(bgSand, bgX, bgY, tileWidth, tileHeight)
                }
                bgX += tileWidth
            }
            bgX = 0;
            bgY += tileHeight;
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    draw() {
        ctx.globalAlpha = playerOpacity / 100
        ctx.save();
        ctx.translate((x - tileWidth / 2)+tileWidth/2, (y - tileHeight / 2)+tileHeight/2);
        ctx.rotate(playerRotation*90*Math.PI/180.0);
        ctx.translate(-(x - tileWidth / 2)-tileWidth/2, -(y - tileHeight / 2)-tileHeight/2);
        ctx.drawImage(sprPlayer, x - tileWidth / 2, y - tileHeight / 2, tileWidth, tileHeight);
        ctx.restore();
        ctx.globalAlpha = 1;
        };
    }

class Grid {
    constructor(size) {
        this.size = size;
    }
    draw() {
        fGX = 0
        fGY = 0
        ctx.lineWidth = 3
        ctx.strokeStyle = 'black';
        for (var r = 1; r <= this.size; r++) {
        for (var c = 1; c <= this.size; c++) {
            ctx.strokeRect(fGX, fGY, tileWidth, tileHeight);
            fGX += tileWidth
        }
        fGX = 0;
        fGY += tileHeight;
    }
    }
}

class Tiles {
    constructor(tileArray) {
        this.tileArray = tileArray;
    }
    draw() {
        fGX = 0
        fGY = 0
        for (var r = 1; r <= grid.size; r++) {
            for (var c = 1; c <= grid.size; c++) {
                tileDrawMods = {}
                tileDrawMods = levelModifiers[(r-1)*grid.size+c-1]
                tileDraw(this.tileArray[(r-1)*grid.size+c-1])
                ctx.strokeRect(fGX, fGY, tileWidth, tileHeight);
                if (this.tileArray[(r-1)*grid.size+c-1] == "4") {
                    startPos.row = r
                    startPos.column = c
                }
                fGX += tileWidth
            }
            fGX = 0;
            fGY += tileHeight;
        }
    }
}

class WinAnimation {
    constructor(x,y,color) {
        this.x = x
        this.y = y
        this.color = color
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,630,80)
    }
}

class winScreenText {
    constructor() {}
    draw() {
        ctx.font = "48px roboto";
        ctx.globalAlpha = winTextOpacity;
        ctx.fillStyle = 'black'
        ctx.fillText("Level cleared!", 170, 50);
        ctx.fillStyle = 'black'
        ctx.fillText(levelName+" by "+levelCreator, 0, 135);
        ctx.fillRect(0,150,630,10)
        if (movesDisp == 1) ctx.fillText("🚩"+movesDisp+" move", 0, 220); else ctx.fillText("🚩"+movesDisp+" moves", 0, 220);
        ctx.fillText("🕒"+timeMinutes+":"+timeSeconds+"."+timeMilliseconds, 0, 295)
        if (deathsDisp == 1) ctx.fillText("💀"+deathsDisp+" death", 0, 370); else ctx.fillText("💀"+deathsDisp+" deaths", 0, 370);
        if (monkeyThrowsDisp == 1) ctx.fillText("🐵"+monkeyThrowsDisp+" monkey throw", 0, 448); else ctx.fillText("🐵"+monkeyThrowsDisp+" monkey throws", 0, 448);
        ctx.globalAlpha = 1;
    }
}

//TILE DRAW FUNCTIONS
function tileDraw(tile) {
    ctx.imageSmoothingEnabled = false;
    if (tile == "2") {
        ctx.drawImage(sprWater, fGX, fGY, tileWidth, tileHeight);
    }
    if (tile == "3") {
        if (tileDrawMods.wallVisibility !== 0) ctx.drawImage(sprWall, fGX, fGY, tileWidth, tileHeight); else ctx.drawImage(sprWallOff, fGX, fGY, tileWidth, tileHeight);
    }
    if (tile == "4") {
        ctx.drawImage(sprStart, fGX, fGY, tileWidth, tileHeight);
    }
    if (tile == "5") {
        ctx.drawImage(sprEnd, fGX, fGY, tileWidth, tileHeight);
    }
    if (tile == "6") {
        if (tileDrawMods.spikeActive == 1) ctx.drawImage(sprSpike, fGX, fGY, tileWidth, tileHeight); else ctx.drawImage(sprSpikeOff, fGX, fGY, tileWidth, tileHeight);
    }
    if (tile == "7") {
        let tileMonkeyFindY = (fGY + tileHeight) / tileHeight - 1
        let tileMonkeyFindX = (fGX + tileWidth) / tileWidth - 1
        let tileMonkeyFind = monkeyArray.find(item => item.x === tileMonkeyFindX && item.y === tileMonkeyFindY)
        let tileMonkeyFindRot = tileMonkeyFind.direction - 1
        ctx.save();
        ctx.translate(fGX+tileWidth/2, fGY+tileHeight/2);
        ctx.rotate(tileMonkeyFindRot*90*Math.PI/180.0);
        ctx.translate(-fGX-tileWidth/2, -fGY-tileHeight/2);
        ctx.drawImage(sprMonkey, fGX, fGY, tileWidth, tileHeight);
        ctx.restore();
    }
    if (tile == "8") {
        ctx.drawImage(sprButton, fGX, fGY, tileWidth, tileHeight);
    }
}

//RENDER GAME
const player = new Player(x, y, 10, 'red')
const grid = new Grid(4)
const tiles = new Tiles(tilesArray)
const background = new Background(1)
//WIN strokes
const winStrok1 = new WinAnimation(-630,0,'yellow')
const winStrok5 = new WinAnimation(630,78.75,'#FFD700')
const winStroke3 = new WinAnimation(-630,157.5,'yellow')
const winStroke4 = new WinAnimation(630,236.25,'#FFD700')
const winStroke5 = new WinAnimation(-630,315,'yellow')
const winStroke6 = new WinAnimation(630,393.75,'#FFD700')
const winStroke7 = new WinAnimation(-630,472.5,'yellow')
const winStroke8 = new WinAnimation(630,551.25,'#FFD700')
const winScreenDraw = new winScreenText()
gridY = (y + tileHeight / 2) / tileHeight - 1
gridX = (x + tileWidth / 2) / tileWidth - 1
update()
requestAnimationFrame(update);
function update() {
    ctx.globalAlpha = 1
    //A movement animation takes movAniLength frames! (btDelay)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    //OTHER stuff to draw
    background.draw()
    tiles.draw()
    grid.draw()
    //PLAYER movement
    if (playing) {
        checkWallVisibleOverride()
        if (btLeft && btDelay == 0 && movAni == 0 && x - tileWidth > 0 && !noThrough.includes(tilesArray[gridToIndex(gridX - 1, gridY)])) {
            moves += 1;
            playerRotation = 3
            movAniLength = 20;
            movAni = 20;
            movAniType = "left"
            let findMonkey = monkeyArray.find(item => item.x === gridX - 1 && item.y === gridY)
            console.log(findMonkey)
            //Check if there is a monkey currently on the tile I'm moving to, I will cross it and it will throw me mid-move animation
            if ((tilesArray[gridToIndex(gridX - 1, gridY)]) == "7" && findMonkey.direction == 1) monkeyCross = true
        } 
        if (btRight && btDelay == 0 && movAni == 0 && x + tileWidth < 630 && !noThrough.includes(tilesArray[gridToIndex(gridX + 1, gridY)])) {
            moves += 1;
            playerRotation = 1
            movAniLength = 20;
            movAni = 20;
            movAniType = "right"
            let findMonkey = monkeyArray.find(item => item.x === gridX + 1 && item.y === gridY)
            //Check if there is a monkey currently on the tile I'm moving to, I will cross it and it will throw me mid-move animation
            if ((tilesArray[gridToIndex(gridX + 1, gridY)]) == "7" && findMonkey.direction == 3) monkeyCross = true
        }
        if (btUp && btDelay == 0 && movAni == 0 && y - tileHeight > 0 && !noThrough.includes(tilesArray[gridToIndex(gridX, gridY - 1)])) {
            moves += 1;
            playerRotation = 0
            movAniLength = 20;
            movAni = 20;
            movAniType = "up"
            let findMonkey = monkeyArray.find(item => item.x === gridX && item.y === gridY - 1)
            //Check if there is a monkey currently on the tile I'm moving to, I will cross it and it will throw me mid-move animation
            if ((tilesArray[gridToIndex(gridX, gridY - 1)]) == "7" && findMonkey.direction == 2) monkeyCross = true
        }
        if (btDown && btDelay == 0 && movAni == 0 && y + tileHeight < 630 && !noThrough.includes(tilesArray[gridToIndex(gridX, gridY + 1)])) {
            moves += 1;
            playerRotation = 2
            movAniLength = 20;
            movAni = 20;
            movAniType = "down"
            let findMonkey = monkeyArray.find(item => item.x === gridX && item.y === gridY + 1)
            //Check if there is a monkey currently on the tile I'm moving to, I will cross it and it will throw me mid-move animation
            if ((tilesArray[gridToIndex(gridX, gridY + 1)]) == "7" && findMonkey.direction == 0) monkeyCross = true
        }
        //IF COLLISION OVERRIDEN FOR WALL MODIFIER, RESTORE ARRAY
        noThrough = ["3"]
        //ANIMATION and stuff
        if (movAni > 0) movAnimation(movAniType);
        if (btDelay > 0) btDelay -= 1;
        player.x = x
        player.y = y
        ctx.globalAlpha = 1
        infoMoves.innerHTML = "➡️ Moves: "+moves
        //CHECK FOR SPECIFIC TILES AND DO THINGS
        if (tilesArray[gridToIndex(gridX, gridY)] == "5") endReached();
        if (tilesArray[gridToIndex(gridX, gridY)] == "6" && levelModifiers[gridToIndex(gridX, gridY)].spikeActive == 1) killPlayer();
        if (tilesArray[gridToIndex(gridX, gridY)] == "7" && movAni == 0) monkeyThrowPlayer();
    }
    player.draw();
    if (winScreen) winStrokesUpdate()
    if (!winScreen) winStrokesUpdateBack()
    winStrok1.draw()
    winStrok5.draw()
    winStroke3.draw()
    winStroke4.draw()
    winStroke5.draw()
    winStroke6.draw()
    winStroke7.draw()
    winStroke8.draw()
    winScreenDraw.draw()
    //OPACITY of player for effect
    if (playing && playerOpacity < 100) playerOpacity += 1;
    if (!playing && playerOpacity > 0) playerOpacity -= 1;
    //DAMAGE FLICKER PLAYER
    if (damageFlicker > 0) {
        if (Math.round(damageFlicker / 10) / 2 == Math.round(Math.round(damageFlicker / 10) / 2)) {
            playerOpacity = 100;
        } else {
            playerOpacity = 0;
        }
        console.log(damageFlicker)
        damageFlicker -= 0.25;
    }
    requestAnimationFrame(update);
}

//MOVEMENT DETECTION
document.onkeydown = function (e) {
    if (loadInput !== document.activeElement) {
    switch (e.keyCode) {
    case 37:
        if (!btRight && !btDown && !btUp) btLeft = true;
        break;
    case 38:
        if (!btDown && !btLeft && !btRight) btUp = true;
        break;
    case 39:
        if (!btLeft && !btDown && !btUp) btRight = true;
        break;
    case 40:
        if (!btUp && !btLeft && !btRight) btDown = true;
        break;
    case 32:
        if (!btSpace) toggleLevel();
        btSpace = true;
        break;
    case 16:
        if (!btShift && levelSettings.stayMove && !btRight && !btLeft && !btUp && !btDown && playing) noMoveMove()
        btShift = true
        break;
    }
}
}
document.onkeyup = function (e) {
    switch (e.keyCode) {
    case 37:
        btLeft = false;
        break;
    case 38:
        btUp = false;
        break;
    case 39:
        btRight = false;
        break;
    case 40:
        btDown = false;
        break;
    case 32:
        btSpace = false;
        break;
    case 16:
        btShift = false;
        break;
    }
    btDelay = 10;
}

//MISCELLANEOUS FUNCTIONS
function formGrid(size) {
    tileWidth = canvas.width / size
    tileHeight = canvas.height / size
    grid.size = size;
    // stopLevel()
}

function startLevel() {
    playing = true;
    //Go to start position
    x = startPos.column*tileWidth - tileWidth / 2
    y = startPos.row*tileHeight - tileHeight / 2
    gridY = (y + tileHeight / 2) / tileHeight - 1
    gridX = (x + tileWidth / 2) / tileWidth - 1
    moves = 0;
    gameInfo.classList.remove('error')
    gameInfo.style.visibility = 'visible';
    gameInfo.style.height = 'initial';
    startButton.innerHTML = "🛑"
    startButton.title = "End the level"
    audStart.play()
    winScreen = false;
    startTime = new Date()
    deaths = 0;
    monkeyThrows = 0;
    winStrokeSpeed = 0
    winStrokeBackSpeed = 0
    checkStartEnd()
}

function stopLevel() {
    gameInfo.style.visibility = 'collapse';
    gameInfo.style.height = 0;
    playing = false;
    startButton.innerHTML = "▶️"
    startButton.title = "Start the level"
    //reset level for changes
    loadLevel(oldCode)
}

function formLevel(array) {
    tilesArray = array;
    tiles.tileArray = tilesArray;
    background.theme = levelSettings.theme;
    //monkeys
    monkeyArray = []
    for (let m = 0; m < tilesArray.length; m++) {
        if (tilesArray[m] == '7') {
            //create a monkeyArray element for the lovely monke
            monkeyArray.push({
                x:m - Math.floor(m/levelSize)*grid.size,
                y:Math.floor(m/grid.size),
                //0 = up, 1 = right, and so on...
                direction:levelModifiers[m].monkeyStartDir
            })
        }
    }
}

function toggleLevel() {
    if (playing) {stopLevel()} else {startLevel()};
}

function gridToIndex(gX,gY) {
    return gY*grid.size+gX;
}

function endReached() {
    stopLevel()
    gameInfo.classList.remove('error')
    gameInfo.style.visibility = 'visible';
    gameInfo.style.height = 'initial';
    if (moves == 1) {infoMoves.innerHTML = "🚩Level finished in "+moves+" move!"} else {infoMoves.innerHTML = "🚩Level finished in "+moves+" moves!"}
    audWin.play()
    winStrokeSpeed = 0
    winScreen = true;
    endTime = new Date()
    timeMinutes = Math.floor(Math.round((endTime - startTime) / 1000) / 60)
    timeSeconds = Math.floor((endTime - startTime) / 1000) - 60 * timeMinutes
    timeMilliseconds = Math.round((endTime - startTime)) - 60 * 1000 * timeMinutes - 1000 * timeSeconds
    console.log("Amount of milliseconds passed: "+ (endTime - startTime))
    if (timeMinutes < 10) timeMinutes = "0"+timeMinutes
    if (timeSeconds < 10) timeSeconds = "0"+timeSeconds
    if (timeMilliseconds < 100) timeMilliseconds = "0"+timeMilliseconds
    if (timeMilliseconds < 10) timeMilliseconds = "0"+timeMilliseconds
    deathsDisp = deaths
    movesDisp = moves
    monkeyThrowsDisp = monkeyThrows
}

function movAnimation(type) {
    if (movAni == movAniLength && type !== "monkey") {
        audMove.play()
        updateMonkeys()
        if (tilesArray[gridToIndex(gridX, gridY)] == "8") audButtonRelease.play();
    }
    if (movAni == movAniLength && type == "monkey") {
        monkeyThrowAniDistX = (startPos.column*tileWidth - tileWidth / 2 - x) / movAniLength
        monkeyThrowAniDistY = (startPos.row*tileHeight - tileHeight / 2 - y) / movAniLength
    }
    if (type == "left") {
        x -= tileWidth / movAniLength
    }
    if (type == "right") {
        x += tileWidth / movAniLength
    }
    if (type == "up") {
        y -= tileHeight / movAniLength
    }
    if (type == "down") {
        y += tileHeight / movAniLength
    }
    if (type == "monkey") {
        x += monkeyThrowAniDistX
        y += monkeyThrowAniDistY
    }
    movAni -= 1;
    if (movAni == Math.round(movAniLength / 2) && monkeyCross) monkeyThrowPlayer();
    if (movAni == 0) {
        btDelay = 40;
        gridY = (y + tileHeight / 2) / tileHeight - 1
        gridX = (x + tileWidth / 2) / tileWidth - 1
        if (tilesArray[gridToIndex(gridX, gridY)] == "8") buttonPress();
        monkeyCross = false
    }
}

function loadLevel(code) {
    console.log(code)
    oldCode = code
    document.getElementById("loadInput").value = ""
    console.log("Level code:"+code)
    console.log("Splitting parts...")
    //Split it in parts
    let arrayIndex = 0
    loadArray = [];
    loadArray.length = 1000;
    loadArray[arrayIndex] = "";
    for (let i = 0; i < code.length; i++) {
        console.log("Now checking letter "+i+", which has a string of "+code[i])
        if (code[i] == ";") {
            console.log("Result of index " +arrayIndex+": "+loadArray[arrayIndex]+" Next!")
            arrayIndex += 1
            loadArray[arrayIndex] = "";
        } else {
            loadArray[arrayIndex] = loadArray[arrayIndex]+code[i];
        }
    }
    //Interpret the split code
    //Level name & creator
    levelName = loadArray[0]
    levelCreator = loadArray[1]
    //Level size
    levelSize = parseInt(loadArray[2])
    //Level elements
    levelElements = []
    levelElements.length = levelSize * levelSize
    for (let i = 1; i <= levelSize * levelSize; i++) {
        levelElements[i - 1] = loadArray[i + 2]
        if (i == levelSize * levelSize) modifierIndex = i + 3;
    }
    //Level tile modifiers
    levelModifiers = []
    levelModifiers.length = levelSize * levelSize
    for (let m = modifierIndex; m <= modifierIndex + levelSize * levelSize - 1; m++) {
        levelModifiers[m - modifierIndex] = {
            monkeyStartDir:1,
            wallVisibility:1,
            spikeActive:1,
            sendSignal:{signalChannel:0,signalTrigger:0},
            receiveSignal:{signalChannel:0,signalAction:0}
        }
        if (loadArray[m] == "0") {
            //SET ALL MODIFIERS TO DEFAULT
            console.log("No modifiers found!")
        } else {
            if (loadArray[m].includes(",")) {
                //SPLIT THE DIFFERENT MODIFIERS AND APPLY THEM
                console.log("Multiple modifiers found! Splitting...")
                let toSplit = loadArray[m]
                let splitParts = []
                let splitIndex = 0
                for (i = 0; i < toSplit.length; i++) {
                    if (toSplit[i] == ",") {
                        splitIndex += 1;
                    } else {
                        if (!splitParts[splitIndex]) splitParts.push(toSplit[i]); else splitParts[splitIndex] = splitParts[splitIndex]+toSplit[i]
                    }
                }
                console.log(splitParts)
                //DONE SPLITTING, NOW INTERPRET ELEMENTS
                splitParts.forEach(element => modifierInterpret(element,m))
            } else {
                console.log("Found one modifier, adding to array...")
                modifierInterpret(loadArray[m],m)
            }
        }
        if (m == modifierIndex + levelSize * levelSize - 1) settingsIndex = m + 1;
    }
    //Level settings
    levelSettings.theme = loadArray[settingsIndex]
    levelSettings.stayMove = loadArray[settingsIndex + 1]
    //Load the level
    //Generate grid
    formGrid(levelSize)
    formLevel(levelElements)
}

function modifierInterpret(modString,mm) {
    console.log("Now interpreting: "+modString)
    if (modString.includes("M1")) levelModifiers[mm - modifierIndex].monkeyStartDir = parseInt(modString.slice(-1))
    if (modString.includes("M2")) levelModifiers[mm - modifierIndex].wallVisibility = parseInt(modString.slice(-1))
    if (modString.includes("M3")) levelModifiers[mm - modifierIndex].spikeActive = parseInt(modString.slice(-1))
    if (modString.includes("S1")) {
        //GET THE INDEXES OF THE START AND END OF BOTH PARAMETERS
        let param1Start = modString.indexOf("=") + 1
        let param1Length = (modString.indexOf(":") - 1) - param1Start + 1
        let param2Start = modString.indexOf(":") + 1
        //GET THE PARAMETER VALUES AND APPLY THEM TO THE OBJECT
        levelModifiers[mm - modifierIndex].sendSignal.signalChannel = parseInt(modString.substr(param1Start, param1Length))
        levelModifiers[mm - modifierIndex].sendSignal.signalTrigger = parseInt(modString.substr(param2Start))
    }
    if (modString.includes("S2")) {
        //GET THE INDEXES OF THE START AND END OF BOTH PARAMETERS
        let param1Start = modString.indexOf("=") + 1
        let param1Length = (modString.indexOf(":") - 1) - param1Start + 1
        let param2Start = modString.indexOf(":") + 1
        //GET THE PARAMETER VALUES AND APPLY THEM TO THE OBJECT
        levelModifiers[mm - modifierIndex].receiveSignal.signalChannel = parseInt(modString.substr(param1Start, param1Length))
        levelModifiers[mm - modifierIndex].receiveSignal.signalAction = parseInt(modString.substr(param2Start))
    }
}

    //Disable default scroll keys
    window.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1 && loadInput !== document.activeElement) {
            e.preventDefault();
        }
        }, false);

function killPlayer() {
    x = startPos.column*tileWidth - tileWidth / 2
    y = startPos.row*tileHeight - tileHeight / 2
    gridY = (y + tileHeight / 2) / tileHeight - 1
    gridX = (x + tileWidth / 2) / tileWidth - 1
    damageFlicker = 80;
    audDeath.play()
    deaths += 1
}

function updateMonkeys() {
    monkeyArray.forEach(function updateMonkey(e,i) {
        //UPDATE DIRECTION IF NECESSARY
        if (monkeyArray[i].direction == 0) {
            if (monkeyArray[i].y == 0 || noMonkeyThrough.includes(tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y - 1)])) {
                monkeyArray[i].direction = 2
            }
        }
        if (monkeyArray[i].direction == 1) {
            if (monkeyArray[i].x == grid.size - 1 || noMonkeyThrough.includes(tilesArray[gridToIndex(monkeyArray[i].x + 1,monkeyArray[i].y)])) {
                monkeyArray[i].direction = 3
            }
        }
        if (monkeyArray[i].direction == 2) {
            if (monkeyArray[i].y == grid.size - 1 || noMonkeyThrough.includes(tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y + 1)])) {
                monkeyArray[i].direction = 0
            }
        }
        if (monkeyArray[i].direction == 3) {
            if (monkeyArray[i].x == 0 || noMonkeyThrough.includes(tilesArray[gridToIndex(monkeyArray[i].x - 1,monkeyArray[i].y)])) {
                monkeyArray[i].direction = 1
            }
        }
        //MOVE THE MONKEY
        if (monkeyArray[i].direction == 0) {
            //UPDATE THE GRID
            tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y)] = "1"
            tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y - 1)] = "7"
            //UPDATE THE MONKEY
            monkeyArray[i].y -= 1
        }
        if (monkeyArray[i].direction == 1) {
            //UPDATE THE GRID
            tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y)] = "1"
            tilesArray[gridToIndex(monkeyArray[i].x + 1,monkeyArray[i].y)] = "7"
            //UPDATE THE MONKEY
            monkeyArray[i].x += 1
        }
        if (monkeyArray[i].direction == 2) {
            //UPDATE THE GRID
            tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y)] = "1"
            tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y + 1)] = "7"
            //UPDATE THE MONKEY
            monkeyArray[i].y += 1
        }
        if (monkeyArray[i].direction == 3) {
            //UPDATE THE GRID
            tilesArray[gridToIndex(monkeyArray[i].x,monkeyArray[i].y)] = "1"
            tilesArray[gridToIndex(monkeyArray[i].x - 1,monkeyArray[i].y)] = "7"
            //UPDATE THE MONKEY
            monkeyArray[i].x -= 1
        }
        //UPDATE THE GRID ELEMENT WITH THE NEW TILESARRAY
        tiles.tileArray = tilesArray
    })
}

function winStrokesUpdate() {
    winStrokeSpeed += 0.05
    if (winStrok1.x < 0) winStrok1.x += winStrokeSpeed;
    if (winStrok1.x > 0) winStrok1.x = 0;
    if (winStrok5.x > 0) winStrok5.x -= winStrokeSpeed;
    if (winStrok5.x < 0) winStrok5.x = 0;
    if (winStroke3.x < 0) winStroke3.x += winStrokeSpeed;
    if (winStroke3.x > 0) winStroke3.x = 0;
    if (winStroke4.x > 0) winStroke4.x -= winStrokeSpeed;
    if (winStroke4.x < 0) winStroke4.x = 0;
    if (winStroke5.x < 0) winStroke5.x += winStrokeSpeed;
    if (winStroke5.x > 0) winStroke5.x = 0;
    if (winStroke6.x > 0) winStroke6.x -= winStrokeSpeed;
    if (winStroke6.x < 0) winStroke6.x = 0;
    if (winStroke7.x < 0) winStroke7.x += winStrokeSpeed;
    if (winStroke7.x > 0) winStroke7.x = 0;
    if (winStroke8.x > 0) winStroke8.x -= winStrokeSpeed;
    if (winStroke8.x < 0) winStroke8.x = 0;
    winTextOpacity = (winStrok1.x + 630) / 630
    console.log(winTextOpacity)
}

function winStrokesUpdateBack() {
    winStrokeBackSpeed += 0.05
    if (winStrok1.x > -630) winStrok1.x -= winStrokeBackSpeed
    if (winStrok1.x < -630) winStrok1.x = -630
    if (winStrok5.x < 630) winStrok5.x += winStrokeBackSpeed
    if (winStrok5.x > 630) winStrok5.x = 630
    if (winStroke3.x > -630) winStroke3.x -= winStrokeBackSpeed
    if (winStroke3.x < -630) winStroke3.x = -630
    if (winStroke4.x < 630) winStroke4.x += winStrokeBackSpeed
    if (winStroke4.x > 630) winStroke4.x = 630
    if (winStroke5.x > -630) winStroke5.x -= winStrokeBackSpeed
    if (winStroke5.x < -630) winStroke5.x = -630
    if (winStroke6.x < 630) winStroke6.x += winStrokeBackSpeed
    if (winStroke6.x > 630) winStroke6.x = 630
    if (winStroke7.x > -630) winStroke7.x -= winStrokeBackSpeed
    if (winStroke7.x < -630) winStroke7.x = -630
    if (winStroke8.x < 630) winStroke8.x += winStrokeBackSpeed
    if (winStroke8.x > 630) winStroke8.x = 630
    winTextOpacity = (winStrok1.x + 630) / 630
}

function monkeyThrowPlayer() {
    movAni = 40
    movAniLength = 40
    movAniType = "monkey"
    monkeyCross = false;
    monkeyThrows += 1
    audMonkey.play()
}

function noMoveMove() {
    moves += 1
    audSkip.play()
    updateMonkeys()
}

function buttonPress() {
    audButtonPress.play()
}

function checkStartEnd() {
    //GENERAL ERROR CODE
    if (!levelElements.includes("4") || !levelElements.includes("5") || levelElements.filter(x => x === "4").length > 1) {
        stopLevel()
        gameInfo.style.visibility = 'visible';
        gameInfo.style.height = 'initial';
        infoMoves.innerHTML = "Encountered an error while starting the level!"
        infoMoves.classList.add('error')
    }
    if (!levelElements.includes("4")) infoMoves.innerHTML = "Error: The level has no starting position!"
    if (!levelElements.includes("5")) infoMoves.innerHTML = "Error: The level has no end position!"
    if (levelElements.filter(x => x === "4").length > 1) infoMoves.innerHTML = "Error: A level can only have one starting position!"
}

function checkWallVisibleOverride() {
    if (btLeft && tilesArray[gridToIndex(gridX - 1, gridY)] == "3" && levelModifiers[gridToIndex(gridX - 1, gridY)].wallVisibility == 0) {
        noThrough = []
    }
    if (btRight && tilesArray[gridToIndex(gridX + 1, gridY)] == "3" && levelModifiers[gridToIndex(gridX + 1, gridY)].wallVisibility == 0) {
        noThrough = []
    }
    if (btUp && tilesArray[gridToIndex(gridX, gridY - 1)] == "3" && levelModifiers[gridToIndex(gridX, gridY - 1)].wallVisibility == 0) {
        noThrough = []
    }
    if (btDown && tilesArray[gridToIndex(gridX, gridY + 1)] == "3" && levelModifiers[gridToIndex(gridX, gridY + 1)].wallVisibility == 0) {
        noThrough = []
    }
}

//DEFAULT LEVEL LOAD, KEEP AT BOTTOM!
loadLevel(oldCode)