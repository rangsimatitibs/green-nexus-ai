import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface OptimizationData {
  baseline: {
    yield: number;
    energy: number;
    time: number;
  };
  optimized: {
    yield: number;
    energy: number;
    time: number;
  };
}

interface OptimizationChartsProps {
  data: OptimizationData;
}

export const OptimizationCharts = ({ data }: OptimizationChartsProps) => {
  const comparisonData = [
    {
      metric: 'Yield (%)',
      Baseline: parseFloat(data.baseline.yield.toFixed(1)),
      Optimized: parseFloat(data.optimized.yield.toFixed(1))
    },
    {
      metric: 'Energy (kWh)',
      Baseline: parseFloat(data.baseline.energy.toFixed(1)),
      Optimized: parseFloat(data.optimized.energy.toFixed(1))
    },
    {
      metric: 'Time (hrs)',
      Baseline: parseFloat(data.baseline.time.toFixed(1)),
      Optimized: parseFloat(data.optimized.time.toFixed(1))
    }
  ];

  const radarData = [
    {
      metric: 'Yield',
      Baseline: (data.baseline.yield / 100) * 100,
      Optimized: (data.optimized.yield / 100) * 100
    },
    {
      metric: 'Efficiency',
      Baseline: 100 - (data.baseline.energy / data.optimized.energy) * 100,
      Optimized: 100
    },
    {
      metric: 'Speed',
      Baseline: 100 - ((data.baseline.time / data.optimized.time) * 100 - 100),
      Optimized: 100
    }
  ];

  const improvementData = [
    {
      name: 'Yield',
      improvement: ((data.optimized.yield - data.baseline.yield) / data.baseline.yield * 100)
    },
    {
      name: 'Energy',
      improvement: ((data.baseline.energy - data.optimized.energy) / data.baseline.energy * 100)
    },
    {
      name: 'Time',
      improvement: ((data.baseline.time - data.optimized.time) / data.baseline.time * 100)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Baseline" fill="hsl(var(--muted-foreground))" />
                <Bar dataKey="Optimized" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Improvement Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={improvementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Improvement (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="improvement" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Baseline" dataKey="Baseline" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.3} />
              <Radar name="Optimized" dataKey="Optimized" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
