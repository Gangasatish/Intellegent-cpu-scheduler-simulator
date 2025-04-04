document.getElementById("algorithm").addEventListener("change", function () {
    let quantumInput = document.getElementById("quantumInput");
    quantumInput.style.display = this.value === "RoundRobin" ? "block" : "none";
});

let processes = [];

function addProcess() {
    let table = document.getElementById("processTable");
    let row = table.insertRow(-1);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);

    let processId = processes.length + 1;
    cell1.innerHTML = processId;

    let arrivalInput = document.createElement("input");
    arrivalInput.type = "number";
    arrivalInput.className = "arrival";
    arrivalInput.placeholder = "AT";
    cell2.appendChild(arrivalInput);

    let burstInput = document.createElement("input");
    burstInput.type = "number";
    burstInput.className = "burst";
    burstInput.placeholder = "BT";
    cell3.appendChild(burstInput);

    processes.push({ id: processId, arrival: 0, burst: 0 });
}

function runSimulation() {
    let loading = document.getElementById("loading");
    let output = document.getElementById("output");

    // Show loading animation
    loading.style.display = "block";
    output.style.display = "none";

    let arrivalInputs = document.querySelectorAll(".arrival");
    let burstInputs = document.querySelectorAll(".burst");

    processes = [];

    for (let i = 0; i < arrivalInputs.length; i++) {
        let arrival = parseInt(arrivalInputs[i].value);
        let burst = parseInt(burstInputs[i].value);

        if (!isNaN(arrival) && !isNaN(burst)) {
            processes.push({ id: i + 1, arrival, burst });
        }
    }

    let algorithm = document.getElementById("algorithm").value;
    let quantum = algorithm === "RoundRobin" ? parseInt(document.getElementById("quantum").value) : null;

    // Simulate processing delay for animation
    setTimeout(() => {
        loading.style.display = "none";  // Hide loader
        output.style.display = "block";  // Show results

        if (algorithm === "FCFS") {
            output.innerHTML = generateTable(calculateFCFS(processes));
        } else if (algorithm === "SJF") {
            output.innerHTML = generateTable(calculateSJF(processes));
        } else if (algorithm === "RoundRobin") {
            output.innerHTML = generateTable(calculateRoundRobin(processes, quantum));
        } else {
            output.innerText = "Invalid algorithm selected.";
        }
    }, 2000); // Simulated processing time
}

function calculateFCFS(processes) {
    processes.sort((a, b) => a.arrival - b.arrival);

    let completionTime = 0;
    let result = [];

    processes.forEach(p => {
        completionTime = Math.max(completionTime, p.arrival) + p.burst;
        let turnaroundTime = completionTime - p.arrival;
        let waitingTime = turnaroundTime - p.burst;

        result.push({ id: p.id, arrival: p.arrival, burst: p.burst, completion: completionTime, turnaround: turnaroundTime, waiting: waitingTime });
    });

    return result;
}

function calculateSJF(processes) {
    let time = 0, completed = 0;
    let result = [], processList = [...processes];

    while (completed < processes.length) {
        let readyQueue = processList.filter(p => p.arrival <= time && p.burst > 0);
        if (readyQueue.length === 0) {
            time++;
            continue;
        }

        readyQueue.sort((a, b) => a.burst - b.burst); // Shortest job first
        let current = readyQueue[0];
        let completionTime = time + current.burst;

        let turnaroundTime = completionTime - current.arrival;
        let waitingTime = turnaroundTime - current.burst;

        result.push({ id: current.id, arrival: current.arrival, burst: current.burst, completion: completionTime, turnaround: turnaroundTime, waiting: waitingTime });

        time = completionTime;
        processList = processList.filter(p => p.id !== current.id);
        completed++;
    }

    return result;
}

function calculateRoundRobin(processes, quantum) {
    let time = 0, queue = [...processes];
    let remaining = queue.map(p => ({ ...p, remainingBurst: p.burst }));
    let result = [];
    let completionTimes = {};

    while (remaining.length > 0) {
        let current = remaining.shift();
        
        if (current.remainingBurst > quantum) {
            time += quantum;
            current.remainingBurst -= quantum;
            remaining.push(current);
        } else {
            time += current.remainingBurst;
            completionTimes[current.id] = time;
            let turnaroundTime = completionTimes[current.id] - current.arrival;
            let waitingTime = turnaroundTime - current.burst;
            result.push({ id: current.id, arrival: current.arrival, burst: current.burst, completion: completionTimes[current.id], turnaround: turnaroundTime, waiting: waitingTime });
        }
    }

    result.sort((a, b) => a.id - b.id);
    return result;
}

function generateTable(data) {
    let tableHTML = `<table border='1' cellpadding='5' cellspacing='0'>
        <tr>
            <th>Process ID</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Completion Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
        </tr>`;

    data.forEach(p => {
        tableHTML += `<tr>
            <td>${p.id}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.completion}</td>
            <td>${p.turnaround}</td>
            <td>${p.waiting}</td>
        </tr>`;
    });

    tableHTML += `</table>`;
    return tableHTML;
}
