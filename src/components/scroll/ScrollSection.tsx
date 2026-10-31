interface Props {
  children: React.ReactNode
  id?: string
}

/** Keep navigation anchors stable while their semantic sections move. */
export default function ScrollSection({ children, id }: Props) {
  return <div id={id}>{children}</div>
}
