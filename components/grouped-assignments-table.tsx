"use client"

import { useState, useMemo } from "react"
import { useStore, type Assignment } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { QrCode, Eye, Package } from "lucide-react"
import { ReturnToolsModal } from "./return-tools-modal"
import { UserQRModal } from "./user-qr-modal"

interface GroupedAssignment {
  userId: string
  userName: string
  userRole: string
  assignments: Assignment[]
  totalTools: number
  latestDate: string
  projects: string[]
}

export function GroupedAssignmentsTable() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const assignments = useStore((state) => state.assignments)
  const users = useStore((state) => state.users)
  const tools = useStore((state) => state.tools)

  const groupedAssignments = useMemo(() => {
    const groups = new Map<string, GroupedAssignment>()

    assignments
      .filter((a) => a.status === "pending")
      .forEach((assignment) => {
        const user = users.find((u) => u.id === assignment.userId)
        if (!user) return

        if (!groups.has(assignment.userId)) {
          groups.set(assignment.userId, {
            userId: assignment.userId,
            userName: assignment.userName,
            userRole: user.role,
            assignments: [],
            totalTools: 0,
            latestDate: assignment.date,
            projects: [],
          })
        }

        const group = groups.get(assignment.userId)!
        group.assignments.push(assignment)
        group.totalTools += assignment.toolIds.length
        if (assignment.date > group.latestDate) {
          group.latestDate = assignment.date
        }
        if (!group.projects.includes(assignment.project)) {
          group.projects.push(assignment.project)
        }
      })

    return Array.from(groups.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate))
  }, [assignments, users])

  const getDaysOverdue = (date: string) => {
    const assignmentDate = new Date(date)
    const today = new Date()
    const diffTime = today.getTime() - assignmentDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (date: string) => {
    const days = getDaysOverdue(date)
    if (days > 7) {
      return (
        <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
          Atrasada ({days} dias)
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
        Pendente
      </Badge>
    )
  }

  if (groupedAssignments.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">Nenhuma atribuição pendente</div>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="pb-3 text-left text-sm font-medium">Usuário</th>
              <th className="pb-3 text-left text-sm font-medium">Ferramentas Atribuídas</th>
              <th className="pb-3 text-left text-sm font-medium">Data</th>
              <th className="pb-3 text-left text-sm font-medium">Obra/Projeto</th>
              <th className="pb-3 text-left text-sm font-medium">Status</th>
              <th className="pb-3 text-right text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {groupedAssignments.map((group) => {
              const user = users.find((u) => u.id === group.userId)
              const initials = group.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)

              return (
                <tr key={group.userId} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{group.userName}</div>
                        <div className="text-xs text-muted-foreground">{group.userRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="tools" className="border-none">
                        <AccordionTrigger className="py-0 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{group.totalTools} ferramenta(s)</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="mt-2 space-y-1">
                            {group.assignments.map((assignment) =>
                              assignment.toolIds.map((toolId, idx) => {
                                const tool = tools.find((t) => t.id === toolId)
                                return (
                                  <div key={`${assignment.id}-${toolId}`} className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {tool?.barcode || "N/A"}
                                    </Badge>
                                    <span>{assignment.toolNames[idx]}</span>
                                  </div>
                                )
                              }),
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </td>
                  <td className="py-3 text-sm">{group.latestDate}</td>
                  <td className="py-3 text-sm">{group.projects.join(", ")}</td>
                  <td className="py-3">{getStatusBadge(group.latestDate)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      {user?.qrCodeData && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUserId(user.id)}
                          title="Ver QR Code do usuário"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAssignment(group.assignments[0])}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => setSelectedAssignment(group.assignments[0])}>
                        Devolver
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedAssignment && (
        <ReturnToolsModal
          open={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={selectedAssignment}
        />
      )}

      {selectedUserId && (
        <UserQRModal open={!!selectedUserId} onClose={() => setSelectedUserId(null)} userId={selectedUserId} />
      )}
    </>
  )
}
