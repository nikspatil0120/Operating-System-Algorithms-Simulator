function generateInputs() {
    const numResources = parseInt(document.getElementById('numResources').value);
    const numProcesses = parseInt(document.getElementById('numProcesses').value);

    // Generate Available Resources inputs
    const availableContainer = document.getElementById('availableResources');
    availableContainer.innerHTML = '<table class="resource-table"><tr>';
    for (let i = 0; i < numResources; i++) {
        availableContainer.querySelector('tr').innerHTML += `
            <td>R${i + 1}: <input type="number" id="available${i}" min="0" value="0"></td>
        `;
    }
    availableContainer.innerHTML += '</tr></table>';

    // Generate Maximum Need Matrix
    generateMatrix('maxNeedMatrix', numProcesses, numResources, 'max');

    // Generate Allocation Matrix
    generateMatrix('allocationMatrix', numProcesses, numResources, 'allocation');
}

function generateMatrix(containerId, rows, cols, prefix) {
    const container = document.getElementById(containerId);
    let table = '<table class="resource-table">';
    
    // Header row
    table += '<tr><th>Process</th>';
    for (let j = 0; j < cols; j++) {
        table += `<th>R${j + 1}</th>`;
    }
    table += '</tr>';

    // Data rows
    for (let i = 0; i < rows; i++) {
        table += `<tr><td>P${i + 1}</td>`;
        for (let j = 0; j < cols; j++) {
            table += `<td><input type="number" id="${prefix}_${i}_${j}" min="0" value="0"></td>`;
        }
        table += '</tr>';
    }
    table += '</table>';
    container.innerHTML = table;
}

function newAvailable(numProcesses, numResources, available, allocated) {
    const new_available = new Array(numResources).fill(0);
    
    for(let j = 0; j < numResources; j++) {
        let sum = 0;
        for(let i = 0; i < numProcesses; i++) {
            sum += allocated[i][j];
        }
        new_available[j] = available[j] - sum;
    }
    return new_available;
}

function calculateNeed(numProcesses, numResources, max, allocated) {
    const need = Array(numProcesses).fill().map(() => Array(numResources));
    for(let i = 0; i < numProcesses; i++) {
        for(let j = 0; j < numResources; j++) {
            need[i][j] = max[i][j] - allocated[i][j];
        }
    }
    return need;
}

function isSafe(numProcesses, numResources, need, allocated, new_available) {
    const work = [...new_available];
    const finish = new Array(numProcesses).fill(false);
    const safe_sequence = new Array(numProcesses);
    let count = 0;

    while(count < numProcesses) {
        let allocate = false;
        for(let i = 0; i < numProcesses; i++) {
            if(!finish[i]) {
                let can_allocate = true;
                for(let j = 0; j < numResources; j++) {
                    if(need[i][j] > work[j]) {
                        can_allocate = false;
                        break;
                    }
                }

                if(can_allocate) {
                    for(let j = 0; j < numResources; j++) {
                        work[j] += allocated[i][j];
                    }
                    finish[i] = true;
                    safe_sequence[count] = i;
                    count++;
                    allocate = true;
                    i = -1; // Reset loop to check from beginning
                }
            }
        }
        if(!allocate) {
            return {
                isSafe: false,
                safeSequence: []
            };
        }
    }

    return {
        isSafe: true,
        safeSequence: safe_sequence
    };
}

function checkSafety() {
    const numResources = parseInt(document.getElementById('numResources').value);
    const numProcesses = parseInt(document.getElementById('numProcesses').value);

    // Get available resources
    const available = [];
    for (let i = 0; i < numResources; i++) {
        available[i] = parseInt(document.getElementById(`available${i}`).value);
    }

    // Get maximum need matrix
    const max = Array(numProcesses).fill().map(() => Array(numResources));
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            max[i][j] = parseInt(document.getElementById(`max_${i}_${j}`).value);
        }
    }

    // Get allocation matrix
    const allocation = Array(numProcesses).fill().map(() => Array(numResources));
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            allocation[i][j] = parseInt(document.getElementById(`allocation_${i}_${j}`).value);
        }
    }

    // Calculate new available resources
    const new_available = newAvailable(numProcesses, numResources, available, allocation);

    // Calculate need matrix
    const need = calculateNeed(numProcesses, numResources, max, allocation);

    // Check if system is in safe state
    const result = isSafe(numProcesses, numResources, need, allocation, new_available);
    displayResults(result);
}

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    if (result.isSafe) {
        resultsDiv.innerHTML = `
            <div class="success-message">
                <h3>The System is in a safe state.</h3>
                <p>Safe sequence: ${result.safeSequence.map(p => 'P' + (p + 1)).join(' ')}</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="error-message">
                <h3>The system is not in a safe state.</h3>
            </div>
        `;
    }
}

window.onload = () => generateInputs(); 