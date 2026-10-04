import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function ContinueButton({
  text = "Continue",
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      className="group cursor-pointer relative mt-16 px-8 py-4 text-lg md:text-xl bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors overflow-hidden"
      onClick={onClick}
    >
      <span className="relative flex items-center justify-center">
        <span className="transition-transform duration-200 ease-out group-hover:-translate-x-3">
          {text}
        </span>

        <ArrowRightIcon
          aria-hidden="true"
          strokeWidth={3}
          className="absolute right-0 h-5 w-5 translate-x-4 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-3 group-hover:opacity-100"
        />
      </span>
    </button>
  );
}
