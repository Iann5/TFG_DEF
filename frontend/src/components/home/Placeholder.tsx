export default function Placeholder({ className, texto = "IMG" }: { className?: string, texto?: string }) {
  return (
    <div className={`bg-slate-800 border-4 border-white relative flex items-center justify-center shadow-inner ${className}`}>
      <span className="text-white font-bangers text-4xl uppercase tracking-widest opacity-30 text-shadow-solid">{texto}</span>
    </div>
  );
}