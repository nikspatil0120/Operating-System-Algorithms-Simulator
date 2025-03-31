function generateInputs() {
    const container = document.getElementById('processInputsContainer');
    
    let html = `
        <div class="input-group">
            <label for="numBlocks">Number of Memory Blocks:</label>
            <input type="number" id="numBlocks" min="1" value="5" onchange="generateMemoryInputs()">
        </div>
        <div class="input-group">
            <label for="numProcesses">Number of Processes:</label>
            <input type="number" id="numProcesses" min="1" value="4" onchange="generateProcessInputs()">
        </div>
        <div class="input-group">
            <label for="algorithm">Algorithm:</label>
            <select id="algorithm">
                <option value="firstFit">First Fit</option>
                <option value="bestFit">Best Fit</option>
                <option value="worstFit">Worst Fit</option>
            </select>
        </div>
        <div id="memoryInputs"></div>
        <div id="processInputs"></div>
        <button id="calculateBtn" style="display: none;">Calculate</button>
    `;
    
    container.innerHTML = html;
    generateMemoryInputs();
    generateProcessInputs();
}

// Function to generate memory block inputs
function generateMemoryInputs() {
    const numBlocks = parseInt(document.getElementById('numBlocks').value);
    const container = document.getElementById('memoryInputs');
    
    let html = '<table class="process-table">';
    html += `
        <tr>
            <th>Block</th>
            <th>Size (KB)</th>
        </tr>
    `;
    
    for(let i = 0; i < numBlocks; i++) {
        html += `
            <tr>
                <td>Block ${i + 1}</td>
                <td><input type="number" id="block_${i}" min="1" value="${Math.floor(Math.random() * 900) + 100}"></td>
            </tr>
        `;
    }
    html += '</table>';
    container.innerHTML = html;

    // Show the process section after generating memory blocks
    document.getElementById('processSection').style.display = 'block';
}

// Function to generate process inputs
function generateProcessInputs() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const container = document.getElementById('processInputs');
    
    let html = '<table class="process-table">';
    html += `
        <tr>
            <th>Process</th>
            <th>Size (KB)</th>
        </tr>
    `;
    
    for(let i = 0; i < numProcesses; i++) {
        html += `
            <tr>
                <td>P${i + 1}</td>
                <td><input type="number" id="process_${i}" min="1" value="${Math.floor(Math.random() * 400) + 100}"></td>
            </tr>
        `;
    }
    html += '</table>';
    container.innerHTML = html;

    // Show the calculate button after generating process inputs
    document.getElementById('calculateBtn').style.display = 'block';
}

// Function to allocate memory
function allocateMemory() {
    const numBlocks = parseInt(document.getElementById('numBlocks').value);
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const algorithm = document.getElementById('algorithm').value;
    
    const blocks = [];
    const processes = [];
    const blockUsed = new Array(numBlocks).fill(false); // Track if block is already used
    
    // Get block sizes
    for(let i = 0; i < numBlocks; i++) {
        blocks.push(parseInt(document.getElementById(`block_${i}`).value));
    }
    
    // Get process sizes
    for(let i = 0; i < numProcesses; i++) {
        processes.push({
            id: i + 1,
            size: parseInt(document.getElementById(`process_${i}`).value)
        });
    }
    
    // Create copy of blocks for allocation
    const allocation = new Array(numProcesses).fill(-1);
    const remainingSpace = [...blocks];
    
    switch(algorithm) {
        case 'firstFit':
            firstFit(blocks, processes, allocation, remainingSpace, blockUsed);
            break;
        case 'bestFit':
            bestFit(blocks, processes, allocation, remainingSpace, blockUsed);
            break;
        case 'worstFit':
            worstFit(blocks, processes, allocation, remainingSpace, blockUsed);
            break;
    }
    
    displayResults(blocks, processes, allocation, remainingSpace);
}

// Update allocation algorithms
function firstFit(blocks, processes, allocation, remainingSpace, blockUsed) {
    // Initialize allocation array with -1
    allocation.fill(-1);
    
    // For each process
    for(let i = 0; i < processes.length; i++) {
        // Look through each block
        for(let j = 0; j < blocks.length; j++) {
            // If block is not allocated and has enough space
            if(!blockUsed[j] && blocks[j] >= processes[i].size) {
                // Allocate process to this block
                allocation[i] = j;
                // Mark block as used
                blockUsed[j] = true;
                // Update remaining space
                remainingSpace[j] = blocks[j] - processes[i].size;
                break;
            }
        }
    }
}

function bestFit(blocks, processes, allocation, remainingSpace, blockUsed) {
    // Initialize allocation array with -1
    allocation.fill(-1);
    
    // For each process
    for(let i = 0; i < processes.length; i++) {
        let bestIdx = -1;
        
        // Look through each block
        for(let j = 0; j < blocks.length; j++) {
            // If block has enough space
            if(blocks[j] >= processes[i].size) {
                // If block is not allocated and (no best found yet OR this block is smaller than best)
                if(!blockUsed[j] && (bestIdx === -1 || blocks[j] < blocks[bestIdx])) {
                    bestIdx = j;
                }
            }
        }
        
        // If we found a suitable block
        if(bestIdx !== -1) {
            allocation[i] = bestIdx;
            blockUsed[bestIdx] = true;
            remainingSpace[bestIdx] = blocks[bestIdx] - processes[i].size;
        }
    }
}

function worstFit(blocks, processes, allocation, remainingSpace, blockUsed) {
    // Initialize allocation array with -1
    allocation.fill(-1);
    
    // For each process
    for(let i = 0; i < processes.length; i++) {
        let worstIdx = -1;
        
        // Look through each block
        for(let j = 0; j < blocks.length; j++) {
            // If block has enough space
            if(blocks[j] >= processes[i].size) {
                // If block is not allocated and (no worst found yet OR this block is larger than worst)
                if(!blockUsed[j] && (worstIdx === -1 || blocks[j] > blocks[worstIdx])) {
                    worstIdx = j;
                }
            }
        }
        
        // If we found a suitable block
        if(worstIdx !== -1) {
            allocation[i] = worstIdx;
            blockUsed[worstIdx] = true;
            remainingSpace[worstIdx] = blocks[worstIdx] - processes[i].size;
        }
    }
}

function displayResults(blocks, processes, allocation, remainingSpace) {
    const resultsDiv = document.getElementById('results');
    
    let html = '<h3>Allocation Results</h3>';
    html += '<table class="process-table">';
    html += `
        <tr>
            <th>Process</th>
            <th>Size (KB)</th>
            <th>Block</th>
            <th>Block Size (KB)</th>
            <th>Remaining Space (KB)</th>
            <th>Status</th>
        </tr>
    `;
    
    processes.forEach((process, i) => {
        const blockIndex = allocation[i];
        html += `
            <tr>
                <td>P${process.id}</td>
                <td>${process.size}</td>
                <td>${blockIndex !== -1 ? `Block ${blockIndex + 1}` : 'Not Allocated'}</td>
                <td>${blockIndex !== -1 ? blocks[blockIndex] : '-'}</td>
                <td>${blockIndex !== -1 ? remainingSpace[blockIndex] : '-'}</td>
                <td class="status ${blockIndex !== -1 ? 'allocated' : 'free'}">
                    ${blockIndex !== -1 ? 'Allocated' : 'Not Allocated'}
                </td>
            </tr>
        `;
    });
    html += '</table>';

    // Update the Memory Blocks Status table
    html += '<h3>Memory Blocks Status</h3>';
    html += '<table class="process-table">';
    html += `
        <tr>
            <th>Block</th>
            <th>Total Size (KB)</th>
            <th>Used Space (KB)</th>
            <th>Remaining Space (KB)</th>
            <th>Status</th>
        </tr>
    `;
    
    blocks.forEach((block, i) => {
        const used = block - remainingSpace[i];
        const status = remainingSpace[i] === block ? 'Free' : 
                      remainingSpace[i] === 0 ? 'Allocated' : 'Partially Allocated';
        const statusClass = remainingSpace[i] === block ? 'free' : 'allocated';
        
        html += `
            <tr>
                <td>Block ${i + 1}</td>
                <td>${block}</td>
                <td>${used}</td>
                <td>${remainingSpace[i]}</td>
                <td class="status ${statusClass}">
                    ${status}
                </td>
            </tr>
        `;
    });
    html += '</table>';
    
    resultsDiv.innerHTML = html;
}

// Initialize on page load
window.onload = () => generateInputs(); 