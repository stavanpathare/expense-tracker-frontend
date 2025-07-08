const backendURL = "http://localhost:5000";

// ========== AUTH CHECK ==========
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard.html")) {
    if (!localStorage.getItem("token")) {
      window.location.href = "index.html";
    } else {
      getExpenses();
      getBudgets();
    }
  }
});

// ========== UTILITY ==========
function showMessage(text, isError = false) {
  const msg = document.getElementById("message");
  msg.style.display = "block";
  msg.textContent = text;
  msg.style.background = isError ? "#f8d7da" : "#d4edda";
  msg.style.color = isError ? "#721c24" : "#155724";
  setTimeout(() => {
    msg.style.display = "none";
  }, 3000);
}

function clearInputs(ids) {
  ids.forEach(id => document.getElementById(id).value = "");
}

// ========== FORM TOGGLE ==========
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

if (signUpButton && signInButton && container) {
  signUpButton.addEventListener("click", () => container.classList.add("right-panel-active"));
  signInButton.addEventListener("click", () => container.classList.remove("right-panel-active"));
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
      localStorage.setItem("userId", data.user.id);
      window.location.href = "dashboard.html";
    } else {
      showMessage(data.message, true);
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
      showMessage("Signup successful! Please log in.");
      clearInputs(["name", "signupEmail", "signupPassword"]);
    } else {
      showMessage(data.message, true);
    }
  } catch {
    showMessage("Signup failed", true);
  }
}

// ========== EXPENSES ==========
async function addExpense() {
  const userId = localStorage.getItem("userId");
  const expense = {
    userId,
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    description: document.getElementById("description").value,
    isRecurring: false,
    recurrence: "",
    splitWith: [],
    paidBy: "self",
    settled: false,
  };

  try {
    const res = await fetch(`${backendURL}/api/expenses/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });

    if (res.ok) {
      showMessage("Expense added successfully");
      clearInputs(["amount", "category", "date", "description"]);
      getExpenses();
    } else {
      const data = await res.json();
      showMessage(data.message || "Error adding expense", true);
    }
  } catch {
    showMessage("Error adding expense", true);
  }
}

async function getExpenses() {
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch(`${backendURL}/api/expenses/${userId}`);
    const expenses = await res.json();
    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    expenses.forEach(exp => {
      const item = document.createElement("div");
      item.setAttribute("id", `expense-${exp._id}`);
      item.innerHTML = `
        ${exp.date} - ${exp.category}: ₹${exp.amount} (${exp.description})
        <button onclick="showEditExpense('${exp._id}', '${exp.amount}', '${exp.category}', '${exp.date}', '${exp.description}')">Edit</button>
        <button onclick="deleteExpense('${exp._id}')">Delete</button>
      `;
      list.appendChild(item);
    });
  } catch {
    showMessage("Error fetching expenses", true);
  }
}

function showEditExpense(id, amount, category, date, description) {
  const item = document.getElementById(`expense-${id}`);
  item.innerHTML = `
    <input type="number" id="edit-amount-${id}" value="${amount}" />
    <input type="text" id="edit-category-${id}" value="${category}" />
    <input type="date" id="edit-date-${id}" value="${date}" />
    <input type="text" id="edit-description-${id}" value="${description}" />
    <button onclick="saveEditExpense('${id}')">Save</button>
    <button onclick="getExpenses()">Cancel</button>
  `;
}

async function saveEditExpense(id) {
  const amount = document.getElementById(`edit-amount-${id}`).value;
  const category = document.getElementById(`edit-category-${id}`).value;
  const date = document.getElementById(`edit-date-${id}`).value;
  const description = document.getElementById(`edit-description-${id}`).value;

  try {
    const res = await fetch(`${backendURL}/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category, date, description }),
    });

    if (res.ok) {
      showMessage("Expense updated successfully");
      getExpenses();
    } else {
      const data = await res.json();
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

      if (res.ok) {
        showMessage("Expense deleted");
        getExpenses();
      } else {
        const data = await res.json();
        showMessage(data.message || "Error deleting expense", true);
      }
    } catch {
      showMessage("Error deleting expense", true);
    }
  }
}

// ========== BUDGET ==========
async function setBudget() {
  const userId = localStorage.getItem("userId");
  const budget = {
    userId,
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

    if (res.ok) {
      showMessage("Budget set successfully");
      clearInputs(["budgetCategory", "budgetAmount", "budgetMonth"]);
      getBudgets();
    } else {
      const data = await res.json();
      showMessage(data.message || "Error setting budget", true);
    }
  } catch {
    showMessage("Error setting budget", true);
  }
}

async function getBudgets() {
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch(`${backendURL}/api/budgets/${userId}`);
    const budgets = await res.json();
    const list = document.getElementById("budgetList");
    list.innerHTML = "";

    budgets.forEach(budget => {
      const item = document.createElement("div");
      item.textContent = `${budget.month} - ${budget.category}: ₹${budget.amount}`;

      if (budget.amount > 10000) {
        item.style.background = "#ffe0e0";
      }
      list.appendChild(item);
    });
  } catch {
    showMessage("Error fetching budgets", true);
  }
}

// ========== LOGOUT ==========
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
