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
                    "fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 ease-out md:translate-x-0 flex flex-col h-screen sticky top-0 overflow-hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Unified Sidebar Header */}
                <div className="p-6">
                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 ring-4 ring-slate-100/50">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">Gateway</h1>
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">ERP-Pro</p>
                        </div>
                    </div>
                </div>

                {/* Gateway Menu Section */}
                <div className="flex-1 overflow-y-auto px-5 py-2">
                    <div className="mb-4 px-3 flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gateway Menu</h3>
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                    </div>

                    <nav className="space-y-1">
                        <SidebarItem to="/" icon={LayoutDashboard}>Main Dashboard</SidebarItem>

                        <div className="h-px bg-slate-100 my-4 mx-3"></div>

                        {[
                            { title: "Sales Voucher", sub: "Record Sales", icon: ShoppingCart, color: "bg-blue-600", to: "/sales" },
                            { title: "Purchase Voucher", sub: "Stock Entry", icon: Package, color: "bg-indigo-600", to: "/purchases" },
                            { title: "Banking & Cash", sub: "Payments", icon: Landmark, color: "bg-cyan-600", to: "/banking" },
                            { title: "Stock Summary", sub: "Inventory", icon: Package, color: "bg-amber-600", to: "/inventory" },
                        ].map((item, idx) => (
                            <NavLink
                                key={idx}
                                to={item.to}
                                className={({ isActive }) => clsx(
                                    "group flex items-center p-3 rounded-2xl transition-all duration-300 border border-transparent mb-1",
                                    isActive ? "bg-blue-50/50 border-blue-100 shadow-sm" : "hover:bg-slate-50"
                                )}
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mr-3.5 transition-transform group-hover:scale-105 shadow-md",
                                    item.color
                                )}>
                                    <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-sm font-black text-slate-900 truncate">{item.title}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{item.sub}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 ml-1 text-slate-200 group-hover:text-slate-900 transition-colors" />
                            </NavLink>
                        ))}

                        <div className="h-px bg-slate-100 my-4 mx-3"></div>

                        <SidebarItem to="/reports/profit-loss" icon={BarChart3}>Advanced Reports</SidebarItem>
                        <SidebarItem to="/settings" icon={Settings}>System Settings</SidebarItem>
                    </nav>
                </div>

                {/* Profile Section */}
                <div className="p-5 border-t border-slate-100 bg-white">
                    <div className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-white">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563EB&color=fff&bold=true`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-900 truncate">{user?.name || 'Admin'}</p>
                                <p className="text-[9px] font-bold text-blue-600 uppercase">Pro Account</p>
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Log Out">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Professional Header */}
                <header className="h-20 bg-white border-b border-slate-200/60 flex items-center px-6 sm:px-10 justify-between sticky top-0 z-40">
                    <div className="flex items-center flex-1 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden mr-4 p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center mr-8 flex-shrink-0">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3 hidden sm:block">
                                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Dashboard</h2>
                        </div>

                        {/* Centered Search Bar */}
                        <div className="hidden md:flex max-w-lg w-full relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search ledgers, reports, vouchers... (Alt+S)"
                                className="block w-full pl-11 pr-4 py-2.5 border border-slate-100 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100/40 focus:border-blue-300 transition-all font-bold text-xs shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="hidden xl:flex items-center space-x-2.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest bg-slate-100/50 px-3.5 py-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-600">ALT+G</span>
                            <span>Quick Jump</span>
                        </div>

                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all relative border border-slate-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-4 ring-white" />
                        </button>

                        <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    </div>
                </header>

                {/* High Contrast Content Area */}
                <main className="flex-1 overflow-auto p-6 sm:p-10 relative bg-[#F8FAFC]">
                    {/* Subtle Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
