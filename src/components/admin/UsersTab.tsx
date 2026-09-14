import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/format'
import type { UserProfile } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

/**
 * Super-admin flow: the first registered user is the admin (see schema.sql
 * trigger). From here, that admin promotes/demotes everyone else.
 */
export default function UsersTab() {
  const { t, i18n } = useTranslation()
  const { user: me, refreshProfile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('users').select('*').order('created_at')
    setUsers((data || []) as UserProfile[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const setRole = async (id: string, role: 'admin' | 'customer') => {
    const { error } = await supabase.from('users').update({ role }).eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(t('common.saved'))
    if (id === me?.id) await refreshProfile()
    refetch()
  }

  if (loading) return null

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.user')}</TableHead>
            <TableHead>{t('checkout.phone')}</TableHead>
            <TableHead>{t('admin.date')}</TableHead>
            <TableHead>{t('admin.role')}</TableHead>
            <TableHead className="w-40"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <p className="text-sm font-medium">{u.display_name || '—'}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {u.phone || '—'}
              </TableCell>
              <TableCell className="text-sm">{formatDate(u.created_at, i18n.language)}</TableCell>
              <TableCell>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-volt text-volt-fg' : ''}>
                  {u.role}
                </Badge>
              </TableCell>
              <TableCell>
                {u.id !== me?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRole(u.id, u.role === 'admin' ? 'customer' : 'admin')}
                  >
                    {u.role === 'admin' ? t('admin.makeCustomer') : t('admin.makeAdmin')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
