import { useNavigate } from "react-router";

const ServerErrorPage = ({ error, onReset }) => {
  const navigate = useNavigate();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-[120px] font-['Bebas_Neue',_sans-serif] leading-none tracking-[6px] text-[#0E2A4A] opacity-10 select-none">
          500
        </p>
        <div className="-mt-8">
          <h1 className="text-4xl font-['Bebas_Neue',_sans-serif] tracking-[3px] text-[#0E2A4A]">
            SERVER ERROR
          </h1>
          <p className="mt-3 text-sm font-semibold text-gray-500">
            Something went wrong on our end. Please try again or return to the dashboard.
          </p>
          {error?.message ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-red-500">Error details</p>
              <p className="mt-1 text-xs font-mono text-red-600 break-all">{error.message}</p>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-[#0E2A4A] px-6 py-3 text-sm font-black text-[#0E2A4A] hover:bg-[#0E2A4A] hover:text-white transition-colors"
            >
              RELOAD PAGE
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl bg-[#0E2A4A] px-6 py-3 text-sm font-black text-white hover:bg-[#1a3d6e] transition-colors"
            >
              GO TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
