"use client"

import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { customerSchema, type Customer } from "@/modules/customers/services/types/customer-types"

interface DataTableRowActionsProps {
  row: Row<Customer>
  onUpdateCustomer?: (customer: Customer) => void | Promise<void>
  onDeleteCustomer?: (customerId: string) => void | Promise<void>
}

export function DataTableRowActions({
  row, onUpdateCustomer, onDeleteCustomer,
}: DataTableRowActionsProps) {
  const parsed = customerSchema.safeParse(row.original)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<Customer | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!parsed.success) return null
  const customer = parsed.data

  function openEditDialog() {
    setDraft({ ...customer })
    setError(null)
    setEditOpen(true)
  }

  async function handleSaveEdit() {
    if (!draft?.fullName.trim()) {
      setError("Họ và tên là bắt buộc")
      return
    }
    if (!draft?.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      setError("Email không hợp lệ")
      return
    }
    if (!draft?.phoneNumber.trim()) {
      setError("Số điện thoại là bắt buộc")
      return
    }
    try {
      setIsSaving(true)
      setError(null)
      await onUpdateCustomer?.({ ...draft, fullName: draft.fullName.trim(), email: draft.email.trim(), phoneNumber: draft.phoneNumber.trim() })
      setEditOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Cập nhật thất bại")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await onDeleteCustomer?.(customer.id)
      setDeleteOpen(false)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Xóa thất bại")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="cursor-pointer" onClick={openEditDialog}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Cập nhật thông tin khách hàng.</DialogDescription>
          </DialogHeader>
          {draft ? (
            <div className="space-y-5">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="space-y-2">
                <Label htmlFor={`customer-fullname-${customer.id}`}>Full Name *</Label>
                <Input
                  id={`customer-fullname-${customer.id}`}
                  value={draft.fullName}
                  onChange={(event) => setDraft((current) => current ? { ...current, fullName: event.target.value } : current)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`customer-email-${customer.id}`}>Email *</Label>
                <Input
                  id={`customer-email-${customer.id}`}
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft((current) => current ? { ...current, email: event.target.value } : current)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`customer-phone-${customer.id}`}>Phone *</Label>
                <Input
                  id={`customer-phone-${customer.id}`}
                  value={draft.phoneNumber}
                  onChange={(event) => setDraft((current) => current ? { ...current, phoneNumber: event.target.value } : current)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`customer-service-${customer.id}`}>Service</Label>
                <Input
                  id={`customer-service-${customer.id}`}
                  value={draft.serviceName}
                  onChange={(event) => setDraft((current) => current ? { ...current, serviceName: event.target.value } : current)}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng <strong>{customer.fullName}</strong> không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
