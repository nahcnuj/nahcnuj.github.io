export default function RemoteImage({
  baseUrl = 'https://img.nahcnuj.work',
  src,
  alt,
  ...props
}: { baseUrl?: string; src: `/${string}`; alt: string; width?: number; height?: number }) {
  return <img {...props} alt={alt} src={baseUrl + src} />
}
