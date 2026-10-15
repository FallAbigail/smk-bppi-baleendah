import { useEffect } from 'react'
import { schoolProfile } from '../data/schoolProfile'

export function usePageMeta(pageTitle: string, description: string) {
  useEffect(() => {
    const title = `${pageTitle} | ${schoolProfile.name}`
    document.title = title
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (descriptionTag) descriptionTag.content = description
    const socialTitleTag = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (socialTitleTag) socialTitleTag.content = title
    const socialDescriptionTag = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]',
    )
    if (socialDescriptionTag) socialDescriptionTag.content = description
    const twitterTitleTag = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
    if (twitterTitleTag) twitterTitleTag.content = title
    const twitterDescriptionTag = document.querySelector<HTMLMetaElement>(
      'meta[name="twitter:description"]',
    )
    if (twitterDescriptionTag) twitterDescriptionTag.content = description
  }, [pageTitle, description])
}
