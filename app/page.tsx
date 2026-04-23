import { getSheetTabs } from '@/lib/sheets'
import DirectoryClient from './components/DirectoryClient'

export const revalidate = 30;

export default async function Page() {
  let tabs: string[] = []
  
  try {
    tabs = await getSheetTabs()
  } catch (e) {
    console.error('Failed to load sheet tabs:', e)
  }

  return <DirectoryClient initialTabs={tabs} />
}
