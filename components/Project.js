import React, { useState } from 'react'
import {
  useCoordinators,
  useCurrentUser,
  useProject,
  useRoles,
  useUsers,
} from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'
import Link from 'next/link'

function Project({ code }) {
  const { user } = useUser()
  const { session } = useUser()
  const [data] = useCurrentUser({ token: session?.access_token, id: user?.id })
  const [userId, setUserId] = useState(null)

  const [project, { mutate }] = useProject({ token: session?.access_token, code })
  console.log({ project })
  const [roles] = useRoles({
    token: session?.access_token,
    code: project?.code,
  })
  console.log(data?.is_admin)
  const [coordinators] = useCoordinators({
    token: session?.access_token,
    code: project?.code,
  })
  const [users] = useUsers(session?.access_token)

  const handleSetCoordinator = async () => {
    if (!project?.id || !userId) {
      alert('неправильный координатор')
      return
    }
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post('/api/languages/ru/projects/rlob/coordinators', {
        user_id: userId,
        project_id: project?.id,
      })
      .then((result) => {
        const { data, status } = result

        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }

  return (
    <div>
      <h3>Project</h3>
      <div>
        Title <b>{project?.title}</b>
      </div>
      <div>
        Code <b>{project?.code}</b>
      </div>
      <div>
        Language <b>{project?.languages?.orig_name}</b>
      </div>
      <div>
        Method <b>{project?.methods?.title}</b>
      </div>
      <div>
        type <b>{project?.type}</b>
      </div>
      <div>
        {roles && (
          <>
            {roles.data.map((el, key) => {
              return (
                <div key={key}>{`${el.role} ${el.users.login} ${el.users.email}`}</div>
              )
            })}
          </>
        )}
        {data?.is_admin && (
          <Link key={project?.id} href={`/projects/${project?.code}/management`}>
            <a className="btn btn-filled btn-cyan">Редактирование проекта</a>
          </Link>
        )}
        {data?.isAdmin && (
          <>
            <select onChange={(e) => setUserId(e.target.value)} className="form max-w-sm">
              {users &&
                Object.values(users).map((el) => {
                  return (
                    <option key={el.id} value={el.id}>
                      {el.email}
                    </option>
                  )
                })}
            </select>
            <button onClick={handleSetCoordinator} className="btn btn-cyan btn-filled">
              Set coordinator
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Project
