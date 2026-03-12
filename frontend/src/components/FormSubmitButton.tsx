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
            className="w-full py-4 mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-900/30 active:scale-95 disabled:opacity-50 text-lg uppercase tracking-wider"
        >
            {loading ? loadingText : text}
        </button>
    );
}
