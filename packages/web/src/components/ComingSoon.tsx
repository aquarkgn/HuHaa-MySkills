interface ComingSoonProps {
  title: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="grid h-full place-items-center text-muted-foreground">
      <div className="text-center">
        <p className="text-h4 text-foreground">{title}</p>
        <p className="mt-1 text-body-sm">待开发，敬请期待</p>
      </div>
    </div>
  )
}
