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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye, Download, Edit, Trash2, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmPopover } from "@/components/ui/delete-confirm-popover"
import { toast } from "sonner"
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
import { Contract, Room, Tenant, Building } from "@/types"

interface ContractDataTableProps {
  data: Contract[]
  phongList?: Room[]
  khachThueList?: Tenant[]
  toaNhaList?: Building[]
  onView: (contract: Contract) => void
  onEdit: (contract: Contract) => void
  onDelete: (id: string) => void
  onDownload: (contract: Contract) => void
  onGiaHan: (contract: Contract) => void
  onHuy: (contract: Contract) => void
  actionLoading?: string | null
}

export function HopDongDataTable({ 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  onDownload, 
  onGiaHan, 
  onHuy,
  actionLoading 
}: ContractDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'expired':
      case 'hetHan':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
      case 'daHuy':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const isExpiringSoon = (endDateStr: Date | string) => {
    const today = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (endDateStr: Date | string) => {
    const today = new Date();
    const endDate = new Date(endDateStr);
    return endDate < today;
  };

  const getWarningBadge = (endDate: Date | string) => {
    if (isExpired(endDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isExpiringSoon(endDate)) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    } else {
      return <Badge variant="outline">Normal</Badge>;
    }
  };

  const columns: ColumnDef<Contract>[] = [
    {
      accessorKey: "contractCode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Contract Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("contractCode") || (row.original as any).maHopDong}</div>,
    },
    {
      accessorKey: "roomId",
      header: "Room / Building",
      cell: ({ row }) => {
        const room = (row.getValue("roomId") || (row.original as any).phong) as any;
        return (
          <div className="text-sm">
            <div className="font-medium">{room?.roomCode || room?.maPhong || 'N/A'}</div>
            <div className="text-gray-500 text-xs">
              {room?.buildingId?.name || room?.toaNha?.tenToaNha || 'N/A'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "representativeId",
      header: "Representative",
      cell: ({ row }) => {
        const rep = (row.getValue("representativeId") || (row.original as any).nguoiDaiDien) as any;
        return <div>{rep?.fullName || rep?.hoTen || 'N/A'}</div>;
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const contract = row.original;
        const start = contract.startDate || (contract as any).ngayBatDau;
        const end = contract.endDate || (contract as any).ngayKetThuc;
        return (
          <div className="text-sm">
            <div>From: {new Date(start).toLocaleDateString()}</div>
            <div>To: {new Date(end).toLocaleDateString()}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "rentPrice",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Rent Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("rentPrice") ?? (row.original as any).giaThue)
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status") || (row.original as any).trangThai),
    },
    {
      accessorKey: "endDate",
      header: "Alert",
      cell: ({ row }) => {
        const end = (row.getValue("endDate") || (row.original as any).ngayKetThuc) as Date | string;
        return getWarningBadge(end);
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const contract = row.original
        const status = contract.status || (contract as any).trangThai;

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
                  navigator.clipboard.writeText(contract._id!);
                  toast.success('Contract ID copied');
                }}
              >
                Copy Contract ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(contract)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(contract)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(contract)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {status === 'active' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onGiaHan(contract)}
                    disabled={actionLoading === `giahan-${contract._id}`}
                  >
                    {actionLoading === `giahan-${contract._id}` ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Renewing...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Renew
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onHuy(contract)}
                    className="text-orange-600"
                    disabled={actionLoading === `huy-${contract._id}`}
                  >
                    {actionLoading === `huy-${contract._id}` ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel Contract
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="p-0">
                <DeleteConfirmPopover
                  onConfirm={() => onDelete(contract._id!)}
                  title="Delete Contract"
                  description="Are you sure you want to delete this contract? This will permanently remove all associated data."
                  buttonVariant="ghost"
                  buttonSize="sm"
                  iconOnly={false}
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by contract code..."
          value={(table.getColumn("contractCode")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("contractCode")?.setFilterValue(event.target.value)
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
                    {column.id === "contractCode" ? "Contract Code" :
                     column.id === "roomId" ? "Room" :
                     column.id === "representativeId" ? "Tenant" :
                     column.id === "startDate" ? "Duration" :
                     column.id === "rentPrice" ? "Price" :
                     column.id === "status" ? "Status" :
                     column.id === "endDate" ? "Alert" :
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
                  colSpan={columns.length}
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
          Showing {table.getRowModel().rows.length} contracts
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
