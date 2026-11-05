import { Badge } from './ui/index.jsx'
import { estadoInfo } from '../lib/store.jsx'

export default function EstadoBadge({ estado }) {
  const e = estadoInfo(estado)
  return <Badge tone={e.tone}>{e.label}</Badge>
}
