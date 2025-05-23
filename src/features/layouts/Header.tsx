import NavHeaderLogo from "./NavHeaderLogo";
import ActionButtons from "./ActionButtons";
import NavHeaderSearch from "./NavHeaderSearch";

const Header = () => {
  return (
    <header className="z-40 shadow-[0px_0px_25px_0px_rgba(94,92,154,0.1)] h-14 flex w-full items-center bg-white px-5 py-2.5 gap-4">
      <NavHeaderLogo />
      <div className="flex items-center gap-4">
        <ActionButtons />
        <NavHeaderSearch />
      </div>
    </header>
  );
};

export default Header;
