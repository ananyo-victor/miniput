import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-[120px] font-['Bebas_Neue',_sans-serif] leading-none tracking-[6px] text-[#2d2d2d] opacity-10 select-none">
          404
        </p>
        <div className="-mt-8">
          <h1 className="text-4xl font-['Bebas_Neue',_sans-serif] tracking-[3px] text-[#2d2d2d]">
            PAGE NOT FOUND
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#5b5b5b]">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-[#2d2d2d] px-6 py-3 text-sm font-black text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white transition-colors"
            >
              GO BACK
            </button>
            <button
              onClick={() => navigate("/home")}
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

export default NotFoundPage;
