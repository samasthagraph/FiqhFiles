import Header from '../components/Header';
import QAFeed from '../components/QAFeed';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col bg-brand-light">
            <Header />

            <main className="flex-1">
                {/* Hero Section with Samastha Graph Hero Pattern */}
                <section className="relative hero-pattern text-white py-16 sm:py-24 lg:py-28 overflow-hidden shadow-inner border-b border-brand-olive/30">
                    {/* Ambient Glow Effects matching samasthagraph.com */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-olive rounded-full mix-blend-screen filter blur-3xl opacity-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-muted rounded-full mix-blend-screen filter blur-3xl opacity-30 pointer-events-none"></div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-dark/90 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-bold text-brand-surface ring-1 ring-inset ring-brand-olive/60 mb-6 sm:mb-8 shadow-sm">
                            <span className="inline-block size-2 rounded-full bg-brand-gold animate-pulse"></span>
                            <span>Fiqh Files | Samastha Graph Knowledge Platform</span>
                        </div>

                        <h1 className="mx-auto max-w-5xl text-4xl sm:text-6xl md:text-8xl lg:text-[5.75rem] font-black tracking-tight text-white font-fn-kanaka-semibold flex flex-col items-center leading-[1.05] sm:leading-[0.92] gap-1 sm:gap-2 drop-shadow-md">
                            <span className="block text-white">മനസ്സിലൊരു</span>
                            <span className="block text-brand-gold">ചോദ്യമുണ്ടോ?</span>
                        </h1>

                        <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-brand-light/90 font-rahna22 px-2">
                            നിത്യജീവിതത്തിലെ കർമശാസ്ത്രപരമായ സംശയങ്ങൾക്ക് കൃത്യവും ലളിതവുമായ മറുപടികൾ. സമസ്ത ഗ്രാഫ് 'ഫിഖ്ഹ് ഫയൽസി'ലൂടെ നിങ്ങളുടെ സംശയങ്ങൾ ചോദിച്ചറിയാം.
                        </p>

                        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-6 w-full max-w-xs sm:max-w-none mx-auto">
                            <Link
                                className="w-full sm:w-auto rounded-lg bg-brand-gold hover:bg-yellow-500 px-8 py-3.5 sm:py-4 text-sm sm:text-base font-black text-brand-dark shadow-xl shadow-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold transition-all hover:scale-105 active:scale-95 text-center uppercase tracking-wider"
                                to="/ask"
                            >
                                Ask a Question
                            </Link>
                            <a
                                className="text-sm font-bold leading-6 text-brand-surface hover:text-brand-gold transition-colors py-2 flex items-center gap-1.5"
                                href="#feed"
                            >
                                Browse Latest Mas'alas <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </section>

                <QAFeed limit={12} showFilter={false} />
            </main>

            {/* Footer matching samasthagraph.com */}
            <footer className="bg-brand-dark text-brand-light py-12 border-t border-brand-olive/30 mt-auto">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/fiqh_files_logo.png" alt="Fiqh File" className="h-9 sm:h-10 w-auto object-contain" />
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

export default LandingPage;
