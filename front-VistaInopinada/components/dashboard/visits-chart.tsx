"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { semana: "Sem 1", visitas: 12, cumplimiento: 85 },
  { semana: "Sem 2", visitas: 8, cumplimiento: 90 },
  { semana: "Sem 3", visitas: 15, cumplimiento: 88 },
  { semana: "Sem 4", visitas: 10, cumplimiento: 92 },
  { semana: "Sem 5", visitas: 14, cumplimiento: 87 },
  { semana: "Sem 6", visitas: 11, cumplimiento: 91 },
  { semana: "Sem 7", visitas: 9, cumplimiento: 89 },
  { semana: "Sem 8", visitas: 13, cumplimiento: 93 },
]

export function VisitsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="semana" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px"
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Bar 
            dataKey="visitas" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
            name="Visitas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
