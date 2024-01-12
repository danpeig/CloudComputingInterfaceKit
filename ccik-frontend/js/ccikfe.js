/* =============================================================
* CCIK - Cloud Computing Interface Kit Frontend
* Developed by Daniel BP (daniel@danbp.org)
*
* https://www.danbp.org
*
* Copyright 2020
*
* CCIK Frontend is distribute unde the GNU GPLv3 license
* (https://www.gnu.org/licenses/gpl-3.0.en.html)
*
* Frontend Version: 1.0
*
/* =============================================================*/

//Server configuration
let serverURL = "http://localhost:3000";
let serverTemplateRoute = "/template";
let serverProcessRoute = "/compute";
let formatAsTXT = true; //If false the results will be displayed in the JSON format
let formatRuler = "----------------------------------------\n"; //For the TXT outputs
let resultsJSON = "";

//Binds to the HTML elements
let formFile = document.getElementById("file");
let formFileReload = document.getElementById("fileReload");
let formDefault = document.getElementById("default");
let formInput = document.getElementById("input");
let formDownloadInput = document.getElementById("downloadInput");
let formSubmit = document.getElementById("submit");
let formStatus = document.getElementById("status");
let formClearStatus = document.getElementById("clearStatus");
let formOutput = document.getElementById("output");
let formDownloadOutput = document.getElementById("downloadOutput");
let formResultsAsJSON = document.getElementById("resultsAsJSON");
let formUseAsInput = document.getElementById("useAsInput");
let formClearOutput = document.getElementById("clearOutput");
let formClearInput = document.getElementById("clearInput");

//Attach events to components
formFile.addEventListener('change', readSingleFile, false);
formFileReload.addEventListener('click', readSingleFile, false);
formDownloadInput.addEventListener('click', saveInput, false);
formDownloadOutput.addEventListener('click', saveOutput, false);
formClearStatus.addEventListener('click', clearStatus, false);
formDefault.addEventListener('click', loadDefault, false);
formSubmit.addEventListener('click', process, false);
formResultsAsJSON.addEventListener('change', updateResults, false);
formResultsAsJSON.checked = !formatAsTXT;
formUseAsInput.addEventListener('click', useAsInput, false);
formClearInput.addEventListener('click', clearInput, false);
formClearOutput.addEventListener('click', clearOutput, false);

//Clear status
function clearStatus() {
    formStatus.value = "";
}

//Clear input
function clearInput() {
    formInput.value = "";
}

//Clear output
function clearOutput() {
    resultsJSON = "";
    formOutput.value = "";
}

//Clear output
function useAsInput() {
    if(resultsJSON != "") formInput.value = formatResults(false);
}

//Read input file contents
function readSingleFile(evt) {
    var f = formFile.files[0];
    if (f) {
        var r = new FileReader();
        r.readAsText(f);
        r.onload = function (e) {
            var contents = e.target.result;
            formInput.value = "";
            if (checkInput(contents)) formInput.value = contents
            else logStatus("Client: Invalid file syntax/format. File contents not loaded");
        }
    } else {
        logStatus("Client: Failed to read the file");
    }
}

//Download Input
function saveInput() {
    var blob = new Blob([formInput.value], {
        type: "application/json"
    });
    if (blob.size > 0) saveAs(blob, "input.json");
}

//Download Results
function saveOutput() {
    if (formatAsTXT) { //Download as TXT
        var blob = new Blob([formOutput.value], {
            type: "text/html; charset=utf-8"
        });
        if (blob.size > 0) saveAs(blob, "output.txt");
    } else { //Download as JSON
        var blob = new Blob([formOutput.value], {
            type: "application/json"
        });
        if (blob.size > 0) saveAs(blob, "output.json");
    }
}

//Load default
function loadDefault() {
    logStatus("Server: Requested input template");
    fetch(serverURL + serverTemplateRoute)
        .then(response => {
            if (!response.ok) { //Invalid response
                throw Error(response.statusText);
            }
            return response
        })
        .then(response => response.json()) //Parsing to JSON will also validate the results
        .then(body => {
            formInput.value = "";
            formInput.value = JSON.stringify(body, null, 2);
        })
        .catch((error) => {
            logStatus("Server-" + error);
            if (error.toString().indexOf("TypeError") > -1) logStatus("Server: Unable to connect to the server");
            console.log(error);
        });
}


//Check the input JSON format
function checkInput(JSONasTEXT) {
    if (JSONasTEXT.length > 0)
        try {
            let object = JSON.parse(JSONasTEXT);
        } catch (error) {
            logStatus("Client-" + error);
            console.error(error);
            return false;
        }
    else {
        logStatus("Client: Empty input, nothing to do");
        return false;
    }
    return true;
}


//Process
function process() {
    if (checkInput(formInput.value)) {
        let options = {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: formInput.value
        }
        fetch(serverURL + serverProcessRoute, options)
            .then(response => {
                if (!response.ok) { //Invalid response
                    throw Error(response.statusText);
                }
                return response
            })
            .then(response => response.text()) //Can be parsed as text because we will validate that later
            .then(body => {
                resultsJSON = body;
                formOutput.value = formatResults(formatAsTXT);
            })
            .catch((error) => {
                logStatus("Server-" + error);
                if (error.toString().indexOf("TypeError") > -1) logStatus("Server: Unable to connect to the server");
                console.log(error);
            });
    }
}

//Log status
function logStatus(message) {
    if (message != "") {
        let dateTime = new Date().toISOString().substr(0, 19).replace("T", " ");
        formStatus.value += dateTime + " - " + message + "\n";
        formStatus.scrollTop = formStatus.scrollHeight;
    }
}

//Update the results box
function updateResults() {
    if(resultsJSON != ""){
        if(formResultsAsJSON.checked == true) formatAsTXT = false;
        else formatAsTXT = true;
        formOutput.value = formatResults(formatAsTXT);
    }
    else formOutput.value = "";
}

//Parse and format the results
function formatResults(asTXT) {
    let results = "";
    try {
        let object = JSON.parse(resultsJSON); //Parses to JSON to check if the response format is valid
        if (asTXT) { //Format as Text     
            if (object !== undefined) {
                Object.keys(object).forEach(key => { //Iterate over sections (sections are mandatory)
                    let section = object[key];
                    if (key == "logMessages") {
                        object.logMessages.forEach(element => logStatus("Server: " + element)) //Extracts server log messages and display in the proper place
                    } else if (key == "respHeader") {
                        results += object.respHeader.text + "\n\n";
                    } else if (key == "respFooter") {
                        results += formatRuler + "\n" + object.respFooter.text;
                    } else {
                        results += formatRuler + section.label + "\n" + formatRuler;
                        Object.keys(section.variables).forEach(key => { //Iterate over variables (variables are optional)
                            let variables = section.variables[key];
                            results += variables.label + ": " + variables.prefix + variables.value + variables.suffix + "\n";
                        });
                    }
                });
            }
        } else results = JSON.stringify(object, null, 2); //Direct JSON output (no conversion to text)

    } catch (error) {
        logStatus("Client-" + error);
        console.error(error);
    }
    if (results.length == 0) logStatus("Client: No results");
    return results;
}
