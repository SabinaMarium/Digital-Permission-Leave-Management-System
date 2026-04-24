// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtQx8RJ3QbAAxZOwthz4YqWeq-DOC5rGg",
    authDomain: "eduleave-system.firebaseapp.com",
    projectId: "eduleave-system",
    storageBucket: "eduleave-system.firebasestorage.app",
    messagingSenderId: "311349906309",
    appId: "1:311349906309:web:bf5391e233cd186943d2ec"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============ REGISTER ============
async function register() {
    let name = document.getElementById("name")?.value.trim();
    let email = document.getElementById("email")?.value.trim();
    let pass = document.getElementById("password")?.value;
    let confirmPwd = document.getElementById("confirmPassword")?.value;
    let role = document.getElementById("role")?.value;

    if (!name || !email || !pass || !confirmPwd || !role) {
        alert("Please fill all fields!");
        return;
    }
    if (!emailPattern.test(email)) {
        alert("Enter a valid email address!");
        return;
    }
    if (pass !== confirmPwd) {
        alert("❌ Passwords do not match!");
        return;
    }
    
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecial = /[@$!%*?&#]/.test(pass);
    const isLong = pass.length >= 8;
    
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial || !isLong) {
        alert("❌ Password must contain: Uppercase, Lowercase, Digit, Special character (@$!%*?&#) and min 8 characters!");
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;
        await db.collection("users").doc(user.uid).set({
            name: name, email: email, role: role, createdAt: new Date().toISOString()
        });
        alert("✅ Registration successful! Please login.");
        window.location.href = "index.html";
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') alert("Email already exists! Try login.");
        else if (error.code === 'auth/invalid-email') alert("Invalid email format!");
        else if (error.code === 'auth/weak-password') alert("Password is too weak!");
        else alert(error.message);
    }
}

// ============ LOGIN ============
async function login() {
    let email = document.getElementById("loginEmail")?.value.trim();
    let password = document.getElementById("loginPassword")?.value;
    let errorDiv = document.getElementById("loginError");
    
    if (!email || !password) {
        if (errorDiv) errorDiv.innerText = "Please fill all fields!";
        return;
    }
    if (errorDiv) errorDiv.innerText = "";
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData) throw new Error("User data not found!");
        
        sessionStorage.setItem("currentUser", JSON.stringify({
            id: user.uid, name: userData.name, email: user.email, role: userData.role
        }));
        
        if (userData.role === "admin") window.location.href = "admin.html";
        else window.location.href = "home.html";
    } catch (error) {
        if (errorDiv) {
            if (error.code === 'auth/user-not-found') errorDiv.innerText = "No user found with this email!";
            else if (error.code === 'auth/wrong-password') errorDiv.innerText = "Wrong password!";
            else if (error.code === 'auth/invalid-email') errorDiv.innerText = "Invalid email format!";
            else errorDiv.innerText = error.message;
        }
    }
}

// ============ LOGOUT ============
async function logout() {
    try { await auth.signOut(); } catch(e) { console.error(e); }
    sessionStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// ============ GET CURRENT USER ============
function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// ============ SUBMIT LEAVE ============
async function submitLeave() {
    let current = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!current) {
        const user = await getCurrentUser();
        if (!user) { alert("Please login again"); window.location.href = "index.html"; return; }
        const userDoc = await db.collection("users").doc(user.uid).get();
        current = { id: user.uid, name: userDoc.data()?.name, email: user.email, role: userDoc.data()?.role };
        sessionStorage.setItem("currentUser", JSON.stringify(current));
    }
    
    let name = document.getElementById("studentName")?.value.trim();
    let type = document.getElementById("leaveType")?.value;
    let from = document.getElementById("fromDate")?.value;
    let to = document.getElementById("toDate")?.value;
    let reason = document.getElementById("leaveReason")?.value.trim();
    
    if (!name || !from || !to || !reason) {
        alert("Please fill all fields!");
        return;
    }
    if (new Date(from) > new Date(to)) {
        alert("End date cannot be before start date!");
        return;
    }
    
    try {
        await db.collection("leaves").add({
            userName: name, userEmail: current.email, userId: current.id,
            type: type, from: from, to: to, reason: reason,
            status: "Pending", timestamp: new Date().toISOString()
        });
        alert("✅ Leave request submitted!");
        document.getElementById("fromDate").value = "";
        document.getElementById("toDate").value = "";
        document.getElementById("leaveReason").value = "";
    } catch(e) { alert("Failed to submit!"); }
}

// ============ SUBMIT PERMISSION ============
async function submitPermission() {
    let current = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!current) {
        const user = await getCurrentUser();
        if (!user) { alert("Please login again"); window.location.href = "index.html"; return; }
        const userDoc = await db.collection("users").doc(user.uid).get();
        current = { id: user.uid, name: userDoc.data()?.name, email: user.email, role: userDoc.data()?.role };
        sessionStorage.setItem("currentUser", JSON.stringify(current));
    }
    
    let name = document.getElementById("studentName")?.value.trim();
    let purpose = document.getElementById("purposeType")?.value;
    let startTime = document.getElementById("startTime")?.value;
    let endTime = document.getElementById("endTime")?.value;
    let date = document.getElementById("permissionDate")?.value;
    let reason = document.getElementById("permissionReason")?.value.trim();
    
    if (!name || !purpose || !startTime || !endTime || !date || !reason) {
        alert("Please fill all fields!");
        return;
    }
    if (startTime >= endTime) {
        alert("End time must be after start time!");
        return;
    }
    
    let [startHour, startMinute] = startTime.split(':').map(Number);
    let [endHour, endMinute] = endTime.split(':').map(Number);
    let diffMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    let hours = Math.floor(diffMinutes / 60);
    let minutes = diffMinutes % 60;
    let duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    try {
        await db.collection("permissions").add({
            userName: name, userEmail: current.email, userId: current.id,
            purpose: purpose, startTime: startTime, endTime: endTime, date: date,
            duration: duration, reason: reason, status: "Pending", timestamp: new Date().toISOString()
        });
        alert("✅ Permission request submitted!");
        document.getElementById("startTime").value = "";
        document.getElementById("endTime").value = "";
        document.getElementById("permissionDate").value = "";
        document.getElementById("permissionReason").value = "";
    } catch(e) { alert("Failed to submit!"); }
}

// Auth state listener for home page
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.data();
        if (userData) {
            sessionStorage.setItem("currentUser", JSON.stringify({
                id: user.uid, name: userData.name, email: user.email, role: userData.role
            }));
        }
    }
});