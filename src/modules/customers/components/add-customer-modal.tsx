"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Customer } from "@/modules/customers/services/types/customer-types"

const customerFormSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(100),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 ký tự").max(20),
  serviceName: z.string().min(1, "Vui lòng nhập tên dịch vụ").max(200),
})
type CustomerFormData = z.infer<typeof customerFormSchema>

interface AddCustomerModalProps {
  onAddCustomer?: (customer: Customer) => void | Promise<void>
  trigger?: React.ReactNode
}

export function AddCustomerModal({ onAddCustomer, trigger }: AddCustomerModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    serviceName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateCustomerId = () => `CUS-${Date.now()}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const validatedData = customerFormSchema.parse(formData)
      const newCustomer: Customer = {
        id: generateCustomerId(),
        ...validatedData,
      }
      await onAddCustomer?.(newCustomer)
      setFormData({ fullName: "", email: "", phoneNumber: "", serviceName: "" })
      setErrors({})
      setOpen(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => { if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message })
        setErrors(newErrors)
      } else {
        setErrors({ root: error instanceof Error ? error.message : "Failed to create customer" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ fullName: "", email: "", phoneNumber: "", serviceName: "" })
    setErrors({})
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="default" size="sm" className="cursor-pointer">
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Tạo khách hàng mới. Điền thông tin bên dưới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.root ? <p className="text-sm text-destructive">{errors.root}</p> : null}
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Ngô Thanh Tùng"
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="tungnt@softech.vn"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone *</Label>
            <Input
              id="phoneNumber"
              placeholder="1234567890"
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
          {/* Service */}
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service *</Label>
            <Input
              id="serviceName"
              placeholder="Web Development"
              value={formData.serviceName}
              onChange={(e) => setFormData((prev) => ({ ...prev, serviceName: e.target.value }))}
              className={errors.serviceName ? "border-red-500" : ""}
            />
            {errors.serviceName && <p className="text-sm text-red-500">{errors.serviceName}</p>}
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} className="cursor-pointer" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
