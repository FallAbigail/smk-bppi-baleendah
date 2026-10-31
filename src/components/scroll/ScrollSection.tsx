interface Props {
  children: React.ReactNode
  id?: string
}

/** Keep section anchors and layout stable during content entrances. */
export default function ScrollSection({ children, id }: Props) {
  return <div id={id}>{children}</div>
}
