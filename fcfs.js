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

    // Add ready queue section if it doesn't exist
    if (!document.querySelector('.ready-queue-section')) {
        const readyQueueSection = document.createElement('div');
        readyQueueSection.className = 'ready-queue-section';
        readyQueueSection.innerHTML = `
            <h3>Ready Queue</h3>
            <div class="ready-queue">
                <div class="queue-items"></div>
            </div>
        `;
        container.after(readyQueueSection);
    }
}

function calculateFCFS() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const at = new Array(numProcesses);
    const bt = new Array(numProcesses);
    const ct = new Array(numProcesses);
    const tat = new Array(numProcesses);
    const wt = new Array(numProcesses);
    const processOrder = new Array(numProcesses);
    let ganttChart = []; // Initialize Gantt chart array

    // Get input values
    for(let i = 0; i < numProcesses; i++) {
        at[i] = parseInt(document.getElementById(`at_${i}`).value);
        bt[i] = parseInt(document.getElementById(`bt_${i}`).value);
        processOrder[i] = i + 1;
    }

    // Sort by arrival time
    for(let i = 0; i < numProcesses - 1; i++) {
        for(let j = 0; j < numProcesses - 1; j++) {
            if(at[j] > at[j + 1]) {
                // Swap arrival times
                let temp = at[j];
                at[j] = at[j + 1];
                at[j + 1] = temp;

                // Swap burst times
                temp = bt[j];
                bt[j] = bt[j + 1];
                bt[j + 1] = temp;

                // Swap process order
                temp = processOrder[j];
                processOrder[j] = processOrder[j + 1];
                processOrder[j + 1] = temp;
            }
        }
    }

    // Create processes array for ready queue tracking
    const processes = [];
    for(let i = 0; i < numProcesses; i++) {
        processes.push({
            id: processOrder[i],
            at: at[i],
            bt: bt[i],
            completed: false
        });
    }

    let currentTime = at[0];

    // Calculate completion times and build Gantt chart
    for(let i = 0; i < numProcesses; i++) {
        if(currentTime < at[i]) {
            currentTime = at[i];
        }

        // Update ready queue before processing
        updateReadyQueue(currentTime, processes, processOrder[i]);
        
        ganttChart.push({
            process: processOrder[i],
            startTime: currentTime,
            endTime: currentTime + bt[i]
        });

        ct[i] = currentTime + bt[i];
        currentTime = ct[i];
        processes[i].completed = true;
        
        // Update ready queue after processing
        updateReadyQueue(currentTime, processes, null);
    }

    // Calculate turnaround and waiting times
    let totalTAT = 0, totalWT = 0;
    for(let i = 0; i < numProcesses; i++) {
        tat[i] = ct[i] - at[i];
        wt[i] = tat[i] - bt[i];
        totalTAT += tat[i];
        totalWT += wt[i];
    }

    const tatAvg = totalTAT / numProcesses;
    const wtAvg = totalWT / numProcesses;

    displayResults(processOrder, at, bt, ct, tat, wt, tatAvg, wtAvg);
    drawGanttChart(ganttChart);
}

function displayResults(processOrder, at, bt, ct, tat, wt, tatAvg, wtAvg) {
    const resultsDiv = document.getElementById('results');
    
    let table = `
        <table class="process-table">
            <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Completion Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
            </tr>
    `;

    for(let i = 0; i < processOrder.length; i++) {
        table += `
            <tr>
                <td>P${processOrder[i]}</td>
                <td>${at[i]}</td>
                <td>${bt[i]}</td>
                <td>${ct[i]}</td>
                <td>${tat[i]}</td>
                <td>${wt[i]}</td>
            </tr>
        `;
    }
    table += '</table>';

    resultsDiv.innerHTML = `
        ${table}
        <div class="results-summary">
            <p>Average Turnaround Time: ${tatAvg.toFixed(2)}</p>
            <p>Average Waiting Time: ${wtAvg.toFixed(2)}</p>
        </div>
    `;
}

function drawGanttChart(ganttChart) {
    const ganttDiv = document.getElementById('ganttChart');
    ganttDiv.innerHTML = '<h3>Gantt Chart</h3>';
    
    const chart = document.createElement('div');
    chart.className = 'gantt-chart';
    
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    ganttChart.forEach((block, index) => {
        const div = document.createElement('div');
        div.className = 'gantt-block';
        div.style.animationDelay = `${index * 0.2}s`;
        
        const duration = block.endTime - block.startTime;
        div.style.minWidth = `${Math.max(duration * 50, 100)}px`;
        
        div.innerHTML = `
            <div class="process-label">Process ${block.process}</div>
            <div class="time-range">${block.startTime} - ${block.endTime}</div>
            <div class="duration">Duration: ${duration}</div>
        `;
        
        timeline.appendChild(div);
    });

    chart.appendChild(timeline);
    ganttDiv.appendChild(chart);
}

function updateReadyQueue(currentTime, processes, executingProcess) {
    const queueItems = document.querySelector('.queue-items');
    const readyProcesses = processes.filter(p => 
        p.at <= currentTime && 
        !p.completed && 
        p.id !== executingProcess
    );

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

window.onload = () => generateInputs(); 