import supabaseApi from 'utils/supabaseServer'

export default async function languageProjectHandler(req, res) {
  const supabase = supabaseApi({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Access denied!' })
  }
  let data = {}
  const {
    query: { code },
    method,
  } = req
  switch (method) {
    case 'GET':
      try {
        const { data: value, error } = await supabase
          .from('projects')
          .select(
            'id, title, orig_title, code, type, method, languages(orig_name,code), dictionaries_alphabet, base_manifest'
          )
          .eq('code', code)
          .maybeSingle()
        if (error) throw error
        data = value
      } catch (error) {
        return res.status(404).json({ error })
      }
      return res.status(200).json({ ...data })
    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
