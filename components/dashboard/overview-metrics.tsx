"use client"

import Image from "next/image"
import { MetricCard } from "./metric-card"

interface MetricData {
  title: string
  value: string
  change: string
  icon: string
  iconBg: string
}

const metricsData: MetricData[] = [
  {
    title: "Total Payments",
    value: "24,567",
    change: "+12.5%",
    icon: "/tel.svg",
    iconBg: "bg-teal-500/20",
  },
  {
    title: "Total Amount Sent",
    value: "$1.2M",
    change: "+8.2%",
    icon: "/processing.svg",
    iconBg: "bg-blue-500/20",
  },
  {
    title: "Success Rate",
    value: "98.7%",
    change: "+2.1%",
    icon: "/check.svg",
    iconBg: "bg-green-500/20",
  },
  {
    title: "Active Batches",
    value: "12",
    change: "Live",
    icon: "/clock.svg",
    iconBg: "bg-purple-500/20",
  },
]

export function OverviewMetrics() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric, index) => (
        <MetricCard key={metric.title} {...metric} index={index} />
      ))}
    </div>
  )
}
