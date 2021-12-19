// If promptState is true, it means that any subsequent press of integers will not overwrite the previous
let promptState = true;

// If floatState is true, then we consider decimals
let floatState = false;

// List of operations
class Enum {
    constructor(...keys) {
      keys.forEach((key, i) => {
        this[key] = i;
      });
      Object.freeze(this);
    }
  
    *[Symbol.iterator]() {
      for (let key of Object.keys(this)) yield key;
    }
  }
  
  const operationEnum = new Enum(
    'ADD',
    'SUBTRACT',
    'MULTIPLY',
    'DIVIDE',
    'SQRT',
    'EQUALS',
    'SQRT',
  );

  let operationType = "";


// Variables to hold recent operations and current input
let prevVal = "";
let currVal = "";

const ints = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

// For the display of the calculator
const screen = document.querySelector(".console");
screen.addEventListener('transitionend', function(e) {
    // Small animation to let the user know their button has been pressed
    removePlaying();
});

const MAX_DIGITS = 8;

// For the keyboard functionality
document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;

    // Alert the key name and key code on keydown
    // console.log(`Key pressed ${name} \r\n Key code value: ${code}`);
    keyboardAction(name);
});

// Listener for integers
for (let i = 0; i < ints.length; i++) {
    const intBtn = document.querySelector("#" + ints[i])
    intBtn.addEventListener("click", e => {
        const buttonPressed = intBtn.textContent;    

        // When do we reset/flush the previous value?
        //  1) When we only have a zero
        //  2) When we have 12345678 and then replace it with a bunch of zeros
        //  3) When the most recent action was pressing equals
        if (currVal === "0" || currVal === "0".repeat(MAX_DIGITS) || operationType == operationEnum.EQUALS) {
            prevVal = "";
            currVal = buttonPressed;
            promptState = true;
            floatState = false;
        } // Otherwise, if we haven't reached eight digits yet, add to the end
        else if (currVal.length < MAX_DIGITS) {
            currVal += buttonPressed;
        } else { // If we have reached the cap, pop from the front and add to the back
            currVal = currVal.substr(1,MAX_DIGITS) + buttonPressed;
        }
        screen.textContent = currVal.toString();

    });
}

// The following buttons determine what happens when an arithmetic operation is pressed
//  If there are valid entries to evaluate (e.g. a first value and a previous value are given), then it will be evaluated
//  Otherwise, the calculator waits for two valid inputs 
const plusBtn = document.querySelector("#plus");
plusBtn.addEventListener("click", e => { 
    saveValueOrPerformOperation();

    // Keep track of recent action
    operationType = operationEnum.ADD;
    
})

const subtractBtn = document.querySelector("#subtract");
subtractBtn.addEventListener("click", e => { 
    saveValueOrPerformOperation();

    // Keep track of recent action
    operationType = operationEnum.SUBTRACT;
    
})

const multiplyBtn = document.querySelector("#multiply");
multiplyBtn.addEventListener("click", e => { 
    saveValueOrPerformOperation();

    // Keep track of recent action
    operationType = operationEnum.MULTIPLY;
    
})

const divideBtn = document.querySelector("#divide");
divideBtn.addEventListener("click", e => { 
    saveValueOrPerformOperation();

    // Keep track of recent action
    operationType = operationEnum.DIVIDE;

    floatState = true;    
})

// Square root is special - it does not need an a and b
//  It will attempt to square root whatever is on the screen
const sqrtBtn = document.querySelector("#sqrt");
sqrtBtn.addEventListener("click", e => { 
    
    operationType = operationEnum.SQRT;
    floatState = true;    
    equalBtn.click();    
})

// The equal button also evaluates the expression
const equalBtn = document.querySelector("#equals");
equalBtn.addEventListener("click", e => {
    removePlaying();
    let returnVal = checkReturnVal(applyFunction());

    if (returnVal != false) {    
        screen.textContent = returnVal;
        prevVal = returnVal;
        currVal = "";
        operationType = operationEnum.EQUALS;
    }
})

// Reset the calculator
const clearBtn = document.querySelector("#clear");
clearBtn.addEventListener("click", e=> {
    location.reload();
});

// Clear what is on the screen
const clearEntryBtn = document.querySelector("#clear-entry");
clearEntryBtn.addEventListener("click", e=> {
    // If we most recently pressed "EQUALS", CE is equivalent to clear
    if (operationType = operationEnum.EQUALS) {
        clearBtn.click();
    } else { // Otherwise, just clear the most recent input
        currVal = "";
        screen.textContent = currVal;
    }

});

// Allow users to use decimals
const decimalBtn = document.querySelector("#decimal");
decimalBtn.addEventListener("click", e=> {

    // If blank, assume to mean "0." is desired
    if (currVal == "") {
        screen.textContent = 0;
    }

    // Do not allow double decimal
    if (!getScreenValue().includes(".")) {



        // Add the decimal
        floatState = true;
        currVal += ".";
        screen.textContent = currVal;
    } 

});

// Change from pos to neg or vice-versa
const plusMinusBtn = document.querySelector("#pm");
plusMinusBtn.addEventListener("click", e=> {
    let screenValue = getScreenValue();
    
    if (screenValue.includes("-")) {
        screenValue = screenValue.substr(1,screenValue.length);
    } else {
        screenValue = "-" + screenValue;
    }

    // If the most recent operation was equals, then we need to consider the input on the screen as "prevVal", and we expect the user to give us a "currVal" next
    //  Else (if we are coming from another operation), the result of said operation is "prevVal" and our flipped-sign is "currVal"
    if (operationType == operationEnum.EQUALS) {
        prevVal = screenValue;
    } else {
        currVal = screenValue;
    }
    screen.textContent = screenValue;
});

// Based on the most recent operation, apply a function
function applyFunction() {
    let a, b;

    if (!floatState) {
        a = parseInt(prevVal);
        b = parseInt(currVal);
    } else {
        a = parseFloat(prevVal);
        b = parseFloat(currVal);
    }

    // console.log("a: " + a + " b: " + b + " operation: " + getKeyByValue(operationEnum, operationType))

    switch(operationType) {
        case operationEnum.ADD:
          return a + b;
          break;
        case operationEnum.SUBTRACT:
          return a - b;
          break;
        case operationEnum.MULTIPLY:
            return a * b;
            break;
        case operationEnum.DIVIDE:
            return a / b;
            break;
        case operationEnum.SQRT:
            let val = Math.sqrt(parseFloat(getScreenValue()));
            return isNaN(val) ? "err" : val;
        default:
          return NaN;
      }
}

// EFFECTS: If we recently flushed, then we need to initialize/save prevVal
//          Otherwise, we may need to evaluate the most recent operation to chain them
function saveValueOrPerformOperation() {
    removePlaying();
    screen.classList.add('playing');

       
    // If we recently flushed, then we need to initialize prevVal
    if (prevVal == "") {
        prevVal = currVal;
        currVal = "";
    // If the previous operation was another arithmetic operation, we need to evaluate it
    //  Otherwise, we recently came from an equals... do nothing
    } else if (operationType != operationEnum.EQUALS){
        let returnVal = checkReturnVal(applyFunction());

        if (returnVal != false) {
            prevVal = returnVal;
            screen.textContent = prevVal; 
            currVal = "";
        }
    }
}

// Return the value on the screen
function getScreenValue() {
    return screen.textContent;
}

// SOURCE: https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

// Check what our calculator calculated
function checkReturnVal(returnVal) {
    // If it returns a valid number or "err"
    if (!isNaN(returnVal) || returnVal == "err") {
        let returnValString = returnVal.toString();

        // Truncate if necessary
        if (returnValString.length > MAX_DIGITS) {
            if (returnValString.includes(".")) {
                returnVal = returnVal.toFixed(MAX_DIGITS-1);
            } 
            returnVal = returnVal.toString().substr(0,MAX_DIGITS);     
        }          
        return returnVal;
    // If it is not a number
    } else {
        return false
    }
}

// Keyboard to action
function keyboardAction(name) {
    switch(name) {
        case "0":
            document.querySelector("#" + ints[0]).click();
            break;
        case "1":
            document.querySelector("#" + ints[1]).click();
            break;
        case "2":
            document.querySelector("#" + ints[2]).click();
            break;
        case "3":
            document.querySelector("#" + ints[3]).click();
            break;
        case "4":
            document.querySelector("#" + ints[4]).click();
            break;
        case "5":
            document.querySelector("#" + ints[5]).click();
            break;      
        case "6":
            document.querySelector("#" + ints[6]).click();
            break;
        case "7":
            document.querySelector("#" + ints[7]).click();
            break;
        case "8":
            document.querySelector("#" + ints[8]).click();
            break;      
        case "9":
            document.querySelector("#" + ints[9]).click();
            break;  
        case "+":
            plusBtn.click();
            break;
        case "-":
            subtractBtn.click();
            break;
        case "/":
            divideBtn.click();
            break;
        case "*":
            multiplyBtn.click();
            break; 
        case "=":
        case "Enter":
            equalBtn.click();
            break;   
        case ".":
            decimalBtn.click();
            break;
        default:
            // Do nothing
    }

    
}

// Remove the playing transition class
function removePlaying() {
    if (screen.classList.contains("playing")) {
        screen.classList.remove('playing');
    }
}