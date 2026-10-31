import { Lang } from './types'
// Khmer UI strings need native-speaker review before publication.
const d = {
  en: { search: 'Search provinces or destinations', all: 'All', capital: 'Capital', coastal: 'Coastal', province: 'Province', capitalUnit: 'Capital (first-level administrative unit)', reset: 'Whole Cambodia', overview: 'Overview', area: 'Area', population: 'Population', neighbors: 'Neighbors', attractions: 'Attractions', na: 'Data not available', empty: 'No results', count: 'administrative units', coords: 'Copy name & coordinates', pending: 'Coordinates pending verification', loading: 'Loading boundaries…', fullscreen: 'Fullscreen', dataErr: 'Boundary data is missing or invalid. Run: node scripts/fetch-boundaries.mjs' },
  km: { search: 'ស្វែងរក', all: 'ទាំងអស់', capital: 'រាជធានី', coastal: 'ឆ្នេរសមុទ្រ', province: 'ខេត្ត', capitalUnit: 'រាជធានី (ក្រុមរដ្ឋបាលថ្នាក់ដំបូង)', reset: 'កម្ពុជាទាំងមូល', overview: 'ទិដ្ឋភាពទូទៅ', area: 'ផ្ទៃក្រឡា', population: 'ប្រជាជន', neighbors: 'ខេត្តជិតខាង', attractions: 'ទីតាំងទេសចរណ៍', na: 'មិនមានទិន្នន័យ', empty: 'មិនមានលទ្ធផល', count: 'អង្គភាពរដ្ឋបាល', coords: 'ចម្លងឈ្មោះ និងកូអរដោនេ', pending: 'កូអរដោនេកំពុងរង់ចាំការផ្ទៀងផ្ទាត់', loading: 'កំពុងផ្ទុក…', fullscreen: 'ពេញអេក្រង់', dataErr: 'ទិន្នន័យព្រំដែនបាត់ ឬមិនត្រឹមត្រូវ។' },
}
export const t = (l: Lang, k: keyof typeof d.en) => d[l][k]
