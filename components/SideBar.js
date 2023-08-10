import { useTranslation } from 'react-i18next'

import { Menu } from '@headlessui/react'

import SwitchLocalization from './SwitchLocalization'
import AboutVersion from 'components/AboutVersion'
import TranslatorImage from './TranslatorImage'
import SignOut from './SignOut'

import Localization from 'public/localization.svg'
import VersionLogo from 'public/version.svg'
import Burger from 'public/burger.svg'
import Close from 'public/close.svg'

import { useCurrentUser } from 'lib/UserContext'
function SideBar({ setIsOpenSideBar, access }) {
  const { user } = useCurrentUser()
  const { t } = useTranslation('projects')

  return (
    <>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button onClick={() => setIsOpenSideBar((prev) => !prev)}>
              {access &&
                (!open ? (
                  <Burger className="h-10 stroke-slate-600" />
                ) : (
                  <Close className="h-10 stroke-slate-600" />
                ))}
            </Menu.Button>

            <Menu.Items
              // внутри <main> есть первый див, который даёт здесь смещение (class="pt-5 px-5 lg:px-8 mt-14 sm:mt-auto"), поэтому я использовал отрицательные отступы
              className="fixed flex flex-col w-full gap-7 top-20 px-5 -mx-5 z-20 cursor-default md:w-1/2 md:pr-3 lg:pr-0 lg:w-[48%] xl:w-[27rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card flex flex-col gap-7 cursor-default">
                <div>
                  <div className="cursor-default flex items-center pb-5 gap-2 border-b border-gray-300">
                    <div className="w-12 h-12 min-w-[3rem]">
                      <TranslatorImage item={{ users: user }} />
                    </div>

                    <div>
                      <div className="text-2xl font-bold">{user?.login}</div>
                      <div>{user?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col min-h-[60vh] justify-between">
                  <div className="flex flex-col gap-7">
                    <Menu.Item
                      as="div"
                      disabled
                      className="flex items-center gap-2 justify-between cursor-default"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="px-4 py-2 rounded-[23rem] bg-gray-200">
                          <Localization className="w-5 h-5 min-w-[1.5rem] stroke-slate-600" />
                        </div>
                        <span>{t('Language')} </span>
                      </div>
                      <SwitchLocalization />
                    </Menu.Item>

                    <Menu.Item
                      as="div"
                      disabled
                      className="flex items-center gap-2 justify-between cursor-default"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="px-4 py-2 rounded-[23rem] bg-gray-200">
                          <VersionLogo className="w-5 h-5 min-w-[1.5rem]" />
                        </div>
                        <AboutVersion isSidebar={true} />
                      </div>
                    </Menu.Item>
                  </div>

                  <div className="flex justify-center cursor-pointer">
                    <SignOut />
                  </div>
                </div>
              </div>
            </Menu.Items>
          </>
        )}
      </Menu>
    </>
  )
}

export default SideBar
