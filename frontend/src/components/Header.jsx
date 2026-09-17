import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/10 bg-white dark:bg-background-dark px-6 md:px-20 py-3 sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-slate-100 group">
                <img src="/logo.png" alt="Fiqh File Logo" className="h-11 w-auto object-contain transition-transform group-hover:scale-105" />
                <span className="text-xl font-black tracking-tight text-primary"></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-medium leading-normal text-slate-900 dark:text-slate-100 hover:text-primary transition-colors">Home</Link>
                <Link to="/fatwas" className="text-sm font-medium leading-normal text-slate-900 dark:text-slate-100 hover:text-primary transition-colors">Fatwa</Link>
                <Link to="/ask" className="flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold leading-normal text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    Ask a Question
                </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-slate-900 dark:text-slate-100 p-2" onClick={toggleMenu}>
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-background-dark border-b border-primary/10 flex flex-col p-6 gap-4 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <Link to="/" className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 pb-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/fatwas" className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 pb-2" onClick={() => setIsMenuOpen(false)}>Fatwa</Link>
                    <Link to="/ask" className="w-full text-center rounded-xl bg-primary px-5 py-3 text-lg font-bold text-white shadow-lg shadow-primary/20" onClick={() => setIsMenuOpen(false)}>
                        Ask a Question
                    </Link>
                </div>
            )}
        </header>
    );
};

export default Header;
