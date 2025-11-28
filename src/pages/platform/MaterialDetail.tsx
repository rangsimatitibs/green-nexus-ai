import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImage from "@/assets/materialink-logo.png";
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
    const pageHeight = doc.internal.pageSize.height;
    
    // MaterialInk brand colors (HSL to RGB conversion)
    const primaryColor: [number, number, number] = [34, 159, 143]; // Teal
    const accentColor: [number, number, number] = [59, 183, 126]; // Green
    let yPosition = 20;

    // Helper function to add header to each page
    const addHeader = () => {
      // Add logo
      const img = new Image();
      img.src = logoImage;
      doc.addImage(img, "PNG", 14, 10, 40, 12);
      
      // Add company tagline
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Sustainable Materials Intelligence", pageWidth - 14, 16, { align: "right" });
      
      // Header line
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, 26, pageWidth - 14, 26);
    };

    // Helper function to add footer to each page
    const addFooter = (pageNum: number) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `MaterialInk © ${new Date().getFullYear()} | Advanced Data Sheet`,
        14,
        pageHeight - 10
      );
      doc.text(`Page ${pageNum}`, pageWidth - 14, pageHeight - 10, { align: "right" });
    };

    let pageNum = 1;
    addHeader();

    yPosition = 35;

    // Title section with brand styling
    doc.setFillColor(...primaryColor);
    doc.rect(14, yPosition, pageWidth - 28, 20, "F");
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ADVANCED DATA SHEET", pageWidth / 2, yPosition + 8, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Material ID: ${material.id.slice(0, 8)}`, pageWidth / 2, yPosition + 15, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    yPosition += 28;

    // Record Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("RECORD INFORMATION", 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 2;

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: [
        ["Material ID (MAT_ID)", material.id],
        ["Material Name", material.name],
        ["Category", material.category],
        ["Entry Date", new Date().toLocaleDateString()],
      ],
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: "bold",
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // Material Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("MATERIAL INFORMATION", 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 2;

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
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: "bold",
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // Material Properties
    if (yPosition > 240) {
      addFooter(pageNum);
      doc.addPage();
      pageNum++;
      addHeader();
      yPosition = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("MATERIAL PROPERTIES", 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 2;

    const propertiesBody = Object.entries(material.properties).map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").trim(),
      String(value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Property", "Value"]],
      body: propertiesBody,
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: "bold",
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // Applications
    if (yPosition > 240) {
      addFooter(pageNum);
      doc.addPage();
      pageNum++;
      addHeader();
      yPosition = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("APPLICATIONS", 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Create a styled box for applications
    const applicationsText = material.applications.join(" • ");
    const splitApplications = doc.splitTextToSize(applicationsText, pageWidth - 36);
    const boxHeight = splitApplications.length * 5 + 8;
    
    doc.setFillColor(245, 250, 248);
    doc.roundedRect(14, yPosition - 3, pageWidth - 28, boxHeight, 2, 2, "F");
    doc.text(splitApplications, 18, yPosition + 2);
    yPosition += boxHeight + 10;

    // Certifications & Regulations
    if (yPosition > 240) {
      addFooter(pageNum);
      doc.addPage();
      pageNum++;
      addHeader();
      yPosition = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("CERTIFICATIONS & REGULATIONS", 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 2;

    const regulationsBody = material.regulations.map((reg: string, idx: number) => [
      `Certification ${idx + 1}`,
      reg,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: regulationsBody,
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: "bold",
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // Sustainability Metrics
    if (yPosition > 240) {
      addFooter(pageNum);
      doc.addPage();
      pageNum++;
      addHeader();
      yPosition = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text("SUSTAINABILITY METRICS", 14, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 2;

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
      theme: "striped",
      headStyles: { 
        fillColor: accentColor,
        fontSize: 10,
        fontStyle: "bold",
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    // Add footer to last page
    addFooter(pageNum);

    // Save the PDF
    doc.save(`MaterialInk_${material.name.replace(/\s+/g, "_")}_DataSheet.pdf`);
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
