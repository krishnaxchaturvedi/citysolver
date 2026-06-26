"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  X,
  Eye,
  MapPin,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  SortAsc,
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badges"
import { PriorityBadge } from "@/components/status-badges"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { currentUser, complaints, type Status, type Priority, type Complaint } from "@/lib/data"

type SortOption = "newest" | "oldest" | "priority-high" | "priority-low" | "status"

const statusOptions: Status[] = ["Submitted", "Under Review", "Approved", "Assigned", "In Progress", "Resolved", "Rejected"]
const priorityOptions: Priority[] = ["Critical", "High", "Medium", "Low"]

export default function MyComplaintsPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<Status[]>([])
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([])
  const [sortBy, setSortBy] = React.useState<SortOption>("newest")
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table")

  const toggleStatus = (status: Status) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const togglePriority = (priority: Priority) => {
    setPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  const clearFilters = () => {
    setSearch("")
    setStatusFilter([])
    setPriorityFilter([])
  }

  const filteredComplaints = React.useMemo(() => {
    let result = [...complaints]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(c =>
        c.id.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
      )
    }

    if (statusFilter.length > 0) {
      result = result.filter(c => statusFilter.includes(c.status))
    }

    if (priorityFilter.length > 0) {
      result = result.filter(c => priorityFilter.includes(c.priority))
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "priority-high": {
          const order: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
          return order[b.priority] - order[a.priority]
        }
        case "priority-low": {
          const order: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
          return order[a.priority] - order[b.priority]
        }
        case "status": {
          const order: Record<Status, number> = {
            "Submitted": 1, "Under Review": 2, "Approved": 3,
            "Assigned": 4, "In Progress": 5, "Resolved": 6, "Rejected": 7
          }
          return order[a.status] - order[b.status]
        }
        default:
          return 0
      }
    })

    return result
  }, [search, statusFilter, priorityFilter, sortBy])

  const hasActiveFilters = search || statusFilter.length > 0 || priorityFilter.length > 0

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="My Complaints"
      description="View and track all your submitted complaints"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticket ID, issue, or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="outline" className="gap-2">
                      <Filter className="size-4" />
                      Status
                      {statusFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {statusFilter.length}
                        </Badge>
                      )}
                      <ChevronDown className="size-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map(status => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="outline" className="gap-2">
                      <Filter className="size-4" />
                      Priority
                      {priorityFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {priorityFilter.length}
                        </Badge>
                      )}
                      <ChevronDown className="size-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {priorityOptions.map(priority => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={() => togglePriority(priority)}
                      >
                        {priority}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-40 gap-2">
                    <SortAsc className="size-4" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priority-high">Highest Priority</SelectItem>
                    <SelectItem value="priority-low">Lowest Priority</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    <X className="size-4" />
                    Clear
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <Badge variant="secondary" className="gap-1.5 py-1">
                      Search: {search}
                      <button onClick={() => setSearch("")} className="hover:text-foreground">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  {statusFilter.map(status => (
                    <Badge key={status} variant="secondary" className="gap-1.5 py-1">
                      Status: {status}
                      <button onClick={() => toggleStatus(status)} className="hover:text-foreground">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  {priorityFilter.map(priority => (
                    <Badge key={priority} variant="secondary" className="gap-1.5 py-1">
                      Priority: {priority}
                      <button onClick={() => togglePriority(priority)} className="hover:text-foreground">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filteredComplaints.length === 0 ? (
              <Empty className="min-h-64">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No complaints found</EmptyTitle>
                  <EmptyDescription>
                    {hasActiveFilters
                      ? "Try adjusting your filters or search query"
                      : "You haven't submitted any complaints yet"}
                  </EmptyDescription>
                  {!hasActiveFilters && (
                    <Button asChild className="mt-4">
                      <Link href="/report">
                        Report Your First Issue
                      </Link>
                    </Button>
                  )}
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="hidden size-10 shrink-0 overflow-hidden rounded-lg sm:block">
                            <Image
                              src={complaint.image}
                              alt={complaint.category}
                              width={40}
                              height={40}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{complaint.category}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-48">
                              {complaint.title}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={complaint.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {complaint.date}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        <span className="line-clamp-1 max-w-32">{complaint.location}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/tracking/${complaint.id}`}>
                              <Eye className="mr-1.5 size-3.5" />
                              Track
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {filteredComplaints.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredComplaints.length} of {complaints.length} complaints</span>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
