export default function Comp1() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-full flex flex-col pt-8 z-40 bg-[#1c1b1b] w-64 rounded-0">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold text-white tracking-widest font-['Space_Grotesk']">
            STREETRIOT
          </h1>
          <p className="text-[10px] text-white opacity-40 font-['Space_Grotesk'] tracking-[0.2em]">
            Management Portal
          </p>
        </div>
        <nav className="flex-1">
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 font-['Space_Grotesk'] text-sm tracking-widest"
            href="/"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 font-['Space_Grotesk'] text-sm tracking-widest"
            href="/"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Products
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 font-['Space_Grotesk'] text-sm tracking-widest"
            href="/"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            Orders
          </a>
          <a
            className="bg-[#b90c1b] text-white font-bold px-6 py-4 flex items-center gap-4 translate-x-1 font-['Space_Grotesk'] text-sm tracking-widest"
            href="/"
          >
            <span className="material-symbols-outlined">group</span>
            Customers
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 font-['Space_Grotesk'] text-sm tracking-widest"
            href="/"
          >
            <span className="material-symbols-outlined">analytics</span>
            Analytics
          </a>
          <a
            className="text-[#ebe7e7] px-6 py-4 flex items-center gap-4 opacity-60 hover:bg-[#b90c1b] hover:opacity-100 transition-all duration-150 font-['Space_Grotesk'] text-sm tracking-widest"
            href="/"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>
        <div className="p-6 border-t border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container">
            <img
              className="w-full h-full object-cover grayscale"
              data-alt="Admin User"
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
