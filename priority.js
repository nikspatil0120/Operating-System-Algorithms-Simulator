function generateProcessInputs() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const container = document.getElementById('processInputsContainer');
    
    let table = '<table class="process-table">';
    table += `
        <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Priority</th>
        </tr>
    `;
    
    for(let i = 0; i < numProcesses; i++) {
        table += `
            <tr>
                <td>P${i + 1}</td>
                <td><input type="number" id="at_${i}" min="0" value="0"></td>
                <td><input type="number" id="bt_${i}" min="1" value="1"></td>
                <td><input type="number" id="priority_${i}" min="1" value="1"></td>
            </tr>
        `;
    }
    table += '</table>';
    container.innerHTML = table;
}

function calculatePriority() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const processes = [];
    const ganttChart = [];
    
    // Initialize process arrays
    for(let i = 0; i < numProcesses; i++) {
        processes.push({
            id: i + 1,
            at: parseInt(document.getElementById(`at_${i}`).value),
            bt: parseInt(document.getElementById(`bt_${i}`).value),
            priority: parseInt(document.getElementById(`priority_${i}`).value),
            remainingTime: parseInt(document.getElementById(`bt_${i}`).value),
            ct: 0,
            tat: 0,
            wt: 0,
            completed: false
        });
    }

    // Sort processes by arrival time
    processes.sort((a, b) => {
        if (a.at !== b.at) return a.at - b.at;
        return a.priority - b.priority;
    });

    let currentTime = 0;
    let completedProcesses = 0;
    let prevProcess = null;

    while(completedProcesses < numProcesses) {
        let selectedIndex = -1;
        let highestPriority = Number.MAX_VALUE;

        // Find process with highest priority that has arrived
        for(let i = 0; i < numProcesses; i++) {
            if(processes[i].at <= currentTime && !processes[i].completed) {
                if(processes[i].priority < highestPriority) {
                    highestPriority = processes[i].priority;
                    selectedIndex = i;
                }
                else if(processes[i].priority === highestPriority) {
                    // If same priority, choose the one that arrived earlier
                    if(processes[i].at < processes[selectedIndex].at) {
                        selectedIndex = i;
                    }
                }
            }
        }

        if(selectedIndex !== -1) {
            // Process found to execute
            processes[selectedIndex].remainingTime--;
            
            // Add to Gantt chart if it's a different process
            if(prevProcess !== processes[selectedIndex]) {
                ganttChart.push({
                    process: processes[selectedIndex].id,
                    startTime: currentTime,
                    endTime: currentTime + 1
                });
                prevProcess = processes[selectedIndex];
            } else {
                // Update end time of current process in Gantt chart
                ganttChart[ganttChart.length - 1].endTime = currentTime + 1;
            }

            // Check if process is completed
            if(processes[selectedIndex].remainingTime === 0) {
                completedProcesses++;
                processes[selectedIndex].completed = true;
                processes[selectedIndex].ct = currentTime + 1;
                processes[selectedIndex].tat = processes[selectedIndex].ct - processes[selectedIndex].at;
                processes[selectedIndex].wt = processes[selectedIndex].tat - processes[selectedIndex].bt;
            }
        }
        
        currentTime++;
    }

    // Calculate averages
    const totalTAT = processes.reduce((sum, p) => sum + p.tat, 0);
    const totalWT = processes.reduce((sum, p) => sum + p.wt, 0);
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
                <th>Priority</th>
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
                <td>${processes[i].priority}</td>
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

window.onload = () => generateProcessInputs(); 