const backendURL = "https://expense-tracker-backend-vw56.onrender.com";

// ========== INIT ========== //
document.addEventListener("DOMContentLoaded", () => {
  // drawBudgetCategoryPieChart();
  drawSavingsVsBudgetChart();
  drawMonthlyExpensesLineChart();
  drawExpensesByCategoryBarChart();
  drawBudgetCategoryDonutChart();
});

// ========== PIE CHART: Current Month Budget by Category ========== //
// async function drawBudgetCategoryPieChart() {
//   const userId = localStorage.getItem("userId");
//   const currentMonth = new Date().toISOString().slice(0, 7);

//   try {
//     const res = await fetch(`${backendURL}/api/budgets/${userId}`);
//     const budgets = await res.json();

//     const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
//     const labels = currentMonthBudgets.map(b => b.category);
//     const data = currentMonthBudgets.map(b => parseFloat(b.amount));

//     const softColors = [
//       '#4E79A7', // Blue – Food
//   '#F28E2B', // Orange – Travel
//   '#E15759', // Red – Shopping
//   '#76B7B2', // Teal – Health
//   '#59A14F', // Green – Bills
//   '#EDC948', // Yellow – Entertainment
//   '#B07AA1', // Purple – Education
//   '#FF9DA7'  // Pink – Misc
//     ];

//     const ctx = document.getElementById("budgetPieChart").getContext("2d");

//     new Chart(ctx, {
//       type: "pie",
//       data: {
//         labels,
//         datasets: [{
//           label: "Budget by Category",
//           data,
//           backgroundColor: softColors.slice(0, labels.length),
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             position: "bottom",
//             labels: {
//               color: "#fff",
//               font: {
//                 size: 14,
//                 weight: 'bold'
//               }
//             }
//           },
//           title: {
//             display: true,
//             text: "Current Month Budget Allocation",
//             color: "#fff",
//             padding: 10
//           }
//         }
//       }
//     });

//   } catch (err) {
//     console.error("Pie chart load error:", err);
//   }
// }

async function drawBudgetCategoryDonutChart() {
  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    const res = await fetch(`${backendURL}/api/budgets/${userId}`);
    const budgets = await res.json();

    const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);
    const labels = currentMonthBudgets.map((b) => b.category);
    const data = currentMonthBudgets.map((b) => parseFloat(b.amount));

    const softColors = [
      "#4E79A7", // Blue – Food
      "#F28E2B", // Orange – Travel
      "#E15759", // Red – Shopping
      "#76B7B2", // Teal – Health
      "#59A14F", // Green – Bills
      "#EDC948", // Yellow – Entertainment
      "#B07AA1", // Purple – Education
      "#FF9DA7", // Pink – Misc
    ];

    const ctx = document.getElementById("budgetPieChart").getContext("2d");
    new Chart(ctx, {
      type: "doughnut", // 🔁 changed from "pie" to "doughnut"
      data: {
        labels,
        datasets: [
          {
            label: "Budget by Category",
            data,
            backgroundColor: softColors.slice(0, labels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%", // 🍩 thickness of the donut hole
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#fff",
              font: {
                size: 13,
                weight: "bold",
              },
            },
          },
          title: {
            display: true,
            text: "Budget Allocation (Donut)",
            color: "#fff",
            padding: 10,
          },
        },
      },
    });
  } catch (err) {
    console.error("Donut chart load error:", err);
  }
}

// ========== BAR CHART: Monthly Savings vs Budget ========== //
async function drawSavingsVsBudgetChart() {
  const userId = localStorage.getItem("userId");

  try {
    const [budgetsRes, savingsRes] = await Promise.all([
      fetch(`${backendURL}/api/budgets/${userId}`),
      fetch(`${backendURL}/api/savings/${userId}`),
    ]);

    const budgets = await budgetsRes.json();
    const savings = await savingsRes.json();

    const monthMap = {};

    budgets.forEach((b) => {
      if (!monthMap[b.month]) monthMap[b.month] = { budget: 0, savings: 0 };
      monthMap[b.month].budget += parseFloat(b.amount);
    });

    savings.forEach((s) => {
      if (!monthMap[s.month]) monthMap[s.month] = { budget: 0, savings: 0 };
      monthMap[s.month].savings = parseFloat(s.saved);
    });

    const months = Object.keys(monthMap).sort();
    const budgetValues = months.map((m) => monthMap[m].budget);
    const savingsValues = months.map((m) => monthMap[m].savings);
    const labels = months.map((m) =>
      new Date(m + "-01").toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    );

    const ctx = document
      .getElementById("savingsVsBudgetChart")
      .getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Budget",
            data: budgetValues,
            backgroundColor: "#3b82f6",
          },
          {
            label: "Savings",
            data: savingsValues,
            backgroundColor: "#10b981",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
              font: { size: 14, weight: "bold" },
            },
          },
          title: {
            display: true,
            text: "Budget vs Savings (Monthly)",
            color: "#fff",
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#fff",
              font: { size: 12 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#fff",
              font: { size: 12 },
            },
          },
        },
      },
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

    expenses.forEach((e) => {
      const month = e.date.slice(0, 7); // YYYY-MM
      if (!monthMap[month]) monthMap[month] = 0;
      monthMap[month] += parseFloat(e.amount);
    });

    const months = Object.keys(monthMap).sort();
    const values = months.map((m) => monthMap[m]);

    const labels = months.map((m) =>
      new Date(m + "-01").toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    );

    const ctx = document.getElementById("monthlyExpenseChart").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Total Expenses",
            data: values,
            fill: false,
            borderColor: "#f59e0b", // soft red
            backgroundColor: "#f59e0b",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
              font: { size: 14 },
            },
          },
          title: {
            display: true,
            text: "Monthly Expense Trend",
            color: "#fff",
          },
        },
        scales: {
          x: {
            ticks: { color: "#fff" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#fff" },
          },
        },
      },
    });
  } catch (err) {
    console.error("Line chart error:", err);
  }
}

// Expenses Pie CHart
async function drawExpensesByCategoryBarChart() {
  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    const res = await fetch(`${backendURL}/api/expenses/${userId}`);
    const expenses = await res.json();

    const monthlyExpenses = expenses.filter((exp) =>
      exp.date.startsWith(currentMonth)
    );

    // Group by category
    const categoryTotals = {};
    monthlyExpenses.forEach((exp) => {
      const cat = exp.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const ctx = document
      .getElementById("expensesByCategoryChart")
      .getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "₹ Spent",
            data,
            backgroundColor: "#ef4444",
            borderRadius: 5,
          },
        ],
      },
      options: {
        indexAxis: "y", // Horizontal bar
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#fff",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            ticks: {
              color: "#fff",
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Expenses by Category Chart Error:", err);
  }
}

// ========== LOGOUT ==========
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
