'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminCreateStaff, adminUpdateStaff, adminDeleteStaff } from '@/actions/admin'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const ROLES = [
  { value: 'ADMIN', label: 'Admin (full access)' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'SALES', label: 'Sales' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
  { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
  { value: 'CONTENT_MANAGER', label: 'Content Manager' },
] as const

type Role = (typeof ROLES)[number]['value']

type Staff = {
  id: string
  name: string | null
  email: string
  role: Role
  phone: string | null
  jobTitle: string | null
  department: string | null
  active: boolean
}

export function StaffForm({
  staff,
  canAssignAdmin,
}: {
  staff?: Staff | null
  canAssignAdmin: boolean
}) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const isEdit = !!staff

  const [name, setName] = useState(staff?.name ?? '')
  const [email, setEmail] = useState(staff?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(staff?.role ?? 'CUSTOMER_SUPPORT')
  const [phone, setPhone] = useState(staff?.phone ?? '')
  const [jobTitle, setJobTitle] = useState(staff?.jobTitle ?? '')
  const [department, setDepartment] = useState(staff?.department ?? '')
  const [active, setActive] = useState(staff?.active ?? true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      if (!isEdit && password.length < 8) {
        toast.error('Password must be at least 8 characters')
        return
      }
      const payload: Record<string, any> = {
        name,
        email,
        role,
        phone: phone || undefined,
        jobTitle: jobTitle || undefined,
        department: department || undefined,
        active,
      }
      if (password) payload.password = password
      const r = isEdit
        ? await adminUpdateStaff(staff!.id, payload)
        : await adminCreateStaff(payload)
      if (r.ok) {
        toast.success(isEdit ? 'Staff updated' : 'Staff created')
        router.push('/admin/staff')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const r = await adminDeleteStaff(staff!.id)
      if (r.ok) {
        toast.success('Staff disabled')
        router.push('/admin/staff')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not disable')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Account</CardTitle>
            <CardDescription>Identity and login credentials.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tunde Adebayo"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tunde@wardrobecare.com"
                disabled={isEdit}
              />
              {isEdit && (
                <p className="text-xs text-muted-foreground">Email cannot be changed after creation.</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                Password {isEdit ? '(leave blank to keep current)' : ''}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={!isEdit}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Role & Department</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r.value !== 'ADMIN' || canAssignAdmin).map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!canAssignAdmin && (
                <p className="text-xs text-muted-foreground">Only Admin users can grant Admin role.</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Sales Associate"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Customer Success"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 000 0000"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive users can't sign in.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Save changes' : 'Create staff'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/staff">Cancel</Link>
          </Button>
        </div>

        {isEdit && (
          <Card className="border-red-200">
            <CardHeader className="border-b border-red-100">
              <CardTitle className="font-display text-lg text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-700 border-red-200 hover:bg-red-50">
                    <Ban className="size-4" />
                    Disable staff account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disable this staff account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deactivates <span className="font-medium">{staff!.name ?? staff!.email}</span>
                      {' '}and demotes them to a regular customer role. Their audit history is preserved.
                      This action can be undone by re-enabling the account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleting ? 'Disabling…' : 'Disable'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  )
}
