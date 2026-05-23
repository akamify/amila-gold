export default function Comp2() {
  return (
    <>
      <header className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-50 bg-[#fcf8f8] border-b-0 tonal-shift">
        <div className="flex items-center gap-8 flex-1">
          <div className="text-2xl font-black text-[#1c1b1b] tracking-[0.05em] font-['Space_Grotesk']">
            StreetRiot{" "}
            <span className="text-[#b90c1b]">ADMIN</span>
          </div>
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface opacity-40 text-sm">
              search
            </span>
            <input
              className="w-full bg-[#f6f3f2] border-none focus:ring-0 text-sm py-2 pl-10 placeholder:opacity-40 tracking-widest font-['Space_Grotesk']"
              placeholder="SEARCH CUSTOMER ID, EMAIL, OR SEGMEN..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative hover:bg-[#ebe7e7] p-2 transition-colors duration-200">
            <span className="material-symbols-outlined text-[#1c1b1b]">
              notifications
            </span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#b90c1b]"></span>
          </button>
          <button className="hover:bg-[#ebe7e7] p-2 transition-colors duration-200">
            <span className="material-symbols-outlined text-[#1c1b1b]">
              mail
            </span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant opacity-20"></div>
          <button className="text-sm font-bold text-[#b90c1b] font-['Space_Grotesk'] tracking-wider hover:opacity-80 active:scale-95 transition-all">
            Profile
          </button>
        </div>
      </header>
    </>
  );
}
