"use client";
import { useRouter } from "next/navigation";
import ForwardArrow from "../../../public/next-page.svg";
import BackwardArrow from "../../../public/previous-page.svg";

export default function HistoryArrows() {
  const router = useRouter();

  const goToPreviousPage = () => {
    router.back();
  };

  const goToNextPage = () => {
    router.forward();
  };

  return (
    <div className='grid grid-cols-2 h-full gap-2'>
      <button onClick={goToPreviousPage}>
        <BackwardArrow />
      </button>
      <button onClick={goToNextPage}>
        <ForwardArrow />
      </button>
    </div>
  );
}
