import SymbolIcon from "@/app/components/icons/SymbolIcon";
export default function Comp2() {
  return (
    <>
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform z-50">
        <SymbolIcon name={"add"} className="text-3xl" />
      </button>
    </>
  );
}
