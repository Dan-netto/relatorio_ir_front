"use client"

import { useEffect,useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, DollarSign, PieChartIcon, BarChart3, ArrowUpDown } from "lucide-react"

export default function InvestmentDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add these state declarations
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("https://appcalculoemissao-2c6b30e79caa.herokuapp.com/carteira")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Falha ao carregar dados do backend");
        setLoading(false);
      });
  }, []);

  // Cálculos dos totais
  const totals = useMemo(() => {
    const totalInvestido = data.reduce((sum, item) => sum + item.total_investido, 0)
    const totalDividendos = data.reduce((sum, item) => sum + item.dividendos, 0)
    const totalJCP = data.reduce((sum, item) => sum + item.juros_sobre_capital_proprio, 0)

    // TIR média ponderada
    const tirMediaPonderada =
      data.reduce((sum, item) => sum + item.TIR * item.total_investido, 0) / totalInvestido

    return {
      totalInvestido,
      totalDividendos,
      totalJCP,
      tirMediaPonderada,
      retornoTotal: totalDividendos + totalJCP,
    }
  }, [data])

  // Dados filtrados e ordenados
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((item) => item.ticker.toLowerCase().includes(searchTerm.toLowerCase()))

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a]
        const bValue = b[sortField as keyof typeof b]

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [searchTerm, sortField, sortDirection])

  // Dados para gráfico de pizza (alocação)
  const pieData = data.map((item) => ({
    name: item.ticker,
    value: item.total_investido,
    percentage: ((item.total_investido / totals.totalInvestido) * 100).toFixed(1),
  }))

  // Dados para gráfico de barras (dividendos + JCP)
  const barData = data.map((item) => ({
    ticker: item.ticker,
    dividendos: item.dividendos,
    jcp: item.juros_sobre_capital_proprio,
    total: item.dividendos + item.juros_sobre_capital_proprio,
  }))

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const COLORS = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"]

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Investimentos</h1>
          <p className="text-muted-foreground">Consolidação e análise da sua carteira de ações</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totals.totalInvestido)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dividendos Recebidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totals.totalDividendos)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">JCP Recebidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totals.totalJCP)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TIR Média Ponderada</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatPercentage(totals.tirMediaPonderada)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Alocação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Alocação por Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Dividendos + JCP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dividendos + JCP por Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ticker" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="dividendos" stackId="a" fill="#ea580c" name="Dividendos" />
                  <Bar dataKey="jcp" stackId="a" fill="#f97316" name="JCP" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Interativa */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento dos Investimentos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Buscar por ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("ticker")} className="h-auto p-0 font-semibold">
                        Ticker
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("quantidade")}
                        className="h-auto p-0 font-semibold"
                      >
                        Quantidade
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("total_investido")}
                        className="h-auto p-0 font-semibold"
                      >
                        Total Investido
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("preco_medio")}
                        className="h-auto p-0 font-semibold"
                      >
                        Preço Médio
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("tir")} className="h-auto p-0 font-semibold">
                        TIR
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("dividendos")}
                        className="h-auto p-0 font-semibold"
                      >
                        Dividendos
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("juros_sobre_capital_proprio")}
                        className="h-auto p-0 font-semibold"
                      >
                        JCP
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((investment) => (
                    <TableRow key={investment.ticker}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{investment.ticker}</Badge>
                      </TableCell>
                      <TableCell>{investment.quantidade}</TableCell>
                      <TableCell>{formatCurrency(investment.total_investido)}</TableCell>
                      <TableCell>{formatCurrency(investment.preco_medio)}</TableCell>
                      <TableCell>
                        <span className={investment.TIR >= 10 ? "text-primary" : "text-muted-foreground"}>
                          {formatPercentage(investment.TIR)}
                        </span>
                      </TableCell>
                      <TableCell className="text-primary">{formatCurrency(investment.dividendos)}</TableCell>
                      <TableCell className="text-primary">
                        {formatCurrency(investment.juros_sobre_capital_proprio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
