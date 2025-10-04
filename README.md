# CPU Scheduling Simulator (Interactive Web App)

## 🌟 Project Description

This project is an **interactive web-based CPU scheduling simulator** designed to help users understand how different operating system scheduling algorithms manage processes. Built using **HTML, Tailwind CSS, and pure JavaScript**, the application provides a clean, user-friendly interface where you can dynamically input custom processes and visualize the simulation results.

### Key Features:
* **Dynamic Process Input:** Add custom processes defined by Arrival Time (AT), Burst Time (BT), and Priority.
* **Four Algorithms Simulated:** FCFS (First-Come, First-Served), SJF (Shortest Job First - Non-Preemptive), Priority (Non-Preemptive), and Round Robin (with configurable Time Quantum).
* **Visual Gantt Chart:** A dynamic, scaled visualization of the CPU timeline showing process execution and idle time.
* **Performance Metrics:** Automatic calculation and display of **Average Waiting Time (AWT)** and **Average Turnaround Time (ATT)**.

---

## 🛠️ Technologies Used

* **Frontend Structure:** HTML5
* **Styling & UI:** Tailwind CSS (via CDN)
* **Logic:** Pure JavaScript (ES6+) - All scheduling algorithms are implemented in `script.js`.

---

## 🚀 How to Run Locally

Since this is a client-side application, you do not need any backend dependencies (like Python or Node.js) to run it.

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/cpu-scheduling-simulator-web.git](https://github.com/YOUR_USERNAME/cpu-scheduling-simulator-web.git)
    ```

2.  **Navigate to the Directory:**
    ```bash
    cd cpu-scheduling-simulator-web
    ```

3.  **Open the Application:**
    Simply open the **`index.html`** file in your preferred web browser (Chrome, Firefox, etc.).

---

## 💡 How to Use the Simulator

1.  **Process Management:** Use the input fields in the left column to define a process by setting its **Arrival Time**, **Burst Time**, and **Priority**. Click **`+ Add Process`**.
    * *(The app is pre-populated with example data, but you can clear it using the **`Clear All`** button.)*
2.  **Select Algorithm:** Choose the desired scheduling algorithm from the dropdown menu. If you select **Round Robin**, set the **Time Quantum**.
3.  **Run Simulation:** Click the **`Run Simulation`** button.
4.  **Analyze Results:**
    * The **Gantt Chart** shows the sequence of execution.
    * The **Detailed Process Results** table provides calculated Completion Time, TAT, and WT for each process.
    * The **Summary Metrics** highlight the overall Average Waiting Time and Average Turnaround Time.

---

## 🤝 Contribution

Contributions are welcome! If you find bugs or have suggestions for new features (like preemption for SJF/Priority, or different visualization methods), feel free to open an issue or submit a pull request.

---

## 👤 Author

* **[Rishi-Is-Cool]** - [[Link to your portfolio or LinkedIn (Optional)](https://www.linkedin.com/in/rishikesh-patil-486194312/)]

---

**Happy Scheduling!** ⏱️
