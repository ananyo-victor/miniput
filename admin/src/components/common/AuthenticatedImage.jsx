import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthenticatedImage = ({ src, alt, className, containerClassName, onClick }) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let currentUrl = null;
    let cancelled = false;

    setObjectUrl(null);
    setFailed(false);

    axios
      .get(`${API_BASE_URL}${src}`, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        currentUrl = URL.createObjectURL(res.data);
        setObjectUrl(currentUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [src]);

  if (failed) {
    return (
      <div className={`${containerClassName} flex items-center justify-center bg-gray-50 text-[10px] text-gray-400 font-bold`}>
        Failed to load
      </div>
    );
  }

  if (!objectUrl) {
    return <div className={`${containerClassName} animate-pulse bg-gray-200`} />;
  }

  return <img src={objectUrl} alt={alt} className={className} onClick={onClick} />;
};

export default AuthenticatedImage;
