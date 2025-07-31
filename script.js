const backendURL = "https://expense-tracker-backend-vw56.onrender.com";

// ========== INIT ==========
window.addEventListener("pageshow", () => {
  const page = window.location.pathname;

  if (page.includes("dashboard.html")) {
    if (!localStorage.getItem("token")) {
      window.location.href = "index.html";
    } else {
      loadDashboard(); // Always load dashboard data
    }
  }

  const container = document.getElementById("container");
  const signUpBtn = document.getElementById("signUp");
  const signInBtn = document.getElementById("signIn");

  if (signUpBtn && signInBtn && container) {
    signUpBtn.addEventListener("click", () => container.classList.add("active"));
    signInBtn.addEventListener("click", () => container.classList.remove("active"));
  }
});

// ========== DASHBOARD LOADER ==========
function loadDashboard() {
  getExpenses();
  getBudgets();
  getRemainingByCategory();
  getRemainingBudget();
  fetchSavings();
  setupSavingsListeners();
  getSavingsHistory();
}

// ========== UTILITY ==========
function showMessage(text, isError = false) {
  alert(text);
}

function clearInputs(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// ========== AUTH ==========
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${backendURL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id || data.user._id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      window.location.href = "dashboard.html";
    } else {
      showMessage(data.message || "Login failed", true);
    }
  } catch {
    showMessage("Login failed", true);
  }
}

async function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch(`${backendURL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("Signup successful! Please sign in.");
      clearInputs(["name", "signupEmail", "signupPassword"]);
    } else {
      showMessage(data.message || "Signup failed", true);
    }
  } catch {
    showMessage("Signup failed", true);
  }
}

// ========== LOGOUT ==========
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// ========== SAVINGS ==========
function setupSavingsListeners() {
  const savingsSlider = document.getElementById("savingsGoal");
  const savingsValueDisplay = document.getElementById("savingsValue");
  const savedAmountInput = document.getElementById("savedAmount");

  if (savingsSlider && savingsValueDisplay && savedAmountInput) {
    savingsSlider.addEventListener("input", () => {
      const val = Math.round(parseInt(savingsSlider.value) / 100) * 100;
      savingsSlider.value = val;
      savingsValueDisplay.textContent = `₹${val}`;
      updateSavingsBar();
    });

    savedAmountInput.addEventListener("input", updateSavingsBar);
  }
}

function updateSavingsBar() {
  const goal = parseFloat(document.getElementById("savingsGoal").value);
  const saved = parseFloat(document.getElementById("savedAmount").value);
  const bar = document.getElementById("savingsProgress");

  if (!isNaN(goal) && !isNaN(saved) && goal > 0) {
    const percent = Math.min((saved / goal) * 100, 100);
    bar.style.width = `${percent}%`;
  } else {
    bar.style.width = "0%";
  }
}

async function saveSavings() {
  const userId = localStorage.getItem("userId");
  const goal = parseFloat(document.getElementById("savingsGoal").value);
  const saved = parseFloat(document.getElementById("savedAmount").value);
  const month = document.getElementById("savingsMonth").value;

  if (!month) return showMessage("Please select a month for savings", true);

  try {
    const res = await fetch(`${backendURL}/api/savings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, goal, saved, month }),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("Savings updated successfully!");
      updateSavingsBar();
      fetchSavings();
      getSavingsHistory();
    } else {
      showMessage(data.message || "Failed to update savings", true);
    }
  } catch {
    showMessage("Error updating savings", true);
  }
}

async function fetchSavings() {
  const userId = localStorage.getItem("userId");
  const month = document.getElementById("savingsMonth")?.value || new Date().toISOString().slice(0, 7);

  try {
    const res = await fetch(`${backendURL}/api/savings/${userId}?month=${month}`);
    const data = await res.json();

    if (res.ok && data) {
      const slider = document.getElementById("savingsGoal");
      const savedInput = document.getElementById("savedAmount");
      const display = document.getElementById("savingsValue");
      const historyDiv = document.getElementById("savingsHistory");

      if (slider) {
        slider.value = data.goal || 0;
        display.textContent = `₹${data.goal || 0}`;
      }
      if (savedInput) savedInput.value = data.saved || 0;
      if (historyDiv) {
        historyDiv.innerHTML = `
          <p>Previous Goal: ₹${data.goal || 0}</p>
          <p>Previous Saved: ₹${data.saved || 0}</p>
        `;
      }

      updateSavingsBar();
    }
  } catch (err) {
    console.error("Error fetching savings data:", err);
  }
}

async function getSavingsHistory() {
  const userId = localStorage.getItem("userId");
  const list = document.getElementById("savingsHistoryList");
  if (!list) return;

  try {
    const res = await fetch(`${backendURL}/api/savings/${userId}`);
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const sorted = data.sort((a, b) => b.month.localeCompare(a.month));
    list.innerHTML = "";

    sorted.forEach((entry) => {
      const div = document.createElement("div");
      const label = new Date(entry.month + "-01").toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      div.className = "bg-white bg-opacity-10 p-2 rounded mb-2";
      div.innerHTML = `<strong>${label}</strong>: Goal ₹${entry.goal}, Saved ₹${entry.saved}`;
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching savings history:", err);
  }
}

// ========== EXPENSES ==========
async function addExpense() {
  const expense = {
    userId: localStorage.getItem("userId"),
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    description: document.getElementById("description").value,
  };

  try {
    const res = await fetch(`${backendURL}/api/expenses/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("Expense added successfully");
      clearInputs(["amount", "category", "date", "description"]);
      getExpenses();
      getRemainingBudget();
      getRemainingByCategory();
    } else {
      showMessage(data.message || "Error adding expense", true);
    }
  } catch {
    showMessage("Error adding expense", true);
  }
}

async function getExpenses() {
  const userId = localStorage.getItem("userId");
  const container = document.getElementById("expenseList");
  if (!container) return;

  try {
    const res = await fetch(`${backendURL}/api/expenses/${userId}`);
    const expenses = await res.json();

    const grouped = {};
    expenses.forEach((exp) => {
      const monthKey = exp.date.slice(0, 7);
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(exp);
    });

    container.innerHTML = "";
    const sortedMonths = Object.keys(grouped).sort().reverse();
    sortedMonths.forEach((month) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const monthName = new Date(month + "-01").toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      summary.textContent = monthName;
      details.appendChild(summary);

      grouped[month].forEach((exp) => {
        const item = document.createElement("div");
        item.innerHTML = `
          ${exp.date} - ${exp.category}: ₹${exp.amount} (${exp.description})
          <button onclick="editExpense('${exp._id}', '${exp.amount}', '${exp.category}', '${exp.date}', '${exp.description}')">Edit</button>
          <button onclick="deleteExpense('${exp._id}')">Delete</button>
        `;
        details.appendChild(item);
      });

      container.appendChild(details);
    });
  } catch {
    showMessage("Error fetching expenses", true);
  }
}

function editExpense(id, amount, category, date, description) {
  const list = document.getElementById("expenseList");
  list.innerHTML = `
    <input type="number" id="edit-amount" value="${amount}" />
    <input type="text" id="edit-category" value="${category}" />
    <input type="date" id="edit-date" value="${date}" />
    <input type="text" id="edit-description" value="${description}" />
    <button onclick="saveExpense('${id}')">Save</button>
    <button onclick="getExpenses()">Cancel</button>
  `;
}

async function saveExpense(id) {
  const expense = {
    amount: document.getElementById("edit-amount").value,
    category: document.getElementById("edit-category").value,
    date: document.getElementById("edit-date").value,
    description: document.getElementById("edit-description").value,
  };

  try {
    const res = await fetch(`${backendURL}/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("Expense updated successfully");
      getExpenses();
    } else {
      showMessage(data.message || "Error updating expense", true);
    }
  } catch {
    showMessage("Error updating expense", true);
  }
}

async function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense?")) {
    try {
      const res = await fetch(`${backendURL}/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        showMessage("Expense deleted");
        getExpenses();
      } else {
        showMessage(data.message || "Error deleting expense", true);
      }
    } catch {
      showMessage("Error deleting expense", true);
    }
  }
}

// ========== BUDGET ==========
async function setBudget() {
  const budget = {
    userId: localStorage.getItem("userId"),
    category: document.getElementById("budgetCategory").value,
    amount: document.getElementById("budgetAmount").value,
    month: document.getElementById("budgetMonth").value,
  };

  try {
    const res = await fetch(`${backendURL}/api/budgets/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budget),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("Budget set successfully");
      clearInputs(["budgetCategory", "budgetAmount", "budgetMonth"]);
      getBudgets();
    } else {
      showMessage(data.message || "Error setting budget", true);
    }
  } catch {
    showMessage("Error setting budget", true);
  }
}

async function getBudgets() {
  const userId = localStorage.getItem("userId");
  const list = document.getElementById("budgetList");
  if (!list) return;

  try {
    const res = await fetch(`${backendURL}/api/budgets/${userId}`);
    const budgets = await res.json();
    list.innerHTML = "";

    budgets.forEach((budget) => {
      const item = document.createElement("div");
      item.innerHTML = `
        ${budget.month} - ${budget.category}: ₹${budget.amount}
        <button onclick="deleteBudget('${budget._id}')">Delete</button>
      `;
      list.appendChild(item);
    });
  } catch {
    showMessage("Error fetching budgets", true);
  }
}

async function deleteBudget(id) {
  if (confirm("Are you sure you want to delete this budget?")) {
    try {
      const res = await fetch(`${backendURL}/api/budgets/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        showMessage("Budget deleted");
        getBudgets();
      } else {
        showMessage(data.message || "Error deleting budget", true);
      }
    } catch {
      showMessage("Error deleting budget", true);
    }
  }
}

// ========== REMAINING ==========
async function getRemainingBudget() {
  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const display = document.getElementById("remainingBudget");
  if (!display) return;

  try {
    const [budgetRes, expenseRes] = await Promise.all([
      fetch(`${backendURL}/api/budgets/${userId}`),
      fetch(`${backendURL}/api/expenses/${userId}`)
    ]);

    const budgets = await budgetRes.json();
    const expenses = await expenseRes.json();

    const thisMonthBudgets = budgets.filter(b => b.month === currentMonth);
    const totalBudget = thisMonthBudgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const remaining = totalBudget - totalExpenses;
    display.textContent = `₹${remaining.toFixed(2)}`;
  } catch (err) {
    console.error("Error fetching remaining budget:", err);
  }
}

async function getRemainingByCategory() {
  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const display = document.getElementById("remainingByCategory");
  if (!display) return;

  try {
    const [budgetRes, expenseRes] = await Promise.all([
      fetch(`${backendURL}/api/budgets/${userId}`),
      fetch(`${backendURL}/api/expenses/${userId}`)
    ]);

    const budgets = await budgetRes.json();
    const expenses = await expenseRes.json();

    const monthlyBudgets = budgets.filter(b => b.month === currentMonth);
    const categoryMap = {};

    expenses.forEach(exp => {
      const expMonth = exp.date.slice(0, 7);
      if (expMonth !== currentMonth) return;
      if (!categoryMap[exp.category]) categoryMap[exp.category] = 0;
      categoryMap[exp.category] += parseFloat(exp.amount);
    });

    display.innerHTML = "";

    monthlyBudgets.forEach(budget => {
      const spent = categoryMap[budget.category] || 0;
      const remaining = budget.amount - spent;
      const usedPercent = (spent / budget.amount) * 100;

      let alertMsg = "";
      if (usedPercent >= 80) alertMsg = "<span style='color:red'>🔴 Over 80% used!</span>";
      else if (usedPercent >= 60) alertMsg = "<span style='color:orange'>🟠 60%+ used</span>";

      const div = document.createElement("div");
      div.innerHTML = `<strong>${budget.category}</strong>: ₹${remaining.toFixed(2)} left ${alertMsg}`;
      display.appendChild(div);
    });
  } catch (err) {
    console.error("Error in category budget tracker:", err);
  }
}
