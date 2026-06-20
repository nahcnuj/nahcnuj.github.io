type ManifestEntry = {
  file: string
}

type ViteManifest = Record<string, ManifestEntry>

const CLIENT_ENTRY = 'app/client.ts'

function loadViteManifest(): ViteManifest | undefined {
  const modules = import.meta.glob('/dist/.vite/manifest.json', { eager: true }) as Record<
    string,
    { default?: ViteManifest }
  >
  for (const mod of Object.values(modules)) {
    if (mod.default) return mod.default
  }
  return undefined
}

function clientBundleSrc(): string | undefined {
  const manifest = loadViteManifest()
  const entry = manifest?.[CLIENT_ENTRY]
  if (!entry) return undefined

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}${entry.file}`
}

/** Always emits the global client bundle (honox Script skips pages without islands). */
export default function ClientScript({ async: asyncLoad = true }: { async?: boolean }) {
  if (import.meta.env.PROD) {
    const src = clientBundleSrc()
    if (!src) return null
    return <script type="module" {...(asyncLoad ? { async: true } : {})} src={src} />
  }

  return <script type="module" {...(asyncLoad ? { async: true } : {})} src={`/${CLIENT_ENTRY}`} />
}