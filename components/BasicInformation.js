import { useTranslation } from 'next-i18next'
import { useLanguages, useProjects } from 'utils/hooks'

import Plus from 'public/plus.svg'
import Down from 'public/arrow-down.svg'

function BasicInformation({
  errors,
  register,
  methods,
  setIsOpenLanguageCreate,
  uniqueCheck = false,
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const [projects] = useProjects()
  const [languages] = useLanguages()
  const inputs = [
    {
      id: 1,
      title: t('Title'),
      errorCondition: errors?.title,
      placeholder: '',
      register: {
        ...register('title', {
          required: true,
        }),
      },
      errorMessage: errors?.title?.message ?? '',
    },
    {
      id: 2,
      title: t('OrigTitle'),
      errorCondition: errors?.origtitle,
      placeholder: '',
      register: {
        ...register('origtitle', {
          required: true,
        }),
      },
      errorMessage: errors?.title?.message ?? '',
    },
    {
      id: 3,
      title: t('Code'),
      errorCondition: errors?.code,
      placeholder: '',
      register: {
        ...register('code', {
          required: true,
          validate: {
            wrongTypeCode: (value) => /^[a-z\d\-]{2,12}\_[a-z\d\-]{1,12}$/i.test(value),
            notUniqueProject: (value) =>
              uniqueCheck ? !projects?.find((project) => project.code === value) : true,
          },
        }),
      },
      errorMessage:
        errors?.code?.type === 'wrongTypeCode'
          ? t('CodeMessageErrorWrongType')
          : errors?.code?.type === 'notUniqueProject'
          ? t('CodeMessageErrorNotUniqueProject')
          : '',
    },
  ]
  return (
    <div className="flex flex-col gap-3 text-base">
      {inputs.map((input) => (
        <div
          className="flex flex-col md:flex-row justify-start items-start md:items-center gap-4 md:gap-2"
          key={input.title}
        >
          <div className="w-auto md:w-1/5 font-bold">{input.title}</div>
          <div className="flex flex-col gap-2 w-full md:w-4/5">
            <input
              className={
                input?.errorCondition
                  ? 'input-invalid'
                  : 'input-primary bg-th-secondary-10'
              }
              placeholder={input.placeholder}
              {...input.register}
            />
            {input.errorMessage && <div>{' ' + input.errorMessage}</div>}
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
        <div className="w-auto md:w-1/5 font-bold">{t('Language')}</div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full md:w-4/5">
          <div className="relative flex w-full md:w-3/4">
            <select
              className="input-primary bg-th-secondary-10 h-full appearance-none cursor-pointer"
              placeholder={t('Language')}
              {...register('languageId')}
            >
              {languages &&
                languages.map((language) => {
                  return (
                    <option key={language.id} value={language.id}>
                      {language.orig_name}
                    </option>
                  )
                })}
            </select>
            <Down className="w-5 h-5 absolute -translate-y-1/2 top-1/2 right-4 stroke-th-text-primary pointer-events-none" />
          </div>
          <div className="w-full md:w-1/4">
            <button
              type="button"
              className="input-base py-2 flex items-center gap-2 text-th-text-primary border-th-secondary-300 bg-th-secondary-10 truncate"
              onClick={() => setIsOpenLanguageCreate(true)}
            >
              <Plus className="w-6 h-6 min-w-[1.5rem] stroke-2 border-2 border-th-text-primary stroke-th-text-primary rounded-full" />
              <span className="text-sm md:text-base">
                {t('project-edit:AddLanguage')}
              </span>
            </button>
          </div>
        </div>
      </div>
      {methods && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
          <div className="w-auto md:w-1/5 font-bold">{t('Method')}</div>
          <div className="relative flex w-full md:w-4/5">
            <select
              placeholder={t('Method')}
              {...register('methodId')}
              className="input-primary w-3/4 bg-th-secondary-10 appearance-none cursor-pointer"
              defaultValue={methods?.[0]?.id}
            >
              {methods &&
                methods.map((method) => {
                  return (
                    <option key={method.id} value={method.id}>
                      {method.title} ({method.type})
                    </option>
                  )
                })}
            </select>
            <Down className="w-5 h-5 absolute -translate-y-1/2 top-1/2 right-4 stroke-th-text-primary pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInformation
