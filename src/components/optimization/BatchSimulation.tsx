import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { equipmentRecommendations, scalingFactors } from "@/data/equipmentRecommendations";
import { Factory, Beaker, FlaskConical, TrendingUp, DollarSign, Clock } from "lucide-react";

interface BatchSimulationProps {
  baselineYield: number;
  baselineEnergy: number;
  baselineTime: number;
  optimizedYield: number;
  optimizedEnergy: number;
  optimizedTime: number;
}

export const BatchSimulation = ({
  baselineYield,
  baselineEnergy,
  baselineTime,
  optimizedYield,
  optimizedEnergy,
  optimizedTime
}: BatchSimulationProps) => {
  const [selectedScale, setSelectedScale] = useState<string>("lab");
  const [batchVolume, setBatchVolume] = useState<number>(5);
  const [batchesPerYear, setBatchesPerYear] = useState<number>(50);

  const equipment = equipmentRecommendations[selectedScale];
  const scalingFactor = scalingFactors[selectedScale];

  // Calculate scaled values
  const scaledYield = optimizedYield * scalingFactor.yieldEfficiency;
  const scaledEnergy = optimizedEnergy * scalingFactor.energyFactor;
  const scaledTime = optimizedTime * scalingFactor.timeFactor;

  // Calculate economics
  const annualProduction = batchVolume * batchesPerYear * (scaledYield / 100);
  const annualEnergyCost = scaledEnergy * batchesPerYear * 0.15; // $0.15/kWh
  const totalAnnualCost = parseFloat(equipment.estimatedOpex.replace(/[^0-9.-]+/g, "").split('-')[0]) + annualEnergyCost;

  // Comparison data for charts
  const scaleComparisonData = [
    {
      scale: "Lab",
      yield: optimizedYield * scalingFactors.lab.yieldEfficiency,
      energy: optimizedEnergy * scalingFactors.lab.energyFactor,
      time: optimizedTime * scalingFactors.lab.timeFactor,
      cost: 1.0
    },
    {
      scale: "Pilot",
      yield: optimizedYield * scalingFactors.pilot.yieldEfficiency,
      energy: optimizedEnergy * scalingFactors.pilot.energyFactor,
      time: optimizedTime * scalingFactors.pilot.timeFactor,
      cost: 0.7
    },
    {
      scale: "Industrial",
      yield: optimizedYield * scalingFactors.industrial.yieldEfficiency,
      energy: optimizedEnergy * scalingFactors.industrial.energyFactor,
      time: optimizedTime * scalingFactors.industrial.timeFactor,
      cost: 0.5
    }
  ];

  const getScaleIcon = (scale: string) => {
    switch (scale) {
      case "lab": return <Beaker className="h-4 w-4" />;
      case "pilot": return <FlaskConical className="h-4 w-4" />;
      case "industrial": return <Factory className="h-4 w-4" />;
      default: return <Beaker className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scale Configuration</CardTitle>
          <CardDescription>Configure production scale and batch parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Production Scale</Label>
              <Select value={selectedScale} onValueChange={setSelectedScale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">
                    <div className="flex items-center gap-2">
                      <Beaker className="h-4 w-4" />
                      Laboratory (1-10 L)
                    </div>
                  </SelectItem>
                  <SelectItem value="pilot">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Pilot (100-1,000 L)
                    </div>
                  </SelectItem>
                  <SelectItem value="industrial">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Industrial (5,000-20,000 L)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batch Volume (L)</Label>
              <Input
                type="number"
                value={batchVolume}
                onChange={(e) => setBatchVolume(Number(e.target.value))}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Batches per Year</Label>
              <Input
                type="number"
                value={batchesPerYear}
                onChange={(e) => setBatchesPerYear(Number(e.target.value))}
                min={1}
                max={365}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Scaled Yield</span>
                </div>
                <div className="text-2xl font-bold">{scaledYield.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Efficiency factor: {(scalingFactor.yieldEfficiency * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Batch Time</span>
                </div>
                <div className="text-2xl font-bold">{scaledTime.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Time factor: {scalingFactor.timeFactor.toFixed(2)}x
                </p>
              </CardContent>
            </Card>

            <Card className="bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Annual Production</span>
                </div>
                <div className="text-2xl font-bold">{annualProduction.toFixed(0)}L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {batchesPerYear} batches × {batchVolume}L
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="economics">Economics</TabsTrigger>
          <TabsTrigger value="comparison">Scale Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getScaleIcon(selectedScale)}
                {equipment.scale} Equipment Recommendations
              </CardTitle>
              <CardDescription>Recommended equipment for {equipment.batchSize} batches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Bioreactor System</h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium">{equipment.bioreactor.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="font-medium">{equipment.bioreactor.volume}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="font-medium">{equipment.bioreactor.material}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost Range</p>
                    <p className="font-medium">{equipment.bioreactor.cost}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Mixing System</h4>
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium">{equipment.mixingSystem.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Power</p>
                    <p className="font-medium">{equipment.mixingSystem.power}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Speed Range</p>
                    <p className="font-medium">{equipment.mixingSystem.speed}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Monitoring & Control</h4>
                <div className="flex flex-wrap gap-2">
                  {equipment.monitoring.map((item, index) => (
                    <Badge key={index} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Auxiliary Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {equipment.auxiliaryEquipment.map((item, index) => (
                    <Badge key={index} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Capital Expenditure (CapEx)</CardTitle>
                <CardDescription>Initial investment required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{equipment.estimatedCapex}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Includes bioreactor, auxiliary equipment, installation, and commissioning
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Expenditure (OpEx)</CardTitle>
                <CardDescription>Annual operating costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{equipment.estimatedOpex}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Includes utilities, maintenance, consumables, and labor
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Annual Throughput</CardTitle>
                <CardDescription>Expected production capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{equipment.throughput}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your configuration: {annualProduction.toFixed(0)}L/year ({batchesPerYear} batches)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost per Liter</CardTitle>
                <CardDescription>Unit production cost</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${(totalAnnualCost / annualProduction).toFixed(2)}/L
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {annualProduction.toFixed(0)}L annual production
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Across Scales</CardTitle>
              <CardDescription>How process parameters change with scale-up</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scaleComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scale" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yield" fill="hsl(var(--primary))" name="Yield (%)" />
                  <Bar dataKey="energy" fill="hsl(var(--secondary))" name="Energy (kWh)" />
                  <Bar dataKey="time" fill="hsl(var(--accent))" name="Time (h)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relative Cost per Unit</CardTitle>
              <CardDescription>Material cost efficiency improves with scale</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scaleComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scale" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Relative Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-4">
                Lab scale baseline (1.0x). Pilot scale achieves ~30% cost reduction, industrial scale achieves ~50% cost reduction through economies of scale.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
