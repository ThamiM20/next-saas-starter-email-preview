import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye, Trash2, Mail } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export type Email = {
  id: string
  title: string
  from?: string
  to?: string[]
  dateProcessed: string
  status: 'Completed' | 'Processing' | 'Failed'
  hasAttachments?: boolean
}

type EmailKeys = keyof Email;

type EmailColumnDef = ColumnDef<Email, unknown>;

export const columns: EmailColumnDef[] = [
  {
    accessorKey: "title",
    header: "Subject",
    cell: ({ row }) => {
      const email = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium">{email.title || 'No subject'}</span>
          {email.from && (
            <span className="text-xs text-muted-foreground">
              From: {email.from}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dateProcessed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Processed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateProcessed"))
      return format(date, 'MMM d, yyyy h:mm a')
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = 
        status === 'Completed' ? 'default' :
        status === 'Processing' ? 'secondary' : 'destructive';
      
      return (
        <div className="flex items-center space-x-2">
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
          {row.original.hasAttachments && (
            <span className="text-muted-foreground" title="Has attachments">
              📎
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const email = row.original

      return (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `/dashboard/email/preview?id=${email.id}`
            }}
            title="Preview email"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
            onClick={(e) => {
              e.stopPropagation()
              // Handle delete will be passed from parent
              const event = new CustomEvent('deleteEmail', { detail: { id: email.id } })
              window.dispatchEvent(event)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
