import Ornament from './Ornament'

interface Props {
    badge?: string
    title: string
    highlight?: string
}

export default function PageTitle({ badge, title, highlight }: Props) {
    return (
        <div className="text-center pb-4 shrink-0">
            {badge && (
                <div className="text-[9px] tracking-[0.35em] text-gold-dim uppercase mb-1">{badge}</div>
            )}
            <h1 className="font-display text-2xl font-bold tracking-wider">
                {title} {highlight && <span className="text-gold-light">{highlight}</span>}
            </h1>
            <Ornament className="mt-2" />
        </div>
    )
}