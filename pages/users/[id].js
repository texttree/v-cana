import Head from 'next/head'
import { useRouter } from 'next/router'

import axios from 'axios'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import { useCurrentUser } from '../../lib/UserContext'
import { useUser } from '../../utils/hooks'

export default function UserPage() {
  const { t } = useTranslation(['users', 'common'])

  const router = useRouter()
  const { id } = router.query
  const { user: currentUser } = useCurrentUser()
  const [user] = useUser(currentUser?.access_token, id)

  const handleBlock = (blocked) => {
    axios.defaults.headers.common['token'] = currentUser?.access_token
    axios
      .post('/api/users/' + user?.id, { blocked })
      .then((res) => {
        console.log('success', res)
      })
      .catch((err) => {
        console.log('error', err)
      })
  }
  return (
    <>
      <Head>
        <title>V-CANA - {t('profile')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {router.isFallback ? (
        <div></div>
      ) : (
        <div className="container">
          <h1>{t('UserPage')}</h1>
          <div>
            {t('login')}: {user?.login}
          </div>
          <div>
            {t('email')}: {user?.email}
          </div>
          <div>
            {t('agreement')}: {user?.agreement ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            {t('confession')}: {user?.confession ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            {t('IsAdmin')}: {user?.is_admin ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            {t('blocked')}: {user?.blocked ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            <div onClick={() => handleBlock(!user?.blocked)}>
              {user?.blocked ? t('Unblock') : t('Block')}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
    },
  }
}

// ???????? ?? ?????? ???????????????????????? ??????????????, ???? ?????? ???????????????????? ???????????????????? ?????????? ?????????????? ?????? ???????????????? ??????????????
// ???????????????? ?????? ?????????? ???????? ???? ???????????????? ???????????? ???????? ???????????? ?? ?? path ?????????????????? ???????????? url. ?????????? ???? ?????????????? ???????????? ?????????? html ?? json ?????? ???????????????? ??????????????????????.
// ?????? ???? ?????????????? fallback ?? true. ???? ?????????? ???????? ???????????????????? ?????? ???? ?????????? ???????????????? ???????????????? ????????????????
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}
