function generateInputs() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const container = document.getElementById('processInputsContainer');
    
    let table = '<table class="process-table">';
    table += `
        <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
        </tr>
    `;
    
    for(let i = 0; i < numProcesses; i++) {
        table += `
            <tr>
                <td>P${i + 1}</td>
                <td><input type="number" id="at_${i}" min="0" value="0"></td>
                <td><input type="number" id="bt_${i}" min="1" value="1"></td>
            </tr>
        `;
    }
    table += '</table>';
    container.innerHTML = table;

    // Add ready queue section after the input section
    if (!document.querySelector('.ready-queue-section')) {
        const readyQueueSection = document.createElement('div');
        readyQueueSection.className = 'ready-queue-section';
        readyQueueSection.innerHTML = `
            <h3>Ready Queue</h3>
            <div class="ready-queue">
                <div class="queue-items"></div>
            </div>
        `;
        document.querySelector('.input-section').after(readyQueueSection);
    }
}

function calculateSJF() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    
    // Initialize arrays
    let at = new Array(numProcesses);
    let bt = new Array(numProcesses);
    let ct = new Array(numProcesses);
    let tat = new Array(numProcesses);
    let wt = new Array(numProcesses);
    let process = new Array(numProcesses);
    let isCompleted = new Array(numProcesses).fill(false);
    const ganttChart = [];

    // Get input values
    for(let i = 0; i < numProcesses; i++) {
        at[i] = parseInt(document.getElementById(`at_${i}`).value);
        bt[i] = parseInt(document.getElementById(`bt_${i}`).value);
        process[i] = i + 1;
    }

    // Sort by burst time
    for(let i = 0; i < numProcesses - 1; i++) {
        for(let j = i + 1; j < numProcesses; j++) {
            if(bt[i] > bt[j]) {
                // Swap burst times
                let temp = bt[i];
                bt[i] = bt[j];
                bt[j] = temp;

                // Swap arrival times
                temp = at[i];
                at[i] = at[j];
                at[j] = temp;

                // Swap process numbers
                temp = process[i];
                process[i] = process[j];
                process[j] = temp;
            }
        }
    }

    // Find process with minimum arrival time
    let min = at[0];
    let j = 0;
    for(let i = 1; i < numProcesses; i++) {
        if(min > at[i]) {
            min = at[i];
            j = i;
        }
    }

    // Calculate completion time for first process
    ct[j] = at[j] + bt[j];
    let current = ct[j];
    isCompleted[j] = true;

    // Add first process to Gantt chart
    ganttChart.push({
        process: process[j],
        startTime: at[j],
        endTime: ct[j],
        duration: bt[j]
    });

    // Calculate completion times for remaining processes
    for(let i = 0; i < numProcesses; i++) {
        if(!isCompleted[i] && at[i] <= current) {
            ct[i] = current + bt[i];
            ganttChart.push({
                process: process[i],
                startTime: current,
                endTime: ct[i],
                duration: bt[i]
            });
            current = ct[i];
            isCompleted[i] = true;
        }
    }

    // Calculate TAT and WT
    for(let i = 0; i < numProcesses; i++) {
        tat[i] = ct[i] - at[i];
        wt[i] = tat[i] - bt[i];
    }

    // Calculate averages
    let totalTAT = 0, totalWT = 0;
    for(let i = 0; i < numProcesses; i++) {
        totalTAT += tat[i];
        totalWT += wt[i];
    }
    const avgTAT = totalTAT / numProcesses;
    const avgWT = totalWT / numProcesses;

    // Clear previous results
    document.getElementById('ganttChart').innerHTML = '';
    document.getElementById('results').innerHTML = '';

    // Display results in correct order
    drawGanttChart(ganttChart);  // Draw Gantt chart first
    displayResults(process, at, bt, ct, tat, wt, avgTAT, avgWT);  // Then display results table
}

function drawGanttChart(ganttChart) {
    const ganttDiv = document.getElementById('ganttChart');
    ganttDiv.innerHTML = '<h2>Gantt Chart</h2>';
    
    const chart = document.createElement('div');
    chart.className = 'gantt-chart';
    chart.style.display = 'flex';
    chart.style.alignItems = 'center';
    chart.style.overflowX = 'auto';
    chart.style.marginTop = '20px';

    ganttChart.forEach(block => {
        const div = document.createElement('div');
        div.className = 'gantt-block';
        // Set width based on duration
        div.style.width = `${Math.max(block.duration * 60, 80)}px`;
        div.innerHTML = `
            P${block.process}
            <br>
            ${block.startTime} - ${block.endTime}
            <br>
            Duration: ${block.duration}
        `;
        chart.appendChild(div);
    });

    ganttDiv.appendChild(chart);
}

function displayResults(process, at, bt, ct, tat, wt, avgTAT, avgWT) {
    const resultsDiv = document.getElementById('results');
    
    let table = `
        <table class="process-table">
            <tr>
                <th>Process</th>
                <th>AT</th>
                <th>BT</th>
                <th>CT</th>
                <th>TAT</th>
                <th>WT</th>
            </tr>
    `;

    // Display in process order
    for(let k = 1; k <= process.length; k++) {
        for(let i = 0; i < process.length; i++) {
            if(process[i] === k) {
                table += `
                    <tr>
                        <td>P${process[i]}</td>
                        <td>${at[i]}</td>
                        <td>${bt[i]}</td>
                        <td>${ct[i]}</td>
                        <td>${tat[i]}</td>
                        <td>${wt[i]}</td>
                    </tr>
                `;
            }
        }
    }
    table += '</table>';

    resultsDiv.innerHTML = `
        ${table}
        <div class="results-summary">
            <p>Average Turnaround Time: ${avgTAT.toFixed(2)}</p>
            <p>Average Waiting Time: ${avgWT.toFixed(2)}</p>
        </div>
    `;
}

function updateReadyQueue(currentTime, processes, executingProcessId) {
    const queueItems = document.querySelector('.queue-items');
    const readyProcesses = processes.filter(p => 
        p.at <= currentTime && 
        !p.completed && 
        p.id !== executingProcessId
    ).sort((a, b) => a.bt - b.bt); // Sort by burst time for SJF

    let html = '';
    readyProcesses.forEach((process, index) => {
        html += `
            <div class="queue-item" style="animation-delay: ${index * 0.1}s">
                <div class="process-id">P${process.id}</div>
                <div class="process-info">
                    <div class="info-row">
                        <span class="label">Burst Time:</span>
                        <span class="value">${process.bt}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Arrival:</span>
                        <span class="value">${process.at}</span>
                    </div>
                </div>
                <div class="process-status">Ready</div>
            </div>
        `;
    });

    if (readyProcesses.length === 0) {
        html = `
            <div class="empty-queue">
                <div class="empty-message">No processes in queue</div>
            </div>
        `;
    }

    queueItems.innerHTML = html;
}

// Make sure the page initializes properly
document.addEventListener('DOMContentLoaded', function() {
    generateInputs();
}); 
