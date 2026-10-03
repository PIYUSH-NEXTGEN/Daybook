export interface JournalTextStyle {
  fontFamily: 'sans' | 'serif' | 'cursive' | 'mono'
  fontSize: number
  fontColor: string
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  textAlign: 'left' | 'center' | 'justify'
}

export const defaultTextStyle: JournalTextStyle = {
  fontFamily: 'sans',
  fontSize: 13,
  fontColor: '#334155',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  textAlign: 'left'
}
