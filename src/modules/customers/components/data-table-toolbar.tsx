"use client"

import type { Table } from "@tanstack/react-table"
import { Database, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/modules/tasks/components/data-table-view-options"
import { AddCustomerModal } from "./add-customer-modal"
import type { Customer } from "@/modules/customers/services/types/customer-types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddCustomer?: (customer: Customer) => void | Promise<void>
  onSeedCustomers?: () => void | Promise<void>
  isSeedingCustomers?: boolean
}

export function DataTableToolbar<TData>({
  table, onAddCustomer, onSeedCustomers, isSeedingCustomers,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-4">
      {/* Search and Actions Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search by name or email..."
            value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("fullName")?.setFilterValue(event.target.value)
              table.getColumn("email")?.setFilterValue(event.target.value)
            }}
            className=" w-[200px] lg:w-[300px] cursor-text"
          />
          <Button variant="outline" onClick={() => table.resetColumnFilters()} className="px-3 cursor-pointer" disabled={!isFiltered}>
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden lg:block">Reset Filters</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={onSeedCustomers} disabled={!onSeedCustomers || isSeedingCustomers}>
            <Database className="h-4 w-4" />
            <span className="hidden lg:block">{isSeedingCustomers ? "Seeding..." : "Seed Data"}</span>
          </Button>
          <DataTableViewOptions table={table} />
          <AddCustomerModal onAddCustomer={onAddCustomer} />
        </div>
      </div>
    </div>
  )
}
