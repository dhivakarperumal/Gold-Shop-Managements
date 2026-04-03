import { useState } from "react";
import { auth, dbFirestore } from "../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // 2. Set Display Name
      await updateProfile(user, { displayName: form.username });

      // 3. Save User Details as specified by the user's Firestore schema
      await setDoc(doc(dbFirestore, "users", user.uid), {
        username: form.username,
        email: form.email,
        phone: form.phone,
        role: "user", // Default role
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        employeeId: `EMP${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        uid: user.uid
      });

      toast.success("Registration successful! Welcome.");
      navigate("/");
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error(error.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f6f8] px-4 font-sans">
      <div className="w-[450px] bg-white border border-gray-200 shadow-2xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Join Kanak Gold Management System
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone"
              type="text"
              placeholder="9876543210"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full p-3 pr-10 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full p-3 pr-10 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-lg text-white font-bold bg-[#1b88f3] hover:bg-[#1569c7] transition-all duration-300 shadow-md cursor-pointer"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#1b88f3] font-bold hover:underline cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
