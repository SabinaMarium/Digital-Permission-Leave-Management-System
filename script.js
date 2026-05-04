const firebaseConfig = {
    apiKey: "AIzaSyBtQx8RJ3QbAAxZOwthz4YqWeq-DOC5rGg",
    authDomain: "eduleave-system.firebaseapp.com",
    projectId: "eduleave-system",
    storageBucket: "eduleave-system.firebasestorage.app",
    messagingSenderId: "311349906309",
    appId: "1:311349906309:web:bf5391e233cd186943d2ec"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

window.register = async function() {
    let name = document.getElementById("name")?.value.trim();
    let email = document.getElementById("email")?.value.trim();
    let role = document.getElementById("role")?.value;
    let pass = document.getElementById("password")?.value;
    let confirmPwd = document.getElementById("confirmPassword")?.value;
    let errorDiv = document.getElementById("registerError");
    let successDiv = document.getElementById("registerSuccess");
    
    if (errorDiv) { errorDiv.innerHTML = ""; successDiv.innerHTML = ""; }
    if (!name || !email || !role || !pass || !confirmPwd) {
        if (errorDiv) errorDiv.innerHTML = "Please fill all required fields!";
        return;
    }
    if (!emailPattern.test(email)) { if (errorDiv) errorDiv.innerHTML = "Enter a valid email address!"; return; }
    if (pass !== confirmPwd) { if (errorDiv) errorDiv.innerHTML = "Passwords do not match!"; return; }
    
    const hasUpper = /[A-Z]/.test(pass), hasLower = /[a-z]/.test(pass), hasDigit = /[0-9]/.test(pass), hasSpecial = /[@$!%*?&#]/.test(pass), isLong = pass.length >= 8;
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial || !isLong) {
        if (errorDiv) errorDiv.innerHTML = "Password must contain: Uppercase, Lowercase, Digit, Special character and min 8 characters!";
        return;
    }
    
    let department = "", batch = "", studentId = "";
    if (role === "user") {
        department = document.getElementById("userDepartment")?.value;
        batch = document.getElementById("batch")?.value;
        studentId = document.getElementById("studentId")?.value.trim();
        if (!department || !batch || !studentId) {
            if (errorDiv) errorDiv.innerHTML = "Please fill Department, Batch and ID!";
            return;
        }
    } else if (role === "admin") {
        department = document.getElementById("adminDepartment")?.value;
        if (!department) {
            if (errorDiv) errorDiv.innerHTML = "Please select Department!";
            return;
        }
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const userData = { name, email, department, role, createdAt: new Date().toISOString() };
        if (role === "user") { userData.batch = batch; userData.studentId = studentId; }
        await db.collection("users").doc(userCredential.user.uid).set(userData);
        if (successDiv) successDiv.innerHTML = "Registration successful! Redirecting to login...";
        setTimeout(() => { window.location.href = "index.html"; }, 2000);
    } catch (error) {
        if (errorDiv) {
            if (error.code === 'auth/email-already-in-use') errorDiv.innerHTML = "Email already exists! Try login.";
            else if (error.code === 'auth/invalid-email') errorDiv.innerHTML = "Invalid email format!";
            else if (error.code === 'auth/weak-password') errorDiv.innerHTML = "Password is too weak!";
            else errorDiv.innerHTML = error.message;
        }
    }
};

window.login = async function() {
    let email = document.getElementById("loginEmail")?.value.trim();
    let password = document.getElementById("loginPassword")?.value;
    let errorDiv = document.getElementById("loginError");
    if (!email || !password) { if (errorDiv) errorDiv.innerText = "Please fill all fields!"; return; }
    if (errorDiv) errorDiv.innerText = "";
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userDoc = await db.collection("users").doc(userCredential.user.uid).get();
        const userData = userDoc.data();
        if (!userData) throw new Error("User data not found!");
        sessionStorage.setItem("currentUser", JSON.stringify({ id: userCredential.user.uid, name: userData.name, email: userCredential.user.email, role: userData.role }));
        window.location.href = userData.role === "admin" ? "admin.html" : "home.html";
    } catch (error) {
        if (errorDiv) {
            if (error.code === 'auth/user-not-found') errorDiv.innerText = "No user found with this email!";
            else if (error.code === 'auth/wrong-password') errorDiv.innerText = "Wrong password!";
            else if (error.code === 'auth/invalid-email') errorDiv.innerText = "Invalid email format!";
            else if (error.code === 'auth/too-many-requests') errorDiv.innerText = "Too many failed attempts. Try again later.";
            else errorDiv.innerText = error.message;
        }
    }
};

window.logout = async function() {
    try { await auth.signOut(); } catch(e) { console.error(e); }
    sessionStorage.removeItem("currentUser");
    window.location.href = "index.html";
};

function getCurrentUser() {
    return new Promise((resolve) => { const unsubscribe = auth.onAuthStateChanged((user) => { unsubscribe(); resolve(user); }); });
}

window.loadAdmins = async function(department) {
    if (!department) return;
    const adminsSnapshot = await db.collection("users").where("role", "==", "admin").where("department", "==", department).get();
    const adminSelect = document.getElementById("adminSelect");
    if (adminSelect) {
        adminSelect.innerHTML = '<option value="">Select Administrator</option>';
        adminsSnapshot.forEach(doc => { const admin = doc.data(); adminSelect.innerHTML += `<option value="${admin.email}|${admin.name}">${admin.name}</option>`; });
    }
};

window.submitLeave = async function() {
    const user = auth.currentUser;
    if (!user) { alert("Please login again"); window.location.href = "index.html"; return; }
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    let department = document.getElementById("department")?.value;
    let name = document.getElementById("studentName")?.value.trim();
    let adminValue = document.getElementById("adminSelect")?.value;
    let [adminEmail, adminName] = adminValue ? adminValue.split("|") : [];
    let type = document.getElementById("leaveType")?.value;
    let from = document.getElementById("fromDate")?.value;
    let to = document.getElementById("toDate")?.value;
    let reason = document.getElementById("leaveReason")?.value.trim();
    if (!department || !name || !adminEmail || !from || !to || !reason) { alert("Please fill all fields!"); return; }
    if (new Date(from) > new Date(to)) { alert("End date cannot be before start date!"); return; }
    try {
        await db.collection("leaves").add({ userName: name, userEmail: user.email, department, batch: userData.batch || "", studentId: userData.studentId || "", fromDate: from, toDate: to, reason, type, adminEmail, adminName, status: "Pending", timestamp: new Date().toISOString() });
        alert("Leave request submitted!");
        document.getElementById("fromDate").value = ""; document.getElementById("toDate").value = ""; document.getElementById("leaveReason").value = "";
        if (document.getElementById("adminSelect")) document.getElementById("adminSelect").innerHTML = '<option value="">Select Administrator</option>';
    } catch(e) { alert("Failed to submit!"); }
};

window.submitPermission = async function() {
    const user = auth.currentUser;
    if (!user) { alert("Please login again"); window.location.href = "index.html"; return; }
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    let department = document.getElementById("department")?.value;
    let name = document.getElementById("studentName")?.value.trim();
    let adminValue = document.getElementById("adminSelect")?.value;
    let [adminEmail, adminName] = adminValue ? adminValue.split("|") : [];
    let purpose = document.getElementById("purposeType")?.value;
    let startTime = document.getElementById("startTime")?.value;
    let endTime = document.getElementById("endTime")?.value;
    let date = document.getElementById("permissionDate")?.value;
    let reason = document.getElementById("permissionReason")?.value.trim();
    if (!department || !name || !adminEmail || !purpose || !startTime || !endTime || !date || !reason) { alert("Please fill all fields!"); return; }
    if (startTime >= endTime) { alert("End time must be after start time!"); return; }
    let [sh, sm] = startTime.split(':').map(Number), [eh, em] = endTime.split(':').map(Number);
    let diff = (eh*60+em) - (sh*60+sm), hours = Math.floor(diff/60), minutes = diff%60;
    let duration = hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours>1?'s':''}`) : `${minutes} minutes`;
    try {
        await db.collection("permissions").add({ userName: name, userEmail: user.email, department, batch: userData.batch || "", studentId: userData.studentId || "", purpose, startTime, endTime, date, duration, reason, adminEmail, adminName, status: "Pending", timestamp: new Date().toISOString() });
        alert("Permission request submitted!");
        document.getElementById("startTime").value = ""; document.getElementById("endTime").value = ""; document.getElementById("permissionDate").value = ""; document.getElementById("permissionReason").value = "";
        if (document.getElementById("adminSelect")) document.getElementById("adminSelect").innerHTML = '<option value="">Select Administrator</option>';
    } catch(e) { alert("Failed to submit!"); }
};

window.onload = function() {
    const departmentSelect = document.getElementById("department");
    if (departmentSelect) departmentSelect.addEventListener("change", function() { loadAdmins(this.value); });
};