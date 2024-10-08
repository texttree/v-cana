import { useEffect, useState } from 'react'
import Link from 'next/link'
import Close from 'public/close.svg'

const availableOs = ['Windows', 'Linux']

function Download({ t }) {
  const getOSAndArchitecture = () => {
    const userAgent = window.navigator.userAgent

    let os = 'Unknown OS'
    let architecture = 'Unknown Architecture'

    if (userAgent.indexOf('Win') !== -1) {
      os = 'Windows'
      if (userAgent.indexOf('WOW64') !== -1 || userAgent.indexOf('Win64') !== -1) {
        architecture = '64-bit'
      } else {
        architecture = '32-bit'
      }
    } else if (userAgent.indexOf('Mac') !== -1) {
      os = 'MacOS'
    } else if (userAgent.indexOf('Linux') !== -1) {
      os = 'Linux'
    } else if (userAgent.indexOf('X11') !== -1) {
      os = 'UNIX'
    }

    return { os, architecture }
  }

  const [os, setOS] = useState({ os: 'Unknown', architecture: 'Unknown' })
  const [version, setVersion] = useState('latest')

  useEffect(() => {
    setOS(getOSAndArchitecture())

    const fetchVersion = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/hiscoder-com/level-desktop/releases/latest'
        )
        const data = await response.json()
        const latestVersion = data.tag_name
        setVersion(latestVersion.replace('v', ''))
      } catch (error) {
        console.error('Error fetching version:', error)
      }
    }

    fetchVersion()
  }, [])

  const getDownloadLink = () => {
    if (os.os === 'Windows') {
      return os.architecture === '64-bit'
        ? `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL-win-x64-${version}.exe`
        : `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL-win-ia32-${version}.exe`
    } else if (os.os === 'Linux') {
      return `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL_${version}.deb`
    }
    return '#'
  }
  const allLinks = [
    {
      label: 'Windows 64-bit',
      link: `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL-win-x64-${version}.exe`,
    },
    {
      label: 'Windows 32-bit',
      link: `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL-win-ia32-${version}.exe`,
    },
    {
      label: 'Linux .deb',
      link: `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL_${version}.deb`,
    },
    {
      label: 'Linux AppImage',
      link: `https://github.com/hiscoder-com/level-desktop/releases/download/v${version}/LEVEL_${version}.AppImage`,
    },
  ]
  const isAvailableCurrentOs = availableOs.includes(os.os)
  return (
    <div className="relative flex flex-col w-full text-left">
      <p className="hidden md:block mb-9">{t('common:Download')}</p>
      <Close className="absolute md:hidden w-6 h-6 right-0 -top-7 stroke-black cursor-pointer" />
      <div className="text-base font-medium flex flex-col gap-6 overflow-y-auto">
        <p>{t('Download.p1')}</p>
        <h2>{t('Download.Instruction')}</h2>
        <ol className="list-decimal list-inside">
          <li>{t('Download.li1')}</li>
          <li>{t('Download.li2')}</li>
          <li>{t('Download.li3')}</li>
        </ol>
        <p>{t('Download.p2')}</p>
        {isAvailableCurrentOs ? (
          <Link href={getDownloadLink()} className="font-bold text-th-primary-100">
            {t('Download.link')}
          </Link>
        ) : (
          allLinks.map((download) => (
            <Link
              key={download.label}
              href={download.link}
              className="font-bold text-th-primary-100"
            >
              {download.label}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default Download
