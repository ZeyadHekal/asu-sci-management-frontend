import Spinner from "../../ui/spinner/Spinner";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-150px)]">
      <Spinner />
    </div>
  );
};

export default LoadingScreen;
