import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaterialsData } from "@/hooks/useMaterialsData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const MaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { materials, loading, error } = useMaterialsData();
  const [material, setMaterial] = useState<any>(null);
  const [openSections, setOpenSections] = useState<string[]>([
    "record",
    "material-info",
    "properties",
  ]);

  useEffect(() => {
    if (materials && id) {
      const foundMaterial = materials.find((m) => m.id === id);
      setMaterial(foundMaterial);
    }
  }, [materials, id]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Advanced Data Sheet", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`MAT_ID: ${material.id.slice(0, 8)}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Record Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Record Information", 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: [
        ["Material ID (MAT_ID)", material.id],
        ["Material Name", material.name],
        ["Category", material.category],
        ["Entry Date", new Date().toLocaleDateString()],
      ],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Material Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Material Information", 14, yPosition);
    yPosition += 5;

    const materialInfoBody = [
      ["Chemical Formula", material.chemicalFormula],
      ["Chemical Structure", material.chemicalStructure],
      ["Scale", material.scale],
      ["Innovation Level", material.innovation],
    ];

    if (material.uniqueness) {
      materialInfoBody.push(["Unique Characteristics", material.uniqueness]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: materialInfoBody,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Material Properties
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Material Properties", 14, yPosition);
    yPosition += 5;

    const propertiesBody = Object.entries(material.properties).map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").trim(),
      String(value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Property", "Value"]],
      body: propertiesBody,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Applications
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Applications", 14, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const applicationsText = material.applications.join(", ");
    const splitApplications = doc.splitTextToSize(applicationsText, pageWidth - 28);
    doc.text(splitApplications, 14, yPosition);
    yPosition += splitApplications.length * 5 + 10;

    // Certifications & Regulations
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Certifications & Regulations", 14, yPosition);
    yPosition += 5;

    const regulationsBody = material.regulations.map((reg: string, idx: number) => [
      `Certification ${idx + 1}`,
      reg,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: regulationsBody,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Sustainability Metrics
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Sustainability Metrics", 14, yPosition);
    yPosition += 5;

    const sustainabilityBody = [
      ["Overall Score", `${material.sustainability.score}%`],
      ...Object.entries(material.sustainability.breakdown).map(([key, value]) => [
        key.replace(/([A-Z])/g, " $1").trim(),
        `${String(value)}%`,
      ]),
      ["Calculation Method", material.sustainability.calculation],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: sustainabilityBody,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Save the PDF
    doc.save(`${material.name.replace(/\s+/g, "_")}_DataSheet.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-32">
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">
              {error || "Material not found"}
            </p>
            <Link to="/platform/material-scouting">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Material Scouting
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-32">
        {/* Header */}
        <div className="mb-8">
          <Link to="/platform/material-scouting">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Material Scouting
            </Button>
          </Link>
          
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <h1 className="text-2xl font-bold uppercase">Advanced Data Sheet</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToPDF}
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Badge className="bg-primary-foreground text-primary text-lg px-4 py-1">
                MAT_ID {material.id.slice(0, 8)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Record Information */}
        <Collapsible
          open={openSections.includes("record")}
          onOpenChange={() => toggleSection("record")}
        >
          <Card className="mb-4 overflow-hidden">
            <CollapsibleTrigger className="w-full bg-muted/50 p-4 flex justify-between items-center hover:bg-muted/70 transition-colors">
              <h2 className="text-lg font-semibold uppercase">Record Information</h2>
              {openSections.includes("record") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30 w-1/3">
                        Material ID (MAT_ID)
                      </td>
                      <td className="p-4">{material.id}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Material Name
                      </td>
                      <td className="p-4">{material.name}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Category
                      </td>
                      <td className="p-4">{material.category}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Entry Date
                      </td>
                      <td className="p-4">{new Date().toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Material Information */}
        <Collapsible
          open={openSections.includes("material-info")}
          onOpenChange={() => toggleSection("material-info")}
        >
          <Card className="mb-4 overflow-hidden">
            <CollapsibleTrigger className="w-full bg-muted/50 p-4 flex justify-between items-center hover:bg-muted/70 transition-colors">
              <h2 className="text-lg font-semibold uppercase">Material Information</h2>
              {openSections.includes("material-info") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30 w-1/3">
                        Chemical Formula
                      </td>
                      <td className="p-4">{material.chemicalFormula}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Chemical Structure
                      </td>
                      <td className="p-4">{material.chemicalStructure}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Scale
                      </td>
                      <td className="p-4">{material.scale}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Innovation Level
                      </td>
                      <td className="p-4">{material.innovation}</td>
                    </tr>
                    {material.uniqueness && (
                      <tr className="border-b border-border">
                        <td className="p-4 font-semibold text-foreground bg-muted/30">
                          Unique Characteristics
                        </td>
                        <td className="p-4">{material.uniqueness}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Material Properties */}
        <Collapsible
          open={openSections.includes("properties")}
          onOpenChange={() => toggleSection("properties")}
        >
          <Card className="mb-4 overflow-hidden">
            <CollapsibleTrigger className="w-full bg-muted/50 p-4 flex justify-between items-center hover:bg-muted/70 transition-colors">
              <h2 className="text-lg font-semibold uppercase">Material Properties</h2>
              {openSections.includes("properties") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-0">
                <table className="w-full">
                  <tbody>
                    {Object.entries(material.properties).map(([key, value], idx) => (
                      <tr key={key} className={idx !== Object.keys(material.properties).length - 1 ? "border-b border-border" : ""}>
                        <td className="p-4 font-semibold text-foreground bg-muted/30 w-1/3 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td className="p-4">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Applications */}
        <Collapsible
          open={openSections.includes("applications")}
          onOpenChange={() => toggleSection("applications")}
        >
          <Card className="mb-4 overflow-hidden">
            <CollapsibleTrigger className="w-full bg-muted/50 p-4 flex justify-between items-center hover:bg-muted/70 transition-colors">
              <h2 className="text-lg font-semibold uppercase">Applications</h2>
              {openSections.includes("applications") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {material.applications.map((app: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Certifications & Regulations */}
        <Collapsible
          open={openSections.includes("regulations")}
          onOpenChange={() => toggleSection("regulations")}
        >
          <Card className="mb-4 overflow-hidden">
            <CollapsibleTrigger className="w-full bg-muted/50 p-4 flex justify-between items-center hover:bg-muted/70 transition-colors">
              <h2 className="text-lg font-semibold uppercase">Certifications & Regulations</h2>
              {openSections.includes("regulations") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-0">
                <table className="w-full">
                  <tbody>
                    {material.regulations.map((reg: string, idx: number) => (
                      <tr key={idx} className={idx !== material.regulations.length - 1 ? "border-b border-border" : ""}>
                        <td className="p-4 font-semibold text-foreground bg-muted/30 w-1/3">
                          Certification {idx + 1}
                        </td>
                        <td className="p-4">{reg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Sustainability */}
        <Collapsible
          open={openSections.includes("sustainability")}
          onOpenChange={() => toggleSection("sustainability")}
        >
          <Card className="mb-4 overflow-hidden">
            <CollapsibleTrigger className="w-full bg-muted/50 p-4 flex justify-between items-center hover:bg-muted/70 transition-colors">
              <h2 className="text-lg font-semibold uppercase">Sustainability Metrics</h2>
              {openSections.includes("sustainability") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-0">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30 w-1/3">
                        Overall Score
                      </td>
                      <td className="p-4">
                        <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                          {material.sustainability.score}%
                        </Badge>
                      </td>
                    </tr>
                    {Object.entries(material.sustainability.breakdown).map(([key, value], idx) => (
                      <tr key={key} className={idx !== Object.keys(material.sustainability.breakdown).length - 1 ? "border-b border-border" : ""}>
                        <td className="p-4 font-semibold text-foreground bg-muted/30 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td className="p-4">{String(value)}%</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border">
                      <td className="p-4 font-semibold text-foreground bg-muted/30">
                        Calculation Method
                      </td>
                      <td className="p-4 text-sm">{material.sustainability.calculation}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      <Footer />
    </div>
  );
};

export default MaterialDetail;
