import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LogOut, Plus, Edit, Trash2, Upload, BarChart3, ImagePlus, X, FileDown, FileText, Download } from "lucide-react";
import { dataStore, convertImageToBase64, type Candidate } from "@/lib/dataStore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";
import { VotingControl } from "@/components/VotingControl";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { set } from "date-fns";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const MAYOR_COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-1))', 'hsl(var(--chart-5))', 'hsl(var(--chart-3))'];
const DEPUTY_COLORS = ['hsl(var(--chart-3))', 'hsl(var(--chart-5))', 'hsl(var(--chart-2))', 'hsl(var(--chart-1))', 'hsl(var(--chart-4))'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteStats, setVoteStats] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    proposals: "",
    category: "president" as "president" | "mayor" | "deputy",
    imageUrl: "",
  });

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    loadData();

    // Real-time polling every 2 seconds
    const interval = setInterval(() => {
      loadData();
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);
  
  const handleDownloadCSV = () => {
    const votes = dataStore.getVotes();

    if (votes.length === 0) {
      toast.error("No hay votos para exportar");
      return;
    }

    const headers = ["ID Voto", "Fecha", "ID Presidente", "ID Alcalde", "ID Diputado"];
    const csvContent = [
      headers.join(","),
      ...votes.map(vote => {
        const date = new Date(vote.timestamp).toLocaleString();
        return [vote.id, `"${date}"`, vote.president, vote.mayor, vote.deputy].join(",");
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dataset_votos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dataset CSV descargado correctamente");
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("report-content");
    
    if (!element) {
      toast.error("No se pudo generar el informe visual.");
      return;
    }

    try {
      toast.loading("Generando informe PDF...", { id: "pdf-gen" });
      
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setProperties({
        title: "Informe de Resultados Electorales"
      });

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      
      pdf.save(`informe_resultados_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss("pdf-gen");
      toast.success("Informe PDF generado exitosamente");
    } catch (error) {
      console.error(error);
      toast.dismiss("pdf-gen");
      toast.error("Error al generar el PDF");
    }
  };

  const loadData = () => {
    setCandidates(dataStore.getCandidates());
    setVoteStats(dataStore.getVoteStats());
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    toast.success("Sesión cerrada");
    navigate("/admin/login");
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")){
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("El tamaño de la imagen no debe exceder 2MB");
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setImagePreview(base64);
      setFormData({ ...formData, imageUrl: base64 });
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      toast.error("Error al cargar la imagen");
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData({ ...formData, imageUrl: "" });
  };

  const handleSaveCandidate = () => {
    if (!formData.name || !formData.party || !formData.proposals) {
      toast.error("Completa todos los campos");
      return;
    }

    const finalImageUrl = formData.imageUrl || "/placeholder.svg";

    if (editingId) {
      dataStore.updateCandidate(editingId, formData);
      toast.success("Candidato actualizado");
      setEditingId(null);
    } else {
      dataStore.addCandidate({ ...formData, imageUrl: "/placeholder.svg" });
      toast.success("Candidato agregado");
    }

    setFormData({ name: "", party: "", proposals: "", category: "president", imageUrl: "" });
    loadData();
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setFormData({
      name: candidate.name,
      party: candidate.party,
      proposals: candidate.proposals,
      category: candidate.category,
      imageUrl: candidate.imageUrl,
    });
    setImagePreview(candidate.imageUrl);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este candidato?")) {
      dataStore.deleteCandidate(id);
      toast.success("Candidato eliminado");
      loadData();
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      try {
        const result = dataStore.importVotesFromCSV(csv);
        const message = `✓ ${result.imported} votos importados\n${result.nullVotes > 0 ? `⚠ ${result.nullVotes} votos en blanco (marcados como nulos)\n` : ''}${result.invalidRows > 0 ? `✗ ${result.invalidRows} filas inválidas descartadas` : ''}`;
        toast.success(message, { duration: 5000 });
        setCsvUploaded(true);
        loadData();
      } catch (error) {
        toast.error("Error al importar CSV");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  const handleDataCleaning = () => {
    setIsProcessing(true);
    toast.loading("Limpiando datos...", {id: "data-clean"});
    setTimeout(() => {
      const cleaneCount = dataStore.revalidateAndCleanVotes()
      loadData();
      setIsProcessing(false);
      toast.dismiss("data-clean");
      toast.success(`Datos limpiados. ${cleaneCount} votos corregidos.`);

      if (cleaneCount < 0) {
        toast.error("Algunos votos no pudieron ser corregidos y fueron marcados como nulos.");
      } else{
        toast.success("Todos los votos fueron validados correctamente.");
      }
    }, 2000);
  };

  const handleMLTraining = () => {
    setIsProcessing(true);
    toast.loading("Entrenando modelo ML...");
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Modelo entrenado exitosamente");
    }, 3000);
  };

  const getChartData = (category: 'president' | 'mayor' | 'deputy') => {
    if (!voteStats) return [];
    const categoryCandidates = candidates.filter(c => c.category === category);
    const data = categoryCandidates.map(c => ({
      name: c.name,
      votos: voteStats[category][c.id] || 0,
    }));
    
    // Add null votes if they exist
    const nullVotes = voteStats[category]['null'] || 0;
    if (nullVotes > 0) {
      data.push({
        name: 'Votos Nulos',
        votos: nullVotes,
      });
    }
    
    return data;
  };

  const getTotalVotes = () => {
    if (!voteStats) return 0;
    return Object.values(voteStats.president).reduce((a: number, b: number) => a + b, 0);
  };

  const getTimelineData = () => {
    const votes = dataStore.getVotes();
    if (!votes.length) return [];
    const sortedVotes = [...votes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const groupedData: Record<string, number> = {};

    sortedVotes.forEach(vote => {
      // Formato HH:MM (puedes cambiar a solo hora si tienes muchos datos)
      const time = new Date(vote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      groupedData[time] = (groupedData[time] || 0) + 1;
    });

    let cumulativeTotal = 0;
    return Object.entries(groupedData).map(([time, count]) => {
      cumulativeTotal += count;
      return {
        time,
        nuevos: count,
        total: cumulativeTotal
      };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-institutional" />
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Monitoreo</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
            <TabsTrigger value="import">Importar Votos</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-end">
              <Button variant="outline" onClick={handleDownloadCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Descargar Dataset CSV
              </Button>
              <Button variant="default" onClick={handleDownloadPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Descargar Informe PDF
              </Button>
            </div>
            <VotingControl />
            <div id="report-content" className="space-y-6 bg-background p-4 rounded-lg">
              {/* Encabezado del Reporte (visible solo en PDF si ajustas CSS, o siempre) */}
              <div className="text-center mb-8 hidden print:block">
                  <h1 className="text-3xl font-bold">Informe Oficial de Resultados</h1>
                  <p className="text-muted-foreground">Fecha de emisión: {new Date().toLocaleDateString()}</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Votación</CardTitle>
                  <CardDescription>Total de votos registrados: {getTotalVotes().toString()}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Votación en Tiempo Real</CardTitle>
                    <CardDescription>Evolución del acumulado de votos durante la jornada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getTimelineData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            padding={{ left: 30, right: 30 }}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip 
                            labelStyle={{ color: "black" }}
                            contentStyle={{ borderRadius: "8px" }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="total" 
                            name="Votos Acumulados" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Presidente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getChartData('president')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votos">
                          {getChartData('president').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alcalde</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getChartData('mayor')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name}: ${entry.votos}`}
                          outerRadius={100}
                          fill="hsl(var(--chart-2))"
                          dataKey="votos"
                        >
                          {getChartData('mayor').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={MAYOR_COLORS[index % MAYOR_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Diputados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getChartData('deputy')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votos">
                          {getChartData('deputy').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DEPUTY_COLORS[index % DEPUTY_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Editar" : "Agregar"} Candidato</CardTitle>
                <CardDescription>Completa todos los campos y agrega una foto del candidato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="president">Presidente</SelectItem>
                      <SelectItem value="mayor">Alcalde</SelectItem>
                      <SelectItem value="deputy">Diputado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Foto del Candidato</Label>
                  <div className="flex items-start gap-4">
                    {/* Preview de la imagen */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {imagePreview ? (
                          <div className="relative w-full h-full group">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                              onClick={handleRemoveImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors text-center">
                          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Haz clic para subir imagen</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG o GIF (máx. 2MB)
                          </p>
                        </div>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Partido Político</Label>
                  <Input value={formData.party} onChange={(e) => setFormData({ ...formData, party: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Propuestas del Gobierno</Label>
                  <Textarea 
                    value={formData.proposals} 
                    onChange={(e) => setFormData({ ...formData, proposals: e.target.value })} 
                    rows={4} 
                    placeholder="Describe las principales propuestas del candidato..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveCandidate}>
                    {editingId ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {editingId ? "Actualizar" : "Agregar"}
                  </Button>
                  {editingId && (
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        setEditingId(null); 
                        setFormData({ name: "", party: "", proposals: "", category: "president", imageUrl: "" }); 
                        setImagePreview("");
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {['president', 'mayor', 'deputy'].map((category) => {
                const categoryLabel = category === 'president' ? 'Presidentes' : category === 'mayor' ? 'Alcaldes' : 'Diputados';
                const categoryCandidates = candidates.filter(c => c.category === category);
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{categoryLabel}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {categoryCandidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <img 
                            src={candidate.imageUrl || "/placeholder.svg"} 
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover border-2"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.party}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(candidate)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(candidate.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {categoryCandidates.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay candidatos en esta categoría
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Importar Votos Físicos</CardTitle>
                <CardDescription>
                  Sube un archivo CSV con votos de locales físicos de votación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Haz clic para subir CSV</p>
                      <p className="text-xs text-muted-foreground">
                        Formato: president_id,mayor_id,deputy_id
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </div>
                
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Formato del CSV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-background p-3 rounded">
{`president_id,mayor_id,deputy_id
p1,m1,d1
p2,m2,d2
p1,m1,d2`}
                    </pre>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className={!csvUploaded ? "opacity-50" : ""}>
              <CardHeader>
                <CardTitle>Limpieza de Datos</CardTitle>
                <CardDescription>
                  Procesa y limpia los datos importados del CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDataCleaning}
                  disabled={!csvUploaded || isProcessing}
                  className="w-full"
                >
                  Iniciar Limpieza de Datos
                </Button>
              </CardContent>
            </Card>

            <Card className={!csvUploaded ? "opacity-50" : ""}>
              <CardHeader>
                <CardTitle>Entrenamiento ML</CardTitle>
                <CardDescription>
                  Entrena el modelo de Machine Learning con los datos procesados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleMLTraining}
                  disabled={!csvUploaded || isProcessing}
                  className="w-full"
                  variant="secondary"
                >
                  Entrenar Modelo ML
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
