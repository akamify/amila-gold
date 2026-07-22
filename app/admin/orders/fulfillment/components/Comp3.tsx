import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp3() {
  return (
    <>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bebas tracking-tight leading-none">
              Order #SR-92841
            </h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold tracking-widest">
                Processing
              </span>
              <span className="px-3 py-1 border border-primary text-primary text-[10px] font-bold tracking-widest">
                Paid
              </span>
              <span className="text-secondary text-xs font-medium">
                Placed on Oct 24, 2023 at 14:32 PM
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-container-highest px-6 py-3 font-space text-xs font-bold tracking-widest border-none hover:bg-surface-dim transition-colors">
              Print Invoice
            </button>
            <button className="bg-on-surface text-surface px-6 py-3 font-space text-xs font-bold tracking-widest border-none hover:bg-primary transition-colors">
              Update Status
            </button>
          </div>
        </div>
        <div className="h-1 bg-primary w-full max-w-[120px]"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-surface-container-lowest p-0">
              <div className="p-6 bg-surface-container-low flex justify-between items-center">
                <h3 className="font-bebas text-2xl tracking-wide">
                  Order Items (3)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-surface-container-high">
                    <tr className="text-[10px] tracking-[0.2em] font-bold text-secondary">
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    <tr>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-24 bg-surface-container-high overflow-hidden">
                            <img
                              alt="Black Hoody"
                              className="w-full h-full object-cover grayscale contrast-125"
                              data-alt="Close-up of a high-end black luxury streetwear hoodie with thick fabric texture and minimal branding in a clinical studio setting"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxOS_wauukYbWtxsg6zO3Ctuq9-2JFHtvld2SXlMp_hTJj7F6xRjLrXm_6xfkPWAoPv7PoyuVT9755-RUPKg3QydFJ0D0w0PPCypec6cajNhRfr_WC-XPSleUhzCJQHNDxHI0IZofYmV-NYzLub8kN8tMcOKDzv_rDxmPYEznjL8vAcWK1Zax7Qevqr2nQxaQD-XBM8AghoRcMUX8C6zPMlA1DWNDq9s-6p6b85YtuF7s6_zfsYlDPqaWuz5cVtuMEVZdRyY8FVqRl"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm tracking-tight">
                              KINETIC OVERSIZED HOODIE
                            </p>
                            <p className="text-xs text-secondary">
                              Size: XL / Color: Midnight Black
                            </p>
                            <p className="text-[10px] font-mono text-primary">
                              SKU: SR-HOOD-001
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-mono text-sm">01</td>
                      <td className="px-6 py-6 font-mono text-sm">$120.00</td>
                      <td className="px-6 py-6 font-mono text-sm text-right font-bold">
                        $120.00
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-24 bg-surface-container-high overflow-hidden">
                            <img
                              alt="Red Sneakers"
                              className="w-full h-full object-cover"
                              data-alt="Vibrant red performance sneakers on a concrete surface with harsh directional lighting creating sharp shadows"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfrYBmJlPgKzBfWVOfyRoaRZWFnnCL0iqgvER3aL60T3z2DzzwnZiGu5I2dYArGnG8YDMnzrvypeu5E4o8OKqqd1jbaqSqT80Q5tIL0S0bHPTGqTEF4XdTuVLX3smJoqcIPzRmUKczJRG6RJG9tu2h5ZpByxbUWI6ND_WpYPc757xy1D2CasGuutH5phdqr8XwzTpOcgBMAfpvOqPtnxYsT4DAtMgjG6DZght9m4p2R_swoCg-KgKj4BJH3sgKgbdU6NwrKKSfg_a2"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm tracking-tight">
                              RIOT VELOCITY RUNNERS
                            </p>
                            <p className="text-xs text-secondary">
                              Size: 11 / Color: Kinetic Red
                            </p>
                            <p className="text-[10px] font-mono text-primary">
                              SKU: SR-SHOE-992
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-mono text-sm">01</td>
                      <td className="px-6 py-6 font-mono text-sm">$280.00</td>
                      <td className="px-6 py-6 font-mono text-sm text-right font-bold">
                        $280.00
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-24 bg-surface-container-high overflow-hidden">
                            <img
                              alt="White Watch"
                              className="w-full h-full object-cover grayscale"
                              data-alt="Minimalist technical white smartwatch on a dark brushed metal surface with aggressive lighting and sharp edges"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb92wPxzPPBlEzhfa68_d3lu_jV6W-ptk_YfA-9WiFHq0vvQkQPXINToqWnw8IMbWydkr9sGnxZ90nrfQaVbAyiAr6HNeoAgeWf8ZN2xBBSWUFNhIOTPu7ydzRz_2RLaI7oggbWFw8IOU10YIpwgOlhDWBiMgoP6duZ6czAsGiZ68_Xy4ljVf77gSOYt3ym0oWyv5C-bQkWDvO5ZvOOObBTLcJ7zv7QryfzPVx5--7lJN2tHXta0dsdBn-zsjStNQRlFhTQvQZiTbS"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm tracking-tight">
                              PRECISION CHRONO WHITE
                            </p>
                            <p className="text-xs text-secondary">
                              Size: OS / Color: Stark White
                            </p>
                            <p className="text-[10px] font-mono text-primary">
                              SKU: SR-ACC-110
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-mono text-sm">01</td>
                      <td className="px-6 py-6 font-mono text-sm">$145.00</td>
                      <td className="px-6 py-6 font-mono text-sm text-right font-bold">
                        $145.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-8 flex flex-col items-end space-y-2 border-t border-surface-container-high">
                <div className="flex justify-between w-full max-w-xs text-xs">
                  <span className="text-secondary">Subtotal</span>
                  <span className="font-mono">$545.00</span>
                </div>
                <div className="flex justify-between w-full max-w-xs text-xs">
                  <span className="text-secondary">
                    Shipping (Flat Rate)
                  </span>
                  <span className="font-mono">$15.00</span>
                </div>
                <div className="flex justify-between w-full max-w-xs text-xs">
                  <span className="text-secondary">Tax (9.5%)</span>
                  <span className="font-mono">$51.78</span>
                </div>
                <div className="flex justify-between w-full max-w-xs pt-4">
                  <span className="font-bebas text-2xl tracking-widest">
                    Total
                  </span>
                  <span className="font-bebas text-2xl text-primary tracking-widest">
                    $611.78
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-surface p-8 border border-outline-variant/20">
              <h3 className="font-bebas text-2xl tracking-wide mb-8">
                Order Timeline
              </h3>
              <div className="relative space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-primary flex items-center justify-center text-on-primary">
                    <SymbolIcon name={"check"} className="text-[14px]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">
                      ORDER PLACED
                    </p>
                    <p className="text-xs text-secondary">
                      The order was successfully submitted by Marcus Thorne.
                    </p>
                    <p className="text-[10px] font-mono text-primary">
                      OCT 24, 14:32 PM
                    </p>
                  </div>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-primary flex items-center justify-center text-on-primary">
                    <SymbolIcon name={"payments"} className="text-[14px]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">
                      PAYMENT CONFIRMED
                    </p>
                    <p className="text-xs text-secondary">
                      Payment of $611.78 authorized via Apple Pay.
                    </p>
                    <p className="text-[10px] font-mono text-primary">
                      OCT 24, 14:35 PM
                    </p>
                  </div>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-surface-container-high flex items-center justify-center text-on-surface">
                    <SymbolIcon name={"inventory_2"} className="text-[14px]" />
                  </div>
                  <div className="space-y-1 opacity-50">
                    <p className="font-bold text-sm tracking-tight">
                      Processing &amp; Fulfillment
                    </p>
                    <p className="text-xs text-secondary">
                      Warehouse is currently picking and packing items.
                    </p>
                    <p className="text-[10px] font-mono">PENDING</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-surface-container-low p-8 border-l-4 border-primary">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bebas text-2xl tracking-wide">
                  Customer
                </h3>
                <SymbolIcon name={"edit"} className="text-secondary hover:text-primary cursor-pointer" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-on-surface text-surface flex items-center justify-center font-bold text-xl">
                  MT
                </div>
                <div>
                  <p className="font-bold tracking-tight">Marcus Thorne</p>
                  <p className="text-xs text-secondary">Premium Member</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-secondary">
                    Email Address
                  </label>
                  <p className="text-sm font-medium">
                    m.thorne@kinetic-editorial.com
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-secondary">
                    Contact Phone
                  </label>
                  <p className="text-sm font-medium">+1 (555) 012-9842</p>
                </div>
                <div className="pt-4 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary">
                      Total Orders
                    </span>
                    <span className="font-mono font-bold">12 Orders</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-8 shadow-[0_12px_40px_rgba(28,27,27,0.06)]">
              <h3 className="font-bebas text-2xl tracking-wide mb-6">
                Shipping Logistics
              </h3>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-secondary">
                    Delivery Address
                  </label>
                  <p className="text-sm font-medium leading-relaxed">
                    842 Kinetic Way, Suite 400
                    <br />
                    Distrito Industrial
                    <br />
                    New York, NY 10001
                    <br />
                    United States
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-secondary">
                    Shipping Carrier
                  </label>
                  <div className="relative">
                    <select className="w-full bg-surface py-2 px-3 border border-outline-variant/30 text-sm focus:border-primary focus:ring-0 appearance-none">
                      <option>FedEx Priority Overnight</option>
                      <option>DHL Express Worldwide</option>
                      <option>UPS Ground</option>
                    </select>
                    <SymbolIcon name={"expand_more"} className="absolute right-2 top-2 pointer-events-none text-secondary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-secondary">
                    Tracking ID
                  </label>
                  <div className="relative flex">
                    <input
                      className="flex-1 bg-surface py-2 px-3 border border-outline-variant/30 text-sm focus:border-primary focus:ring-0 font-mono"
                      type="text"
                      value="SR-TRK-771928"
                    />
                    <button className="bg-on-surface text-surface px-4 py-2 hover:bg-primary transition-colors">
                      <SymbolIcon name={"content_copy"} className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-surface-container-high">
                <h4 className="text-[10px] font-bold tracking-widest text-secondary mb-4">
                  Location Map
                </h4>
                <div className="w-full h-32 bg-surface-container-high overflow-hidden">
                  <img
                    alt="New York Map"
                    className="w-full h-full object-cover grayscale contrast-150 opacity-40"
                    data-location="New York"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOoHXmPSaFcfvzFgIXGyEKoXNI5sr4iw436w95Y0AqSOZ9PDjLKGL8w6WdPfvAGRFthPP_wSOcsExjyV1KrtBEhbuH--Xi-zXOiift9ffDA_LYv5Xbyf3iKUBXKWAbgHzWNBPQ7p3slLlkWeELdyyae-zFEZEJkmrwDbwxXTnr3GoPL9SIx3DAiZMJwY5pFKuL11tFpAdd06L9usFzUav7_TYnxn3aCwmM_ADmH0Ywume_biyizcB1JMa_qTLd_FvF8cFgdwQu3R0G"
                  />
                </div>
              </div>
            </section>

            <section className="bg-on-surface p-8 text-surface">
              <h3 className="font-bebas text-2xl tracking-wide mb-6">
                Status Management
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest opacity-60">
                    Order Status
                  </label>
                  <select className="w-full bg-[#2c2b2b] py-3 px-4 border-none text-sm focus:ring-2 focus:ring-primary text-surface font-bold tracking-widest">
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <button className="w-full py-4 bg-primary text-on-primary font-space font-black tracking-widest text-xs hover:scale-[1.02] transition-transform">
                  Notify Customer
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="overflow-hidden bg-surface-container-low py-4 border-y border-outline-variant/10">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            <span className="font-bebas text-4xl opacity-10 tracking-widest">
              StreetRiot Kinetic Systems
            </span>
            <span className="font-bebas text-4xl opacity-10 tracking-widest">
              Precision Brutalism
            </span>
            <span className="font-bebas text-4xl opacity-10 tracking-widest">
              Editorial Control
            </span>
            <span className="font-bebas text-4xl opacity-10 tracking-widest">
              High Velocity Flow
            </span>
            <span className="font-bebas text-4xl opacity-10 tracking-widest">
              StreetRiot Kinetic Systems
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
