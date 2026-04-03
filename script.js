const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email validation
const emailInput = document.getElementById("email");
const emailMsg = document.getElementById("emailMsg");

emailInput?.addEventListener("input", function () {
    let email = emailInput.value;

    if (!emailPattern.test(email)) {
        emailMsg.textContent = "❌ Invalid Email";
        emailMsg.style.color = "red";
    } else {
        emailMsg.textContent = "✅ Valid Email";
        emailMsg.style.color = "green";
    }
});

// REGISTER
function register() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if (!name || !email || !pass || !role) {
        alert("Fill all fields!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    users.push({ name, email, pass, role });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered Successfully!");
    window.location.href = "index.html";
}

// LOGIN
function login() {
    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let found = users.find(u => u.email === email && u.pass === pass);

    if (!found) {
        alert("Invalid login!");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(found));

    if (found.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "dashboard.html";
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// USER LEAVE
function submitLeave() {
    let name = document.getElementById("studentName").value;
    let type = document.getElementById("leaveType").value;
    let from = document.getElementById("fromDate").value;
    let to = document.getElementById("toDate").value;

    let leaves = JSON.parse(localStorage.getItem("leaves")) || [];

    leaves.push({ name, type, from, to });

    localStorage.setItem("leaves", JSON.stringify(leaves));

    showLeaves();
}

// SHOW USER LEAVES
function showLeaves() {
    let list = document.getElementById("list");
    if (!list) return;

    let leaves = JSON.parse(localStorage.getItem("leaves")) || [];

    list.innerHTML = "";

    leaves.forEach(l => {
        let li = document.createElement("li");
        li.textContent = `${l.name} - ${l.type}`;
        list.appendChild(li);
    });
}

// ADMIN VIEW
function showAdmin() {
    let list = document.getElementById("adminList");
    if (!list) return;

    let leaves = JSON.parse(localStorage.getItem("leaves")) || [];

    list.innerHTML = "";

    leaves.forEach(l => {
        let li = document.createElement("li");
        li.textContent = `${l.name} - ${l.type}`;
        list.appendChild(li);
    });
}

// AUTO LOAD
window.onload = function () {
    showLeaves();
    showAdmin();
};