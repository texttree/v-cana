import Link from 'next/link'
import Head from 'next/head'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import TT_Logo from '../public/TT_Logo.svg'
import VCANA_logo from '../public/VCANA_logo.svg'

export default function Home() {
  const { locale, pathname, query, asPath } = useRouter()
  const { t } = useTranslation('common')
  return (
    <div className="layout-empty">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex absolute top-10 right-10 font-bold justify-end text-xl lg:text-base">
        <Link href={{ pathname, query }} as={asPath} locale={'ru'}>
          <a className={`text-teal-500 p-2 ${locale === 'ru' ? 'opacity-50' : ''}`}>RU</a>
        </Link>
        <Link replace href={{ pathname, query }} as={asPath} locale={'en'}>
          <a className={`text-teal-500 p-2 ${locale === 'en' ? 'opacity-50' : ''}`}>EN</a>
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center m-3">
        <TT_Logo className="mb-10 w-1/3 md:w-1/5 lg:w-32" />
        <VCANA_logo className="md:w-4/5 lg:w-3/6 xl:w-5/12 2xl:w-1/3" />
        <h2 className="h2 mt-9 mb-16 text-center">{t('Welcome')}</h2>
        <Link href="/login">
          <a className="btn-start">{t('SignIn')}</a>
        </Link>
      </div>
    </div>
  )
}

Home.layoutType = 'empty'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
