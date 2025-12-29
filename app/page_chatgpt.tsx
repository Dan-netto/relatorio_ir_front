"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function InvestmentDashboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("https://appcalculoemissao-2c6b30e79caa.herokuapp.com/carteira")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados")
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError("Falha ao carregar dados do backend")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  // Totais para KPIs
  const totalInvestido = data.reduce((sum, item) => sum + item.total_investido, 0)
  const totalDividendos = data.reduce((sum, item) => sum + item.dividendos, 0)
  const totalJCP = data.reduce((sum, item) => sum + item.juros_sobre_capital_proprio, 0)

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 grid gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ {totalInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dividendos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ {totalDividendos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Juros s/ Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ {totalJCP.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Carteira de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Ticker</th>
                <th className="text-right p-2">Quantidade</th>
                <th className="text-right p-2">Preço Médio</th>
                <th className="text-right p-2">Total Investido</th>
                <th className="text-right p-2">TIR</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.Ticker} className="border-b hover:bg-muted/50">
                  <td className="p-2">{item.Ticker}</td>
                  <td className="p-2 text-right">{item.quantidade}</td>
                  <td className="p-2 text-right">R$ {item.preco_medio.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    R$ {item.total_investido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right">
                    {item.TIR.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
