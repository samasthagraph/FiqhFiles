import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <header className="sticky top-0 z-50 border-t-2 border-secondary bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between">
                    {/* Logo & Brand Identity */}
                    <Link to="/" className="flex items-center gap-3 text-slate-900 group">
                        <img
                            src="/logo.png"
                            alt="Fiqh File Logo"
                            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                        />
                        <div className="hidden sm:block">
                            <span className="block text-base font-black tracking-tight text-primary leading-none">
                                FIQH FILES
                            </span>
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
                                Samastha Graph Archive
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className={`text-xs font-black uppercase tracking-wider transition-colors pb-1 border-b-2 ${
                                isActive('/')
                                    ? 'text-primary border-primary'
                                    : 'text-slate-600 border-transparent hover:text-primary hover:border-slate-300'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/masalas"
                            className={`text-xs font-black uppercase tracking-wider transition-colors pb-1 border-b-2 ${
                                isActive('/masala')
                                    ? 'text-primary border-primary'
                                    : 'text-slate-600 border-transparent hover:text-primary hover:border-slate-300'
                            }`}
                        >
                            Mas'ala Archive
                        </Link>
                        <Link
                            to="/ask"
                            className="inline-flex items-center justify-center bg-slate-900 hover:bg-primary text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm transition-all border border-slate-900 hover:border-primary active:scale-98"
                        >
                            Ask a Question
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-slate-900 p-2 border border-slate-200"
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="border-b border-slate-200 bg-white px-4 py-5 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mx-auto max-w-7xl flex flex-col gap-3">
                        <Link
                            to="/"
                            className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/masalas"
                            className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Mas'ala Archive
                        </Link>
                        <Link
                            to="/ask"
                            className="w-full text-center bg-slate-900 hover:bg-primary text-white px-5 py-3 text-xs font-black uppercase tracking-widest shadow-sm"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Ask a Question
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
