import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp2() {
  return (
    <>
      <header className="flex items-center justify-between px-8 h-16 bg-[#ffffff] dark:bg-[#1c1b1b] border-b border-[#e5bdb9]/20 shadow-[0_12px_40px_rgba(28,27,27,0.06)] sticky top-0 z-10 font-['Space_Grotesk'] font-bold">
        <div className="flex items-center gap-4">
          <SymbolIcon name={"arrow_back"} className="text-primary cursor-pointer" />
          <h2 className="tracking-widest text-sm">
            Order / #SR-92841
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center">
            <SymbolIcon name={"search"} className="absolute left-3 text-secondary" />
            <input
              className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none focus:ring-1 focus:ring-primary text-sm w-64"
              placeholder="Search orders..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <SymbolIcon name={"notifications"} className="text-on-surface hover:text-primary cursor-pointer" />
            <SymbolIcon name={"account_circle"} className="text-on-surface hover:text-primary cursor-pointer" />
          </div>
        </div>
      </header>
    </>
  );
}
