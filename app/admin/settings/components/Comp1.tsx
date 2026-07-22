import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp1() {
  return (
    <>
      <main className="ml-64 pt-24 px-12 pb-20 bg-surface min-h-screen">
        <div className="mb-12">
          <h2 className="text-7xl font-impact tracking-tighter text-on-surface mb-2">
            SYSTEM CONFIG
          </h2>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-primary text-white text-[10px] font-headline font-bold tracking-widest">
              LIVE SERVER
            </span>
            <span className="text-xs font-headline text-on-surface/40 tracking-widest">
              V 2.0.4 - KINETIC EDITORIAL ENGINE
            </span>
          </div>
        </div>

        <div className="flex gap-12 border-b border-outline-variant/20 mb-12 overflow-x-auto whitespace-nowrap">
          <button className="pb-4 border-b-2 border-primary text-on-surface font-headline font-bold tracking-widest text-sm transition-all">
            General
          </button>
          <button className="pb-4 border-b-2 border-transparent text-on-surface/40 hover:text-on-surface font-headline font-bold tracking-widest text-sm transition-all">
            Payments
          </button>
          <button className="pb-4 border-b-2 border-transparent text-on-surface/40 hover:text-on-surface font-headline font-bold tracking-widest text-sm transition-all">
            Shipping
          </button>
          <button className="pb-4 border-b-2 border-transparent text-on-surface/40 hover:text-on-surface font-headline font-bold tracking-widest text-sm transition-all">
            Team
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 space-y-12">
            <div className="bg-surface-container-lowest p-0 relative border-l-4 border-primary">
              <div className="p-8">
                <h3 className="text-xl font-headline font-black mb-8 flex items-center gap-2">
                  <SymbolIcon name={"info"} />
                  General Identity
                </h3>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-headline font-bold tracking-widest text-on-surface/50">
                        Brand Name
                      </label>
                      <input
                        className="w-full border-0 border-b border-outline-variant/40 bg-transparent px-0 py-2 focus:ring-0 focus:border-primary font-headline text-lg transition-all"
                        type="text"
                        value="STREETRIOT"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-headline font-bold tracking-widest text-on-surface/50">
                        Support Email
                      </label>
                      <input
                        className="w-full border-0 border-b border-outline-variant/40 bg-transparent px-0 py-2 focus:ring-0 focus:border-primary font-body text-base transition-all"
                        type="email"
                        value="ops@streetriot.cc"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-headline font-bold tracking-widest text-on-surface/50">
                      Brand Assets
                    </label>
                    <div className="flex items-center gap-6 p-6 bg-surface-container-low border border-dashed border-outline-variant/40">
                      <div className="w-24 h-24 bg-on-surface flex items-center justify-center p-4">
                        <h4 className="text-white font-impact text-xl">RIOT</h4>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold mb-1">
                          Primary Vector Logo
                        </p>
                        <p className="text-[10px] opacity-50 mb-4">
                          SVG, PNG or WEBP. MAX 2MB.
                        </p>
                        <button className="px-4 py-2 bg-on-surface text-white text-[10px] font-headline font-bold hover:bg-primary transition-colors">
                          Replace Asset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 relative">
              <h3 className="text-xl font-headline font-black mb-8 flex items-center gap-2">
                <SymbolIcon name={"groups"} />
                Team Access
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-outline-variant/20 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container-high overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="close-up portrait of a male creative professional with glasses and a serious expression in high-key lighting"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhEQPduA8F6td8E8A-XrHs8g8fTRdPc-ZnWNAcRPCu8nSdU9h7jAnUAf2pbxfzCSxQEWJQIa61q4AJyAC-Ux2O7EtnwiSTJlT0tRkaIYYp3IJZWyz1P667-vSI1uot3sNnRb9gEynXIhsYtFmXOGxalWyGyPFFURxAWrypUX7E69x-WqLdwntPvtbsRTBYyrdM7Ha0sXDnFD-Jc2SgsyBjREKKLVrW1Rc-rO6qn986T-TjwG9x3tjV8GnFUahASfwVRg6PC05PBK-I"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-headline">
                        Marcus Vane
                      </p>
                      <p className="text-[10px] font-body opacity-50">
                        marcus@streetriot.cc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 border border-on-surface/20 text-[9px] font-headline font-bold">
                      Owner
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <SymbolIcon name={"more_vert"} className="text-sm" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-outline-variant/20 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container-high overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="professional portrait of a young woman with dark hair against a minimalist grey background with sharp shadows"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdnyoQTz6bqUAig_uUgi1g_pl_ux8-XRY2PfwZb7CB8LL7XN-s0WntNTFTMN13lVFPhDu0BsnejKQNy3yqfKP0jtPLzn3AFTD_dzoB5yxTwJxvuYvDyd89N_dZ8UFG79brzrr35H9V35d2OXY6cJ-bw0qUo41P7bmmlpDwen87l0q_eapE9Hb97WxFoFSge47qmVpVT0rXPufRjxlEEYJXLbIq8JmEQaP_2tBIgDJ3cNY0Gb5GACx8wlhwSxG2kbb43clUatfej7Sz"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-headline">
                        Elena Rossi
                      </p>
                      <p className="text-[10px] font-body opacity-50">
                        elena@streetriot.cc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 border border-on-surface/20 text-[9px] font-headline font-bold">
                      Editor
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <SymbolIcon name={"more_vert"} className="text-sm" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-outline-variant/20 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container-high overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="profile photo of a diverse male team member in professional attire with neutral studio lighting"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0scAi7VZTmq5OhYY42sZsnwL_ES32lZfFyXV7enmkj8PCv7MxRBGnBIQYUrS13QTnP4lLcD9Tn5H94jUIlvyPOgHbcQt2w1_C9PrbUwQYEsZQftJrVH9alO2sxUzUeCaJ6ZLYWjrIhw8Uu0vN5NeoXgN8iCpZiOZ2V37_eQkgpKiMHeIuyZWJJLGKJSZt1KAsncIu41KPjsDyagoMFtdNuTKMFT2jFMVIr1ebIYGDkqWUTDchto7ULoVNfOa4m_fV2f2yTZLML1xa"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-headline">
                        Julian Cho
                      </p>
                      <p className="text-[10px] font-body opacity-50">
                        j.cho@streetriot.cc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 border border-on-surface/20 text-[9px] font-headline font-bold opacity-50">
                      Viewer
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <SymbolIcon name={"more_vert"} className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
              <button className="mt-8 w-full py-4 border border-on-surface text-[10px] font-headline font-black tracking-[0.2em] hover:bg-on-surface hover:text-white transition-all">
                Invite New Member
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-8">
            <div className="bg-on-surface p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-headline font-black mb-8 flex items-center gap-2 text-primary">
                  <SymbolIcon name={"payments"} />
                  Gateways
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold tracking-widest text-white/40">
                      Stripe Live Key
                    </label>
                    <div className="relative">
                      <input
                        className="w-full border-0 border-b border-white/20 bg-transparent px-0 py-2 focus:ring-0 focus:border-primary font-mono text-xs transition-all text-white/80"
                        type="password"
                        value="pk_live_51MvR9SGI7Y8rF9q1"
                      />
                      <SymbolIcon name={"visibility"} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold tracking-widest text-white/40">
                      PayPal Client ID
                    </label>
                    <input
                      className="w-full border-0 border-b border-white/20 bg-transparent px-0 py-2 focus:ring-0 focus:border-primary font-mono text-xs transition-all text-white/80"
                      type="text"
                      value="AS-K8J2_9Lk_Riot_001"
                    />
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button className="px-6 py-2 bg-primary text-white text-[10px] font-headline font-bold tracking-widest">
                      Connect
                    </button>
                    <button className="px-6 py-2 border border-white/20 text-white text-[10px] font-headline font-bold tracking-widest hover:bg-white hover:text-on-surface transition-all">
                      Test Mode
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
                <SymbolIcon name={"bolt"} className="text-[200px]" />
              </div>
            </div>

            <div className="bg-surface-container-high p-8">
              <h3 className="text-xl font-headline font-black mb-8 flex items-center gap-2">
                <SymbolIcon name={"local_shipping"} />
                Shipping Zones
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-surface-container-lowest border-l-2 border-primary flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-headline font-bold tracking-widest">
                      India (Domestic)
                    </p>
                    <p className="text-lg font-impact tracking-tight">
                      ₹0.00{" "}
                      <span className="text-[10px] font-headline opacity-50 tracking-normal">
                        Free Express
                      </span>
                    </p>
                  </div>
                  <button
                    
                    data-icon="edit"
                   className="text-on-surface/40 hover:text-primary transition-colors"><SymbolIcon name={"edit"} /></button>
                </div>
                <div className="p-4 bg-surface-container-lowest border-l-2 border-on-surface/20 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-headline font-bold tracking-widest">
                      International (Zone 1)
                    </p>
                    <p className="text-lg font-impact tracking-tight">
                      $45.00{" "}
                      <span className="text-[10px] font-headline opacity-50 tracking-normal">
                        Flat Rate
                      </span>
                    </p>
                  </div>
                  <button
                    
                    data-icon="edit"
                   className="text-on-surface/40 hover:text-primary transition-colors"><SymbolIcon name={"edit"} /></button>
                </div>
              </div>
              <button className="mt-6 flex items-center gap-2 text-[10px] font-headline font-bold tracking-widest text-primary hover:gap-4 transition-all">
                Add New Zone
                <SymbolIcon name={"arrow_forward"} className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 left-64 bg-surface/80 backdrop-blur-md border-t border-outline-variant/10 px-12 py-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span className="text-[10px] font-headline font-bold tracking-[0.2em] opacity-40">
              Unsaved Changes detected in GATEWAYS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-8 py-3 text-[10px] font-headline font-black tracking-[0.2em] text-on-surface/40 hover:text-on-surface transition-colors">
              Discard
            </button>
            <button className="px-12 py-3 bg-on-surface text-white text-[10px] font-headline font-black tracking-[0.2em] hover:bg-primary transition-colors Active:scale-95 duration-100">
              Synchronize Core
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
