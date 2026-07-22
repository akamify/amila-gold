import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp3() {
  return (
    <>
      <section className="p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-display text-6xl leading-none text-on-surface mb-2">
              ORDER MANAGEMENT
            </h2>
            <p className="font-['Space_Grotesk'] text-sm tracking-[0.2em] opacity-60">
              Fulfillment Pipeline &amp; History
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-on-surface text-white px-8 py-3 font-display text-xl tracking-widest hover:bg-primary transition-colors flex items-center gap-2">
              <SymbolIcon name={"download"} className="text-base" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-0 mb-12 bg-surface-container-low">
          <div className="p-6 border-r border-outline-variant/20">
            <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.2em] opacity-50 mb-1">
              TOTAL ORDERS
            </p>
            <p className="text-display text-4xl">1,284</p>
            <div className="flex items-center gap-1 mt-2 text-primary">
              <SymbolIcon name={"trending_up"} className="text-xs" />
              <span className="text-[10px] font-bold">+12% vs LY</span>
            </div>
          </div>
          <div className="p-6 border-r border-outline-variant/20">
            <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.2em] opacity-50 mb-1">
              PENDING SHIPMENT
            </p>
            <p className="text-display text-4xl text-primary">42</p>
            <div className="w-full bg-surface-container-high h-[2px] mt-4">
              <div className="bg-primary h-full w-2/3"></div>
            </div>
          </div>
          <div className="p-6 border-r border-outline-variant/20">
            <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.2em] opacity-50 mb-1">
              REVENUE (MTD)
            </p>
            <p className="text-display text-4xl">$84,200</p>
            <p className="text-[10px] font-bold opacity-40 mt-2 tracking-tighter">
              Updated 2m ago
            </p>
          </div>
          <div className="p-6">
            <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.2em] opacity-50 mb-1">
              RETURN RATE
            </p>
            <p className="text-display text-4xl">2.4%</p>
            <div className="flex items-center gap-1 mt-2 text-secondary">
              <SymbolIcon name={"check_circle"} className="text-xs" />
              <span className="text-[10px] font-bold tracking-tighter">
                Within Target
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-1 bg-primary w-24 mb-6"></div>
          <div className="flex flex-wrap items-center gap-6 bg-surface p-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold tracking-widest">
                STATUS:
              </span>
              <select className="border-none bg-surface-container-low text-[10px] tracking-widest font-bold focus:ring-1 focus:ring-primary py-1 px-4">
                <option>ALL ORDERS</option>
                <option>PENDING</option>
                <option>PROCESSING</option>
                <option>SHIPPED</option>
                <option>DELIVERED</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold tracking-widest">
                PAYMENT:
              </span>
              <select className="border-none bg-surface-container-low text-[10px] tracking-widest font-bold focus:ring-1 focus:ring-primary py-1 px-4">
                <option>ANY STATUS</option>
                <option>PAID</option>
                <option>UNPAID</option>
                <option>REFUNDED</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold tracking-widest">
                DATE RANGE:
              </span>
              <select className="border-none bg-surface-container-low text-[10px] tracking-widest font-bold focus:ring-1 focus:ring-primary py-1 px-4">
                <option>LAST 30 DAYS</option>
                <option>LAST 7 DAYS</option>
                <option>CUSTOM RANGE</option>
              </select>
            </div>
            <button className="ml-auto flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">
              <SymbolIcon name={"tune"} className="text-sm" />
              Advanced Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="p-4 font-['Space_Grotesk'] text-[10px] tracking-[0.2em] font-bold opacity-60">
                  Order ID
                </th>
                <th className="p-4 font-['Space_Grotesk'] text-[10px] tracking-[0.2em] font-bold opacity-60">
                  Customer
                </th>
                <th className="p-4 font-['Space_Grotesk'] text-[10px] tracking-[0.2em] font-bold opacity-60">
                  Date
                </th>
                <th className="p-4 font-['Space_Grotesk'] text-[10px] tracking-[0.2em] font-bold opacity-60">
                  Total
                </th>
                <th className="p-4 font-['Space_Grotesk'] text-[10px] tracking-[0.2em] font-bold opacity-60">
                  Payment
                </th>
                <th className="p-4 font-['Space_Grotesk'] text-[10px] tracking-[0.2em] font-bold opacity-60">
                  Fulfillment
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="p-4 font-display text-lg tracking-widest text-on-surface">
                  #SR-9824
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-high flex items-center justify-center font-bold text-[10px] font-['Space_Grotesk']">
                      JD
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-tight">
                        Julian Drach
                      </p>
                      <p className="text-[10px] opacity-40 lowercase">
                        j.drach@email.com
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs tracking-tight">
                  OCT 24, 2023
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs font-bold">
                  $245.00
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-[#f0edec] text-[#1c1b1b] text-[9px] font-bold tracking-widest">
                    PAID
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary"></span>
                    <span className="text-[9px] font-bold tracking-widest text-primary">
                      PROCESSING
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <SymbolIcon name={"chevron_right"} className="text-lg" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="p-4 font-display text-lg tracking-widest text-on-surface">
                  #SR-9823
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-high flex items-center justify-center font-bold text-[10px] font-['Space_Grotesk'] text-primary">
                      AM
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-tight">
                        Aki Morita
                      </p>
                      <p className="text-[10px] opacity-40 lowercase">
                        aki.m@tokyodrift.jp
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs tracking-tight">
                  OCT 23, 2023
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs font-bold">
                  $1,120.00
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-[#f0edec] text-[#1c1b1b] text-[9px] font-bold tracking-widest">
                    PAID
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-secondary"></span>
                    <span className="text-[9px] font-bold tracking-widest text-secondary">
                      SHIPPED
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <SymbolIcon name={"chevron_right"} className="text-lg" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="p-4 font-display text-lg tracking-widest text-on-surface">
                  #SR-9822
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-high flex items-center justify-center font-bold text-[10px] font-['Space_Grotesk']">
                      SB
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-tight">
                        Sarah Blake
                      </p>
                      <p className="text-[10px] opacity-40 lowercase">
                        sb@agency.net
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs tracking-tight">
                  OCT 23, 2023
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs font-bold">
                  $89.00
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-[#ffdad6] text-error text-[9px] font-bold tracking-widest">
                    AWAITING
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-surface-variant"></span>
                    <span className="text-[9px] font-bold tracking-widest opacity-40">
                      ON HOLD
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <SymbolIcon name={"chevron_right"} className="text-lg" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="p-4 font-display text-lg tracking-widest text-on-surface">
                  #SR-9821
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-high flex items-center justify-center font-bold text-[10px] font-['Space_Grotesk']">
                      LX
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-tight">
                        Leo Xing
                      </p>
                      <p className="text-[10px] opacity-40 lowercase">
                        xing.leo@vibe.co
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs tracking-tight">
                  OCT 22, 2023
                </td>
                <td className="p-4 font-['Space_Grotesk'] text-xs font-bold">
                  $455.50
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-[#f0edec] text-[#1c1b1b] text-[9px] font-bold tracking-widest">
                    PAID
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-secondary opacity-30"></span>
                    <span className="text-[9px] font-bold tracking-widest opacity-30">
                      DELIVERED
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <SymbolIcon name={"chevron_right"} className="text-lg" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-between items-center border-t border-on-surface pt-8">
          <div className="text-[10px] font-['Space_Grotesk'] tracking-[0.2em] opacity-40">
            Showing 1 to 10 of 1,284 entries
          </div>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 border border-outline-variant/30 flex items-center justify-center hover:bg-on-surface hover:text-white transition-colors">
              <SymbolIcon name={"west"} className="text-sm" />
            </button>
            <button className="px-4 h-10 bg-on-surface text-white font-['Space_Grotesk'] text-xs font-bold">
              01
            </button>
            <button className="px-4 h-10 border border-outline-variant/30 font-['Space_Grotesk'] text-xs font-bold hover:bg-surface-container-low transition-colors">
              02
            </button>
            <button className="px-4 h-10 border border-outline-variant/30 font-['Space_Grotesk'] text-xs font-bold hover:bg-surface-container-low transition-colors">
              03
            </button>
            <span className="px-2 text-xs opacity-30">...</span>
            <button className="px-4 h-10 border border-outline-variant/30 font-['Space_Grotesk'] text-xs font-bold hover:bg-surface-container-low transition-colors">
              128
            </button>
            <button className="w-10 h-10 border border-outline-variant/30 flex items-center justify-center hover:bg-on-surface hover:text-white transition-colors">
              <SymbolIcon name={"east"} className="text-sm" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
