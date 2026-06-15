import { useNavigate } from "react-router";

const ServerErrorPage = ({ error, onReset }) => {
  const navigate = useNavigate();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-[120px] font-['Bebas_Neue',_sans-serif] leading-none tracking-[6px] text-[#2d2d2d] opacity-10 select-none">
          500
        </p>
        <div className="-mt-8">
          <h1 className="text-4xl font-['Bebas_Neue',_sans-serif] tracking-[3px] text-[#2d2d2d]">
            SERVER ERROR
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#5b5b5b]">
            Something went wrong on our end. Please try again shortly.
          </p>
          {error?.message ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-red-500">Error details</p>
              <p className="mt-1 text-xs font-mono text-red-600 break-all">{error.message}</p>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl border border-[#2d2d2d] px-6 py-3 text-sm font-black text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white transition-colors"
            >
              RELOAD PAGE
            </button>
            <button
              onClick={handleReset}
              className="rounded-2xl bg-[#2d2d2d] px-6 py-3 text-sm font-black text-white hover:bg-[#1a1a1a] transition-colors"
            >
              GO TO HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
