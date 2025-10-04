// --- 1. DATA DEFINITION AND STATE ---
let userProcesses = [];
let processIdCounter = 1;

// Fixed set of colors for better visibility in Gantt chart
const processColors = {
    1: '#2563EB', 2: '#DC2626', 3: '#059669', 4: '#F59E0B',
    5: '#9333EA', 6: '#0D9488', 7: '#BE123C', 8: '#1E40AF',
    9: '#CA8A04', 10: '#475569'
};

// Pre-populate with the initial example data for convenience
const initialExampleData = [
    { arrival: 0, burst: 10, priority: 3 },
    { arrival: 1, burst: 5, priority: 1 },
    { arrival: 2, burst: 2, priority: 4 },
    { arrival: 3, burst: 4, priority: 2 },
];

// --- UTILITY FUNCTIONS ---

function showMessage(message, type = 'error') {
    const box = document.getElementById('message-box');
    box.textContent = message;
    box.classList.remove('hidden');
    box.className = `mb-4 p-3 rounded-lg text-sm font-semibold ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
}

function hideMessage() {
    document.getElementById('message-box').classList.add('hidden');
}

function toggleQuantumInput() {
    const algorithm = document.getElementById('algorithm').value;
    const quantumGroup = document.getElementById('quantum-group');
    if (algorithm === 'RR') {
        quantumGroup.classList.remove('hidden');
    } else {
        quantumGroup.classList.add('hidden');
    }
}

// --- 2. PROCESS MANAGEMENT ---

function renderProcessTable() {
    const container = document.getElementById('process-list-table');
    document.getElementById('process-count').textContent = userProcesses.length;

    if (userProcesses.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 p-4">No processes defined. Add some!</p>';
        return;
    }

    let html = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-indigo-50">
                <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">PID</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AT</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BT</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Pri</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    // Sort by Arrival Time for initial display clarity
    const sortedProcesses = [...userProcesses].sort((a, b) => a.arrival - b.arrival || a.pid - b.pid);

    sortedProcesses.forEach(p => {
        const color = processColors[p.pid % 10 + 1] || '#374151';
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-3 py-2 whitespace-nowrap text-sm font-bold" style="color: ${color};">P${p.pid}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${p.arrival}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${p.burst}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${p.priority}</td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function addProcess() {
    hideMessage();
    const arrival = parseInt(document.getElementById('input-arrival').value);
    const burst = parseInt(document.getElementById('input-burst').value);
    const priority = parseInt(document.getElementById('input-priority').value);
    
    if (isNaN(arrival) || isNaN(burst) || isNaN(priority)) {
        showMessage("All fields must be valid numbers.");
        return;
    }
    if (arrival < 0 || burst <= 0 || priority < 1) {
        showMessage("Arrival Time must be ≥ 0, Burst Time must be ≥ 1, and Priority must be ≥ 1.");
        return;
    }

    const colorIndex = processIdCounter % 10 + 1; // Cycle through 10 colors
    const newProcess = {
        pid: processIdCounter, 
        arrival: arrival, 
        burst: burst, 
        priority: priority, 
        original_burst: burst, 
        color: processColors[colorIndex]
    };
    
    userProcesses.push(newProcess);
    processIdCounter++;
    renderProcessTable();
    showMessage(`Process P${newProcess.pid} added successfully.`, 'success');

    // Clear input fields (optional: keep last values or reset)
    document.getElementById('input-arrival').value = arrival;
    document.getElementById('input-burst').value = 5;
    document.getElementById('input-priority').value = 1;
}

function clearProcesses() {
    userProcesses = [];
    processIdCounter = 1;
    renderProcessTable();
    document.getElementById('results-table-container').innerHTML = '';
    document.getElementById('gantt-chart-container').innerHTML = '';
    document.getElementById('summary-metrics').innerHTML = '';
    document.getElementById('simulation-status').textContent = 'Add processes and run the simulation...';
    document.getElementById('simulation-status').className = "text-lg text-gray-500";
    hideMessage();
}

// --- 3. SCHEDULING ALGORITHM IMPLEMENTATIONS (JS) ---

/**
 * Runs the selected scheduling algorithm.
 * Returns: { results: [], gantt: [], avgTat: number, avgWt: number }
 */
function runAlgorithm(algorithm, quantum, processesToRun) {
    if (processesToRun.length === 0) {
        throw new Error("No processes defined to run the simulation.");
    }
    
    // Create a deep copy of processes for simulation
    let processes = processesToRun.map(p => ({ 
        ...p, 
        burst: p.original_burst, 
        remaining: p.original_burst,
        // Ensure all calculation fields are reset
        start: 0, 
        completion: 0, 
        turnaround: 0, 
        waiting: 0 
    }));
    
    let results = [];
    let ganttChart = [];
    let currentTime = 0;
    let completed = 0;

    // Sort by arrival time initially
    processes.sort((a, b) => a.arrival - b.arrival);
    
    // FCFS (First-Come, First-Served) - Non-Preemptive
    if (algorithm === 'FCFS') {
        for (let i = 0; i < processes.length; i++) {
            let p = processes[i];
            if (currentTime < p.arrival) {
                currentTime = p.arrival; // CPU idle
            }
            p.start = currentTime;
            p.completion = currentTime + p.burst;
            
            ganttChart.push({ pid: p.pid, start: currentTime, end: p.completion, color: p.color });
            currentTime = p.completion;
            p.turnaround = p.completion - p.arrival;
            p.waiting = p.turnaround - p.burst;
            results.push(p);
        }
    }

    // SJF (Shortest Job First) or Priority - Non-Preemptive
    else if (algorithm === 'SJF' || algorithm === 'Priority') {
        let readyQueue = [];
        let waitingProcesses = [...processes]; 
        
        while (completed < processes.length) {
            // Add newly arrived processes to the ready queue
            waitingProcesses = waitingProcesses.filter(p => {
                if (p.arrival <= currentTime) {
                    readyQueue.push(p);
                    return false; // Remove from waiting list
                }
                return true; // Keep in waiting list
            });

            if (readyQueue.length === 0) {
                if (waitingProcesses.length > 0) {
                    // CPU is idle, jump to next arrival time
                    currentTime = Math.min(...waitingProcesses.map(p => p.arrival));
                    continue;
                } else {
                    break; // All processes completed
                }
            }

            // Sort the ready queue
            if (algorithm === 'SJF') {
                // Sort by shortest burst time
                readyQueue.sort((a, b) => a.burst - b.burst);
            } else if (algorithm === 'Priority') {
                // Sort by priority (lower number is higher priority)
                readyQueue.sort((a, b) => a.priority - b.priority);
            }
            
            let p = readyQueue.shift(); // Get the selected process
            
            p.start = currentTime;
            p.completion = currentTime + p.burst;
            
            ganttChart.push({ pid: p.pid, start: currentTime, end: p.completion, color: p.color });
            currentTime = p.completion;

            p.turnaround = p.completion - p.arrival;
            p.waiting = p.turnaround - p.burst;
            results.push(p);
            completed++;
        }
    }
    
    // Round Robin (RR) - Preemptive
    else if (algorithm === 'RR') {
        let queue = [];
        let activeProcesses = processes.map(p => ({...p, remaining: p.burst, finished: false}));
        
        // Helper to add new arrivals to queue
        const addNewArrivals = (start, end) => {
            activeProcesses
                .filter(p => !p.finished && p.arrival > start && p.arrival <= end)
                .sort((a, b) => a.arrival - b.arrival)
                .forEach(p => {
                    // Only add if not already in queue
                    if (!queue.some(q => q.pid === p.pid)) {
                        queue.push(p);
                    }
                });
        };
        
        // Start time: first process arrival or 0
        if (activeProcesses.length > 0) {
            currentTime = activeProcesses[0].arrival;
        }
        
        // Initial queue fill
        activeProcesses
            .filter(p => p.arrival <= currentTime)
            .sort((a, b) => a.arrival - b.arrival)
            .forEach(p => queue.push(p));


        while (completed < processes.length) {
            if (queue.length === 0) {
                // Find the next uncompleted process arrival time
                let nextArrivals = activeProcesses
                    .filter(p => !p.finished)
                    .map(p => p.arrival)
                    .filter(a => a > currentTime); // Only look for future arrivals
                    
                if (nextArrivals.length === 0) break;
                
                let nextArrivalTime = Math.min(...nextArrivals);
                currentTime = nextArrivalTime;
                
                // Add process that just arrived
                activeProcesses
                    .filter(p => !p.finished && p.arrival === currentTime)
                    .sort((a, b) => a.arrival - b.arrival)
                    .forEach(p => queue.push(p));
                    
                continue;
            }

            let p = queue.shift();
            let execTime = Math.min(quantum, p.remaining);
            let start = currentTime;

            currentTime += execTime;
            p.remaining -= execTime;

            ganttChart.push({ pid: p.pid, start: start, end: currentTime, color: p.color });

            // Check for new arrivals during this time slice
            addNewArrivals(start, currentTime);

            if (p.remaining === 0) {
                p.completion = currentTime;
                p.turnaround = p.completion - p.arrival;
                p.waiting = p.turnaround - p.original_burst;
                p.finished = true;
                results.push(p);
                completed++;
            } else {
                // Put back at the end of the queue, after any new arrivals
                if (!queue.some(q => q.pid === p.pid)) {
                     queue.push(p);
                }
            }
        }
    }

    // Calculate Averages (must only use the results array)
    const totalTat = results.reduce((sum, p) => sum + p.turnaround, 0);
    const totalWt = results.reduce((sum, p) => sum + p.waiting, 0);
    const avgTat = totalTat / processesToRun.length;
    const avgWt = totalWt / processesToRun.length;
    
    return { results, gantt: ganttChart, avgTat, avgWt };
}

// --- 4. UI RENDERING ---

function renderGanttChart(ganttData) {
    const container = document.getElementById('gantt-chart-container');
    container.innerHTML = '';
    
    if (ganttData.length === 0) return;

    // Determine the total time for scaling
    const totalTime = ganttData.reduce((max, block) => Math.max(max, block.end), 0);
    
    if (totalTime === 0) return;

    // 1. Render Blocks
    let blockHtml = '<div class="flex w-full" style="min-width: 100%;">';
    let lastEndTime = 0;
    
    ganttData.forEach(block => {
        const duration = block.end - block.start;
        
        // Handle idle time (if any)
        if (block.start > lastEndTime) {
            const idleDuration = block.start - lastEndTime;
            // Scale idle block width
            const idleWidth = (idleDuration / totalTime) * 100;
            blockHtml += `
                <div class="gantt-block bg-gray-300 text-gray-700" style="width: ${idleWidth}%; min-width: 30px;" title="Idle: ${idleDuration} units">
                    Idle
                </div>
            `;
        }

        // Render Process Block
        const blockWidth = (duration / totalTime) * 100;
        blockHtml += `
            <div class="gantt-block text-white font-semibold flex items-center justify-center" 
                style="width: ${blockWidth}%; background-color: ${block.color};" 
                title="P${block.pid}: Start=${block.start}, End=${block.end}, Duration=${duration}">
                P${block.pid}
            </div>
        `;
        lastEndTime = block.end;
    });

    blockHtml += '</div>';
    container.innerHTML += blockHtml;

    // 2. Render Time Line
    let timeLineHtml = `<div class="gantt-time-line w-full relative" style="min-width: 100%;">`;
    let uniqueTimes = new Set();
    
    // Collect all unique start and end times
    ganttData.forEach(block => {
        if (block.start !== block.end) {
            uniqueTimes.add(block.start);
            uniqueTimes.add(block.end);
        }
    });
    uniqueTimes.add(0); // Ensure 0 is always marked

    const sortedTimes = Array.from(uniqueTimes).sort((a, b) => a - b);
    
    sortedTimes.forEach(time => {
        const position = (time / totalTime) * 100;
        timeLineHtml += `
            <div class="gantt-time-mark" style="left: ${position}%;">
                ${time}
            </div>
        `;
    });

    timeLineHtml += '</div>';
    container.innerHTML += timeLineHtml;
}


function renderResultsTable(results) {
    const container = document.getElementById('results-table-container');
    container.innerHTML = '';
    
    let html = `
        <table class="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
            <thead class="bg-indigo-600 text-white">
                <tr>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider rounded-tl-xl">PID</th>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Arrival Time</th>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Burst Time</th>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Priority</th>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Completion Time</th>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Turnaround Time</th>
                    <th class="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider rounded-tr-xl">Waiting Time</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    results.sort((a, b) => a.pid - b.pid).forEach(p => {
        const color = processColors[p.pid % 10 + 1] || '#374151';
        html += `
            <tr class="hover:bg-gray-50 transition duration-100">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold" style="color: ${color};">P${p.pid}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${p.arrival}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${p.original_burst}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${p.priority}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-semibold">${p.completion}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 font-semibold">${p.turnaround}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold">${p.waiting}</td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function renderSummaryMetrics(avgTat, avgWt) {
    const container = document.getElementById('summary-metrics');
    container.innerHTML = `
        <div class="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
            <p class="text-sm font-medium text-blue-600">Average Turnaround Time</p>
            <p class="text-3xl font-extrabold text-blue-800 mt-1">${avgTat.toFixed(2)} units</p>
        </div>
        <div class="bg-red-50 p-5 rounded-xl border-2 border-red-200">
            <p class="text-sm font-medium text-red-600">Average Waiting Time</p>
            <p class="text-3xl font-extrabold text-red-800 mt-1">${avgWt.toFixed(2)} units</p>
        </div>
    `;
}

// --- 5. MAIN EXECUTION ---

function runSimulation() {
    const algorithm = document.getElementById('algorithm').value;
    const quantumInput = document.getElementById('quantum').value;
    const quantum = algorithm === 'RR' ? parseInt(quantumInput) : null;
    
    const statusElement = document.getElementById('simulation-status');
    statusElement.textContent = `Preparing ${algorithm} simulation...`;
    statusElement.className = "text-lg text-indigo-600 font-semibold";
    hideMessage();

    if (userProcesses.length === 0) {
         statusElement.textContent = "Error: Please add at least one process before running the simulation.";
         statusElement.className = "text-lg text-red-600 font-semibold";
         return;
    }

    if (algorithm === 'RR' && (isNaN(quantum) || quantum <= 0)) {
        statusElement.textContent = "Error: Please enter a positive Time Quantum (≥ 1) for Round Robin.";
        statusElement.className = "text-lg text-red-600 font-semibold";
        return;
    }

    try {
        // Pass the current userProcesses array to the algorithm
        const { results, gantt, avgTat, avgWt } = runAlgorithm(algorithm, quantum, userProcesses);

        renderResultsTable(results);
        renderGanttChart(gantt);
        renderSummaryMetrics(avgTat, avgWt);

        statusElement.textContent = `Simulation complete for ${algorithm}.`;
        statusElement.className = "text-lg text-green-600 font-semibold";
        
    } catch (error) {
        console.error("Simulation Error:", error);
        statusElement.textContent = `An error occurred during simulation: ${error.message}`;
        statusElement.className = "text-lg text-red-600 font-semibold";
    }
}

// Initialize UI and pre-populate processes on load
window.onload = () => {
    initialExampleData.forEach(p => {
        const colorIndex = processIdCounter % 10 + 1;
        userProcesses.push({
            pid: processIdCounter, 
            arrival: p.arrival, 
            burst: p.burst, 
            priority: p.priority, 
            original_burst: p.burst, 
            color: processColors[colorIndex]
        });
        processIdCounter++;
    });

    renderProcessTable();
    toggleQuantumInput();
};
