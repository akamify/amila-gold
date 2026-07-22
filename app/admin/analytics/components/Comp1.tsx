import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp1() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-full flex flex-col pt-8 z-40 bg-[#1c1b1b] dark:bg-[#000000] w-64 rounded-0">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold text-white tracking-widest bebas">
            STREETRIOT
          </h1>
          <p className="text-[10px] text-white opacity-40 font-['Space_Grotesk'] tracking-[0.2em]">
            Management Portal
          </p>
        </div>
        <nav className="flex-1">
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 text-sm tracking-widest font-['Space_Grotesk']"
            href="/"
          >
            <SymbolIcon name={"dashboard"} />
            Dashboard
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 text-sm tracking-widest font-['Space_Grotesk']"
            href="/"
          >
            <SymbolIcon name={"inventory_2"} />
            Products
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 text-sm tracking-widest font-['Space_Grotesk']"
            href="/"
          >
            <SymbolIcon name={"shopping_cart"} />
            Orders
          </a>
          <a
            className="bg-[#b90c1b] text-white font-bold px-6 py-4 flex items-center gap-4 translate-x-1 text-sm tracking-widest font-['Space_Grotesk']"
            href="/"
          >
            <SymbolIcon name={"group"} />
            Customers
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 text-sm tracking-widest font-['Space_Grotesk']"
            href="/"
          >
            <SymbolIcon name={"analytics"} />
            Analytics
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 text-sm tracking-widest font-['Space_Grotesk']"
            href="/"
          >
            <SymbolIcon name={"settings"} />
            Settings
          </a>
        </nav>
        <div className="p-6 border-t border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container">
            <img
              className="w-full h-full object-cover grayscale"
              data-alt="Close up portrait of a serious man with short hair and modern streetwear attire, dramatic studio lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6YhrSOm8l8tSzvsUTLCF0kzkgDfxFXYCgrUlQpIE1cHA6QrzB6T6kBp_E8FtmNGjEg6URCacR6x7ivPeeaoRpj5ru5QJQLGFo2TYtq5K15sKt6fIuVGLT597IvUfSvL7WUVxC0UEqMA-0vNje6k2PSFy30ZN3LnRzR46xzto75ACg7WXXGKQN4ZMEN_9VgWvle4oGnD7gfwRwMZO1tWlzc6KcgOWpT2i-8-lVeqQmD7SIu39uyQ6XYhrhb4_KtyCPjkOM_Wde5Pf9"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Admin User</p>
            <p className="text-[10px] text-white opacity-40 tracking-tighter">
              Senior Manager
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
