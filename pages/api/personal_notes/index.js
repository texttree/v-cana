import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function notesHandler(req, res) {
 
  const supabase = createPagesServerClient({ req, res })

  const { body, method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('personal_notes')
          .select('*')
          .is('deleted_at', null)
          .order('changed_at', { ascending: false })
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'POST':
      try {
        const { id, user_id } = body
        // TODO валидацию
        const { data, error } = await supabase
          .from('personal_notes')
          .insert([
            {
              id,
              user_id,
              title: 'new note',
              data: {
                blocks: [],
                version: '2.8.1',
              },
            },
          ])
          .select()
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'DELETE':
      const { user_id } = body
      try {
        const { data, error } = await supabase
          .from('personal_notes')
          .update([{ deleted_at: new Date().toISOString().toLocaleString('en-US') }])
          .match({ user_id })
          .select()

        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
