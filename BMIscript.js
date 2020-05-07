const heightInputFeet = document.getElementById("height-input-feet");
const heightInputInches = document.getElementById("height-input-inches");
const heightInputCM = document.getElementById("height-input-cm");
const weightInput = document.getElementById("weight-input");
const bmiDisplay = document.getElementById("bmi-display");
const resetButton = document.getElementById("reset-btn");
const imperialRadio = document.getElementById("imperial_radio");
const metricRadio = document.getElementById("metric_radio");
const BMIStatus = document.getElementById("bmi-status");

const feetMax = 9;
const inchMax = 108;
const cmMax = 275;

reset();
SetMeasureUnits();


function reset() {
    heightInputFeet.value = "";
    heightInputInches.value = "";
    heightInputCM.value = "";
    weightInput.value = "";
    bmiDisplay.innerText = "BMI: ";
    BMIStatus.style.display = "none";
    // imperialRadio.checked = true;
}

function CalculateImperialBMI(heightFeet, heightInches, weight) {
    let bmi = 0;
    let heightNum = 0;
    let weightNum = 0;

    if (heightFeet != "" && weight != "") {
        if (heightInches === "") {
            heightInputInches.value = 0;
        }
        heightNum = (Number(heightFeet) * 12 + Number(heightInches));
        weightNum = Number(weight);
        bmi = weightNum / (heightNum * heightNum) * 703;
        bmiDisplay.innerText = "BMI: " + bmi.toFixed(2);
        DisplayBMIStatus(bmi);
    }
}

function CalculateMetricBMI(height, weight) {
    let bmi = 0;
    let heightNum = 0;
    let weightNum = 0;

    if (height != "" && weight != "") {
        weightNum = Number(weight);
        if (Number(height) > 3) {
            heightNum = Number(height) / 100;
        }
        else {
            heightNum = Number(height);
        }
        bmi = weightNum / (heightNum * heightNum);
        bmiDisplay.innerText = "BMI: " + bmi.toFixed(2);//(weightNum / (heightNum * heightNum)).toFixed(2);
        DisplayBMIStatus(bmi);
    }
}

function DisplayBMIStatus(bmi){
    BMIStatus.style.display = "inline-block";
    if(bmi < 18.5){
        BMIStatus.innerText = "Underweight";
    }
    else if(bmi >= 18.5 && bmi < 25){
        BMIStatus.innerText = "Normal Weight";
    }
    else if(bmi >= 25 && bmi < 30){
        BMIStatus.innerText = "Overweight";
    }
    else if(bmi >= 30 && bmi < 40){
        BMIStatus.innerText = "Obese";
    }
    else if(bmi >= 40){
        BMIStatus.innerText = "Extremely Obese";
    }
}

function SetMeasureUnits() {
    reset();
    if (imperialRadio.checked) {
        heightInputCM.style.display = "none";
        heightInputFeet.style.display = "inline-block";
        heightInputInches.style.display = "inline-block";
        weightInput.placeholder = "lbs";
    }
    else {
        heightInputCM.style.display = "inline-block";
        heightInputFeet.style.display = "none";
        heightInputInches.style.display = "none";
        weightInput.placeholder = "kg";
    }

}

function ValidateInput(value, senderElement) {
    if (isNaN(value)) {    
        senderElement.value = value.slice(0, -1);
        return false;
    }
    return true;
}

imperialRadio.onclick = function () {
    SetMeasureUnits();
}

metricRadio.onclick = function () {
    SetMeasureUnits();
}

heightInputFeet.oninput = function () {
    if (ValidateInput(heightInputFeet.value, heightInputFeet)) {
        CalculateImperialBMI(heightInputFeet.value, heightInputInches.value, weightInput.value);
    }
}

heightInputInches.oninput = function () {
    if (ValidateInput(heightInputInches.value, heightInputInches)) {
        CalculateImperialBMI(heightInputFeet.value, heightInputInches.value, weightInput.value);
    }
}

heightInputCM.oninput = function () {
    if (ValidateInput(heightInputCM.value, heightInputCM)) {
        CalculateMetricBMI(heightInputCM.value, weightInput.value);
    }
}

weightInput.oninput = function () {
    if (ValidateInput(weightInput.value, weightInput)) {
        if (imperialRadio.checked) {
            CalculateImperialBMI(heightInputFeet.value, heightInputInches.value, weightInput.value)
        }
        else {
            CalculateMetricBMI(heightInputCM.value, weightInput.value);
        }
    }
}

resetButton.onclick = function () {
    reset();
}