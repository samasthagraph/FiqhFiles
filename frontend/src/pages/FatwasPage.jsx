import Header from '../components/Header';
import QAFeed from '../components/QAFeed';

const FatwasPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col bg-brand-light">
            <Header />

            <main className="flex-1">
                {/* Archive Hero Banner with hero-pattern */}
                <section className="relative hero-pattern text-white py-12 sm:py-16 px-4 text-center overflow-hidden border-b border-brand-olive/30 shadow-inner">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-brand-olive rounded-full mix-blend-screen filter blur-3xl opacity-30 pointer-events-none"></div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">All Mas'alas Archive</h1>
                        <p className="max-w-2xl mx-auto text-base text-brand-surface">
                            Browse the complete collection of authentic Islamic rulings from Samastha Graph.
                        </p>
                    </div>
                </section>

                <QAFeed />
            </main>

            {/* Footer matching samasthagraph.com */}
            <footer className="bg-brand-dark text-brand-light py-12 border-t border-brand-olive/30 mt-auto">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/Logo_white.png" alt="Samastha Graph" className="h-10 w-auto object-contain" />
                            <div className="border-l border-brand-olive/50 pl-3">
                                <span className="block text-xs font-black uppercase tracking-widest text-brand-gold">Fiqh Files</span>
                                <span className="block text-[10px] text-brand-surface font-medium">Samastha Knowledge Base</span>
                            </div>
                        </div>
                        <p className="text-sm text-brand-surface text-center">
                            © {new Date().getFullYear()} Fiqh Files | Samastha Graph. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a className="text-brand-surface hover:text-brand-gold transition-colors text-sm font-medium" href="https://samasthagraph.com" target="_blank" rel="noreferrer">
                                Samastha Graph
                            </a>
                            <a className="text-brand-surface hover:text-brand-gold transition-colors text-sm font-medium" href="#">
                                Privacy Policy
                            </a>
                            <a className="text-brand-surface hover:text-brand-gold transition-colors text-sm font-medium" href="#">
                                Terms of Use
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FatwasPage;
