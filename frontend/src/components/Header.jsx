import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="sticky top-0 z-50 bg-brand-dark text-brand-light border-b border-brand-olive/30 shadow-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between whitespace-nowrap">
                    {/* Fiqh File Brand Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/fiqh_files_logo.png"
                            alt="Fiqh File"
                            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-sm font-semibold uppercase tracking-wider text-brand-light hover:text-brand-gold transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/masalas"
                            className="text-sm font-semibold uppercase tracking-wider text-brand-light hover:text-brand-gold transition-colors"
                        >
                            Mas'ala Archive
                        </Link>
                        <Link
                            to="/ask"
                            className="inline-flex items-center justify-center rounded-lg bg-brand-gold hover:bg-yellow-500 text-brand-dark px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                            Ask a Question
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-brand-light hover:text-brand-gold p-2 transition-colors cursor-pointer"
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="border-b border-brand-olive/30 bg-brand-dark/98 backdrop-blur-md px-4 py-6 md:hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="mx-auto max-w-7xl flex flex-col gap-4">
                        <Link
                            to="/"
                            className="text-base font-bold uppercase tracking-wider text-brand-light hover:text-brand-gold border-b border-brand-olive/30 pb-2.5"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/masalas"
                            className="text-base font-bold uppercase tracking-wider text-brand-light hover:text-brand-gold border-b border-brand-olive/30 pb-2.5"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Mas'ala Archive
                        </Link>
                        <Link
                            to="/ask"
                            className="w-full text-center rounded-lg bg-brand-gold text-brand-dark px-5 py-3 text-sm font-black uppercase tracking-wider shadow-lg"
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
