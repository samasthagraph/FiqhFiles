import Header from '../components/Header';
import QAFeed from '../components/QAFeed';
import { Link } from 'react-router-dom';

const FatwasPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col bg-background-light">
            <Header />

            <main className="flex-1">
                {/* Executive Archive Header */}
                <div className="border-b border-slate-200 bg-white py-12 text-center px-4">
                    <div className="inline-flex items-center gap-1.5 border border-slate-300 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700 mb-3 shadow-2xs">
                        <span className="size-1.5 bg-secondary"></span>
                        <span>Official Jurisprudence Archive</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                        All Mas'alas Archive
                    </h1>
                    <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 font-rahna22">
                        കർമശാസ്ത്രപരമായ ചോദ്യോത്തരങ്ങളുടെ പൂർണ്ണ ശേഖരം. നാല് സുന്നി മദ്ഹബുകളിലുമുള്ള വിധികൾ ഇവിടെ പരിശോധിക്കാം.
                    </p>
                </div>
                <QAFeed />
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

export default FatwasPage;
