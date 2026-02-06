import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);
        if (result.success) {
            toast.success('Logged in successfully');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-white flex font-sans">
            {/* Left Side - Image/Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-end p-12 text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                        alt="Building"
                        className="w-full h-full object-cover opacity-50 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-blue-600/60 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 mb-8">
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Layout className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-wide">TallyERP</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Streamline your <br /> business operations.
                    </h1>

                    <p className="text-lg text-blue-100 max-w-md leading-relaxed">
                        Manage your finances, inventory, and payroll with the most trusted ERP platform for growing enterprises.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Login to your account</h2>
                    <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                {...register("password", { required: "Password is required" })}
                            />
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                Remember Me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Forgot Password?
                            </a>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
                    </button>
                </form>

                <div className="mt-8 text-center bg-white">
                    <p className="text-sm text-gray-500">
                        Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign Up</Link>
                    </p>
                </div>

                {/* Footer Links */}
                <div className="mt-auto pt-10 border-t border-transparent">
                    <div className="flex flex-wrap justify-between items-center text-xs text-gray-400">
                        <span>© 2024 TallyERP Systems</span>
                        <div className="space-x-4">
                            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-600">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
