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

function calculateRR() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
    const processes = [];
    const ganttChart = [];
    const readyQueue = [];

    // Initialize processes
    for(let i = 0; i < numProcesses; i++) {
        processes.push({
            id: i + 1,
            at: parseInt(document.getElementById(`at_${i}`).value),
            bt: parseInt(document.getElementById(`bt_${i}`).value),
            remainingTime: parseInt(document.getElementById(`bt_${i}`).value),
            ct: 0,
            tat: 0,
            wt: 0
        });
    }

    // Sort processes by arrival time
    processes.sort((a, b) => a.at - b.at);

    let currentTime = 0;
    let completedProcesses = 0;
    let index = 0;

    // Add initial processes to ready queue
    while(index < numProcesses && processes[index].at <= currentTime) {
        readyQueue.push(index);
        index++;
    }

    // Process until ready queue is empty
    while(readyQueue.length > 0) {
        const currentProcessIndex = readyQueue.shift();
        const executeTime = Math.min(timeQuantum, processes[currentProcessIndex].remainingTime);

        // Add to Gantt chart
        ganttChart.push({
            process: processes[currentProcessIndex].id,
            startTime: currentTime,
            endTime: currentTime + executeTime
        });

        currentTime += executeTime;
        processes[currentProcessIndex].remainingTime -= executeTime;

        // Check for newly arrived processes
        while(index < numProcesses && processes[index].at <= currentTime) {
            readyQueue.push(index);
            index++;
        }

        // If process is not completed, add it back to ready queue
        if(processes[currentProcessIndex].remainingTime > 0) {
            readyQueue.push(currentProcessIndex);
        } else {
            processes[currentProcessIndex].ct = currentTime;
            completedProcesses++;
        }
    }

    // Calculate TAT and WT
    let totalTAT = 0, totalWT = 0;
    for(let i = 0; i < numProcesses; i++) {
        processes[i].tat = processes[i].ct - processes[i].at;
        processes[i].wt = processes[i].tat - processes[i].bt;
        totalTAT += processes[i].tat;
        totalWT += processes[i].wt;
    }

    const avgTAT = totalTAT / numProcesses;
    const avgWT = totalWT / numProcesses;

    displayResults(processes, avgTAT, avgWT);
    drawGanttChart(ganttChart);
}

function displayResults(processes, avgTat, avgWt) {
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

    // Sort processes by ID for display
    processes.sort((a, b) => a.id - b.id);

    for(let i = 0; i < processes.length; i++) {
        table += `
            <tr>
                <td>P${processes[i].id}</td>
                <td>${processes[i].at}</td>
                <td>${processes[i].bt}</td>
                <td>${processes[i].ct}</td>
                <td>${processes[i].tat}</td>
                <td>${processes[i].wt}</td>
            </tr>
        `;
    }
    table += '</table>';

    resultsDiv.innerHTML = `
        ${table}
        <div class="results-summary">
            <p>Average Turnaround Time: ${avgTat.toFixed(2)}</p>
            <p>Average Waiting Time: ${avgWt.toFixed(2)}</p>
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

function updateReadyQueue(readyQueue, processes, timeQuantum) {
    const queueItems = document.querySelector('.queue-items');
    
    let html = '';
    readyQueue.forEach(processIndex => {
        const process = processes[processIndex];
        html += `
            <div class="queue-item">
                <div class="process-id">P${process.id}</div>
                <div class="process-info">
                    RT: ${process.remainingTime}
                    <br>
                    TQ: ${timeQuantum}
                </div>
            </div>
        `;
    });

    queueItems.innerHTML = html;
}

window.onload = () => generateProcessInputs(); 