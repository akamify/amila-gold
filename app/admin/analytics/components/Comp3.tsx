import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp3() {
  return (
    <>
      <div className="p-8 space-y-8">
        <div className="w-full h-1 bg-primary"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] text-primary">
              Intelligence Hub
            </span>
            <h2 className="text-6xl font-black tracking-tighter leading-none bebas">
              Customer Analytics
            </h2>
          </div>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-on-surface text-white text-xs font-bold tracking-widest hover:bg-primary transition-colors">
              Export Report
            </button>
            <button className="px-8 py-3 border border-outline-variant/20 text-on-surface text-xs font-bold tracking-widest hover:bg-surface-container-high transition-colors">
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-64">
          <div className="md:col-span-2 bg-surface-container-low p-6 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-xs font-bold tracking-widest opacity-60">
                High-Value Segment
              </span>
              <div className="text-5xl font-black bebas mt-2">
                1,284{" "}
                <span className="text-sm tracking-normal font-sans opacity-40">
                  Users
                </span>
              </div>
            </div>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-xs font-bold tracking-widest text-primary">
                  +12.4% Increase
                </p>
                <p className="text-[10px] opacity-40 tracking-tighter">
                  Month over Month
                </p>
              </div>
              <SymbolIcon name={"trending_up"} className="text-4xl opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <SymbolIcon name={"star"} className="text-[120px]" />
            </div>
          </div>

          <div className="bg-surface-container-highest p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest opacity-60">
                Average LTV
              </span>
              <div className="text-4xl font-black bebas mt-2">$842.50</div>
            </div>
            <div className="w-full h-1 bg-on-surface/10 mt-4">
              <div className="w-3/4 h-full bg-on-surface"></div>
            </div>
            <p className="text-[10px] opacity-40 tracking-widest mt-2">
              Target: $1,000
            </p>
          </div>

          <div className="bg-primary p-6 text-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest opacity-80">
                Churn Risk
              </span>
              <div className="text-4xl font-black bebas mt-2">4.2%</div>
            </div>
            <div className="flex items-center gap-2">
              <SymbolIcon name={"warning"} className="text-sm" />
              <p className="text-[10px] font-bold tracking-widest">
                Action Required
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="text-xl font-bold tracking-wider">
              Top Tier Customers
            </h3>
            <div className="flex gap-8 text-[10px] font-bold tracking-widest opacity-40">
              <span>All Users (14.2k)</span>
              <span className="text-on-surface opacity-100 border-b-2 border-primary">
                Loyalists (3.1k)
              </span>
              <span>New (842)</span>
              <span>At Risk (112)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-[10px] tracking-[0.2em] font-bold">
                  <th className="p-4">Customer Identity</th>
                  <th className="p-4">Segment</th>
                  <th className="p-4">Engagement Score</th>
                  <th className="p-4">Lifetime Value</th>
                  <th className="p-4">Last Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-high">
                        <img
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          data-alt="Close up of a young man with buzz cut and sharp features, wearing a black technical jacket, minimalist urban background"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPT-_THAPlUHzM0MlY0OyQIMHKYkjeIpw_UzQkjroGuAhYmPMbsoQt1R3SHw3eEFTOBNZK9QT9ALNooaVjKu1lC3R5-Rm_mF6VB2jMExwHtLzwYgGq2vS1-rvtkIG1TsElf_mZ2cG5SIuCnB2G3BMkvcmTYzzDf3uUair92v9IY7so-Bm6kcT8gr3aaYfgWDtI46QCOfo5ODW_qOi4TYki40F9AWVKJJ8s3AnZcNLiEnhhfyadFfizIVykKeDzvXbudAPU3NCW73-z"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">
                          Marcus Sterling
                        </p>
                        <p className="text-xs opacity-40">
                          m.sterling@example.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-on-surface text-white text-[9px] font-bold tracking-widest">
                      Iconic Loyalist
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary/20"></div>
                      </div>
                      <span className="text-xs font-bold bebas">92/100</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-black bebas">$4,120.00</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-medium">2 Hours ago</p>
                    <p className="text-[10px] opacity-40">RIOT-77421-JKT</p>
                  </td>
                  <td className="p-4 text-right">
                    <button  className="opacity-40 hover:opacity-100 hover:text-primary transition-all"><SymbolIcon name={"more_vert"} /></button>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-high">
                        <img
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          data-alt="Young woman with bleached hair and edgy makeup, wearing an oversized graphic hoodie, cool studio lighting with red accents"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjqAmlMHBsqVOzf2RwKMVWJTeOA-boPNDq7KND3f2B8SQ0aQSCeQ2SY38kOL2U4TQiW8NjKTwtyclWISMgp2McO5ZTe1buEfi1DGJt35yIgLf2Z8IckRaLadOLhck0UnH3yhG0sKM-1ExJNdiNFF2_ztTaNUUOGdtLQAtZrwleI5whl3BMjrr7ICCOXGTXOX8_f6DL6joOV9T468mhxMWED6jm4q3F5iaNcFIiKKyeRmKEymp7NfXRd5_qT4REZ5KgmaIHdYJ-1-Uu"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">
                          Elena Vance
                        </p>
                        <p className="text-xs opacity-40">vance.e@cyber.net</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-surface-container-highest text-on-surface text-[9px] font-bold tracking-widest">
                      Whale Buyer
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                      </div>
                      <span className="text-xs font-bold bebas">98/100</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-black bebas">$8,940.22</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-medium">1 Day ago</p>
                    <p className="text-[10px] opacity-40">RIOT-11209-ACC</p>
                  </td>
                  <td className="p-4 text-right">
                    <button  className="opacity-40 hover:opacity-100 hover:text-primary transition-all"><SymbolIcon name={"more_vert"} /></button>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-high">
                        <img
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          data-alt="Cool man with braids and sunglasses looking away, urban environment background with bokeh effect, neon lighting vibes"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPNvAuN1ex1g7K3nqQ67HR6GlWpI1GxFyCT7GTAZhIjttfAKY9X1oqg44AMH9etwKqs1rV2-7oxpNBYCh5vmKvUBERPAaHVi-d6AQBs7WnN0gb5s-2Ov0PGMyCcx1mNeqee-Tw4AwuKzNR0443J_PE9ExlaFcthDU2L0Yc44b0_w5HWnAhfQRBMSeCfEstOsIK14kcMiIqbjuGvIQ2SkryuZ6pJ5p2DMeLzBT0yjUXzHBDroEBr1_Afw0BkExgIhvK7r8asoI2fkLg"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">
                          Koji Tanaka
                        </p>
                        <p className="text-xs opacity-40">tanaka.k@street.jp</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 border border-primary text-primary text-[9px] font-bold tracking-widest">
                      Early Adopter
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary"></div>
                        <div className="w-1.5 h-3 bg-primary/20"></div>
                        <div className="w-1.5 h-3 bg-primary/20"></div>
                        <div className="w-1.5 h-3 bg-primary/20"></div>
                      </div>
                      <span className="text-xs font-bold bebas">45/100</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-black bebas">$1,250.00</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-medium">3 Days ago</p>
                    <p className="text-[10px] opacity-40">RIOT-99301-TEE</p>
                  </td>
                  <td className="p-4 text-right">
                    <button  className="opacity-40 hover:opacity-100 hover:text-primary transition-all"><SymbolIcon name={"more_vert"} /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="relative overflow-hidden bg-on-surface h-12 flex items-center mt-12">
            <div className="whitespace-nowrap flex animate-marquee">
              <span className="text-white bebas text-3xl mx-8 opacity-20">
                MAXIMUM ENGAGEMENT • LATEST ANALYTICS • DATA PRECISION •
                STREETRIOT SYSTEM • MAXIMUM ENGAGEMENT • LATEST ANALYTICS • DATA
                PRECISION • STREETRIOT SYSTEM •
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          <div className="space-y-4 border-l-4 border-primary pl-6">
            <h4 className="font-bold tracking-widest text-xs">
              Retention Rate
            </h4>
            <p className="text-5xl font-black bebas">78.4%</p>
            <p className="text-xs opacity-60 leading-relaxed font-body">
              Customer retention has spiked following the release of the limited
              "NightRider" collection. Loyalists show 4x higher repeat purchase
              frequency.
            </p>
          </div>
          <div className="space-y-4 border-l-4 border-on-surface pl-6">
            <h4 className="font-bold tracking-widest text-xs">
              AOV Growth
            </h4>
            <p className="text-5xl font-black bebas">+$42.10</p>
            <p className="text-xs opacity-60 leading-relaxed font-body">
              Average Order Value is trending upward due to successful
              cross-selling of accessory bundles at checkout.
            </p>
          </div>
          <div className="space-y-4 border-l-4 border-outline-variant pl-6">
            <h4 className="font-bold tracking-widest text-xs">
              Social Signal
            </h4>
            <p className="text-5xl font-black bebas">High</p>
            <p className="text-xs opacity-60 leading-relaxed font-body">
              UGC mentions across major social platforms have increased by 200%
              this quarter among the top 1% of customers.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
