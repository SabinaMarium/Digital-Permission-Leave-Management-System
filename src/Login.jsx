import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (studentId && password) {
      navigate("/register");
    } else {
      alert("Fill all fields");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 to-pink-100">
      <div className="bg-white rounded-2xl shadow-xl w-[900px] flex overflow-hidden">

        {/* Left Image */}
        <div className="w-1/2 bg-indigo-50 flex items-center justify-center p-10">
          <img
            src="https://illustrations.popsy.co/blue/login.svg"
            className="w-full"
            alt="login"
          />
        </div>

        {/* Right Form */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Student ID"
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => setStudentId(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition"
            >
              Submit
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
