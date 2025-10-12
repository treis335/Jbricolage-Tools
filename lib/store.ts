import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "admin" | "warehouse-manager"

export interface User {
  id: string
  name: string
  photo?: string // base64 encoded image
  assignedTools: string[]
  lastAssignment?: string
  qrCodeData?: string
  role?: string

}

export interface Tool {
  id: string
  name: string
  barcode: string
  photo?: string
  status: "available" | "assigned"
  assignedTo?: string
}

export interface Assignment {
  id: string
  userId: string
  userName: string
  toolIds: string[]
  toolNames: string[]
  date: string
  project: string
  status: "pending" | "returned"
  returnDate?: string
}

export interface AuthUser {
  username: string
  role: UserRole
}

interface AppState {
  // Auth
  currentUser: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void

  // Tools
  tools: Tool[]
  addTool: (tool: Omit<Tool, "id">) => void
  updateTool: (id: string, tool: Partial<Tool>) => void
  deleteTool: (id: string) => void

  // Users
  users: User[]
  addUser: (user: Omit<User, "id" | "assignedTools" | "qrCodeData">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  findUserByQRCode: (qrCode: string) => User | undefined

  // Assignments
  assignments: Assignment[]
  addAssignment: (assignment: Omit<Assignment, "id">) => void
  returnTools: (assignmentId: string, toolIds: string[]) => void

  scannedUser: User | null
  setScannedUser: (user: User | null) => void

  isQuickScanMode: boolean
  setQuickScanMode: (active: boolean) => void

  // Tools
  scannedTool: Tool | null
  setScannedTool: (tool: Tool | null) => void
  findToolByBarcode: (barcode: string) => Tool | undefined
}

const initialTools: Tool[] = [
  {
    id: "1",
    name: "Berbequim",
    barcode: "TOOL-001",
    status: "assigned",
    photo: "/power-drill.jpg",
    assignedTo: "1",
  },
  {
    id: "2",
    name: "Martelo",
    barcode: "TOOL-002",
    status: "assigned",
    photo: "/claw-hammer.jpg",
    assignedTo: "1",
  },
  { id: "3", name: "Chave de Fendas", barcode: "TOOL-003", status: "available", photo: "/standard-screwdriver.png" },
  {
    id: "4",
    name: "Serra Elétrica",
    barcode: "TOOL-004",
    status: "assigned",
    photo: "/electric-saw.jpg",
    assignedTo: "2",
  },
  {
    id: "5",
    name: "Rolos de Pintura",
    barcode: "TOOL-005",
    status: "assigned",
    photo: "/paint-roller.jpg",
    assignedTo: "1",
  },
]

const initialUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    photo: "/joao-silva.jpg", // Added photo field
    assignedTools: ["1", "2", "5"],
    qrCodeData: "USER-001",
    lastAssignment: "2025-01-10",
  },
  {
    id: "2",
    name: "Maria Santos",
    photo: "/maria-santos.jpg", // Added photo field
    assignedTools: ["4"],
    qrCodeData: "USER-002",
    lastAssignment: "2025-01-09",
  },
  {
    id: "3",
    name: "Pedro Costa",
    photo: "/pedro-costa.jpg", // Added photo field
    assignedTools: [],
    qrCodeData: "USER-003",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    photo: "/ana-oliveira.jpg", // Added photo field
    assignedTools: [],
    qrCodeData: "USER-004",
  },
]

const initialAssignments: Assignment[] = [
  {
    id: "1",
    userId: "1",
    userName: "João Silva",
    toolIds: ["1", "2", "5"],
    toolNames: ["Berbequim", "Martelo", "Rolos de Pintura"],
    date: "2025-01-10",
    project: "Obra Centro",
    status: "pending",
  },
  {
    id: "2",
    userId: "2",
    userName: "Maria Santos",
    toolIds: ["4"],
    toolNames: ["Serra Elétrica"],
    date: "2025-01-09",
    project: "Reforma Escritório",
    status: "pending",
  },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      login: (username: string, password: string) => {
        if (username === "admin" && password === "admin123") {
          set({ currentUser: { username: "Admin", role: "admin" } })
          return true
        }
        if (username === "armazem" && password === "armazem123") {
          set({ currentUser: { username: "Chefe de Armazém", role: "warehouse-manager" } })
          return true
        }
        return false
      },
      logout: () => set({ currentUser: null }),

      // Tools
      tools: initialTools,
      addTool: (tool) => {
        const newTool = { ...tool, id: Date.now().toString() }
        set((state) => ({ tools: [...state.tools, newTool] }))
      },
      updateTool: (id, tool) => {
        set((state) => ({
          tools: state.tools.map((t) => (t.id === id ? { ...t, ...tool } : t)),
        }))
      },
      deleteTool: (id) => {
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
        }))
      },

      // Users
      users: initialUsers,
      addUser: (user) => {
        const userCount = get().users.length + 1
        const qrCodeData = `USER-${String(userCount).padStart(3, "0")}`
        const newUser = { ...user, id: Date.now().toString(), assignedTools: [], qrCodeData }
        set((state) => ({ users: [...state.users, newUser] }))
      },
      updateUser: (id, user) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)),
        }))
      },
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },
      findUserByQRCode: (qrCode: string) => {
        return get().users.find((u) => u.qrCodeData === qrCode)
      },

      // Assignments
      assignments: initialAssignments,
      addAssignment: (assignment) => {
        const newAssignment = { ...assignment, id: Date.now().toString() }
        set((state) => {
          // Update tool status
          const updatedTools = state.tools.map((tool) =>
            assignment.toolIds.includes(tool.id)
              ? { ...tool, status: "assigned" as const, assignedTo: assignment.userId }
              : tool,
          )

          // Update user assigned tools
          const updatedUsers = state.users.map((user) =>
            user.id === assignment.userId
              ? {
                  ...user,
                  assignedTools: [...user.assignedTools, ...assignment.toolIds],
                  lastAssignment: assignment.date,
                }
              : user,
          )

          return {
            assignments: [...state.assignments, newAssignment],
            tools: updatedTools,
            users: updatedUsers,
          }
        })
      },
      returnTools: (assignmentId, toolIds) => {
        set((state) => {
          const assignment = state.assignments.find((a) => a.id === assignmentId)
          if (!assignment) return state

          const remainingToolIds = assignment.toolIds.filter((id) => !toolIds.includes(id))
          const isFullyReturned = remainingToolIds.length === 0

          // Update assignment
          const updatedAssignments = state.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  toolIds: remainingToolIds,
                  toolNames: a.toolNames.filter((_, i) => !toolIds.includes(a.toolIds[i])),
                  status: isFullyReturned ? ("returned" as const) : a.status,
                  returnDate: isFullyReturned ? new Date().toISOString().split("T")[0] : a.returnDate,
                }
              : a,
          )

          // Update tool status
          const updatedTools = state.tools.map((tool) =>
            toolIds.includes(tool.id) ? { ...tool, status: "available" as const, assignedTo: undefined } : tool,
          )

          // Update user assigned tools
          const updatedUsers = state.users.map((user) =>
            user.id === assignment.userId
              ? { ...user, assignedTools: user.assignedTools.filter((id) => !toolIds.includes(id)) }
              : user,
          )

          return {
            assignments: updatedAssignments,
            tools: updatedTools,
            users: updatedUsers,
          }
        })
      },

      scannedUser: null,
      setScannedUser: (user) => set({ scannedUser: user }),

      isQuickScanMode: false,
      setQuickScanMode: (active) => set({ isQuickScanMode: active }),

      // Tools
      scannedTool: null,
      setScannedTool: (tool) => set({ scannedTool: tool }),
      findToolByBarcode: (barcode: string) => {
        return get().tools.find((t) => t.barcode === barcode)
      },
    }),
    {
      name: "tool-management-storage",
    },
  ),
)
