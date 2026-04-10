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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye, Download, Edit, Trash, CreditCard, Camera, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteConfirmPopover } from "@/components/ui/delete-confirm-popover"
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
import { Invoice, Room, Tenant } from "@/types"

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'unpaid':
    case 'unpaid':
      return <Badge variant="destructive">Unpaid</Badge>;
    case 'partiallyPaid':
    case 'partiallyPaid':
      return <Badge variant="secondary">Partially Paid</Badge>;
    case 'paid':
    case 'paid':
      return <Badge variant="default">Paid</Badge>;
    case 'overdue':
    case 'overdue':
      return <Badge variant="outline">Overdue</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface InvoiceDataTableProps {
  data: Invoice[];
  phongList?: Room[];
  khachThueList?: Tenant[];
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onScreenshot?: (invoice: Invoice) => void;
  onShare?: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onPayment?: (invoice: Invoice) => void;
}

export function createColumns(
  onView: (invoice: Invoice) => void,
  onDownload: (invoice: Invoice) => void,
  onScreenshot: (invoice: Invoice) => void,
  onEdit: (invoice: Invoice) => void,
  onDelete: (id: string) => void,
  onShare?: (invoice: Invoice) => void,
  onPayment?: (invoice: Invoice) => void
): ColumnDef<Invoice>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoiceCode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Invoice Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceCode") || (row.original as any).maHoaDon}</div>
      ),
    },
    {
      accessorKey: "roomId",
      header: "Room",
      cell: ({ row }) => {
        const room = (row.getValue("roomId") || (row.original as any).phong) as any;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {room?.roomCode || room?.maPhong || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "tenantId",
      header: "Tenant",
      cell: ({ row }) => {
        const tenant = (row.getValue("tenantId") || (row.original as any).khachThue) as any;
        return (
          <div className="text-sm">
            {tenant?.fullName || tenant?.hoTen || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: "month",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Period
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const month = row.getValue("month") || (row.original as any).thang;
        const year = row.original.year || (row.original as any).nam;
        return <div className="text-sm font-medium">{month}/{year}</div>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount") ?? (row.original as any).tongTien);
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "paidAmount",
      header: () => <div className="text-right">Paid</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("paidAmount") ?? (row.original as any).daThanhToan);
        return (
          <div className="text-right">
            <span className="text-green-600 font-medium">{formatCurrency(amount)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "remainingAmount",
      header: () => <div className="text-right">Remaining</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("remainingAmount") ?? (row.original as any).conLai);
        return (
          <div className="text-right">
            <span className={amount > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
              {formatCurrency(amount)}
            </span>
          </div>
        );
      },
    },
    {
      id: "meterReadings",
      header: "Meter Readings",
      cell: ({ row }) => {
        const invoice = row.original as any;
        const eStart = invoice.electricityStart ?? invoice.chiSoDienBanDau ?? 0;
        const eEnd = invoice.electricityEnd ?? invoice.chiSoDienCuoiKy ?? 0;
        const eUsage = invoice.electricityUsage ?? invoice.soDien ?? 0;
        const wStart = invoice.waterStart ?? invoice.chiSoNuocBanDau ?? 0;
        const wEnd = invoice.waterEnd ?? invoice.chiSoNuocCuoiKy ?? 0;
        const wUsage = invoice.waterUsage ?? invoice.soNuoc ?? 0;
        
        return (
          <div className="text-xs space-y-1">
            <div className="font-medium text-blue-600">⚡ Electricity:</div>
            <div className="ml-2">
              <div>Start: {eStart} kWh</div>
              <div>End: {eEnd} kWh</div>
              <div className="font-medium">Usage: {eUsage} kWh</div>
            </div>
            <div className="font-medium text-cyan-600">💧 Water:</div>
            <div className="ml-2">
              <div>Start: {wStart} m³</div>
              <div>End: {wEnd} m³</div>
              <div className="font-medium">Usage: {wUsage} m³</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("status") || (row.original as any).trangThai);
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dateStr = row.getValue("dueDate") || (row.original as any).hanThanhToan;
        const date = new Date(dateStr);
        const isOverdue = date < new Date() && (row.original.status === 'unpaid' || row.original.status === 'partiallyPaid');
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const invoice = row.original;
        const remaining = invoice.remainingAmount ?? (invoice as any).conLai;

        return (
          <div className="flex justify-end gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onView(invoice)}
              className="h-8 w-8 p-0"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDownload(invoice)}
              className="h-8 w-8 p-0"
              title="Download HTML"
            >
              <Download className="h-4 w-4" />
            </Button>
            {onScreenshot && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onScreenshot(invoice)}
                className="h-8 w-8 p-0"
                title="Screenshot & Export PDF"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
            {onShare && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onShare(invoice)}
                className="h-8 w-8 p-0"
                title="Copy share link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(invoice)}
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {remaining > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onPayment && onPayment(invoice)}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                title="Create payment"
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
            <DeleteConfirmPopover
              onConfirm={() => onDelete(invoice._id!)}
              title="Delete Invoice"
              description={`Are you sure you want to delete invoice ${invoice.invoiceCode || (invoice as any).maHoaDon}? All related data will be lost.`}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            />
          </div>
        );
      },
    },
  ];
}

export function HoaDonDataTable({
  data,
  onView,
  onDownload,
  onScreenshot,
  onShare,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onPayment,
}: InvoiceDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = React.useMemo(
    () => createColumns(onView, onDownload, onScreenshot || (() => {}), onEdit, onDelete, onShare, onPayment),
    [onView, onDownload, onScreenshot, onEdit, onDelete, onShare, onPayment]
  );

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
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleDeleteSelected = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original._id).filter(Boolean) as string[];
    
    if (selectedIds.length > 0) {
      onDeleteMultiple(selectedIds);
      setRowSelection({});
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by invoice code..."
            value={(table.getColumn("invoiceCode")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("invoiceCode")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 && (() => {
            const selectedCount = table.getFilteredSelectedRowModel().rows.length;
            return (
              <DeleteConfirmPopover
                onConfirm={handleDeleteSelected}
                title="Delete Multiple Invoices"
                description={`Are you sure you want to delete ${selectedCount} selected invoices? This action cannot be undone.`}
                buttonVariant="destructive"
                buttonSize="sm"
                iconOnly={false}
                className="h-8"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete ({selectedCount})
              </DeleteConfirmPopover>
            );
          })()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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
                    {column.id === "invoiceCode" ? "Invoice Code" :
                     column.id === "roomId" ? "Room" :
                     column.id === "tenantId" ? "Tenant" :
                     column.id === "month" ? "Period" :
                     column.id === "totalAmount" ? "Total" :
                     column.id === "paidAmount" ? "Paid" :
                     column.id === "remainingAmount" ? "Remaining" :
                     column.id === "meterReadings" ? "Readings" :
                     column.id === "status" ? "Status" :
                     column.id === "dueDate" ? "Due Date" :
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
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} rows selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 rounded border border-input bg-background px-2 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">First page</span>
              ⟪
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Last page</span>
              ⟫
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
