"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Filter,
  X,
  Eye,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  MoreHorizontal,
  MessageSquare,
  History,
  Send,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  DropdownMenuItem,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { currentUser, complaints, type Status, type Priority, type Complaint, categoryBreakdown } from "@/lib/data"

type SortOption = "newest" | "oldest" | "priority-high" | "priority-low" | "status"

const statusOptions: Status[] = ["Submitted", "Under Review", "Approved", "Assigned", "In Progress", "Resolved", "Rejected"]
const priorityOptions: Priority[] = ["Critical", "High", "Medium", "Low"]
const wardOptions = ["Sector 14", "Sector 9", "Sector 22", "Sector 18", "Sector 7", "Sector 5", "Sector 12", "Sector 31"]

const officers = [
  { name: "Eng. R. Mehta", department: "Roads & Infrastructure", workload: 12 },
  { name: "San. T. Rao", department: "Sanitation", workload: 8 },
  { name: "Eng. K. Singh", department: "Water Works", workload: 15 },
  { name: "Elec. P. Verma", department: "Electrical", workload: 6 },
  { name: "Off. S. Kumar", department: "Public Safety", workload: 4 },
]

interface TimelineEvent {
  date: string
  time: string
  status: Status
  officer?: string
  comments?: string
}

function generateTimeline(complaint: Complaint): TimelineEvent[] {
  return [
    { date: complaint.date, time: "10:30 AM", status: "Submitted", comments: "Issue reported successfully" },
    { date: complaint.date, time: "02:15 PM", status: "Under Review", officer: "Ward Officer S. Kumar", comments: "Under verification" },
    complaint.status !== "Submitted" && { date: complaint.date, time: "04:00 PM", status: "Approved", officer: "Ward Officer S. Kumar" },
    complaint.officer && { date: complaint.date, time: "05:30 PM", status: "Assigned", officer: complaint.officer },
    complaint.status === "In Progress" && { date: complaint.date, time: "08:00 AM", status: "In Progress", officer: complaint.officer, comments: "Work commenced" },
    complaint.status === "Resolved" && { date: complaint.date, time: "03:45 PM", status: "Resolved", officer: complaint.officer || "Field Officer", comments: "Issue resolved" },
  ].filter(Boolean) as TimelineEvent[]
}

export default function AdminComplaintsPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<Status[]>([])
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([])
  const [wardFilter, setWardFilter] = React.useState<string[]>([])
  const [sortBy, setSortBy] = React.useState<SortOption>("newest")
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [internalNote, setInternalNote] = React.useState("")

  const toggleStatus = (status: Status) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const togglePriority = (priority: Priority) => {
    setPriorityFilter(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    )
  }

  const toggleWard = (ward: string) => {
    setWardFilter(prev =>
      prev.includes(ward) ? prev.filter(w => w !== ward) : [...prev, ward]
    )
  }

  const clearFilters = () => {
    setSearch("")
    setStatusFilter([])
    setPriorityFilter([])
    setWardFilter([])
  }

  const filteredComplaints = React.useMemo(() => {
    let result = [...complaints]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(c =>
        c.id.toLowerCase().includes(query) ||
        c.citizen.toLowerCase().includes(query) ||
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

    if (wardFilter.length > 0) {
      result = result.filter(c => wardFilter.some(w => c.location.includes(w)))
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
  }, [search, statusFilter, priorityFilter, wardFilter, sortBy])

  const hasActiveFilters = search || statusFilter.length > 0 || priorityFilter.length > 0 || wardFilter.length > 0

  const handleApprove = () => {
    toast.success("Complaint Approved", { description: "The complaint has been approved and sent for assignment." })
    setIsDrawerOpen(false)
  }

  const handleReject = () => {
    toast.error("Complaint Rejected", { description: "The complaint has been rejected." })
    setIsDrawerOpen(false)
  }

  const handleAssign = (officer: typeof officers[0]) => {
    toast.success("Complaint Assigned", { description: `Assigned to ${officer.name}` })
    setIsDrawerOpen(false)
  }

  const handleAddNote = () => {
    if (!internalNote.trim()) return
    toast.success("Note Added", { description: "Internal note has been added." })
    setInternalNote("")
  }

  return (
    <>
      <DashboardShell
        items={adminNav}
        label="Municipal Admin"
        title="Complaints"
        description="Manage and resolve civic complaints"
        user={{
          name: "Commissioner R. Sharma",
          detail: "Municipal Admin",
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
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by ticket ID, citizen, or location..."
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
                          <Badge variant="secondary" className="ml-1">{statusFilter.length}</Badge>
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
                          <Badge variant="secondary" className="ml-1">{priorityFilter.length}</Badge>
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

                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="outline" className="gap-2">
                        <Filter className="size-4" />
                        Ward
                        {wardFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1">{wardFilter.length}</Badge>
                        )}
                        <ChevronDown className="size-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Filter by Ward</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {wardOptions.map(ward => (
                        <DropdownMenuCheckboxItem
                          key={ward}
                          checked={wardFilter.includes(ward)}
                          onCheckedChange={() => toggleWard(ward)}
                        >
                          {ward}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40 gap-2">
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
                        <button onClick={() => setSearch("")}><X className="size-3" /></button>
                      </Badge>
                    )}
                    {statusFilter.map(status => (
                      <Badge key={status} variant="secondary" className="gap-1.5 py-1">
                        {status}
                        <button onClick={() => toggleStatus(status)}><X className="size-3" /></button>
                      </Badge>
                    ))}
                    {priorityFilter.map(priority => (
                      <Badge key={priority} variant="secondary" className="gap-1.5 py-1">
                        {priority}
                        <button onClick={() => togglePriority(priority)}><X className="size-3" /></button>
                      </Badge>
                    ))}
                    {wardFilter.map(ward => (
                      <Badge key={ward} variant="secondary" className="gap-1.5 py-1">
                        {ward}
                        <button onClick={() => toggleWard(ward)}><X className="size-3" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Ward</TableHead>
                    <TableHead className="hidden lg:table-cell">Officer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow
                      key={complaint.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setIsDrawerOpen(true)
                      }}
                    >
                      <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{complaint.citizen}</span>
                        </div>
                      </TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell><PriorityBadge priority={complaint.priority} /></TableCell>
                      <TableCell><StatusBadge status={complaint.status} /></TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{complaint.location.split(",")[0]}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {complaint.officer || <span className="text-warning">Unassigned</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{complaint.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon-sm" onClick={e => e.stopPropagation()}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => { setSelectedComplaint(complaint); setIsDrawerOpen(true) }}>
                              <Eye className="mr-2 size-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Approved")}>
                              <CheckCircle2 className="mr-2 size-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.error("Rejected")}>
                              <XCircle className="mr-2 size-4" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.success("Assigned")}>
                              <UserPlus className="mr-2 size-4" />
                              Assign Officer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredComplaints.length} of {complaints.length} complaints</span>
          </div>
        </div>
      </DashboardShell>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selectedComplaint && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedComplaint.id}</Badge>
                  <PriorityBadge priority={selectedComplaint.priority} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                <SheetTitle className="text-left">{selectedComplaint.title}</SheetTitle>
                <SheetDescription className="text-left">{selectedComplaint.category}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 grid gap-6">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={selectedComplaint.image}
                    alt={selectedComplaint.category}
                    fill
                    className="object-cover"
                  />
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedComplaint.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Citizen Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span>{selectedComplaint.citizen}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>{selectedComplaint.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span>{selectedComplaint.date}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <History className="size-4" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative ml-4 space-y-4 border-l-2 border-border pb-2">
                      {generateTimeline(selectedComplaint).map((event, i) => (
                        <div key={i} className="relative -ml-4 pl-8">
                          <span className="absolute left-0 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background">
                            {event.status === "Resolved" ? (
                              <CheckCircle2 className="size-4 text-success" />
                            ) : (
                              <Clock className="size-4 text-muted-foreground" />
                            )}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{event.status}</span>
                            <span className="text-xs text-muted-foreground">{event.date} at {event.time}</span>
                            {event.officer && <span className="text-xs text-muted-foreground">by {event.officer}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Assigned Officer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedComplaint.officer ? (
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedComplaint.officer}</p>
                          <p className="text-xs text-muted-foreground">Field Officer</p>
                        </div>
                      </div>
                    ) : (
                      <Select onValueChange={(v) => handleAssign(officers.find(o => o.name === v)!)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Assign to officer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {officers.map(officer => (
                            <SelectItem key={officer.name} value={officer.name}>
                              <div className="flex items-center gap-2">
                                <span>{officer.name}</span>
                                <Badge variant="outline" className="ml-auto">{officer.workload} active</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      Internal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Textarea
                      placeholder="Add internal note..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="min-h-20"
                    />
                    <Button size="sm" onClick={handleAddNote} disabled={!internalNote.trim()}>
                      <Send className="mr-2 size-4" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => toast.info("Priority Changed")}>
                    <AlertTriangle className="mr-2 size-4" />
                    Change Priority
                  </Button>
                  <Button variant="outline" render={<Link href={`/tracking/${selectedComplaint.id}`} />}>
                    <Eye className="mr-2 size-4" />
                    Public View
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleApprove}>
                    <CheckCircle2 className="mr-2 size-4" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    <XCircle className="mr-2 size-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
