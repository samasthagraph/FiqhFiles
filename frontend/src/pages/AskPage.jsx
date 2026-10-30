import Header from '../components/Header';
import QuestionForm from '../components/QuestionForm';

const AskPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col bg-brand-light">
            <Header />

            <main className="flex-1">
                <QuestionForm />
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

export default AskPage;
