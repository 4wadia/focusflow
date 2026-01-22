import React, { useState, useRef } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { API_BASE_URL } from '../api';

interface LoginViewProps {
    onLogin: (email: string, name?: string, avatarUrl?: string) => void;
    onNavigateToSignup: () => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}


export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToSignup, showToast }) => {
    const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Credential Step Handler
    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        // Simulate server validation
        setTimeout(() => {
            setIsLoading(false);
            setStep('verification');
            showToast(`Verification code sent to ${email}`, 'info');
        }, 800);
    };

    // Verification Step Handler
    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = verificationCode.join('');
        if (code.length !== 6) {
            showToast('Please enter the 6-digit code', 'error');
            return;
        }

        setIsLoading(true);
        // Simulate code validation
        setTimeout(() => {
            setIsLoading(false);
            onLogin(email);
        }, 1000);
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);

        // Try to use backend OAuth flow
        showToast('Redirecting to Google...', 'info');

        // Redirect to backend OAuth endpoint
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    // OTP Input Logic
    const handleCodeChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every(char => !isNaN(Number(char)))) {
            const newCode = [...verificationCode];
            pastedData.forEach((char, index) => {
                if (index < 6) newCode[index] = char;
            });
            setVerificationCode(newCode);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col antialiased text-text-main-light dark:text-text-main-dark overflow-x-hidden relative transition-colors duration-200">
            {/* Navbar */}
            <nav className="w-full flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 z-10 absolute top-0 left-0">
                <div className="flex items-center gap-3 text-primary dark:text-white group cursor-pointer select-none">
                    <div className="size-8 flex items-center justify-center rounded-lg text-primary dark:text-white">
                        <Logo className="w-full h-full text-current" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">FocusFlow</h2>
                </div>
                <div className="hidden sm:block">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm mr-2">New here?</span>
                    <button onClick={onNavigateToSignup} className="text-primary dark:text-white font-semibold text-sm hover:underline decoration-2 underline-offset-4">Create an account</button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-0">
                {/* Abstract Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                    <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-neutral-200/40 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-10"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-neutral-200/40 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-10"></div>
                </div>

                <div className="w-full max-w-[440px] flex flex-col">

                    {step === 'credentials' ? (
                        // --- Step 1: Credentials ---
                        <div className="animate-slide-in-right">
                            <div className="mb-8 text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-white tracking-tight mb-3">Welcome back</h1>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal">Please enter your details to sign in.</p>
                            </div>

                            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-white/50 dark:border-white/10 p-6 sm:p-8 w-full">
                                <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-5">
                                    <label className="flex flex-col gap-1.5 w-full">
                                        <span className="text-primary dark:text-gray-200 text-sm font-semibold ml-1">Email Address</span>
                                        <input
                                            className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-primary dark:text-white h-12 px-4 placeholder:text-text-secondary-light/50 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white outline-none shadow-sm transition-all text-base"
                                            placeholder="jane@example.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label className="flex flex-col gap-1.5 w-full group">
                                        <div className="flex justify-between items-center ml-1">
                                            <span className="text-primary dark:text-gray-200 text-sm font-semibold">Password</span>
                                            <button
                                                type="button"
                                                onClick={() => showToast('Password reset is not yet available. Please contact support.', 'info')}
                                                className="text-xs text-text-secondary-light hover:text-primary dark:hover:text-white transition-colors"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative flex items-center">
                                            <input
                                                className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-primary dark:text-white h-12 pl-4 pr-12 placeholder:text-text-secondary-light/50 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white outline-none shadow-sm transition-all text-base"
                                                placeholder="Enter your password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                className="absolute right-4 text-text-secondary-light hover:text-primary dark:hover:text-white transition-colors flex items-center"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
                                            </button>
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 w-full h-12 bg-primary hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-primary rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <div className="size-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                                        ) : 'Sign in'}
                                    </button>
                                </form>

                                <div className="relative flex py-6 items-center">
                                    <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                                    <span className="flex-shrink-0 mx-4 text-text-secondary-light text-sm font-medium">Or continue with</span>
                                    <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleGoogleLogin}
                                        type="button"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center gap-3 hover:bg-background-light dark:hover:bg-surface-dark transition-colors group disabled:opacity-70"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                                        <span className="text-primary dark:text-white font-semibold text-sm">Sign in with Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center gap-3 hover:bg-background-light dark:hover:bg-surface-dark transition-colors group disabled:opacity-70"
                                    >
                                        <svg className="w-5 h-5 fill-current text-primary dark:text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 12.6c0-2.4 2-3.6 2.1-3.6-.1-.3-1.3-4.5-4.4-4.5-1.3 0-2.5.8-3.1.8-.7 0-1.8-.7-3-.7-3 0-5.8 2.4-5.8 6.5 0 2.6 1 4.9 2.5 7 1.1 1.5 2.3 3.2 3.9 3.2 1.5 0 2.1-1 4-1s 2.4 1 4 1c1.7 0 2.8-1.5 3.9-3.1.6-1.1 1.1-2.1 1.1-2.2-.1-.1-2.2-1.3-2.2-4.4zm-4-9.3c.7-.9 1.1-2.1 1-3.3-1.1 0-2.3.6-3.1 1.5-.7.8-1.2 2-1.1 3.2 1.1.1 2.4-.5 3.2-1.4z"></path></svg>
                                        <span className="text-primary dark:text-white font-semibold text-sm">Sign in with Apple</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- Step 2: Verification ---
                        <div className="animate-slide-in-right">
                            <div className="mb-8 text-center sm:text-left">
                                <button
                                    onClick={() => setStep('credentials')}
                                    className="text-sm font-bold text-text-secondary-light hover:text-primary dark:hover:text-white flex items-center gap-1 mb-4"
                                >
                                    <Icon name="arrow_back" size={16} />
                                    Back to Login
                                </button>
                                <h1 className="text-3xl font-extrabold text-primary dark:text-white tracking-tight mb-3">Check your email</h1>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal">We sent a verification code to <span className="font-bold text-primary dark:text-white">{email}</span>.</p>
                            </div>

                            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-white/50 dark:border-white/10 p-6 sm:p-8 w-full">
                                <form onSubmit={handleVerifySubmit} className="flex flex-col gap-6">

                                    <div className="flex gap-2 justify-between sm:justify-center">
                                        {verificationCode.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={el => inputRefs.current[index] = el}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                className="w-10 h-12 sm:w-12 sm:h-14 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-center text-xl font-bold focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white outline-none transition-all"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 w-full h-12 bg-primary hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-primary rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <div className="size-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                                        ) : 'Verify & Login'}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-text-secondary-light">
                                        Didn't receive the email?
                                        <button onClick={() => showToast('Code resent!', 'success')} className="text-primary dark:text-white font-bold hover:underline ml-1">Click to resend</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center sm:hidden">
                        <p className="text-sm text-text-secondary-light">
                            Don't have an account?
                            <button onClick={onNavigateToSignup} className="text-primary dark:text-white font-bold hover:underline ml-1">Sign up</button>
                        </p>
                    </div>
                </div>
            </main>

            {/* Quote */}
            <div className="hidden lg:flex fixed right-10 bottom-10 max-w-xs flex-col gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <div className="size-10 bg-primary/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                    <Icon name="format_quote" className="text-primary dark:text-white" />
                </div>
                <p className="text-sm italic text-primary dark:text-white">"Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort."</p>
                <p className="text-xs font-bold text-primary/60 dark:text-white/60">— Paul J. Meyer</p>
            </div>
        </div>
    );
};