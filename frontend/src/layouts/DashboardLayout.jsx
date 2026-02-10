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
    Zap
} from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ to, icon: Icon, children }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                clsx(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 mb-1",
                    isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
            }
        >
            <Icon className="w-5 h-5 mr-3" />
            {children}
        </NavLink>
    );
};

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Sidebar Header - Company Info */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900">Acme Corp ERP</h1>
                            <p className="text-xs text-gray-500">FY 2023-24</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <nav>
                        <SidebarItem to="/" icon={LayoutDashboard}>Dashboard</SidebarItem>
                        
                        {/* Transactions */}
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 mt-4">Transactions</div>
                        <SidebarItem to="/sales" icon={ShoppingCart}>Sales</SidebarItem>
                        <SidebarItem to="/purchases" icon={Truck}>Purchases</SidebarItem>
                        
                        {/* Masters */}
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 mt-4">Masters</div>
                        <SidebarItem to="/products" icon={Package}>Products</SidebarItem>
                        <SidebarItem to="/customers" icon={Users}>Customers</SidebarItem>
                        <SidebarItem to="/suppliers" icon={Truck}>Suppliers</SidebarItem>
                        
                        {/* Inventory */}
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 mt-4">Inventory</div>
                        <SidebarItem to="/inventory" icon={Package}>Stock Summary</SidebarItem>
                        <SidebarItem to="/stock-movements" icon={Zap}>Stock Movements</SidebarItem>
                        
                        {/* Finance */}
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 mt-4">Finance</div>
                        <SidebarItem to="/banking" icon={Landmark}>Banking & Payments</SidebarItem>
                        <SidebarItem to="/reports/profit-loss" icon={TrendingUp}>Reports</SidebarItem>
                    </nav>
                </div>

                {/* Bottom Action */}
                <div className="p-4 border-t border-gray-100">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center font-medium transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Create Entry
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center text-blue-800 font-bold text-lg mr-8">
                            <span className="bg-blue-600 text-white p-1 rounded mr-2 text-xs">C</span>
                            Gateway of Tally
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex max-w-md w-full relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search accounts or actions"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <MessageSquare className="w-5 h-5" />
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <div className="flex items-center cursor-pointer" onClick={() => logout()}>
                            <div className="text-right mr-3 hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'John Doe'}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'John+Doe'}&background=FFEDD5&color=C2410C`}
                                    alt="Profile"
                                    className="w-full h-full rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Render */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
