interface Props {
  children: React.ReactNode
  id?: string
}

/** Keep section anchors stable; scroll effects belong to the photo within them. */
export default function ScrollSection({ children, id }: Props) {
  return <div id={id}>{children}</div>
}
