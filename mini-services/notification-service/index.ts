import { Server } from 'socket.io'
import http from 'node:http'

// ── Allowed event types ──────────────────────────────────────────────
const ALLOWED_EVENT_TYPES = ['new_report', 'payment_update', 'check_in', 'new_user']

// ── In-memory event history (last 50) ────────────────────────────────
const eventHistory: Array<{
  type: string
  data: any
  userId?: string
  role?: string
  timestamp: string
}> = []
const MAX_HISTORY = 50

function addHistory(event: typeof eventHistory[number]) {
  eventHistory.push(event)
  if (eventHistory.length > MAX_HISTORY) eventHistory.shift()
}

// ── HTTP server (REST API) ──────────────────────────────────────────
const httpServer = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://localhost:3004`)
  const pathname = url.pathname

  // ── GET /events – return last 50 events ───────────────────────────
  if (req.method === 'GET' && pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: true, events: eventHistory }))
    return
  }

  // ── GET /health – simple health check ─────────────────────────────
  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: true,
      status: 'ok',
      uptime: process.uptime(),
      connectedClients: io.sockets.sockets.size,
      eventHistoryCount: eventHistory.length,
    }))
    return
  }

  // ── POST /events – push a new notification ────────────────────────
  if (req.method === 'POST' && pathname === '/events') {
    try {
      const body = await readBody(req)
      const { type, data, userId, role } = body

      if (!type || !ALLOWED_EVENT_TYPES.includes(type)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          success: false,
          error: `Invalid event type. Allowed: ${ALLOWED_EVENT_TYPES.join(', ')}`,
        }))
        return
      }

      const event = {
        type,
        data: data || {},
        userId: userId || undefined,
        role: role || undefined,
        timestamp: new Date().toISOString(),
      }

      addHistory(event)
      console.log(`[EVENT] ${event.type} | userId=${event.userId || 'broadcast'} | role=${event.role || 'all'}`)

      // Broadcast strategy
      if (userId) {
        // Send to specific user room
        io.to(`user:${userId}`).emit('notification', event)
        // Also broadcast globally if no role filter
        if (!role) {
          io.emit('notification', event)
        }
      } else {
        // Broadcast to all connected clients
        io.emit('notification', event)
      }

      // If role is specified, also emit to role-specific room
      if (role) {
        io.to(`role:${role}`).emit('notification', event)
      }

      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, event }))
    } catch (err: any) {
      console.error('[ERROR] POST /events:', err.message)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }))
    }
    return
  }

  // ── 404 ───────────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ success: false, error: 'Not found' }))
})

// ── Helper: read request body ────────────────────────────────────────
function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

// ── Socket.IO server ────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: '*' },
  path: '/socket.io',
})

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id} (total: ${io.sockets.sockets.size})`)

  // Send init message with connection info
  socket.emit('init', {
    message: 'Connected to SAKSI APP notifications',
    socketId: socket.id,
    allowedEvents: ALLOWED_EVENT_TYPES,
    eventHistory: eventHistory.slice(-20), // last 20 events on connect
  })

  // Allow clients to join a user room for targeted notifications
  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`)
    console.log(`[WS] ${socket.id} joined user room: ${userId}`)
    socket.emit('joined', { room: `user:${userId}` })
  })

  // Allow clients to join a role room
  socket.on('join:role', (role: string) => {
    socket.join(`role:${role}`)
    console.log(`[WS] ${socket.id} joined role room: ${role}`)
    socket.emit('joined', { room: `role:${role}` })
  })

  // Allow clients to leave rooms
  socket.on('leave:room', (room: string) => {
    socket.leave(room)
    console.log(`[WS] ${socket.id} left room: ${room}`)
    socket.emit('left', { room })
  })

  // Ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() })
  })

  socket.on('disconnect', (reason) => {
    console.log(`[WS] Client disconnected: ${socket.id} | reason: ${reason} (total: ${io.sockets.sockets.size})`)
  })
})

// ── Start server ─────────────────────────────────────────────────────
const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`)
  console.log(`║   SAKSI APP – Notification Service              ║`)
  console.log(`║   WebSocket + REST API on port ${PORT}              ║`)
  console.log(`╠══════════════════════════════════════════════════╣`)
  console.log(`║   REST Endpoints:                                ║`)
  console.log(`║     POST /events   – Push a notification         ║`)
  console.log(`║     GET  /events   – Get event history (last 50) ║`)
  console.log(`║     GET  /health   – Health check                ║`)
  console.log(`╠══════════════════════════════════════════════════╣`)
  console.log(`║   Event Types:                                   ║`)
  console.log(`║     new_report, payment_update, check_in,        ║`)
  console.log(`║     new_user                                      ║`)
  console.log(`╠══════════════════════════════════════════════════╣`)
  console.log(`║   Socket.IO Rooms:                               ║`)
  console.log(`║     join:user  <userId>  – User-specific room    ║`)
  console.log(`║     join:role  <role>    – Role-specific room    ║`)
  console.log(`╚══════════════════════════════════════════════════╝\n`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[WS] Shutting down notification service...')
  io.close()
  httpServer.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n[WS] Shutting down notification service...')
  io.close()
  httpServer.close()
  process.exit(0)
})
