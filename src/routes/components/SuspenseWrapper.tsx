import { PropsWithChildren, Suspense } from "react";
import LoadingScreen from "./LoadingScreen";

const SuspenseWrapper = ({ children }: PropsWithChildren) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};

export default SuspenseWrapper;
