import { LuSearch } from "react-icons/lu";

const NavHeaderSearch = () => {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <LuSearch size={20} className="text-[#0E1726]" />
      </div>
      <input
        type="text"
        placeholder="Search..."
        className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
      />
    </div>
  );
};

export default NavHeaderSearch;
