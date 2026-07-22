import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp2() {
  return (
    <>
      <main className="ml-64 pt-24 px-10 pb-12 min-h-screen">
        <div className="flex items-center gap-2 mb-8 text-[10px] font-bold tracking-widest opacity-40">
          <span>Admin</span>
          <SymbolIcon name={"chevron_right"} className="text-[10px]" />
          <span>Customers</span>
          <SymbolIcon name={"chevron_right"} className="text-[10px]" />
          <span className="text-on-surface opacity-100">
            Profile: Elena Vance
          </span>
        </div>
        <div className="w-12 h-1 bg-primary mb-12"></div>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8 space-y-10">
            <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-surface-container-lowest p-10 border border-outline-variant/10">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <img
                    className="w-32 h-32 object-cover grayscale brightness-90 border-4 border-primary"
                    data-alt="Modern close-up portrait of a woman with sharp editorial lighting and minimalist background for customer profile"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCllb4qOqOAmyiIL_LS2x11tieqtpJbTPjjOLuo5K72zoy-nlq2eMZ4Si5QU0N_eYK3GJOhsNbZWeBvYxV006swz2mWih3InGQKrNimYDSq29TmBv2O-tbuMyNp7VUYhZqP0icLPff3rYLJOGuqnk3FcZ8y1EPdDmIhGJAf5TkX0OMdMW9lvOMx5br3eV0nVVTyUzHfeU1X4nCOisUjYtwAx891ruW_Vi2JVDyT5ZfRNEJJaLF4GyZxe_a9OmJ8t2wbFZY1W5b20W9i"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white px-3 py-1 text-[10px] font-black tracking-tighter">
                    VIP TIER 3
                  </div>
                </div>
                <div>
                  <h2 className="font-impact text-6xl tracking-tight leading-none mb-1">
                    Elena Vance
                  </h2>
                  <p className="text-sm opacity-60 flex items-center gap-2">
                    <SymbolIcon name={"location_on"} className="text-sm" />
                    Berlin, DE &nbsp; • &nbsp; elena.v@archive-editorial.com
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-surface-container-high px-4 py-1 text-[10px] font-bold tracking-widest">
                      Early Adopter
                    </span>
                    <span className="bg-surface-container-high px-4 py-1 text-[10px] font-bold tracking-widest">
                      Hype Curator
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold opacity-40 tracking-[0.2em] mb-1">
                  Lifetime Spend
                </p>
                <p className="font-impact text-5xl text-primary leading-none">
                  $8,940.22
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container-low p-6 flex flex-col justify-between aspect-video">
                <p className="text-[10px] font-bold opacity-50 tracking-[0.2em]">
                  Avg Order Value
                </p>
                <h4 className="font-impact text-4xl">$447.01</h4>
                <div className="flex items-center gap-1 text-primary">
                  <SymbolIcon name={"trending_up"} className="text-sm" />
                  <span className="text-[10px] font-bold">
                    +12% vs last year
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-low p-6 flex flex-col justify-between aspect-video">
                <p className="text-[10px] font-bold opacity-50 tracking-[0.2em]">
                  Frequency
                </p>
                <h4 className="font-impact text-4xl">1.2/Mo</h4>
                <p className="text-[10px] font-bold opacity-70 tracking-widest">
                  Consistent Cycle
                </p>
              </div>
              <div className="bg-surface-container-low p-6 flex flex-col justify-between aspect-video">
                <p className="text-[10px] font-bold opacity-50 tracking-[0.2em]">
                  Total Orders
                </p>
                <h4 className="font-impact text-4xl">24</h4>
                <p className="text-[10px] font-bold opacity-70 tracking-widest">
                  0 Returns Processed
                </p>
              </div>
            </div>

            <div className="mt-12 border-b border-outline-variant/20 flex gap-10">
              <button className="pb-4 border-b-2 border-primary text-primary text-xs font-bold tracking-[0.1em]">
                Order History
              </button>
              <button className="pb-4 text-xs font-bold tracking-[0.1em] opacity-40 hover:opacity-100 transition-opacity">
                Wishlist Items (12)
              </button>
              <button className="pb-4 text-xs font-bold tracking-[0.1em] opacity-40 hover:opacity-100 transition-opacity">
                Support Tickets (1)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold tracking-widest opacity-40 border-b border-outline-variant/10">
                    <th className="py-4 px-2">Order ID</th>
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">Status</th>
                    <th className="py-4 px-2 text-right">Total</th>
                    <th className="py-4 px-2"></th>
                  </tr>
                </thead>
                <tbody className="text-sm font-headline">
                  <tr className="border-b border-outline-variant/10 hover:bg-white transition-colors group">
                    <td className="py-6 px-2 font-bold tracking-tight">
                      #SR-99023
                    </td>
                    <td className="py-6 px-2 opacity-60">
                      Oct 12, 2023
                    </td>
                    <td className="py-6 px-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 text-[9px] font-black tracking-widest">
                        Shipped
                      </span>
                    </td>
                    <td className="py-6 px-2 text-right font-bold">
                      $1,250.00
                    </td>
                    <td className="py-6 px-2 text-right">
                      <button
                        
                        data-icon="open_in_new"
                       className="opacity-0 group-hover:opacity-100 transition-opacity"><SymbolIcon name={"open_in_new"} /></button>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/10 hover:bg-white transition-colors group">
                    <td className="py-6 px-2 font-bold tracking-tight">
                      #SR-98811
                    </td>
                    <td className="py-6 px-2 opacity-60">
                      Sep 04, 2023
                    </td>
                    <td className="py-6 px-2">
                      <span className="bg-black/10 text-black px-3 py-1 text-[9px] font-black tracking-widest">
                        Delivered
                      </span>
                    </td>
                    <td className="py-6 px-2 text-right font-bold">$890.50</td>
                    <td className="py-6 px-2 text-right">
                      <button
                        
                        data-icon="open_in_new"
                       className="opacity-0 group-hover:opacity-100 transition-opacity"><SymbolIcon name={"open_in_new"} /></button>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/10 hover:bg-white transition-colors group">
                    <td className="py-6 px-2 font-bold tracking-tight">
                      #SR-97542
                    </td>
                    <td className="py-6 px-2 opacity-60">
                      Aug 21, 2023
                    </td>
                    <td className="py-6 px-2">
                      <span className="bg-black/10 text-black px-3 py-1 text-[9px] font-black tracking-widest">
                        Delivered
                      </span>
                    </td>
                    <td className="py-6 px-2 text-right font-bold">$345.00</td>
                    <td className="py-6 px-2 text-right">
                      <button
                        
                        data-icon="open_in_new"
                       className="opacity-0 group-hover:opacity-100 transition-opacity"><SymbolIcon name={"open_in_new"} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-center">
              <button className="border border-outline-variant/40 px-8 py-3 text-[10px] font-bold tracking-[0.2em] hover:bg-surface-container-high transition-colors">
                Load Full History
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-on-surface text-white p-8 space-y-6">
              <h3 className="font-impact text-3xl tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <button className="w-full bg-primary py-4 px-6 flex items-center justify-between group hover:brightness-110 transition-all">
                  <span className="text-xs font-bold tracking-[0.15em]">
                    Send Coupon
                  </span>
                  <SymbolIcon name={"redeem"} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full border border-white/20 py-4 px-6 flex items-center justify-between group hover:bg-white hover:text-black transition-all">
                  <span className="text-xs font-bold tracking-[0.15em]">
                    Manual Credit
                  </span>
                  <SymbolIcon name={"account_balance_wallet"} />
                </button>
                <button className="w-full border border-white/20 py-4 px-6 flex items-center justify-between group hover:bg-white hover:text-black transition-all">
                  <span className="text-xs font-bold tracking-[0.15em]">
                    Direct Message
                  </span>
                  <SymbolIcon name={"chat_bubble"} />
                </button>
                <div className="pt-6 border-t border-white/10">
                  <button className="w-full text-red-500 py-4 px-6 flex items-center justify-between hover:bg-red-500/10 transition-colors group">
                    <span className="text-xs font-bold tracking-[0.15em]">
                      Block Account
                    </span>
                    <SymbolIcon name={"block"} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 space-y-8">
              <h3 className="font-headline font-black text-xl tracking-tighter">
                Customer DNA
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-bold opacity-40 tracking-widest mb-2">
                    Preferred Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold">
                      Outerwear
                    </span>
                    <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold">
                      Footwear
                    </span>
                    <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold">
                      Limited Drops
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-bold opacity-40 tracking-widest mb-2">
                    Acquisition Source
                  </p>
                  <p className="text-sm font-headline font-bold">
                    IG Editorial Campaign 2022
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold opacity-40 tracking-widest mb-2">
                    Internal Tags
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <div className="w-2 h-2 bg-primary"></div>
                      <span>High Retain Risk (Low Recent Activity)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <div className="w-2 h-2 bg-green-500"></div>
                      <span>No Support Escalations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-outline-variant/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-black text-xl tracking-tighter">
                  Admin Notes
                </h3>
                <SymbolIcon name={"add_comment"} className="text-sm cursor-pointer" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 space-y-2">
                  <p className="text-xs leading-relaxed italic">
                    "Interested in the Neo-Brutalism winter drop. Requested
                    early access link."
                  </p>
                  <div className="flex justify-between items-center opacity-40 text-[9px] font-bold tracking-widest">
                    <span>Agent: Marcus K.</span>
                    <span>2 Days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 overflow-hidden bg-primary py-4 -mx-10 whitespace-nowrap">
          <div className="inline-block animate-marquee font-impact text-4xl text-white tracking-[0.1em] opacity-30">
            STREETRIOT EDITORIAL SYSTEM • PRECISION BRUTALISM • EST 2024 •
            STREETRIOT EDITORIAL SYSTEM • PRECISION BRUTALISM • EST 2024 •
            STREETRIOT EDITORIAL SYSTEM • PRECISION BRUTALISM • EST 2024
          </div>
        </div>
      </main>
    </>
  );
}
