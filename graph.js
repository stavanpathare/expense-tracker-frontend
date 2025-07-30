const backendURL = "https://expense-tracker-backend-vw56.onrender.com";

// ========== INIT ========== //
document.addEventListener("DOMContentLoaded", () => {
  drawBudgetCategoryPieChart();
  drawSavingsVsBudgetChart();
  drawMonthlyExpensesLineChart();
});

// ========== PIE CHART: Current Month Budget by Category ========== //
async function drawBudgetCategoryPieChart() {
  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    const res = await fetch(`${backendURL}/api/budgets/${userId}`);
    const budgets = await res.json();

    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    const labels = currentMonthBudgets.map(b => b.category);
    const data = currentMonthBudgets.map(b => parseFloat(b.amount));

    const softColors = [
      "#A0C4FF", "#B9FBC0", "#FFD6A5",
      "#FFC6FF", "#FDFFB6", "#D0F4DE"
    ];

    const ctx = document.getElementById("budgetPieChart").getContext("2d");

    new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          label: "Budget by Category",
          data,
          backgroundColor: softColors.slice(0, labels.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#fff",
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          title: {
            display: true,
            text: "Current Month Budget Allocation",
            color: "#fff",
            padding: 10
          }
        }
      }
    });

  } catch (err) {
    console.error("Pie chart load error:", err);
  }
}

// ========== BAR CHART: Monthly Savings vs Budget ========== //
async function drawSavingsVsBudgetChart() {
  const userId = localStorage.getItem("userId");

  try {
    const [budgetsRes, savingsRes] = await Promise.all([
      fetch(`${backendURL}/api/budgets/${userId}`),
      fetch(`${backendURL}/api/savings/${userId}`)
    ]);

    const budgets = await budgetsRes.json();
    const savings = await savingsRes.json();

    const monthMap = {};

    budgets.forEach(b => {
      if (!monthMap[b.month]) monthMap[b.month] = { budget: 0, savings: 0 };
      monthMap[b.month].budget += parseFloat(b.amount);
    });

    savings.forEach(s => {
      if (!monthMap[s.month]) monthMap[s.month] = { budget: 0, savings: 0 };
      monthMap[s.month].savings = parseFloat(s.saved);
    });

    const months = Object.keys(monthMap).sort();
    const budgetValues = months.map(m => monthMap[m].budget);
    const savingsValues = months.map(m => monthMap[m].savings);
    const labels = months.map(m =>
      new Date(m + "-01").toLocaleString("default", { month: "short", year: "numeric" })
    );

    const ctx = document.getElementById("savingsVsBudgetChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Budget",
            data: budgetValues,
            backgroundColor: "rgba(54, 162, 235, 0.6)"
          },
          {
            label: "Savings",
            data: savingsValues,
            backgroundColor: "rgba(75, 192, 192, 0.6)"
          }
        ]
      },
      options: {
         responsive: true,
  maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
              font: { size: 14, weight: "bold" }
            }
          },
          title: {
            display: true,
            text: "Budget vs Savings (Monthly)",
            color: "#fff"
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#fff",
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#fff",
              font: { size: 12 }
            }
          }
        }
      }
    });

  } catch (err) {
    console.error("Bar chart load error:", err);
  }
}


// EXPENSES 
async function drawMonthlyExpensesLineChart() {
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch(`${backendURL}/api/expenses/${userId}`);
    const expenses = await res.json();

    const monthMap = {};

    expenses.forEach(e => {
      const month = e.date.slice(0, 7); // YYYY-MM
      if (!monthMap[month]) monthMap[month] = 0;
      monthMap[month] += parseFloat(e.amount);
    });

    const months = Object.keys(monthMap).sort();
    const values = months.map(m => monthMap[m]);

    const labels = months.map(m =>
      new Date(m + "-01").toLocaleString("default", { month: "short", year: "numeric" })
    );

    const ctx = document.getElementById("monthlyExpenseChart").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Total Expenses",
          data: values,
          fill: false,
          borderColor: "#f87171", // soft red
          backgroundColor: "#f87171",
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
              font: { size: 14 }
            }
          },
          title: {
            display: true,
            text: "Monthly Expense Trend",
            color: "#fff"
          }
        },
        scales: {
          x: {
            ticks: { color: "#fff" }
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#fff" }
          }
        }
      }
    });

  } catch (err) {
    console.error("Line chart error:", err);
  }
}
