import  { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// interface ProjectChartsProps {
//   projectId: number;
// }

const chartConfig = {
  dataPoints: {
    label: "Data Points",
    color: "hsl(var(--chart-1))",
  },
  annotations: {
    label: "Annotations",
    color: "hsl(var(--chart-2))",
  },
  reviews: {
    label: "Reviews",
    color: "hsl(var(--chart-3))",
  },
  accuracy: {
    label: "Accuracy",
    color: "hsl(var(--chart-4))",
  },
};

//const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ProjectCharts = () => {
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d">("30d");

  
  const dailyProgressData = [
    { date: "Jul 10", dataPoints: 1200, annotations: 980, reviews: 850 },
    { date: "Jul 11", dataPoints: 1500, annotations: 1200, reviews: 1100 },
    { date: "Jul 12", dataPoints: 1800, annotations: 1400, reviews: 1300 },
    { date: "Jul 13", dataPoints: 2200, annotations: 1800, reviews: 1600 },
    { date: "Jul 14", dataPoints: 1900, annotations: 1500, reviews: 1400 },
    { date: "Jul 15", dataPoints: 2100, annotations: 1700, reviews: 1550 },
    { date: "Jul 16", dataPoints: 2400, annotations: 1900, reviews: 1750 },
  ];

  const accuracyData = [
    { date: "Jul 10", accuracy: 92 },
    { date: "Jul 11", accuracy: 94 },
    { date: "Jul 12", accuracy: 91 },
    { date: "Jul 13", accuracy: 96 },
    { date: "Jul 14", accuracy: 93 },
    { date: "Jul 15", accuracy: 95 },
    { date: "Jul 16", accuracy: 97 },
  ];

  const statusDistribution = [
    { name: 'Completed', value: 65, color: '#00C49F' },
    { name: 'In Progress', value: 25, color: '#0088FE' },
    { name: 'Pending', value: 10, color: '#FFBB28' },
  ];

  return (
   <div className="space-y-6 mb-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={dateFilter === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("7d")}
          className="border-white/10"
        >
          7 Days
        </Button>
        <Button
          variant={dateFilter === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("30d")}
          className="border-white/10"
        >
          30 Days
        </Button>
        <Button
          variant={dateFilter === "90d" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("90d")}
          className="border-white/10"
        >
          90 Days
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
        {/* Daily Progress Chart */}
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Daily Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full h-80">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={dailyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="dataPoints" fill="var(--color-dataPoints)" />
                  <Bar dataKey="annotations" fill="var(--color-annotations)" />
                  <Bar dataKey="reviews" fill="var(--color-reviews)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Trend Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full h-80">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <YAxis 
                    domain={[85, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="var(--color-accuracy)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-accuracy)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Distribution (Pie chart) */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
