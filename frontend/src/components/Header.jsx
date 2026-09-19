import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between whitespace-nowrap">
                    <Link to="/" className="flex items-center gap-3 text-slate-900 group">
                        <img src="/logo.png" alt="Fiqh File Logo" className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                        <span className="text-xl font-black tracking-tight text-primary"></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-semibold leading-normal text-slate-900 hover:text-primary transition-colors">Home</Link>
                        <Link to="/masalas" className="text-sm font-semibold leading-normal text-slate-900 hover:text-primary transition-colors">Mas'ala</Link>
                        <Link to="/ask" className="flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold leading-normal text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            Ask a Question
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-slate-900 p-2" onClick={toggleMenu} aria-label="Toggle Menu">
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="border-b border-primary/10 bg-white px-4 py-6 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="mx-auto max-w-7xl flex flex-col gap-4">
                        <Link to="/" className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/masalas" className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2" onClick={() => setIsMenuOpen(false)}>Mas'ala</Link>
                        <Link to="/ask" className="w-full text-center rounded-xl bg-primary px-5 py-3 text-lg font-bold text-white shadow-lg shadow-primary/20" onClick={() => setIsMenuOpen(false)}>
                            Ask a Question
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
