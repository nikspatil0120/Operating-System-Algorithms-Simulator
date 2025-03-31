function generateProcessInputs() {
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
}

function calculateSRTN() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const processes = [];
    const ganttChart = [];

    // Initialize arrays
    let at = new Array(numProcesses);
    let bt = new Array(numProcesses);
    let ct = new Array(numProcesses);
    let tat = new Array(numProcesses);
    let wt = new Array(numProcesses);
    let remainingBurstTime = new Array(numProcesses);
    let isCompleted = new Array(numProcesses).fill(false);

    // Get input values
    for(let i = 0; i < numProcesses; i++) {
        at[i] = parseInt(document.getElementById(`at_${i}`).value);
        bt[i] = parseInt(document.getElementById(`bt_${i}`).value);
        remainingBurstTime[i] = bt[i];
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
            }
        }
    }

    let currentTime = 0;
    let completedProcesses = 0;
    let prevProcess = -1;

    while(completedProcesses < numProcesses) {
        let index = -1;
        let minRemainingTime = Number.MAX_VALUE;

        // Find process with minimum remaining time
        for(let i = 0; i < numProcesses; i++) {
            if(at[i] <= currentTime && !isCompleted[i] && remainingBurstTime[i] < minRemainingTime && remainingBurstTime[i] > 0) {
                minRemainingTime = remainingBurstTime[i];
                index = i;
            }
        }

        if(index === -1) {
            currentTime++;
            continue;
        }

        // Add to Gantt chart
        if(prevProcess !== index) {
            ganttChart.push({
                process: index + 1,
                startTime: currentTime,
                endTime: currentTime + 1
            });
        } else {
            ganttChart[ganttChart.length - 1].endTime = currentTime + 1;
        }

        remainingBurstTime[index]--;
        currentTime++;

        if(remainingBurstTime[index] === 0) {
            ct[index] = currentTime;
            tat[index] = ct[index] - at[index];
            wt[index] = tat[index] - bt[index];
            isCompleted[index] = true;
            completedProcesses++;
        }

        prevProcess = index;
    }

    // Calculate averages
    let totalTAT = 0, totalWT = 0;
    for(let i = 0; i < numProcesses; i++) {
        totalTAT += tat[i];
        totalWT += wt[i];
    }
    const avgTAT = totalTAT / numProcesses;
    const avgWT = totalWT / numProcesses;

    // Prepare process objects for display
    const processesForDisplay = [];
    for(let i = 0; i < numProcesses; i++) {
        processesForDisplay.push({
            id: i + 1,
            at: at[i],
            bt: bt[i],
            ct: ct[i],
            tat: tat[i],
            wt: wt[i]
        });
    }

    displayResults(processesForDisplay, avgTAT, avgWT);
    drawGanttChart(ganttChart);
}

function displayResults(processes, avgTAT, avgWT) {
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

    processes.forEach(p => {
        table += `
            <tr>
                <td>P${p.id}</td>
                <td>${p.at}</td>
                <td>${p.bt}</td>
                <td>${p.ct}</td>
                <td>${p.tat}</td>
                <td>${p.wt}</td>
            </tr>
        `;
    });
    table += '</table>';

    resultsDiv.innerHTML = `
        ${table}
        <div class="results-summary">
            <p>Average Turnaround Time: ${avgTAT.toFixed(2)}</p>
            <p>Average Waiting Time: ${avgWT.toFixed(2)}</p>
        </div>
    `;
}

function drawGanttChart(ganttChart) {
    const ganttDiv = document.getElementById('ganttChart');
    ganttDiv.innerHTML = '<h3>Gantt Chart</h3>';
    
    const chart = document.createElement('div');
    chart.className = 'gantt-chart';
    chart.style.display = 'flex';
    chart.style.alignItems = 'center';
    chart.style.overflowX = 'auto';
    chart.style.marginTop = '20px';

    ganttChart.forEach(block => {
        const div = document.createElement('div');
        div.className = 'gantt-block';
        div.style.minWidth = '50px';
        div.innerHTML = `P${block.process}<br>${block.startTime} - ${block.endTime}`;
        chart.appendChild(div);
    });

    ganttDiv.appendChild(chart);
}

window.onload = () => generateProcessInputs(); 