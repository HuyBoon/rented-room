"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Phone, Mail, MapPin, Eye, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tenant } from "@/types"

interface TenantDataTableProps {
  data: Tenant[]
  onEdit: (tenant: Tenant) => void
  onDelete: (id: string) => void
  onView?: (tenant: Tenant) => void
  actionLoading?: string | null
}

export const columns = (
  onEdit: (tenant: Tenant) => void,
  onDelete: (id: string) => void,
  onView?: (tenant: Tenant) => void,
  actionLoading?: string | null
): ColumnDef<Tenant>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("fullName") || (row.original as any).hoTen}</div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-gray-400" />
        {row.getValue("phoneNumber") || (row.original as any).soDienThoai}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return email ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          {email}
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  {
    accessorKey: "idCardNumber",
    header: "ID Card",
    cell: ({ row }) => <div>{row.getValue("idCardNumber") || (row.original as any).cccd}</div>,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = (row.getValue("gender") || (row.original as any).gioiTinh) as string
      const labels = {
        male: 'Male',
        female: 'Female',
        other: 'Other',
        // Legacy support
        nam: 'Male',
        nu: 'Female',
        khac: 'Other',
      }
      return <div>{labels[gender as keyof typeof labels] || 'Other'}</div>
    },
  },
  {
    accessorKey: "hometown",
    header: "Hometown",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{row.getValue("hometown") || (row.original as any).queQuan}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") || (row.original as any).trangThai) as string
      const variants = {
        renting: { variant: 'default' as const, label: 'Renting' },
        movedOut: { variant: 'secondary' as const, label: 'Moved Out' },
        idle: { variant: 'outline' as const, label: 'Idle' },
        // Legacy support
        dangThue: { variant: 'default' as const, label: 'Renting' },
        daTraPhong: { variant: 'secondary' as const, label: 'Moved Out' },
        chuaThue: { variant: 'outline' as const, label: 'Idle' },
      }
      
      const config = variants[status as keyof typeof variants] || variants.idle
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "currentRoom",
    header: "Current Room",
    cell: ({ row }) => {
      const tenant = row.original;
      const contract = tenant.currentContract || (tenant as any).hopDongHienTai;
      
      if (!contract || !contract.roomId) {
        return <div className="text-gray-400">Not Renting</div>;
      }
      
      const room = contract.roomId || contract.phong;
      
      return (
        <div className="text-sm">
          <div className="font-medium">{room.roomCode || room.maPhong}</div>
          <div className="text-gray-500 text-xs">
            {(room.buildingId?.name || room.toaNha?.tenToaNha) || 'N/A'}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const tenant = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(tenant._id!);
                toast.success('Tenant ID copied');
              }}
            >
              Copy Tenant ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(tenant)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(tenant)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
              </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(tenant._id!)}
              className="text-red-600"
              disabled={actionLoading === `delete-${tenant._id}`}
            >
              {actionLoading === `delete-${tenant._id}` ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function KhachThueDataTable({
  data,
  onEdit,
  onDelete,
  onView,
  actionLoading
}: TenantDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns: columns(onEdit, onDelete, onView, actionLoading),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by name, phone, ID card..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "fullName" ? "Full Name" :
                     column.id === "phoneNumber" ? "Phone Number" :
                     column.id === "email" ? "Email" :
                     column.id === "idCardNumber" ? "ID Card" :
                     column.id === "gender" ? "Gender" :
                     column.id === "hometown" ? "Hometown" :
                     column.id === "status" ? "Status" :
                     column.id === "currentRoom" ? "Current Room" :
                     column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns(onEdit, onDelete, onView, actionLoading).length}
                  className="h-24 text-center"
                >
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} rows selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
