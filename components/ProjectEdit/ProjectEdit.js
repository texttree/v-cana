import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import Brief from './Brief/BriefBlock'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import Breadcrumbs from '../Breadcrumbs'

import { useAccess, useGetSteps, useLanguages, useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import Steps from 'components/ProjectCreate/Steps'
import { supabase } from 'utils/supabaseClient'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import BasicInformation from 'components/ProjectCreate/BasicInformation'
import { useForm } from 'react-hook-form'
import LanguageCreate from 'components/ProjectCreate/LanguageCreate'

function ProjectEdit() {
  const {
    replace,
    query,
    query: { code, setting },
  } = useRouter()
  const { t } = useTranslation()
  const [customSteps, setCustomSteps] = useState([])
  const [isOpenLanguageCreate, setIsOpenLanguageCreate] = useState(false)

  const { user } = useCurrentUser()

  const [users] = useUsers(user?.access_token)
  const [languages, { mutate: mutateLanguage }] = useLanguages(user?.access_token)

  const [steps] = useGetSteps({ token: user?.access_token, code })
  const [project] = useProject({ token: user?.access_token, code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code: project?.code,
  })
  const defaults = useMemo(
    () => ({
      title: project?.title,
      origtitle: project?.orig_title,
      code: project?.code,
      languageId: project?.languages.id,
    }),
    [project?.title, project?.orig_title, project?.code, project?.languages.id]
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: defaults,
  })
  const onSubmit = async (data) => {
    console.log(data)
    const { title, code, languageId, origtitle } = data
    if (!title || !code || !languageId) {
      return
    }
  }
  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults])

  const updateStep = ({ ref, index }) => {
    const _steps = customSteps.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, ...ref }
      }

      return obj
    })
    setCustomSteps(_steps)
  }
  const tabs = useMemo(
    () =>
      [
        {
          id: 'general',
          access: isAdminAccess,
          label: 'project-edit:General',
          panel: (
            <div className="card flex flex-col gap-7 border-y border-slate-900 py-7">
              <p className="text-xl font-bold mb-5">Основная информация</p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <BasicInformation
                  register={register}
                  errors={{}}
                  user={user}
                  setIsOpenLanguageCreate={setIsOpenLanguageCreate}
                />
                <input
                  className="btn-secondary btn-filled"
                  type="submit"
                  value={t('Save')}
                />
              </form>
            </div>
          ),
        },
        {
          id: 'brief',
          access: true,
          label: 'project-edit:Brief',
          panel: <Brief access={isCoordinatorAccess} />,
        },
        {
          id: 'participants',
          access: isModeratorAccess,
          label: 'Participants',
          panel: (
            <Participants
              user={user}
              users={users}
              access={{ isCoordinatorAccess, isAdminAccess }}
            />
          ),
        },
        {
          id: 'resources',
          access: isAdminAccess,
          label: 'Resources',
          panel: <ResourceSettings />,
        },
        {
          id: 'steps',
          access: isAdminAccess,
          label: 'Steps',
          panel: (
            <div className="card flex flex-col gap-2 border-y border-slate-900 py-7">
              <p className="text-xl font-bold mb-5">Шаги</p>
              <Steps customSteps={customSteps} updateStep={updateStep} t={t} />
              <button
                className="w-fit btn-secondary btn-filled"
                onClick={() => updateDB({ steps: customSteps })}
              >
                Save
              </button>
            </div>
          ),
        },
        {
          id: 'briefLocale',
          access: isAdminAccess,
          label: 'BriefLocalization',
          panel: <></>,
        },
      ].filter((el) => el.access),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customSteps, isAdminAccess, isCoordinatorAccess, isModeratorAccess, user, users]
  )

  const idTabs = useMemo(() => tabs.map((tab) => tab.id), [tabs])

  const updateDB = async ({ steps }) => {
    const _steps = steps.map((el) => {
      const { id, description, intro, title } = el
      return { id, description, intro, title }
    })

    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/projects/${code}/steps`, {
        _steps,
        project_id: project.id,
      })
      .then()
      .catch((error) => {
        toast.error(t('SaveFailed') + '. ' + t('PleaseCheckInternetConnection'), {
          duration: 8000,
        })
        console.log(error)
      })
  }

  useEffect(() => {
    if (steps) {
      setCustomSteps(steps)
    }
    // const getSteps = async () => {
    //   const { data, error } = await supabase
    //     .from('steps')
    //     .select('*')
    //     .eq('project_id', project.id)
    //   setCustomSteps(data)
    // }
    // if (project) {
    //   getSteps()
    // }
  }, [steps])

  // console.log(project)

  return (
    <div className="flex flex-col gap-7 mx-auto pb-10 max-w-7xl">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + code },
          { title: t('Settings') },
        ]}
        full
      />

      <div className="hidden sm:flex flex-col gap-7">
        {user?.id && (
          <Tab.Group defaultIndex={idTabs.indexOf(setting)}>
            <Tab.List className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-9 gap-4 mt-2 lg:text-lg font-bold text-center border-b border-slate-600">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    selected ? 'tab-active truncate' : 'tab truncate'
                  }
                  onClick={() =>
                    replace(
                      {
                        query: { ...query, setting: tab.id },
                      },
                      undefined,
                      { shallow: true }
                    )
                  }
                >
                  {t(tab.label)}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {tabs.map((tab, index) => (
                <Tab.Panel key={index}>{tab.panel}</Tab.Panel>
              ))}
              <Tab.Panel>
                {/* <div className="card flex flex-col gap-7 border-y border-slate-900 py-7">
                  <p className="text-xl font-bold mb-5">Основная информация</p>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <BasicInformation
                      register={register}
                      errors={{}}
                      user={user}
                      setIsOpenLanguageCreate={setIsOpenLanguageCreate}
                    />
                    <input
                      className="btn-secondary btn-filled"
                      type="submit"
                      value={t('Save')}
                    />
                  </form>
                </div> */}
              </Tab.Panel>
              <Tab.Panel>{/* <Brief access={isCoordinatorAccess} /> */}</Tab.Panel>
              <Tab.Panel>
                {/* <Participants
                  user={user}
                  users={users}
                  access={{ isCoordinatorAccess, isAdminAccess }}
                /> */}
              </Tab.Panel>
              <Tab.Panel></Tab.Panel>
              <Tab.Panel></Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
      <div className="flex sm:hidden flex-col gap-7">
        <Brief access={isCoordinatorAccess} />
        <Participants
          user={user}
          users={users}
          access={{ isCoordinatorAccess, isAdminAccess }}
        />
        <ResourceSettings />
      </div>
      <LanguageCreate
        user={user}
        t={t}
        isOpen={isOpenLanguageCreate}
        closeHandle={() => setIsOpenLanguageCreate(false)}
        mutateLanguage={mutateLanguage}
        languages={languages}
      />
    </div>
  )
}

export default ProjectEdit
