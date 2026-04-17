interface FormSubmitButtonProps {
    loading: boolean;
    loadingText: string;
    text: string;
}

export default function FormSubmitButton({ loading, loadingText, text }: FormSubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full mt-10 primary-gradient-cta font-headline text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3 overflow-hidden rounded-sm"
        >
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none group-hover:opacity-40 transition-opacity"></div>
            <span className="relative z-10">{loading ? loadingText : text}</span>
            <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">
                {loading ? 'sync' : 'arrow_forward'}
            </span>
        </button>
    );
}
