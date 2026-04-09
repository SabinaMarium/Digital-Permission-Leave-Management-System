// Email pattern & helpers
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register function with password strength validation
function register() {
    let name = document.getElementById("name")?.value.trim();
    let email = document.getElementById("email")?.value.trim();
    let pass = document.getElementById("password")?.value;
    let role = document.getElementById("role")?.value;

    if (!name || !email || !pass || !role) {
        alert("Please fill all fields!");
        return;
    }
    
    if (!emailPattern.test(email)) {
        alert("Enter a valid email address!");
        return;
    }
    
    // Password strength validation
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecial = /[@$!%*?&#]/.test(pass);
    const isLong = pass.length >= 8;
    
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial || !isLong) {
        alert("❌ Password must contain:\n• At least 1 uppercase letter (A-Z)\n• At least 1 lowercase letter (a-z)\n• At least 1 digit (0-9)\n• At least 1 special character (@$!%*?&#)\n• Minimum 8 characters long");
        return;
    }
    
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.email === email)) {
        alert("Email already exists! Try login.");
        return;
    }
    
    users.push({ name, email, pass, role });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! Please login.");
    window.location.href = "index.html";
}

// Login function - now redirects to home.html for users
function login() {
    let email = document.getElementById("loginEmail")?.value.trim();
    let pass = document.getElementById("loginPassword")?.value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let found = users.find(u => u.email === email && u.pass === pass);
    if (!found) {
        alert("Invalid email or password!");
        return;
    }
    localStorage.setItem("currentUser", JSON.stringify(found));
    if (found.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "home.html";  // Changed from dashboard.html to home.html
    }
}

// Logout
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// Auto-setup
window.onload = function() {
    let emailReg = document.getElementById("email");
    let msgSpan = document.getElementById("emailMsg");
    if(emailReg && msgSpan){
        emailReg.addEventListener("input", function(){
            if(!emailPattern.test(emailReg.value)) msgSpan.innerHTML = "❌ Invalid email";
            else msgSpan.innerHTML = "✅ Valid email";
        });
    }
};