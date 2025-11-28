import { Zap, Settings, LineChart, CheckCircle, ArrowRight, Sparkles, TrendingUp, Save, Download, History, X, Copy } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParameterInput } from "@/components/optimization/ParameterInput";
import { OptimizationCharts } from "@/components/optimization/OptimizationCharts";
import { processTemplates, ProcessTemplate } from "@/data/processTemplates";
import { useOptimizationHistory } from "@/hooks/useOptimizationHistory";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProcessOptimization = () => {
  const { toast } = useToast();
  const { runs, loading: historyLoading, saveRun, deleteRun } = useOptimizationHistory();
  
  // Basic parameters
  const [processName, setProcessName] = useState("Custom Process");
  const [processType, setProcessType] = useState<'fermentation' | 'enzymatic' | 'synthesis' | 'custom'>('custom');
  const [temperature, setTemperature] = useState([37]);
  const [ph, setPh] = useState([7]);
  const [agitation, setAgitation] = useState([200]);
  
  // Advanced parameters
  const [substrateConc, setSubstrateConc] = useState([100]);
  const [oxygenLevel, setOxygenLevel] = useState([20]);
  const [retentionTime, setRetentionTime] = useState([48]);
  
  // Constraints
  const [tempMin, setTempMin] = useState(20);
  const [tempMax, setTempMax] = useState(50);
  const [phMin, setPhMin] = useState(4);
  const [phMax, setPhMax] = useState(10);
  
  // Results
  const [optimization, setOptimization] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadTemplate = (template: ProcessTemplate) => {
    setProcessName(template.name);
    setProcessType(template.type);
    setTemperature([template.parameters.temperature]);
    setPh([template.parameters.ph]);
    setAgitation([template.parameters.agitation]);
    setSubstrateConc([template.parameters.substrate_concentration || 100]);
    setOxygenLevel([template.parameters.oxygen_level || 20]);
    setRetentionTime([template.parameters.retention_time || 48]);
    setTempMin(template.constraints.temp_min);
    setTempMax(template.constraints.temp_max);
    setPhMin(template.constraints.ph_min);
    setPhMax(template.constraints.ph_max);
    setOptimization(null);
    
    toast({
      title: "Template Loaded",
      description: `Loaded ${template.name} parameters`
    });
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Calculate deviations from optimal
      const tempDiff = Math.abs(temperature[0] - 37);
      const phDiff = Math.abs(ph[0] - 6.5);
      const agitationDiff = Math.abs(agitation[0] - 300);
      const substrateDiff = substrateConc[0] > 0 ? Math.abs(substrateConc[0] - 120) : 0;
      const oxygenDiff = oxygenLevel[0] > 0 ? Math.abs(oxygenLevel[0] - 25) : 0;
      
      // Calculate baseline performance
      const baselineYield = Math.max(50, 100 - (tempDiff * 1.2 + phDiff * 2.5 + agitationDiff * 0.08 + substrateDiff * 0.1 + oxygenDiff * 0.3));
      const baselineEnergy = temperature[0] * 0.5 + agitation[0] * 0.02 + (showAdvanced ? oxygenLevel[0] * 0.1 : 0);
      const baselineTime = 24 - (agitation[0] / 50) + (showAdvanced ? (120 - substrateConc[0]) * 0.05 : 0);
      
      // Calculate optimized values
      const optTemp = Math.max(tempMin, Math.min(tempMax, 37));
      const optPh = Math.max(phMin, Math.min(phMax, 6.5));
      const optAgitation = 300;
      const optSubstrate = showAdvanced ? 120 : substrateConc[0];
      const optOxygen = showAdvanced ? 25 : oxygenLevel[0];
      const optRetention = showAdvanced ? Math.max(24, retentionTime[0] * 0.85) : retentionTime[0];
      
      const optimizedYield = Math.min(98, baselineYield + 12 + Math.random() * 8);
      const optimizedEnergy = optTemp * 0.5 + optAgitation * 0.02 + (showAdvanced ? optOxygen * 0.1 : 0);
      const optimizedTime = 24 - (optAgitation / 50) + (showAdvanced ? (120 - optSubstrate) * 0.05 : 0);
      
      const result = {
        baseline: {
          yield: baselineYield,
          energy: baselineEnergy,
          time: Math.max(6, baselineTime)
        },
        optimized: {
          temperature: optTemp,
          ph: optPh,
          agitation: optAgitation,
          substrate_concentration: optSubstrate,
          oxygen_level: optOxygen,
          retention_time: optRetention,
          yield: optimizedYield,
          energy: optimizedEnergy,
          time: Math.max(6, optimizedTime)
        },
        improvements: {
          yield: ((optimizedYield - baselineYield) / baselineYield * 100),
          energy: ((baselineEnergy - optimizedEnergy) / baselineEnergy * 100),
          time: ((baselineTime - optimizedTime) / baselineTime * 100)
        }
      };
      
      setOptimization(result);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleSave = async () => {
    if (!optimization) return;
    
    await saveRun({
      process_name: processName,
      process_type: processType,
      temperature: temperature[0],
      ph: ph[0],
      agitation: agitation[0],
      substrate_concentration: showAdvanced ? substrateConc[0] : undefined,
      oxygen_level: showAdvanced ? oxygenLevel[0] : undefined,
      retention_time: showAdvanced ? retentionTime[0] : undefined,
      temp_min: tempMin,
      temp_max: tempMax,
      ph_min: phMin,
      ph_max: phMax,
      baseline_yield: optimization.baseline.yield,
      baseline_energy: optimization.baseline.energy,
      baseline_time: optimization.baseline.time,
      optimized_yield: optimization.optimized.yield,
      optimized_energy: optimization.optimized.energy,
      optimized_time: optimization.optimized.time,
      opt_temperature: optimization.optimized.temperature,
      opt_ph: optimization.optimized.ph,
      opt_agitation: optimization.optimized.agitation,
      opt_substrate_concentration: optimization.optimized.substrate_concentration,
      opt_oxygen_level: optimization.optimized.oxygen_level,
      opt_retention_time: optimization.optimized.retention_time,
      yield_improvement: optimization.improvements.yield,
      energy_improvement: optimization.improvements.energy,
      time_improvement: optimization.improvements.time,
      notes: notes
    });
  };

  const exportToPDF = () => {
    if (!optimization) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Bioprocess Optimization Report', 14, 20);
    
    // Process info
    doc.setFontSize(12);
    doc.text(`Process: ${processName}`, 14, 35);
    doc.text(`Type: ${processType}`, 14, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 49);
    
    // Parameters table
    const parameterData = [
      ['Temperature', `${temperature[0]}°C`, `${optimization.optimized.temperature}°C`],
      ['pH', `${ph[0]}`, `${optimization.optimized.ph}`],
      ['Agitation', `${agitation[0]} RPM`, `${optimization.optimized.agitation} RPM`],
    ];
    
    if (showAdvanced) {
      parameterData.push(
        ['Substrate Conc.', `${substrateConc[0]} g/L`, `${optimization.optimized.substrate_concentration} g/L`],
        ['Oxygen Level', `${oxygenLevel[0]}%`, `${optimization.optimized.oxygen_level}%`],
        ['Retention Time', `${retentionTime[0]} hrs`, `${optimization.optimized.retention_time} hrs`]
      );
    }
    
    autoTable(doc, {
      head: [['Parameter', 'Baseline', 'Optimized']],
      body: parameterData,
      startY: 60,
    });
    
    // Results table
    const resultsData = [
      ['Yield', `${optimization.baseline.yield.toFixed(1)}%`, `${optimization.optimized.yield.toFixed(1)}%`, `+${optimization.improvements.yield.toFixed(1)}%`],
      ['Energy', `${optimization.baseline.energy.toFixed(1)} kWh`, `${optimization.optimized.energy.toFixed(1)} kWh`, `${optimization.improvements.energy.toFixed(1)}%`],
      ['Time', `${optimization.baseline.time.toFixed(1)} hrs`, `${optimization.optimized.time.toFixed(1)} hrs`, `${optimization.improvements.time.toFixed(1)}%`],
    ];
    
    autoTable(doc, {
      head: [['Metric', 'Baseline', 'Optimized', 'Improvement']],
      body: resultsData,
      startY: (doc as any).lastAutoTable.finalY + 10,
    });
    
    // Notes
    if (notes) {
      doc.text('Notes:', 14, (doc as any).lastAutoTable.finalY + 20);
      const splitNotes = doc.splitTextToSize(notes, 180);
      doc.text(splitNotes, 14, (doc as any).lastAutoTable.finalY + 27);
    }
    
    doc.save(`optimization-${processName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Optimization report downloaded successfully"
    });
  };

  const loadFromHistory = (run: any) => {
    setProcessName(run.process_name);
    setProcessType(run.process_type);
    setTemperature([run.temperature]);
    setPh([run.ph]);
    setAgitation([run.agitation]);
    if (run.substrate_concentration) {
      setSubstrateConc([run.substrate_concentration]);
      setShowAdvanced(true);
    }
    if (run.oxygen_level) setOxygenLevel([run.oxygen_level]);
    if (run.retention_time) setRetentionTime([run.retention_time]);
    setTempMin(run.temp_min);
    setTempMax(run.temp_max);
    setPhMin(run.ph_min);
    setPhMax(run.ph_max);
    setNotes(run.notes || "");
    
    // Reconstruct optimization results
    setOptimization({
      baseline: {
        yield: run.baseline_yield,
        energy: run.baseline_energy,
        time: run.baseline_time
      },
      optimized: {
        temperature: run.opt_temperature,
        ph: run.opt_ph,
        agitation: run.opt_agitation,
        substrate_concentration: run.opt_substrate_concentration,
        oxygen_level: run.opt_oxygen_level,
        retention_time: run.opt_retention_time,
        yield: run.optimized_yield,
        energy: run.optimized_energy,
        time: run.optimized_time
      },
      improvements: {
        yield: run.yield_improvement,
        energy: run.energy_improvement,
        time: run.time_improvement
      }
    });
    
    setHistoryOpen(false);
    toast({
      title: "Run Loaded",
      description: `Loaded optimization from ${new Date(run.created_at).toLocaleDateString()}`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Bioprocess Optimization
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Advanced AI-driven parameter tuning with real-time visualization, history tracking, and comprehensive analysis.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Start Optimizing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Optimizer */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Advanced Optimizer
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Optimize Your Bioprocess
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Configure parameters, apply constraints, and see AI-powered optimization recommendations
            </p>
          </div>

          <Tabs defaultValue="optimizer" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="optimizer" className="space-y-6">
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-2 flex-1 mr-4">
                    <Label>Process Name</Label>
                    <input
                      type="text"
                      value={processName}
                      onChange={(e) => setProcessName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter process name"
                    />
                  </div>
                  <div className="space-y-2 w-48">
                    <Label>Process Type</Label>
                    <Select value={processType} onValueChange={(value: any) => setProcessType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fermentation">Fermentation</SelectItem>
                        <SelectItem value="enzymatic">Enzymatic</SelectItem>
                        <SelectItem value="synthesis">Synthesis</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <History className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Optimization History</DialogTitle>
                          <DialogDescription>
                            Load previous optimization runs or delete them
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {historyLoading ? (
                            <p className="text-center text-muted-foreground">Loading...</p>
                          ) : runs.length === 0 ? (
                            <p className="text-center text-muted-foreground">No saved optimizations yet</p>
                          ) : (
                            runs.map((run) => (
                              <Card key={run.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{run.process_name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(run.created_at).toLocaleString()}
                                    </p>
                                    <div className="mt-2 text-sm">
                                      <span className="text-green-600">Yield: +{run.yield_improvement.toFixed(1)}%</span>
                                      {' • '}
                                      <span>Energy: {run.energy_improvement.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => loadFromHistory(run)}
                                    >
                                      <Copy className="h-4 w-4 mr-1" />
                                      Load
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteRun(run.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Core Parameters</h3>
                  
                  <ParameterInput
                    label="Temperature"
                    value={temperature}
                    onChange={setTemperature}
                    min={15}
                    max={80}
                    step={1}
                    unit="°C"
                    tooltip="Optimal temperature range varies by process. Most bioprocesses operate between 25-50°C."
                    constraintMin={tempMin}
                    constraintMax={tempMax}
                  />

                  <ParameterInput
                    label="pH Level"
                    value={ph}
                    onChange={setPh}
                    min={2}
                    max={12}
                    step={0.5}
                    unit=""
                    tooltip="pH affects enzyme activity and microbial growth. Most processes prefer pH 5-8."
                    constraintMin={phMin}
                    constraintMax={phMax}
                  />

                  <ParameterInput
                    label="Agitation Speed"
                    value={agitation}
                    onChange={setAgitation}
                    min={0}
                    max={600}
                    step={50}
                    unit="RPM"
                    tooltip="Controls mixing and oxygen transfer. Higher speeds increase energy consumption."
                  />

                  <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Parameters
                  </Button>

                  {showAdvanced && (
                    <div className="space-y-6 pt-4 border-t">
                      <h3 className="text-lg font-semibold">Advanced Parameters</h3>
                      
                      <ParameterInput
                        label="Substrate Concentration"
                        value={substrateConc}
                        onChange={setSubstrateConc}
                        min={0}
                        max={200}
                        step={10}
                        unit="g/L"
                        tooltip="Initial substrate concentration. Higher values can increase yield but may cause inhibition."
                      />

                      <ParameterInput
                        label="Oxygen Level"
                        value={oxygenLevel}
                        onChange={setOxygenLevel}
                        min={0}
                        max={100}
                        step={5}
                        unit="%"
                        tooltip="Dissolved oxygen saturation. Critical for aerobic processes."
                      />

                      <ParameterInput
                        label="Retention Time"
                        value={retentionTime}
                        onChange={setRetentionTime}
                        min={1}
                        max={168}
                        step={1}
                        unit="hours"
                        tooltip="Total process duration. Longer times may increase yield but reduce productivity."
                      />

                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <Label>Temperature Constraints (°C)</Label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={tempMin}
                              onChange={(e) => setTempMin(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Min"
                            />
                            <input
                              type="number"
                              value={tempMax}
                              onChange={(e) => setTempMax(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>pH Constraints</Label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={phMin}
                              onChange={(e) => setPhMin(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Min"
                              step="0.5"
                            />
                            <input
                              type="number"
                              value={phMax}
                              onChange={(e) => setPhMax(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Max"
                              step="0.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="w-full mt-6"
                  size="lg"
                >
                  {isOptimizing ? (
                    <>Optimizing...</>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Optimize Process
                    </>
                  )}
                </Button>

                {optimization && (
                  <div className="space-y-6 mt-8 animate-fade-in border-t pt-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-semibold">Optimization Results</h3>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={exportToPDF} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                      </div>
                    </div>

                    <OptimizationCharts data={optimization} />

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-5 bg-muted/30">
                        <h4 className="font-semibold mb-4">Baseline Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Yield</span>
                            <span className="font-semibold">{optimization.baseline.yield.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Energy</span>
                            <span className="font-semibold">{optimization.baseline.energy.toFixed(1)} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Time</span>
                            <span className="font-semibold">{optimization.baseline.time.toFixed(1)} hrs</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-5 bg-primary/5 border-primary/20">
                        <h4 className="font-semibold mb-4">Optimized Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Yield</span>
                            <span className="font-semibold text-primary">{optimization.optimized.yield.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Energy</span>
                            <span className="font-semibold text-primary">{optimization.optimized.energy.toFixed(1)} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Time</span>
                            <span className="font-semibold text-primary">{optimization.optimized.time.toFixed(1)} hrs</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="p-5 bg-accent/5">
                      <h4 className="font-semibold mb-4">Recommended Parameters</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Temperature</div>
                          <div className="text-xl font-bold text-accent">{optimization.optimized.temperature}°C</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">pH</div>
                          <div className="text-xl font-bold text-accent">{optimization.optimized.ph}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Agitation</div>
                          <div className="text-xl font-bold text-accent">{optimization.optimized.agitation} RPM</div>
                        </div>
                        {showAdvanced && (
                          <>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">Substrate</div>
                              <div className="text-xl font-bold text-accent">{optimization.optimized.substrate_concentration} g/L</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">Oxygen</div>
                              <div className="text-xl font-bold text-accent">{optimization.optimized.oxygen_level}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">Time</div>
                              <div className="text-xl font-bold text-accent">{optimization.optimized.retention_time.toFixed(1)} hrs</div>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>

                    <div className="flex gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <strong className="text-foreground">Expected Improvements:</strong>
                        <span className="text-muted-foreground"> Yield +{Math.abs(optimization.improvements.yield).toFixed(1)}%, 
                        Energy {optimization.improvements.energy > 0 ? '+' : ''}{optimization.improvements.energy.toFixed(1)}%, 
                        Time {optimization.improvements.time > 0 ? '+' : ''}{optimization.improvements.time.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this optimization run..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {processTemplates.map((template) => (
                  <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <Button onClick={() => loadTemplate(template)} size="sm">
                        Load
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Typical Yield:</span>
                        <span className="font-medium">{template.typical_yield}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Typical Time:</span>
                        <span className="font-medium">{template.typical_time}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Advanced Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <LineChart className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-time Visualization</h3>
              <p className="text-muted-foreground">Interactive charts showing parameter impacts, sensitivity analysis, and performance comparisons.</p>
            </Card>
            <Card className="p-6">
              <History className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">History Tracking</h3>
              <p className="text-muted-foreground">Save, compare, and revisit previous optimization runs. Track improvements over time.</p>
            </Card>
            <Card className="p-6">
              <Download className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Export Reports</h3>
              <p className="text-muted-foreground">Generate professional PDF reports with all parameters, results, and recommendations.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Bioprocessing Efficiency
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join companies achieving breakthrough improvements with AI optimization
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Start Optimizing Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProcessOptimization;
