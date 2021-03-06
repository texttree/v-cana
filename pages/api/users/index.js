import { supabase } from '../../../utils/supabaseClient'
import { supabaseService } from '../../../utils/supabaseServer'

export default async function handler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    body: { email, password, login },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: users, error: errorGet } = await supabase
          .from('users')
          .select('id, login, email, blocked, agreement, confession, is_admin')
        if (errorGet) throw errorGet
        res.status(200).json(users)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    case 'POST':
      // TODO валидацию
      // is it admin
      try {
        const { error: errorPost } = await supabaseService.auth.api.createUser({
          email,
          password,
          user_metadata: { login },
        })
        if (errorPost) throw errorPost
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      res.status(201).json({})
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
