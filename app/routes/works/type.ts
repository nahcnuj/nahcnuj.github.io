import RemoteImage from '../../components/RemoteImage'
import { Head } from '../../global'

export type Meta = Head & {
  begins: number
  ends?: number
  thumbnail?: Parameters<typeof RemoteImage>[0]['src']
}
