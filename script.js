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
const screen = document.querySelector(".console");
const MAX_DIGITS = 8;

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

const sqrtBtn = document.querySelector("#sqrt");
sqrtBtn.addEventListener("click", e => { 
    
    // Square root is special - it does not need an a and b
    operationType = operationEnum.SQRT;
    floatState = true;    
    equalBtn.click();    
})

const equalBtn = document.querySelector("#equals");
equalBtn.addEventListener("click", e => {
    let returnVal = applyFunction();
    let returnValString = returnVal.toString();

    // Truncate if necessary
    if (returnValString.length > MAX_DIGITS) {
        if (returnValString.includes(".")) {
            returnVal = returnVal.toFixed(MAX_DIGITS-1);
        } 
        returnVal = returnVal.toString().substr(0,MAX_DIGITS);     
    }   
    
    screen.textContent = returnVal; 
    prevVal = returnVal;
    currVal = "";
    operationType = operationEnum.EQUALS;
})

// Reset the calculator
const clearBtn = document.querySelector("#clear");
clearBtn.addEventListener("click", e=> {
    promptState = true;
    floatState = false;

    prevVal = "";
    currVal = "";
    operationType = "";
    screen.textContent = prevVal;
});

const decimalBtn = document.querySelector("#decimal");
decimalBtn.addEventListener("click", e=> {

    // Only add a decimal if it does not already exist
    if (!getScreenValue().includes(".")) {

        // If blank, assume to mean "0." is desired
        if (currVal == "") {
            currVal = 0;
        }

        // Add the decimal
        floatState = true;
        currVal += ".";
        screen.textContent = currVal;
    }

});

const plusMinusBtn = document.querySelector("#pm");
plusMinusBtn.addEventListener("click", e=> {
    let screenValue = getScreenValue();
    
    // Change from pos to neg or vice-versa
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

// TODO: Move the percent and CE from the image

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

    console.log("a: " + a + " b: " + b + " operation: " + getKeyByValue(operationEnum, operationType))

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
            return Math.sqrt(parseFloat(getScreenValue()));
        default:
          // code block
      }
}

// EFFECTS: If we recently flushed, then we need to initialize/save prevVal
//          Otherwise, we may need to evaluate the most recent operation to chain them
function saveValueOrPerformOperation() {
    // TODO: Flash to indicate that the arithmetic button has been pressed;
    screen.textContent = "";
       
    // If we recently flushed, then we need to initialize prevVal
    if (prevVal == "") {
        prevVal = currVal;
        currVal = "";
    // If the previous operation was another arithmetic operation, we need to evaluate it
    //  Otherwise, we recently came from an equals... do nothing
    } else if (operationType != operationEnum.EQUALS){
        // TODO: Similar to equals
        prevVal = applyFunction().toString();
        screen.textContent = prevVal; 
        currVal = "";
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

