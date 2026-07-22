import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp3() {
  return (
    <>
      <div className="flex items-center gap-2 mb-8 text-[10px] font-bold tracking-widest opacity-40">
        <span>Admin</span>
        <SymbolIcon name={"chevron_right"} className="text-[10px]" />
        <span>Customers</span>
        <SymbolIcon name={"chevron_right"} className="text-[10px]" />
        <span className="text-on-surface opacity-100">
          Profile: Elena Vance
        </span>
      </div>
    </>
  );
}
