import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'

import Footer from 'components/Footer'
import { supabase } from 'utils/supabaseClient'

export default function UserAgreement() {
  const router = useRouter()
  const { t } = useTranslation(['user-agreement', 'common'])
  const handleClick = async () => {
    const { error } = await supabase.rpc('check_agreement')
    if (error) {
      console.error(error)
    } else {
      router.push(`/confession`)
    }
  }

  return (
    <div className="layout-appbar">
      <div className="text-alignment text-justify">
        <h1 className="h1 pt-4">{t('Agreement')}:</h1>
        <div className="h6 mt-7">
          <b className="font-bold">{t('License')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextLicense', { interpolation: { escapeValue: false } }),
            }}
            className="py-4"
          />
          <b className="font-bold">{t('Recommendations')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextRecommendation', { interpolation: { escapeValue: false } }),
            }}
            className="py-4"
          />
          <b className="font-bold">{t('Definition')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextDefinition', { interpolation: { escapeValue: false } }),
            }}
            className="pt-4"
          />
        </div>
      </div>
      <Footer
        textButton={t('common:Next')}
        textCheckbox={t('common:Agree')}
        handleClick={handleClick}
      />
    </div>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['user-agreement', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
