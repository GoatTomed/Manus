import { useKeyCounter } from "../hooks/useKeyCounter";

export default function KeyCounter() {
  const { getCount } = useKeyCounter();
  const count = getCount();

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00ABFF]"></div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Keys</span>
      </div>
      <span className="text-xl font-bold text-[#00ABFF]">{count}</span>
    </div>
  );
}
