import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp1() {
  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-surface-container-low/98 backdrop-blur-sm">
        <div className="flex justify-between items-center w-full px-8 h-20 bg-white dark:bg-[#1c1b1b]">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black text-[#1c1b1b] dark:text-[#fcf8f8] tracking-tighter font-headline">
              STREETRIOT
            </span>
            <span className="h-4 w-[1px] bg-outline-variant/30"></span>
            <span className="font-['Space_Grotesk'] tracking-[0.05em] text-[#1c1b1b] dark:text-[#fcf8f8]">
              Admin - Global Search &amp; Actions
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="hover:bg-[#f6f3f2] dark:hover:bg-[#2c2b2b] p-2 transition-colors duration-200">
              <SymbolIcon name={"close"} className="text-on-surface" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-5xl mx-auto px-8 py-16">
            <div className="relative mb-20">
              <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <SymbolIcon name={"search"} className="text-4xl text-primary" />
              </div>
              <input
                className="w-full bg-transparent border-none border-b-2 border-on-surface/10 focus:border-primary focus:ring-0 text-5xl font-impact tracking-wider placeholder:text-surface-dim pt-4 pb-6 pl-16 transition-all"
                placeholder="SEARCH COMMANDS, ORDERS, OR PRODUCTS..."
                type="text"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
                <span className="px-2 py-1 bg-surface-container-highest font-mono text-xs border border-outline-variant">
                  ESC
                </span>
                <span className="px-2 py-1 bg-surface-container-highest font-mono text-xs border border-outline-variant">
                  TO CLOSE
                </span>
              </div>
            </div>
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[2px] w-8 bg-primary"></div>
                <h2 className="font-headline font-black text-xl tracking-tighter italic">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex flex-col items-start p-6 bg-surface-container-lowest border border-transparent hover:border-primary transition-all group">
                  <SymbolIcon name={"add_box"} className="text-primary mb-4" />
                  <span className="font-headline font-bold text-sm tracking-widest mb-1">
                    Create New Product
                  </span>
                  <span className="text-xs text-secondary font-medium">
                    Catalog Management
                  </span>
                </button>
                <button className="flex flex-col items-start p-6 bg-surface-container-lowest border border-transparent hover:border-primary transition-all group">
                  <SymbolIcon name={"local_shipping"} className="text-primary mb-4" />
                  <span className="font-headline font-bold text-sm tracking-widest mb-1">
                    Update Order Status
                  </span>
                  <span className="text-xs text-secondary font-medium">
                    Fulfillment Flow
                  </span>
                </button>
                <button className="flex flex-col items-start p-6 bg-surface-container-lowest border border-transparent hover:border-primary transition-all group">
                  <SymbolIcon name={"mail"} className="text-primary mb-4" />
                  <span className="font-headline font-bold text-sm tracking-widest mb-1">
                    Email Customer
                  </span>
                  <span className="text-xs text-secondary font-medium">
                    CRM &amp; Support
                  </span>
                </button>
                <button className="flex flex-col items-start p-6 bg-surface-container-lowest border border-transparent hover:border-primary transition-all group">
                  <SymbolIcon name={"monitoring"} className="text-primary mb-4" />
                  <span className="font-headline font-bold text-sm tracking-widest mb-1">
                    Run Sales Report
                  </span>
                  <span className="text-xs text-secondary font-medium">
                    Analytics Portal
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <SymbolIcon name={"receipt_long"} className="text-sm" />
                  <h3 className="font-headline font-bold text-sm tracking-widest text-secondary">
                    Orders
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container flex items-center justify-center font-bold text-xs">
                      #942
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        Marcus V. — $240.00
                      </p>
                      <p className="text-[10px] tracking-widest text-secondary">
                        Processing • 2 mins ago
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-white hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container flex items-center justify-center font-bold text-xs">
                      #941
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        Sarah L. — $115.00
                      </p>
                      <p className="text-[10px] tracking-widest text-primary">
                        High Priority • 14 mins ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <SymbolIcon name={"shopping_bag"} className="text-sm" />
                  <h3 className="font-headline font-bold text-sm tracking-widest text-secondary">
                    Products
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="studio shot of a premium black minimalist oversized hoodie with heavy cotton texture against a clean studio background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVBpZTvX-9x_GxuQpJtyEhrIYR8UL90BCzQxE7tKz47jS9QMwLJpV0bfTy-WXMYhRBOkWjfSACksseVf_VQSpwH6bJ7wDV7oCJE2dy3qZowVPFfVvjYJFlMEiXKdPbXTpLfg_oFUhsUBnfGv_yz-x7ufJnkHO4UTbh00NcUSZ1Dppbq0kYJ179RI9L-Pe0fnw3E9LBO6jWZyN7IdDqUlWchpTKI82HpYtvsoMJlR2q2VV333CCitGgK7cyy8ETUType4z9OXd6tj8j"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        RIOT Heavy Hoodie
                      </p>
                      <p className="text-[10px] tracking-widest text-secondary">
                        42 in stock • SKU: RH-01
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-white hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="vibrant red athletic sneaker with sharp futuristic lines and high-contrast black details on a light grey background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7l0tbpxYO6IXLk_xiKYpDBVYWaL7-vdUHFaFCr_LCukQS5NQktLcAV8G5ZGD9HB7YDh14WdLC2t_GU1c0tUUFSNPI2G6yS7d7tYjP4ccIxdm1q1JGu3MDhSf4xdsegm5mDUZYAJRv7rwg81U90P8iAsqYE68ShrT75RtE8hkuptAp2tkzjlruiJPJfvrbzY41X7F9H83Jm7fSaIqIH7rLbaUa6N1fHT7Ujlpj7gvFtsC5CGme8wkvhLffCtUJJ0YChBOfDmED1Hlx"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        Velocity Runner X
                      </p>
                      <p className="text-[10px] tracking-widest text-secondary">
                        12 in stock • SKU: VR-X
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <SymbolIcon name={"group"} className="text-sm" />
                  <h3 className="font-headline font-bold text-sm tracking-widest text-secondary">
                    Customers
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <SymbolIcon name={"person"} className="text-primary text-lg" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        Elena Rodriguez
                      </p>
                      <p className="text-[10px] tracking-widest text-secondary">
                        elena.rod@riot.com • VIP
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-white hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <SymbolIcon name={"person"} className="text-secondary text-lg" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">James Chen</p>
                      <p className="text-[10px] tracking-widest text-secondary">
                        j.chen@web.com • New Member
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-20 border-t border-outline-variant/30 pt-8 flex justify-between items-center text-[10px] font-bold tracking-[0.2em] text-secondary/60">
              <div className="flex gap-8">
                <span>Navigate: ↑ ↓</span>
                <span>Select: Enter</span>
                <span>Close: Esc</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 bg-primary animate-pulse"></span>
                <span>System Live: 14:02 UTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
