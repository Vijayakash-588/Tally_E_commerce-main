import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { registerUser } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        const payload = {
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'user'
        };

        const result = await registerUser(payload);

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/login');
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
                        Start your journey <br /> with TallyERP.
                    </h1>

                    <p className="text-lg text-blue-100 max-w-md leading-relaxed">
                        Join thousands of businesses that trust our platform to manage their operations efficiently.
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white overflow-y-auto py-12">
                <div className="bg-white dark:bg-blue-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Create Account</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 text-center">Join ERP Pro.</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-white mb-1">Company / User Name</label>
                                <input
                                    placeholder="e.g. Acme Corp or John Doe"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    {...register("name", { required: "Name is required" })}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white mb-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="admin@company.com"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                        {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
