import Header from '../components/Header';
import QAFeed from '../components/QAFeed';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col bg-background-light">
            <Header />

            <main className="flex-1">
                {/* Executive Hero Section */}
                <section className="relative border-b border-slate-200 bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                        {/* Institutional Badge (Sharp, Non-Rounded) */}
                        <div className="inline-flex items-center gap-2 border border-slate-300 bg-slate-50 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-slate-700 mb-6 sm:mb-8 shadow-2xs">
                            <span className="size-1.5 bg-secondary"></span>
                            <span>Samastha Graph • Official Jurisprudence & Mas'ala Archive</span>
                        </div>

                        {/* Malayalam Main Headline */}
                        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 font-fn-kanaka-semibold flex flex-col items-center leading-tight gap-1">
                            <span className="block text-slate-950">മനസ്സിലൊരു</span>
                            <span className="block text-secondary">ചോദ്യമുണ്ടോ?</span>
                        </h1>

                        {/* Malayalam Explanatory Subtitle */}
                        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 font-rahna22 px-2">
                            നിത്യജീവിതത്തിലെ കർമശാസ്ത്രപരമായ സംശയങ്ങൾക്ക് കൃത്യവും ലളിതവുമായ മറുപടികൾ. സമസ്ത ഗ്രാഫ് 'ഫിഖ്ഹ് ഫയൽസ്'ലൂടെ നിങ്ങളുടെ സംശയങ്ങൾ ചോദിച്ചറിയാം.
                        </p>

                        {/* Primary Call to Action Buttons (Sharp, Non-Rounded) */}
                        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-6 w-full max-w-xs sm:max-w-none mx-auto">
                            <Link
                                to="/ask"
                                className="w-full sm:w-auto bg-slate-900 hover:bg-primary text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest shadow-sm transition-all border border-slate-900 hover:border-primary active:scale-98 text-center"
                            >
                                Ask a Question
                            </Link>
                            <a
                                href="#feed"
                                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-primary transition-colors py-2"
                            >
                                <span>Browse Latest Mas'alas</span>
                                <span>&rarr;</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Executive Key Pillars Strip */}
                <section className="border-b border-slate-200 bg-slate-50/75 py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-center">
                            <div className="px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pillar I</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Authentic Rulings</p>
                                <p className="text-[11px] text-slate-500 font-rahna22">അധികാരിക ഫത്‌വകൾ</p>
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pillar II</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Four Sunni Madhhabs</p>
                                <p className="text-[11px] text-slate-500 font-rahna22">നാല് മദ്ഹബുകൾ</p>
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pillar III</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Video Explanations</p>
                                <p className="text-[11px] text-slate-500 font-rahna22">വീഡിയോ വിവരണം</p>
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pillar IV</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Word Doc Export</p>
                                <p className="text-[11px] text-slate-500 font-rahna22">ഡോക്യുമെന്റ് ഡൗൺലോഡ്</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feed Section */}
                <QAFeed limit={12} />
            </main>

            {/* Executive Footer */}
            <footer className="bg-slate-900 py-10 text-white border-t border-slate-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Fiqh File Logo" className="h-9 w-auto object-contain brightness-0 invert" />
                            <div>
                                <span className="block text-sm font-black tracking-wider uppercase text-white">
                                    Fiqh Files Archive
                                </span>
                                <span className="block text-[10px] text-slate-400 tracking-wider uppercase">
                                    Samastha Graph Initiative
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                            © {new Date().getFullYear()} Fiqh Files • Samastha Graph. All rulings authenticated by qualified scholars.
                        </p>
                        <div className="flex gap-5 text-xs">
                            <Link to="/masalas" className="text-slate-400 hover:text-white transition-colors">Archive</Link>
                            <Link to="/ask" className="text-slate-400 hover:text-white transition-colors">Ask Question</Link>
                            <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">Portal</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
