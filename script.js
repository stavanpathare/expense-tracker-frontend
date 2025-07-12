const backendURL = "https://expense-tracker-backend-vw56.onrender.com";

// ========== INIT & AUTH ==========
document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname;

  if (page.includes("dashboard.html")) {
    if (!localStorage.getItem("token")) {
      window.location.href = "index.html";
    } else {
      getExpenses();
      getBudgets();
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
    } else {
      showMessage(data.message || "Error adding expense", true);
    }
  } catch {
    showMessage("Error adding expense", true);
  }
}

async function getExpenses() {
  const userId = localStorage.getItem("userId");
  const list = document.getElementById("expenseList");
  if (!list) return;

  try {
    const res = await fetch(`${backendURL}/api/expenses/${userId}`);
    const expenses = await res.json();
    list.innerHTML = "";

    expenses.forEach(exp => {
      const item = document.createElement("div");
      item.innerHTML = `
        ${exp.date} - ${exp.category}: ₹${exp.amount} (${exp.description})
        <button onclick="deleteExpense('${exp._id}')">Delete</button>
      `;
      list.appendChild(item);
    });
  } catch {
    showMessage("Error fetching expenses", true);
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

    budgets.forEach(budget => {
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

// ========== LOGOUT ==========
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
