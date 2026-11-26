import { lazy, Suspense } from "react";
import { isComponentBookingEnabled } from "../componentBookingFlag";

const LazyBookingRequestBlock = lazy(() => import("./BookingRequestBlockImpl"));

export default function BookingRequestBlock(props) {
  if (!isComponentBookingEnabled()) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyBookingRequestBlock {...props} />
    </Suspense>
  );
}