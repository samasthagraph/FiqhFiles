import Header from '../components/Header';
import QAFeed from '../components/QAFeed';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(72,31,78,0.12)_0%,rgba(250,247,244,0)_100%)]"></div>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-1.5 text-sm font-bold text-primary ring-1 ring-inset ring-secondary/30 mb-8">
                            <span className="inline-block size-2 rounded-full bg-secondary"></span>
                        </div>
                        <h1 className="mx-auto max-w-5xl text-6xl sm:text-7xl md:text-8xl lg:text-[5.75rem] font-black tracking-tight text-slate-900 font-fn-kanaka-semibold flex flex-col items-center leading-[0.9] sm:leading-[0.92] gap-1 sm:gap-2">
                            <span className="block">മനസ്സിലൊരു</span>
                            <span className="block text-secondary">ചോദ്യമുണ്ടോ?</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400 font-rahna22">
                            നിത്യജീവിതത്തിലെ കർമശാസ്ത്രപരമായ സംശയങ്ങൾക്ക് കൃത്യവും ലളിതവുമായ മറുപടികൾ. സമസ്ത ഗ്രാഫ് 'ഫിഖ്ഹ് ഫയൽസി'ലൂടെ നിങ്ങളുടെ സംശയങ്ങൾ ചോദിച്ചറിയാം.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-105 active:scale-95" to="/ask">
                                Ask a Question
                            </Link>
                            <a className="text-sm font-bold leading-6 text-primary hover:text-secondary transition-colors" href="#feed">
                                Browse Latest Fatwas <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </section>

                <QAFeed limit={12} />
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 py-12 text-white border-t border-primary/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Fiqh File Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                            <h2 className="text-2xl font-black tracking-tight text-secondary"></h2>
                        </div>
                        <p className="text-sm text-slate-400 text-center">
                            © {new Date().getFullYear()} Fiqh Files | Samastha Graph.  All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a className="text-slate-400 hover:text-secondary transition-colors text-sm font-medium" href="#">Privacy Policy</a>
                            <a className="text-slate-400 hover:text-secondary transition-colors text-sm font-medium" href="#">Terms of Use</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
