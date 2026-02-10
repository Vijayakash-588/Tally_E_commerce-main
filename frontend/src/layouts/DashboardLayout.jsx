import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Package,
    BarChart3,
    Landmark,
    Settings,
    PlusCircle,
    Search,
    Bell,
    MessageSquare,
    Menu,
    X,
    Users,
    Truck,
    ShoppingCart,
    TrendingUp,
    Zap,
    ChevronRight,
    Building2,
    Calendar,
    LogOut
} from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ to, icon: Icon, children, active }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                clsx(
                    "group flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 mb-1.5",
                    isActive
                        ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )
            }
        >
            <div className="flex items-center">
                <Icon className={clsx("w-5 h-5 mr-3 transition-colors", active ? "text-white" : "group-hover:text-blue-600")} />
                {children}
            </div>
            <ChevronRight className={clsx("w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0")} />
        </NavLink>
    );
};

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 ease-out lg:transform-none flex flex-col shadow-xl lg:shadow-none",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Sidebar Header - Company Info */}
                <div className="p-8 pb-6">
                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-sm font-black text-slate-900 truncate">Vikas Tally Store</h1>
                            <div className="flex items-center text-[10px] font-bold text-slate-400 mt-0.5 space-x-2">
                                <Calendar className="w-3 h-3" />
                                <span>FY 2023-24</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    <nav className="space-y-6">
                        <div>
                            <SidebarItem to="/" icon={LayoutDashboard}>Dashboard</SidebarItem>
                        </div>

                        {/* Transactions Section */}
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 mb-2">Transactions</div>
                            <SidebarItem to="/sales" icon={ShoppingCart}>Sales</SidebarItem>
                            <SidebarItem to="/purchases" icon={Truck}>Purchases</SidebarItem>
                        </div>

                        {/* Masters Section */}
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 mb-2">Masters</div>
                            <SidebarItem to="/products" icon={Package}>Products</SidebarItem>
                            <SidebarItem to="/customers" icon={Users}>Customers</SidebarItem>
                            <SidebarItem to="/suppliers" icon={Truck}>Suppliers</SidebarItem>
                        </div>

                        {/* Inventory Section */}
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 mb-2">Inventory</div>
                            <SidebarItem to="/inventory" icon={Package}>Stock Summary</SidebarItem>
                            <SidebarItem to="/stock-movements" icon={Zap}>Stock Movements</SidebarItem>
                        </div>

                        {/* Finance Section */}
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 mb-2">Finance</div>
                            <SidebarItem to="/banking" icon={Landmark}>Banking</SidebarItem>
                            <SidebarItem to="/reports/profit-loss" icon={TrendingUp}>Reports</SidebarItem>
                        </div>
                    </nav>
                </div>

                {/* Bottom Profile / Logout */}
                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563EB&color=fff&bold=true`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                                <p className="text-[10px] font-medium text-slate-500">Super Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Log Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-8 justify-between sticky top-0 z-40">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden mr-6 p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center mr-12 group cursor-default">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">Gateway</h1>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Enterprise ERP</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex max-w-xl w-full relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reports, ledgers or vouchers... (Cmd + K)"
                                className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-8">
                        <div className="hidden xl:flex items-center space-x-2 mr-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-500 border border-slate-200">ALT+G</span>
                            <span>Go To</span>
                        </div>

                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-2 invisible md:visible"></div>

                        <button className="flex items-center space-x-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-black text-white flex items-center justify-center font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                                JD
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-black text-slate-900">{user?.name?.split(' ')[0] || 'Admin'}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Premium User</p>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Content Render */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 custom-scrollbar relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-200/20 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

