import { Zap, Settings, LineChart, CheckCircle, ArrowRight, Sparkles, TrendingUp, Save, Download, History, X, Copy, Lock, Clock } from "lucide-react";
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
import { BatchSimulation } from "@/components/optimization/BatchSimulation";
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
  const [resultsTab, setResultsTab] = useState("analysis");

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
      
      {/* Hero Section with Coming Soon Gate */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Bioprocess Optimization
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Advanced AI-driven parameter tuning with real-time visualization, history tracking, and comprehensive analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Premium Gate */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-2 border-primary/20">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary rounded-full" />
              <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-accent rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/30 rounded-lg rotate-45" />
            </div>
            
            <CardContent className="relative py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              
              <Badge className="mb-4" variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                Premium Feature
              </Badge>
              
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Coming Soon
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Our advanced bioprocess optimization tool is currently under development. 
                Get notified when this powerful feature becomes available to premium users.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-10 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">AI-Powered Tuning</h4>
                    <p className="text-xs text-muted-foreground">Intelligent parameter optimization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <LineChart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Real-time Analysis</h4>
                    <p className="text-xs text-muted-foreground">Live visualization of results</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Custom Templates</h4>
                    <p className="text-xs text-muted-foreground">Pre-configured process types</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" variant="hero">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Join Waitlist for Early Access
                  </Button>
                </Link>
                <Link to="/platform/material-scouting">
                  <Button size="lg" variant="outline">
                    Explore Material Scouting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProcessOptimization;
