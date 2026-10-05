import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function ContinueButton({
  text = "Continue",
  disabled = false,
  pophover = "",
  onClick,
}: {
  text?: string;
  disabled?: boolean;
  pophover?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="group cursor-pointer disabled:cursor-not-allowed relative mt-16 px-8 py-4 text-lg md:text-xl bg-white disabled:bg-zinc-600 text-black disabled:text-zinc-300 font-semibold rounded-full hover:bg-gray-200 transition-colors overflow-hidden"
      disabled={disabled}
      title={disabled ? pophover : ""}
      onClick={() => {
        !disabled && onClick();
      }}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={`transition-transform duration-200 ease-out ${
            !disabled ? "group-hover:-translate-x-3" : ""
          }`}
        >
          {text}
        </span>

        <ArrowRightIcon
          aria-hidden="true"
          strokeWidth={3}
          className={`absolute right-0 h-5 w-5 translate-x-4 opacity-0 transition-all duration-200 ease-out ${
            !disabled ? "group-hover:translate-x-3 group-hover:opacity-100" : ""
          }`}
        />
      </span>
    </button>
  );
}
