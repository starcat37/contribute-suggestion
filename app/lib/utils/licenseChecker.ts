export const OPEN_SOURCE_LICENSES = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'GPL-2.0',
  'BSD-3-Clause',
  'BSD-2-Clause',
  'ISC',
  'Mozilla Public License 2.0',
  'LGPL-3.0',
  'LGPL-2.1',
  'Unlicense',
  'CC0-1.0'
] as const

export type OpenSourceLicense = typeof OPEN_SOURCE_LICENSES[number]

export function isOpenSourceLicense(license: string | null): license is OpenSourceLicense {
  if (!license) return false
  return OPEN_SOURCE_LICENSES.includes(license as OpenSourceLicense)
}

export function getLicenseInfo(licenseKey: string | null) {
  if (!licenseKey) return null

  const licenseMap: Record<string, { name: string; description: string; url: string }> = {
    'MIT': {
      name: 'MIT License',
      description: '매우 관대한 라이센스로 상업적 이용 가능',
      url: 'https://opensource.org/licenses/MIT'
    },
    'Apache-2.0': {
      name: 'Apache License 2.0',
      description: '특허권 보호가 포함된 관대한 라이센스',
      url: 'https://opensource.org/licenses/Apache-2.0'
    },
    'GPL-3.0': {
      name: 'GNU General Public License v3.0',
      description: 'Copyleft 라이센스, 파생작업도 같은 라이센스 적용',
      url: 'https://opensource.org/licenses/GPL-3.0'
    },
    'BSD-3-Clause': {
      name: 'BSD 3-Clause License',
      description: '간단하고 관대한 라이센스',
      url: 'https://opensource.org/licenses/BSD-3-Clause'
    },
    'ISC': {
      name: 'ISC License',
      description: 'MIT와 유사한 매우 관대한 라이센스',
      url: 'https://opensource.org/licenses/ISC'
    }
  }

  return licenseMap[licenseKey] || {
    name: licenseKey,
    description: '기타 오픈소스 라이센스',
    url: ''
  }
}