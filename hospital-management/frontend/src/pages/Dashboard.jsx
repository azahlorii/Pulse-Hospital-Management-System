import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Stethoscope, CalendarClock, Receipt } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

const fallbackTrend = [
  { day: 'Mon', appointments: 12 },
  { day: 'Tue', appointments: 18 },
  { day: 'Wed', appointments: 14 },
  { day: 'Thu', appointments: 22 },
  { day: 'Fri', appointments: 19 },
  { day: 'Sat', appointments: 9 },
  { day: 'Sun', appointments: 6 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState(fallbackTrend)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => {
        setStats(res.data.stats)
        if (res.data.trend) setTrend(res.data.trend)
      })
      .catch(() => {
        // Backend route arrives in a later step — use placeholder numbers for now.
        setStats({ patients: 0, doctors: 0, appointmentsToday: 0, pendingBills: 0 })
      })
  }, [])

  const cards = [
    { label: 'Total Patients', value: stats?.patients ?? '—', icon: Users, accent: 'text-primary' },
    { label: 'Active Doctors', value: stats?.doctors ?? '—', icon: Stethoscope, accent: 'text-primary' },
    { label: "Today's Appointments", value: stats?.appointmentsToday ?? '—', icon: CalendarClock, accent: 'text-amber' },
    { label: 'Pending Bills', value: stats?.pendingBills ?? '—', icon: Receipt, accent: 'text-pulse' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Good to see you, {user?.name?.split(' ')[0] || 'there'}.
        </h1>
        <p className="text-ink/50 text-sm mt-1">Here's what's happening across the hospital today.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map(({ label, value, icon: Icon, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="bg-card rounded-xl border border-line p-5"
          >
            <Icon className={accent} size={20} />
            <p className="text-2xl font-semibold text-ink mt-3">{value}</p>
            <p className="text-ink/50 text-sm">{label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="bg-card rounded-xl border border-line p-6 mt-6"
      >
        <h2 className="font-medium text-ink mb-4">Appointments this week</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F6E6A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0F6E6A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#0B1E2D80' }} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8E7' }} />
            <Area type="monotone" dataKey="appointments" stroke="#0F6E6A" strokeWidth={2} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
