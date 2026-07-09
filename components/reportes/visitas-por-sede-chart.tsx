"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts"

export interface VisitasPorSedeChartData {
  sede: string
  cantidad: number
  porcentaje: number
  color?: string
}

export function VisitasPorSedeChart({ data }: { data?: VisitasPorSedeChartData[] }) {
  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No hay datos de visitas por sede</p>
      </div>
    )
  }

  const enrichedData = data.map((item, index) => ({
    ...item,
    color: item.color || [`hsl(var(--chart-1))`, `hsl(var(--chart-2))`, `hsl(var(--chart-3))`][index % 3],
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="cantidad"
            nameKey="sede"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {enrichedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px"
            }}
            formatter={(value) => [`${value} visitas`, ""]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
