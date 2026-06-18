import { ProgressSpinner } from "primereact/progressspinner";

type LoaderProps = {
  fullScreen?: boolean;
  size?: number;
  text?: string;
};

export default function Loader({
  fullScreen = false,
  size = 50,
  text = "Loading...",
}: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "fixed inset-0 bg-black/20 z-50" : "py-10"
      }`}
    >
      <ProgressSpinner style={{ width: size, height: size }} />
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  );
}