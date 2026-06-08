"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowUp, BarChart3, Users, UserCheck, UserX } from "lucide-react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { getCustomerColumns } from "@/modules/customers/components/columns"
import { DataTable } from "@/modules/customers/components/data-table"
import {
  createCustomer, deleteCustomer, getCustomers, seedCustomersWithClient, updateCustomer,
} from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)

  const refreshCustomers = useCallback(async () => {
    const list = await getCustomers()
    setCustomers(list)
  }, [])

  useEffect(() => {
    const loadCustomers = async () => {
      try { await refreshCustomers() } catch (error) { console.error("Failed to load customers:", error) }
      finally { setLoading(false) }
    }
    loadCustomers()
  }, [refreshCustomers])

  const handleAddCustomer = useCallback(async (newCustomer: Customer) => {
    await createCustomer(newCustomer)
    await refreshCustomers()
  }, [refreshCustomers])

  const handleUpdateCustomer = useCallback(async (customer: Customer) => {
    await updateCustomer(customer)
    setCustomers((prev) => prev.map((item) => (item.id === customer.id ? customer : item)))
  }, [])

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    await deleteCustomer(customerId)
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
  }, [])

  const handleSeedCustomers = useCallback(async () => {
    try {
      setIsSeeding(true)
      const seeded = await seedCustomersWithClient()
      setCustomers(seeded)
    } catch (error) { console.error("Failed to seed customers:", error) }
    finally { setIsSeeding(false) }
  }, [])

  const customerColumns = useMemo(
    () => getCustomerColumns({ onUpdateCustomer: handleUpdateCustomer, onDeleteCustomer: handleDeleteCustomer }),
    [handleDeleteCustomer, handleUpdateCustomer]
  )

  const total = customers.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage your customer database with ease.</p>
      </div>

      {/* Mobile view placeholder */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Customers Dashboard</h3>
            <p className="text-muted-foreground">Please use a larger screen to view the full interface.</p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Customers</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{total}</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3"><Users className="size-6" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>View, filter, and manage all your customers in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customers}
              columns={customerColumns}
              onAddCustomer={handleAddCustomer}
              onSeedCustomers={handleSeedCustomers}
              isSeedingCustomers={isSeeding}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
