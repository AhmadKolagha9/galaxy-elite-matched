export type HeaderSectionKey = 'private-club' | 'interest-board' | 'private-opportunities' | 'market-pulse' | 'submit'

export type SiteSettings = {
  maintenance: {
    enabled: boolean
    title: string
    message: string
    updatedAt: string | null
  }
  navigation: Record<HeaderSectionKey, boolean>
}

export const headerSectionLabels: Record<HeaderSectionKey, string> = {
  'private-club': 'Private Club',
  'interest-board': 'Interest Board',
  'private-opportunities': 'Private Opportunities',
  'market-pulse': 'Market Pulse',
  submit: 'Submit'
}
