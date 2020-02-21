/* =============================================================
* CCIK - Cloud Computing Interface Kit Backend
* Developed by Daniel Brooke Peig (daniel@danbp.org)
*
* https://www.danbp.org
*
* Copyright 2020
*
* CCIK is distribute unde the GNU GPLv3 license
* (https://www.gnu.org/licenses/gpl-3.0.en.html)
*
* Backend Version: 1.0
*
/* =============================================================*/

//Input template (also used to verify the input format)
//Note that the template equals to part of the output section. This way we can use the output as the input for a new calculation.
let template = {
    "inputs": {
        "label": "Inputs",
        "variables": {
            "width": {
                "label": "Width",
                "value": 0,
                "unit": "m"
            },
            "length": {
                "label": "Length",
                "value": 0,
                "unit": "m"
            },
            "height": {
                "label": "Height",
                "value": 0,
                "unit": "m"
            }
        }
    }
};

//Computation model interface for Express.js
let compute = {
    input: "",
    output: "",
    template: template,
    compute: function () {
        this.output = process(this.input, this.template);
    }
}
exports.compute = compute;

//Main processing function
function process(input, template) {

    //Empty response with log messages only
    let response = {
        "logMessages": []
    }

    //Response template and defaults
    let responseResults = {
        "respHeader": {
            "text": "Cube Properties Calculator"
        },
        "inputs": {
            "label": "Inputs",
            "variables": {
                "width": {
                    "label": "Width",
                    "prefix": "",
                    "value": 0,
                    "suffix": "m"
                },
                "length": {
                    "label": "Length",
                    "prefix": "",
                    "value": 0,
                    "suffix": "m"
                },
                "height": {
                    "label": "Height",
                    "prefix": "",
                    "value": 0,
                    "suffix": "m"
                }
            }
        },
        "results": {
            "label": "Results",
            "variables": {
                "area": {
                    "label": "Area",
                    "prefix": "",
                    "value": 0,
                    "suffix": "m²"
                },
                "perimeter": {
                    "label": "Perimeter",
                    "prefix": "",
                    "value": 0,
                    "suffix": "m"
                },
                "volume": {
                    "label": "Volume",
                    "prefix": "",
                    "value": 0,
                    "suffix": "m³"
                }
            }
        },
        "respFooter": {
            "text": "Created by CCIK 1.0"
        }
    }

    //Check if the input structure is valid and if all data fields exist
    let validFlag = true;
    Object.keys(template).forEach(key => {
        if (input[key] === undefined) { //Checks if all the keys from the template exist in the input
            response.logMessages.push("Error! Missing required variable: " + key);
            validFlag = false;
        } else if (template[key].value !== undefined && input[key].value === undefined) { //Checks if all variables have a value field
            response.logMessages.push("Error! Missing variable value: " + key);
            validFlag = false;
        }
    });
    if (validFlag) {
        //Performs the computation
        let inpInput = input.inputs.variables;
        let resInput = responseResults.inputs.variables;
        let resResult = responseResults.results.variables;

        resInput.width.value = inpInput.width.value;
        resInput.height.value = inpInput.height.value;
        resInput.length.value = inpInput.length.value;
        resResult.area.value = inpInput.width.value * inpInput.length.value;
        resResult.perimeter.value = inpInput.width.value * 2 + inpInput.length.value * 2;
        resResult.volume.value = inpInput.width.value * inpInput.length.value * inpInput.height.value;

        response.logMessages.push("SUCCESS!"); //Some feedback
        Object.assign(response, responseResults); //Compose the final response if successfull
    }
    return response;
}