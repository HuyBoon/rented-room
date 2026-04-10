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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye, Copy, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Room } from "@/types"
import { DeleteConfirmPopover } from "@/components/ui/delete-confirm-popover"
import { ImageCarousel } from "@/components/ui/image-carousel"

interface RoomDataTableProps {
  data: Room[]
  onEdit: (room: Room) => void
  onDelete: (id: string) => void
}

export function PhongDataTable({ data, onEdit, onDelete }: RoomDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const getStatusBadge = (status: string) => {
    const variants = {
      available: { variant: 'secondary' as const, label: 'Available' },
      booked: { variant: 'outline' as const, label: 'Booked' },
      rented: { variant: 'default' as const, label: 'Rented' },
      maintenance: { variant: 'destructive' as const, label: 'Maintenance' },
      // Legacy support
      trong: { variant: 'secondary' as const, label: 'Available' },
      daDat: { variant: 'outline' as const, label: 'Booked' },
      dangThue: { variant: 'default' as const, label: 'Rented' },
      baoTri: { variant: 'destructive' as const, label: 'Maintenance' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: "roomCode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Room Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("roomCode") || (row.original as any).maPhong}</div>,
    },
    {
      accessorKey: "buildingId",
      header: "Building",
      cell: ({ row }) => {
        const building = row.getValue("buildingId") || (row.original as any).toaNha;
        return <div>{typeof building === 'object' ? (building.name || building.tenToaNha) : 'N/A'}</div>;
      },
    },
    {
      accessorKey: "floor",
      header: "Floor",
      cell: ({ row }) => <div>{row.getValue("floor") ?? (row.original as any).tang}</div>,
    },
    {
      accessorKey: "area",
      header: "Area",
      cell: ({ row }) => <div>{row.getValue("area") ?? (row.original as any).dienTich} m²</div>,
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
        const formatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status") || (row.original as any).trangThai),
    },
    {
      accessorKey: "tenants",
      header: "Current Tenants",
      cell: ({ row }) => {
        const room = row.original;
        const contract = room.currentContract || (room as any).hopDongHienTai;
        
        const tenantList = contract?.tenantIds || contract?.khachThueId;

        if (!tenantList || tenantList.length === 0) {
          return <div className="text-gray-400">Empty</div>;
        }
        
        return (
          <div className="space-y-1">
            {tenantList.map((tenant: any) => (
              <div key={tenant._id} className="text-sm">
                <span className="font-medium">{tenant.fullName || tenant.hoTen}</span>
                {(contract.representativeId?._id === tenant._id || contract.nguoiDaiDien?._id === tenant._id) && (
                  <span className="text-xs text-blue-600 ml-1">(Rep)</span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "maxTenants",
      header: "Max Tenants",
      cell: ({ row }) => <div>{row.getValue("maxTenants") ?? (row.original as any).soNguoiToiDa}</div>,
    },
    {
      accessorKey: "images",
      header: "Images",
      cell: ({ row }) => {
        const images = (row.getValue("images") || (row.original as any).anhPhong) as string[];
        if (!images || images.length === 0) {
          return <div className="text-gray-400 text-sm">No images</div>;
        }
        return (
          <div className="flex items-center space-x-2">
            <div className="relative w-12 h-8 rounded overflow-hidden">
              <img
                src={images[0]}
                alt="Room"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col space-y-1">
              {images.length > 1 && (
                <span className="text-xs text-gray-500">+{images.length - 1}</span>
              )}
              <div className="flex space-x-1">
                <ImageCarousel
                  images={images}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="View images">
                      <Eye className="h-3 w-3" />
                    </Button>
                  }
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  title="Copy share link"
                  onClick={() => {
                    const room = row.original;
                    const code = room.roomCode || (room as any).maPhong;
                    const publicUrl = `${window.location.origin}/view-room?phong=${code}`;
                    navigator.clipboard.writeText(publicUrl);
                    toast.success('Share link copied');
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const room = row.original
        const code = room.roomCode || (room as any).maPhong;

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
                  const publicUrl = `${window.location.origin}/view-room?phong=${code}`;
                  navigator.clipboard.writeText(publicUrl);
                  toast.success('Share link copied');
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy share link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const publicUrl = `${window.location.origin}/view-room?phong=${code}`;
                  window.open(publicUrl, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View public page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(room._id!);
                  toast.success('Room ID copied');
                }}
              >
                Copy Room ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(room)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-0">
                <DeleteConfirmPopover
                  onConfirm={() => onDelete(room._id!)}
                  title="Delete Room"
                  description="Are you sure you want to delete this room? This action cannot be undone."
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
          placeholder="Search by room code..."
          value={(table.getColumn("roomCode")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("roomCode")?.setFilterValue(event.target.value)
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
                    {column.id === "roomCode" ? "Room Code" :
                     column.id === "buildingId" ? "Building" :
                     column.id === "floor" ? "Floor" :
                     column.id === "area" ? "Area" :
                     column.id === "rentPrice" ? "Rent Price" :
                     column.id === "status" ? "Status" :
                     column.id === "tenants" ? "Current Tenants" :
                     column.id === "maxTenants" ? "Max Tenants" :
                     column.id === "images" ? "Images" :
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
          Showing {table.getRowModel().rows.length} rooms
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
