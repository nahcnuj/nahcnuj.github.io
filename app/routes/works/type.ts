import type RemoteImage from '../../components/RemoteImage'
import type { Head } from '../../global'

export type Meta = Head & {
  begins: number
  ends?: number
  thumbnail?: Parameters<typeof RemoteImage>[0]['src']
}
