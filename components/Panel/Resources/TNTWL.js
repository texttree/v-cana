import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import MarkdownExtended from 'components/MarkdownExtended'
import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'

import Close from 'public/close.svg'

function TNTWL({ config, url }) {
  const [item, setItem] = useState(null)
  const { loading, data, error } = useGetResource({ config, url })
  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <ToolContent setItem={setItem} item={item} />
          <ToolList setItem={setItem} data={data} />
        </div>
      )}
    </>
  )
}

export default TNTWL

function ToolList({ setItem, data }) {
  const { t } = useTranslation('common')
  const [intro, setIntro] = useState([])
  const [verses, setVerses] = useState([])
  useEffect(() => {
    if (data) {
      const { intro, ...verses } = data
      intro && setIntro(intro)
      verses && setVerses(Object.entries(verses))
    }
  }, [data])
  return (
    <div className="divide-y divide-gray-800 divide-dashed h-full overflow-auto">
      <div className="justify-center flex">
        {intro.map((el) => (
          <div
            onClick={() => setItem({ text: el.text, title: t(el.title) })}
            className="mx-2  btn-white my-2"
            key={el.id}
          >
            {t(el.title)}
          </div>
        ))}
      </div>
      {data &&
        verses.map((el, index) => {
          return (
            <div key={index} className="p-4 flex mx-4">
              <div className="text-2xl">{el[0]}</div>
              <div className="text-gray-700 pl-7">
                <ul>
                  {el[1]?.map((item) => {
                    return (
                      <li
                        key={item.id}
                        className={`py-2 cursor-pointer ${
                          item.repeat ? 'text-gray-400' : ''
                        }`}
                        onClick={() => setItem({ text: item.text, title: item.title })}
                      >
                        <ReactMarkdown>{item.title}</ReactMarkdown>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })}
    </div>
  )
}

function ToolContent({ setItem, item }) {
  return (
    <div
      className={`absolute top-0 bottom-0 bg-white overflow-auto left-0 right-0 p-8 ${
        item ? '' : 'hidden'
      }`}
    >
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setItem(null)}
      >
        <Close />
      </div>
      <div className=" font-bold text-xl mb-2">
        <ReactMarkdown>{item?.title}</ReactMarkdown>
      </div>
      <MarkdownExtended>{item?.text}</MarkdownExtended>
    </div>
  )
}
