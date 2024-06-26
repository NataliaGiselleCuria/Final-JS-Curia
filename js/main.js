


let currentLevel = 6;
let enabledRowNumber = 1;
let currentRow;
const table = document.querySelector('#table');
const pickLevels = document.querySelectorAll('.pickLevel');
let palabraGanadora = [];
let finalized = false;
const canvas = document.getElementById("canvas");
let focusFirstInputRow;

//*------- Storage:

//LocalStorag de estadisticas
let estadisticas = JSON.parse(localStorage.getItem("estadisticas")) || {jugadas:0, victorias:0, word1:0, word2:0, word3:0, word4:0, word5:0, word6:0, perdidas:0};
let estadisticasAux = JSON.parse(localStorage.getItem("estadisticasAux")) || {victorias:0, word1:0, word2:0, word3:0, word4:0, word5:0, word6:0, perdidas:0};   

localStorage.setItem("estadisticas", JSON.stringify(estadisticas));
localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAux));

//LocalStorage de la jugada
let savedPlay = JSON.parse(localStorage.getItem("savedPlay")) || {
    level6:{word1:[], word2:[], word3:[], word4:[], word5:[], word6:[], winningWord:[]},
    level7:{word1:[], word2:[], word3:[], word4:[], word5:[], word6:[], winningWord:[]},
    level8:{word1:[], word2:[], word3:[], word4:[], word5:[], word6:[], winningWord:[]},
    level9:{word1:[], word2:[], word3:[], word4:[], word5:[], word6:[], winningWord:[]}
};
localStorage.setItem("savedPlay", JSON.stringify(savedPlay));

//comprobar si hay partida guardada y rellenar la tabla.
function checkSavedPlay(){
    let savedPlayLS = JSON.parse(localStorage.getItem("savedPlay"));
    const keys = document.querySelectorAll('.key');
    for (let lv in savedPlayLS) {
        if (savedPlayLS.hasOwnProperty(lv) && lv === 'level' + currentLevel) {
           
            for (let word in savedPlayLS[lv]) {
                if (savedPlayLS[lv][word].length > 0) {
                    for (let i = 0; i < table.children.length; i++) {
                        if (word == table.children[i].classList[1]) {
                            for (let j = 0; j < table.children[i].children.length; j++) {
                                table.children[i].children[j].value = savedPlayLS[lv][word][j].value
                                agregarClase(table.children[i].children[j], savedPlayLS[lv][word][j].state + '-cell');

                                keys.forEach(key => {
                                    if (key.innerHTML === savedPlayLS[lv][word][j].value.toUpperCase()) {
                                        agregarClase(key, savedPlayLS[lv][word][j].state + '-key');
                                    }
                                });
                            }
                        }
                    }
                    
                }
            };

            if(savedPlayLS[lv].winningWord.length>0){
                palabraGanadora = savedPlayLS[lv].winningWord
                
            }
        }
    }

    localStorage.setItem("savedPlay", JSON.stringify(savedPlayLS));

    enabledRow();
}

//asignar una palabra ganadora a cada nivel y guardarlo en Local storage.
function setWordsLevels(){
    let levels = 6;

    async function processLevels() {
        if (levels <= 9) {
            await setWord(levels);
            levels++;
            processLevels();
        }
    }
    
    processLevels(); // Iniciar el proceso
}

//vaciar el local storage
function clenLevelStorage(){
    let savedPlayLS = JSON.parse(localStorage.getItem("savedPlay"));

    for (let lv in savedPlayLS){
        if(savedPlayLS.hasOwnProperty(lv) && lv === 'level'+currentLevel){
            for (let word in savedPlayLS[lv]) {
                savedPlayLS[lv][word]=([]);
            };
        }
    }

    localStorage.setItem("savedPlay", JSON.stringify(savedPlayLS));
}


//*------- tabla:

pickLevels.forEach(pick => {
    pick.addEventListener('click', function(event){
        setLevel(event.currentTarget);
    })
});


// definir nivel del juego (cantidad de letras)
function setLevel(pickLevel){

    let levelText = document.querySelectorAll('#levelText');
    let levels = document.querySelectorAll('#level');

    if (pickLevel.id === "levelDown" && currentLevel > 6) {
        levelText[0].innerHTML = (--currentLevel) + " LETRAS";

    } else if (pickLevel.id === "levelUp" && currentLevel < 9) {
        levelText[0].innerHTML = (++currentLevel) + " LETRAS";
    }

    const levelClasses = ['easy', 'normal', 'medium', 'hard'];

    levels.forEach((level, index) => {
        level.removeAttribute('class');
        if (index < currentLevel - 5) {
            level.setAttribute('class', levelClasses[index]);
        }
    });

    canvas.style.display="none";
    cleanTable();
    cleanKeys();
    setTable(currentLevel);
    checkSavedPlay();

}

// crear la tabla a partir del nivel del juego.
function setTable(currentLevel){
    let aux = 0;

    do{
        let aux2 = 1;

        aux++;

        let row = document.createElement('span');
        row.className= 'row word' + aux;

        do{
            
            let cell = document.createElement('input');
            cell.classList.add('cell');
            cell.setAttribute('id','letter'+aux2) ;
            cell.setAttribute('autocomplete','off');
            row.appendChild(cell);
            aux2++

            if(window.innerWidth<500){
                cell.setAttribute('readonly', 'readonly');
            }
            

        }while(aux2 <= currentLevel);
       
        table.appendChild(row);

    }while(aux<=5);

    setTimeout(function(){
        eventCells();
        setEventKeys();
        enabledRow();
    }, 0);   
}

// establecer la fila disponible para ingresar la palabra.
function enabledRow() {

    const inputs = table.querySelectorAll('input');

    inputs.forEach(input => {
         input.setAttribute('disabled', '');   
    });

    const rowsTable = table.querySelectorAll('.row');
    let shouldEnable;
    

    for (let i = 0; i < rowsTable.length; i++) {
        let complete = true; // Reset complete flag for each row
        const inputsRow = rowsTable[i].querySelectorAll('input');
        inputsRow.forEach(input => {
            if (input.value.trim() === '') {
                complete = false;
            }
        });

        if (!complete) {
            shouldEnable = rowsTable[i]; 
            currentRow = rowsTable[i]; 
            const inputEnabled = shouldEnable.querySelectorAll('input');
            inputEnabled.forEach(input => {
                
                input.removeAttribute('disabled');
            });
           
            break; 
        }
    }

    firstFocus(shouldEnable);

    return shouldEnable;
   
}

// pone en foco automaticamente el primer input de la fila disponible.
function firstFocus(row){  
    let primerInput = row.querySelector('.cell:first-child');
    primerInput.focus();
}

//limpiar tabla
function cleanTable(){
    table.innerHTML="";
}


//*------- funciones de las celdas:
function eventCells(){

    let inputs = document.querySelectorAll('.cell');

    inputs.forEach(function(input) {

        //focus de las celdas.
        input.addEventListener('input', function(event) {
            let currentInput = event.currentTarget;
            checkFocus(currentInput, event) ;
        });
    
        //borrar celdas por teclado.
        input.addEventListener('keydown', function (event) {
    
            if (event.key === 'Backspace' || event.key === 'Delete') {
                if (event.currentTarget.value.length === 0) {
                    if (!event.currentTarget.id.includes('1')) {
                        event.currentTarget.previousElementSibling.focus();
                    }
                }
            }
        });
    
        // reasignar valor a un input(celda).
        input.addEventListener('input', function(event) {
            let currentInput = event.currentTarget;
            let letter = event.target.value; 
            
            if (event.currentTarget.value.length > 1) {
                input.value = letter.charAt(1);
            }
    
            checkFocus(currentInput,event)
        });
    
        // agregar clase al input(celda) en foco, y sacarselo a todos los demás.
        input.addEventListener('focus', function(event) {
            input.classList.add('cell-focus');
    
            inputs.forEach(el => {
                if(el!=input){
                    el.classList.remove('cell-focus');
                }
            });
        });
    
        //evitar que se pierda el foco de las celdas.
        input.addEventListener('blur', function(event) {
            let currentInput = event.currentTarget;
            document.addEventListener('click', function(event) {
                checkInput(event, currentInput);
            });
        });
    });
}

// comprobar si la fila fue completada cuando se preciona 'enter'.
document.addEventListener('keydown', function(event) {
    if (!finalized && event.key ===  "Enter"){
        checkCompleteRow(currentRow)
    } 
   
});

// evitar que el focus se pierda de las celdas.
function checkInput(event,el){
    if(event.target.tagName == "INPUT" && event.target!=el){
        el.classList.remove('cell-focus');
    }  
}

// redirigir focus a siguiente casilla o anterior segun corresponda.
function checkFocus(currentInput, event){

    if (currentInput.value.length === 1 && !currentInput.id.includes(currentLevel)) {
        currentInput.nextElementSibling.focus();
    }
    
    if (event.key === 'Backspace' || event.key === 'Delete') {
        if (currentInput.value.length === 0) {
            if(!currentInput.id.includes('1')){
                currentInput.previousElementSibling.focus();
            }
        }    
    } else if (currentInput.value.length === 1 && !currentInput.id.includes(currentLevel)) {
        event.target.nextElementSibling.focus();
    }
}

//*------- funciones del teclado:
function setEventKeys(){
    const keys = document.querySelectorAll('.key');
    keys.forEach(function(key) {
        key.addEventListener('click', eventKeys)
    })
}

function eventKeys(event){
    const inputs = currentRow.querySelectorAll('.cell');
    let letter = event.target.innerHTML;    
            let cell;
            inputs.forEach(input => {
                if(input.className.includes('cell-focus')){
                    if(event.target.innerHTML== 'ENVIAR' ){
                        
                        checkCompleteRow(currentRow);

                    }else if (event.target.className.includes('borrar') || event.target.className.includes('fa-delete-left')){
                        input.value="";
                        if(!input.id.includes('1')){
                            input.previousElementSibling.focus();
                        }
                    }else{
                        input.value = letter;
                    }
                    
                    cell = input;
                }
            });
    
             checkFocus(cell, event);
}

function  cleanKeys(){
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if(!key.classList.contains('borrar') && !key.classList.contains('enviar') )
        key.setAttribute('class','key')
    });
    
}

//*------- el juego:

// setTable(currentLevel);
setLevel(currentLevel);
// checkSavedPlay();
setWordsLevels();
setStatistics();

//Busca la palabra ganadora aleatoriamente por nivel en el json
async function setWord(level){

    let savedPlayLS = JSON.parse(localStorage.getItem("savedPlay"));

    try {
        
        for(let lv in savedPlayLS){
            if(savedPlayLS.hasOwnProperty(lv) && lv === 'level'+level){
                const response = await fetch('js/wordsLevels.json');
                const wordsLevels = await response.json();

                const wordsCurrentLevel = wordsLevels[level];
                if (!wordsCurrentLevel) {
                    throw new Error('No se encontraron palabras para el nivel especificado.');
                }

                const randomIndex = Math.floor(Math.random() * wordsCurrentLevel.length);
                const palabra = wordsCurrentLevel[randomIndex];

                if(savedPlayLS[lv].winningWord.length==0){
                    for (let i = 0; i < palabra.length; i++) {
                        palabraGanadora = []; 
                        savedPlayLS[lv].winningWord.push(palabra.charAt(i))
                        localStorage.setItem("savedPlay", JSON.stringify(savedPlayLS));
                        palabraGanadora = savedPlayLS['level'+currentLevel].winningWord;
                    }

                } else {

                    let savedPlayLS = JSON.parse(localStorage.getItem("savedPlay"));

                    palabraGanadora = savedPlayLS['level'+currentLevel].winningWord

                    
                }  
            }
        }

    } catch (error) {
        console.error(error);
    }

    
}

//comprobar si la fila actual fue completada para contunuar.
function checkCompleteRow(RowToCheck){
    
    const currentRow = RowToCheck;
    const inputs = currentRow.querySelectorAll('input');
    let complete = true;

    inputs.forEach(input => {
        if (input.value.trim() === '') {
            complete = false;
        }
    });

    if (complete) {

        checkLetters(currentRow)

    } else {
        const toasts = document.querySelector('#error');
        const notif = document.createElement('div');
        notif.classList.add('error');
        
        notif.innerText = "La palabra debe estar completa!";

        toasts.appendChild(notif);
        currentRow.classList.add('animacion');

        setTimeout(() => {
          notif.remove()
          
        }, 2000)

        setTimeout(() => {
         currentRow.classList.remove('animacion')
        }, 1000)
        
      
    }
}

//comprobar la palabra ingredasa / letras correctas / letras presentes en la palabra / letras incorrectas.
function checkLetters(row){

    const inputs = row.querySelectorAll('input');
    const keys = document.querySelectorAll('.key');
    let successes = 0;
    let correctPositions = [];
    const attemp = row.classList[1];

    for (let i = 0; i < inputs.length; i++) {
        const inputLetter = inputs[i].value.toLowerCase();

        // Determinar el estado de la letra actual
        let letterState;
        if (palabraGanadora[i] === inputLetter) {
            letterState = 'correct';
            successes++
        } else if (palabraGanadora.includes(inputLetter)) {
            if (correctPositions.includes(i)) {
                letterState = 'contain';
            } else {
                letterState = 'incorrect';
            }
        } else {
            letterState = 'incorrect';
        }

        // Agregar clases a los inputs y keys
        agregarClase(inputs[i], letterState + '-cell');

        keys.forEach(key => {
            if (key.innerHTML === inputLetter.toUpperCase()) {
                agregarClase(key, letterState + '-key');
            }
        });

        //guarda la palabra en local storage.
        let savedPlayLS = JSON.parse(localStorage.getItem("savedPlay"));

        for (let lv in savedPlayLS){
            if(savedPlayLS.hasOwnProperty(lv) && lv === 'level'+currentLevel){
                for (let value in savedPlayLS[lv]) {
                    if (savedPlayLS[lv].hasOwnProperty(value) && value === attemp) {
                        savedPlayLS[lv][value].push({ value: inputLetter, state: letterState });
                    }
                }   
            }
        }

        localStorage.setItem("savedPlay", JSON.stringify(savedPlayLS));
    }

    if (successes == inputs.length){

        let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

        for(let estadistica in estadisticasAuxLS){
            if (estadistica == attemp){
                estadisticasAuxLS[estadistica]++;
            }
        }

        estadisticasAuxLS.victorias++

        localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAuxLS));

       
        clenLevelStorage()
        festejo();
        finalizedishGame()

    }else{

        if(enabledRowNumber!='6'){

            enabledRowNumber++
            enabledRow(enabledRowNumber);

        }else{

            let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

            estadisticasAuxLS.perdidas++

            localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAuxLS));

            clenLevelStorage(level);
            finalizedishGame()
        } 
    } 
}

//agregar clase a las letras
function agregarClase(elemento, clase) {
    if(elemento.classList.contains('key') && elemento.classList.length>=1){
        elemento.classList.remove(elemento.classList[1]);
        elemento.classList.add(clase);
    }else{
        elemento.classList.add(clase);
    }  
}

// terminar juego
function finalizedishGame(){

    finalized = true;
    
    let estadisticasLS = JSON.parse(localStorage.getItem("estadisticas"));
    let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

    estadisticasLS.jugadas++

    estadisticasLS.victorias = Math.round((estadisticasAuxLS.victorias*100)/estadisticasLS.jugadas);
    estadisticasLS.word1 = (estadisticasAuxLS.word1==0)? "0" : Math.round((estadisticasAuxLS.word1*100)/estadisticasLS.jugadas);
    estadisticasLS.word2 = (estadisticasAuxLS.word2==0)? "0" : Math.round((estadisticasAuxLS.word2*100)/estadisticasLS.jugadas);
    estadisticasLS.word3 = (estadisticasAuxLS.word3==0)? "0" : Math.round((estadisticasAuxLS.word3*100)/estadisticasLS.jugadas);
    estadisticasLS.word4 = (estadisticasAuxLS.word4==0)? "0" : Math.round((estadisticasAuxLS.word4*100)/estadisticasLS.jugadas);
    estadisticasLS.word5 = (estadisticasAuxLS.word5==0)? "0" : Math.round((estadisticasAuxLS.word5*100)/estadisticasLS.jugadas);
    estadisticasLS.word6 = (estadisticasAuxLS.word6==0)? "0" : Math.round((estadisticasAuxLS.word6*100)/estadisticasLS.jugadas);
    estadisticasLS.perdidas = (estadisticasAuxLS.perdidas==0)? "0" : Math.round((estadisticasAuxLS.perdidas*100)/estadisticasLS.jugadas);

    localStorage.setItem("estadisticas", JSON.stringify(estadisticasLS));
    localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAuxLS));
    
    setStatistics()

    setTimeout(() => {
        openStatics();
    }, 800);

    let savedPlayLS = JSON.parse(localStorage.getItem("savedPlay"));

    for(let lv in savedPlayLS){
        if(savedPlayLS.hasOwnProperty(lv) && lv === 'level'+currentLevel){

            savedPlayLS[lv].winningWord=([])
            localStorage.setItem("savedPlay", JSON.stringify(savedPlayLS));
            setWord(currentLevel);
        }
    }
}

//setear estadisticas
function setStatistics(){
    let estadisticasLS = JSON.parse(localStorage.getItem("estadisticas"));
    let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

    const plays = document.querySelector('#plays')
    plays.innerHTML = estadisticasLS.jugadas;

    const won = document.querySelector('#won')
    won.innerHTML = estadisticasLS.victorias;

    // graphic

    const try1Graphic =  document.querySelector('.try-1');
    const try1Text = document.querySelector('.try-1P');
    try1Text.innerHTML = estadisticasAuxLS.word1 + ' (' + estadisticasLS.word1 + '%)';
    try1Graphic.style.width = estadisticasLS.word1 + "%";

    const try2Graphic =  document.querySelector('.try-2');
    const try2Text = document.querySelector('.try-2P');
    try2Text.innerHTML = estadisticasAuxLS.word2 + ' (' + estadisticasLS.word2 + '%)';;
    try2Graphic.style.width = estadisticasLS.word2 + "%";

    const try3Graphic =  document.querySelector('.try-3');
    const try3Text = document.querySelector('.try-3P');
    try3Text.innerHTML = estadisticasAuxLS.word3 + ' (' + estadisticasLS.word3 + '%)';;
    try3Graphic.style.width = estadisticasLS.word3 + "%";

    const try4Graphic =  document.querySelector('.try-4');
    const try4Text = document.querySelector('.try-4P');
    try4Text.innerHTML = estadisticasAuxLS.word4 + ' (' + estadisticasLS.word4 + '%)';
    try4Graphic.style.width = estadisticasLS.word4 + "%";
    
    const try5Graphic =  document.querySelector('.try-5');
    const try5Text = document.querySelector('.try-5P');
    try5Text.innerHTML = estadisticasAuxLS.word5 + ' (' + estadisticasLS.word5 + '%)';
    try5Graphic.style.width = estadisticasLS.word5 + "%";

    const try6Graphic =  document.querySelector('.try-6');
    const try6Text = document.querySelector('.try-6P');
    try6Text.innerHTML = estadisticasAuxLS.word6 + ' (' + estadisticasLS.word6 + '%)';
    try6Graphic.style.width = estadisticasLS.word6 + "%";

    const lossGraphic = document.querySelector('.loss');
    const lossText = document.querySelector('.lossP');
    lossText.innerHTML = estadisticasAuxLS.perdidas + ' (' + estadisticasLS.perdidas + '%)';
    lossGraphic.style.width = estadisticasLS.perdidas + "%";

}

//*------- estadisticas:

const showStatistics = document.querySelector('.fa-square-poll-vertical');
const hideStadistics = document.querySelector('.close');
const statistics = document.querySelector('#statistics');
const playAgain = document.querySelector('#button')


showStatistics.addEventListener('click', function(){
    openStatics();
})


hideStadistics.addEventListener('click', function(){
    closeStatics();
})

//abrir estadisticas
function openStatics(){
    statistics.style.top ='5%';
    if(!finalized){
        playAgain.style.display="none";
    }else{
        playAgain.style.display="block"
    }
}

//cerrar estadisticas
function closeStatics(){
    statistics.style.top = '110%';
} 

// resetear juego
function reset(){
    finalized=false;
    enabledRowNumber = 1
    setLevel('6');
    closeStatics();
}

//animacion de festejo
function festejo() {
    let W = window.innerWidth;
    let H = window.innerHeight;
    const context = canvas.getContext("2d");
    const maxConfettis = 150;
    const particles = [];

    const possibleColors = [
        "DodgerBlue",
        "OliveDrab",
        "Gold",
        "Pink",
        "SlateBlue",
        "LightBlue",
        "Gold",
        "Violet",
        "PaleGreen",
        "SteelBlue",
        "SandyBrown",
        "Chocolate",
        "Crimson"
    ];

    canvas.style.display = "block"

    function randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    function confettiParticle() {
        this.x = Math.random() * W; // x
        this.y = Math.random() * H - H; // y
        this.r = randomFromTo(11, 33); // radius
        this.d = Math.random() * maxConfettis + 11;
        this.color =
            possibleColors[Math.floor(Math.random() * possibleColors.length)];
        this.tilt = Math.floor(Math.random() * 33) - 11;
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;

        this.draw = function () {
            context.beginPath();
            context.lineWidth = this.r / 2;
            context.strokeStyle = this.color;
            context.moveTo(this.x + this.tilt + this.r / 3, this.y);
            context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
            return context.stroke();
        };
    }

    function Draw() {
        const results = [];

        requestAnimationFrame(Draw);
        
        context.clearRect(0, 0, W, window.innerHeight);

        for (var i = 0; i < maxConfettis; i++) {
            results.push(particles[i].draw());
        }

        let particle = {};
        let remainingFlakes = 0;
        for (var i = 0; i < maxConfettis; i++) {
            particle = particles[i];

            particle.tiltAngle += particle.tiltAngleIncremental;
            
            if(W<600){
                
                particle.y += (Math.sin(particle.d) + 0.0001 + particle.r / 4) / 2;
            } else {
                particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
            }
            
            particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

            if (particle.y <= H) remainingFlakes++;

            // If a confetti has fluttered out of view,
            // bring it back to above the viewport and let if re-fall.
            if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
                particle.x = Math.random() * W;
                particle.y = -30;
                particle.tilt = Math.floor(Math.random() * 10) - 20;
            }
        }

        return results;
    }

    window.addEventListener(
        "resize",
        function () {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        },
        false
    );

    // Push new confetti objects to `particles[]`
    for (var i = 0; i < maxConfettis; i++) {
        particles.push(new confettiParticle());
    }

    // Initialize
    canvas.width = W;
    canvas.height = H;
    Draw();
}

//modo oscuro

const switchToggle = document.querySelector(".switch");

switchToggle.addEventListener("click", e =>{
    switchToggle.classList.toggle("active");
    document.body.classList.toggle("active");
})

