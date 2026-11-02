import { useEffect, useState } from 'preact/hooks';

// A stored Blob needs an object URL to show in <img>; the URL is released when the
// logo changes or the component goes away, or the phone keeps every old copy in memory.
export function LogoImage({ logo, class: className }: { logo: Blob; class?: string }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const next = URL.createObjectURL(logo);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [logo]);
  return url ? <img src={url} alt="" class={className} /> : null;
}
