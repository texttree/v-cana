import supabaseApi from 'utils/supabaseServer'

export default async function userProjectshandler(req, res) {
  const supabase = supabaseApi({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  let data = {}
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select(
            '*,users!inner(id),project_translators!inner(*),project_moderators!inner(*)'
          )
          .eq('users.id', id)

        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json(data)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
