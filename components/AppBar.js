import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useRecoilValue } from 'recoil'

import Timer from 'components/Timer'
import Dropdown from './Dropdown'
import SideBar from './SideBar'

import { stepConfigState } from './state/atoms'
import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

import VCANA_logo from 'public/vcana-logo.svg'
import Down from 'public/arrow-down.svg'
import User from 'public/user.svg'

export default function AppBar({ setIsOpenSideBar, isOpenSideBar, hideAppbar }) {
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [access, setAccess] = useState(false)
  const stepConfig = useRecoilValue(stepConfigState)
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const router = useRouter()
  useEffect(() => {
    setIsStepPage(router.pathname === '/translate/[project]/[book]/[chapter]/[step]')
  }, [router.pathname])
  useEffect(() => {
    const hasAccess = async () => {
      try {
        const { data, error } = await supabase.rpc('has_access')
        if (error) throw error
        setAccess(data)
      } catch (error) {
        return error
      }
    }
    if (user?.id) {
      hasAccess()
    }
  }, [supabase, user])

  const logoLink = useMemo(() => {
    return !user?.id ? '/login' : access ? '/account' : '/agreements'
  }, [access, user])
  return (
    <div className={`bg-th-primary ${isOpenSideBar ? 'sticky top-0 z-30' : ''}`}>
      <div className="appbar" onClick={() => isOpenSideBar && setIsOpenSideBar(false)}>
        <div className="relative md:static flex items-center h-10 md:justify-start md:gap-7">
          <SideBar setIsOpenSideBar={setIsOpenSideBar} access={access} />
          <div
            className={`flex justify-center w-full ${
              access && !isStepPage ? '-ml-10' : ''
            } md:ml-0  ${!access ? 'pointer-events-none ' : ''}`}
          >
            <Link href={logoLink}>
              <VCANA_logo className="h-6 fill-th-secondary-text" />
            </Link>
          </div>

          {isStepPage && (
            <div className="flex gap-7 md:hidden">
              <Timer time={stepConfig.time} />
              <Down
                className="w-6 h-6"
                onClick={() => setShowFullAppbar((prev) => !prev)}
              />
            </div>
          )}
        </div>
        {isStepPage && (
          <>
            <div
              className={`block md:flex text-center text-th-secondary-text ${
                showFullAppbar ? '' : 'hidden'
              }`}
            >
              {stepConfig.title}
            </div>
            <div
              className={`items-center gap-4 md:flex justify-center md:justify-start text-th-primary-text ${
                showFullAppbar ? 'flex' : 'hidden'
              }`}
            >
              <div className="flex row px-5 py-2.5 items-center gap-1 cursor-default bg-th-secondary-background rounded-3xl">
                <User className="w-4 h-4 stroke-th-primary-icons" />
                {stepConfig.count_of_users}
              </div>
              <div className="hidden md:flex px-5 py-2.5 bg-th-secondary-background rounded-3xl">
                <Timer time={stepConfig.time} />
              </div>
              <Dropdown description={stepConfig?.description} user={user} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
