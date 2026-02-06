import { useState } from "react";

function Register() {
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 to-pink-100">
      <div className="bg-white rounded-2xl shadow-xl w-[900px] flex overflow-hidden">

        {/* Left Illustration */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-10">
          <img
            src="https://illustrations.popsy.co/blue/student.svg"
            className="w-full"
            alt="register"
          />
        </div>

        {/* Right Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Create Account
          </h2>

          <form className="grid grid-cols-2 gap-3">
            <input className="border px-3 py-2 rounded" name="firstName" placeholder="First Name" onChange={handleChange} />
            <input className="border px-3 py-2 rounded" name="lastName" placeholder="Last Name" onChange={handleChange} />

            <input className="border px-3 py-2 rounded" name="email" placeholder="Email" />
            <input className="border px-3 py-2 rounded" name="phone" placeholder="Phone" />

            <input className="border px-3 py-2 rounded col-span-2" name="department" placeholder="Department" />

            <input type="password" className="border px-3 py-2 rounded" placeholder="Password" />
            <input type="password" className="border px-3 py-2 rounded" placeholder="Confirm Password" />

            <button className="col-span-2 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition">
              Submit
            </button>
          </form>

          <p className="text-sm text-center mt-3 text-gray-500">
            Already have an account? Login
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
