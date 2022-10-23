import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useTeamNotes, useProject } from 'utils/hooks'
import { useRouter } from 'next/router'
import Close from 'public/close.svg'
import Waste from 'public/waste.svg'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ListOfNotes = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ListOfNotes),
  {
    ssr: false,
  }
)

function TeamNotes() {
  const [noteId, setNoteId] = useState('test_noteId')
  const [activeNote, setActiveNote] = useState(null)
  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()
  const router = useRouter()
  const {
    query: { project: code },
  } = router
  const [project] = useProject({ token: user?.access_token, code })
  const [notes, { loading, error, mutate }] = useTeamNotes({
    token: user?.access_token,
    project_id: project?.id,
  })

  useEffect(() => {
    const currentNote = notes?.find((el) => el.id === noteId)
    setActiveNote(currentNote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const addNote = () => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post(`/api/team_notes`, { id, project_id: project?.id })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/team_notes/${id}`, { id, project_id: project?.id })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  useEffect(() => {
    if (!activeNote) {
      return
    }
    const timer = setTimeout(() => {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/team_notes/${activeNote?.id}`, activeNote)
        .then(() => mutate())
        .catch((err) => console.log(err))
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote])

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex justify-end">
            <button className="btn-cyan mb-4 right-0" onClick={addNote}>
              {t('Create')}
            </button>
          </div>
          <ListOfNotes
            notes={notes}
            removeNote={removeNote}
            setNoteId={setNoteId}
            classes={{
              item: 'bg-cyan-50 my-6 rounded-lg shadow-md',
              title: 'font-bold p-2',
              text: 'px-2 h-10 overflow-hidden',
              delBtn: 'px-4 py-2',
            }}
            isShowText
            delBtnIcon={<Waste className={'w-4 h-4'} />}
          />
        </div>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
            onClick={() => {
              setActiveNote(null)
              setNoteId(null)
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              wrapper: '',
              title: 'bg-cyan-50 p-2 font-bold rounded-lg my-4 shadow-md',
              redactor:
                'bg-cyan-50 overflow-hidden break-words p-4 px-4 rounded-lg my-4 shadow-md',
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
          />
        </>
      )}
    </div>
  )
}

export default TeamNotes
