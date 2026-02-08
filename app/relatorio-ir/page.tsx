"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCopy, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, History, Coins } from "lucide-react";

export default function DeclaracaoIRPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  useEffect(() => {
    // URL do seu endpoint Heroku
    fetch("https://relatorioir-e9fc6ed37199.herokuapp.com/relatorio-ir")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do IR:", err);
        setIsLoading(false);
      });
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleTicker = (ticker: string) => {
    setExpandedTicker(expandedTicker === ticker ? null : ticker);
  };

  if (isLoading) return <p className="text-center mt-10">Processando dados do IR...</p>;
  if (!data) return <p className="text-center mt-10">Nenhum dado encontrado.</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Auxiliar de Declaração IRPF 2025</h1>
        <p className="text-slate-500 text-sm">Ano-calendário {data.ano_referencia} | Posição em 31/12/{data.ano_referencia}</p>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-blue-500" />
          <p className="text-xs text-blue-700">
            <strong>Dica de Navegação:</strong> Clique nos ativos para ver o histórico detalhado de compras, vendas e proventos que compõem os valores finais.
          </p>
        </div>
      </header>

      <Tabs defaultValue="bens" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 bg-slate-100 p-1">
          <TabsTrigger value="bens">Bens e Direitos</TabsTrigger>
          <TabsTrigger value="isentos">Rend. Isentos</TabsTrigger>
          <TabsTrigger value="exclusiva">Tributação Exclusiva</TabsTrigger>
          <TabsTrigger value="renda_variavel">Renda Variável</TabsTrigger>
        </TabsList>

        {/* --- FICHA: BENS E DIREITOS --- */}
        <TabsContent value="bens">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ficha: Bens e Direitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.carteira.map((item: any, idx: number) => {
                const isExpanded = expandedTicker === item.ticker;
                const textoDescricao = `${item.custodia.quantidade_final} ações de ${item.razao_social} (${item.ticker}). Custo médio de R$ ${item.custodia.preco_medio_ajustado.toFixed(2)}.`;

                return (
                  <div key={idx} className="border rounded-md bg-white shadow-sm overflow-hidden">
                    {/* Cabeçalho do Ativo (Resumo) */}
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleTicker(item.ticker)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-indigo-700 text-lg">{item.ticker}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.cnpj}</span>
                        </div>
                        <div className="hidden md:block border-l pl-4">
                          <p className="text-[10px] text-slate-400 uppercase">Situação em 31/12</p>
                          <p className="font-bold">R$ {item.custodia.total_investido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Conteúdo Expandido (Drill-down) */}
                    {isExpanded && (
                      <div className="bg-slate-50 border-t p-4 space-y-6">
                        {/* 1. Área de Cópia da Discriminação */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Discriminação para a Receita Federal</p>
                          <div className="relative">
                            <p className="bg-white p-3 rounded border text-xs leading-relaxed pr-10">
                              {textoDescricao}
                            </p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(textoDescricao, `disc-${idx}`); }}
                              className="absolute right-2 top-2 text-slate-400 hover:text-indigo-600"
                            >
                              {copiedIndex === `disc-${idx}` ? <CheckCircle2 size={16} /> : <ClipboardCopy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 2. Tabela de Histórico de Negociações */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-indigo-700">
                              <History size={16} />
                              <span className="text-xs font-bold uppercase">Histórico de Custódia (Eventos)</span>
                            </div>
                            <div className="bg-white rounded border overflow-x-auto">
                              <table className="w-full text-[10px]">
                                <thead className="bg-slate-100 border-b">
                                  <tr>
                                    <th className="p-2 text-left">Data</th>
                                    <th className="p-2 text-left">Tipo</th>
                                    <th className="p-2 text-right">Qtd</th>
                                    <th className="p-2 text-right">Preço</th>
                                    <th className="p-2 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.drill_down_negociacoes.map((neg: any, nIdx: number) => (
                                    <tr key={nIdx} className="border-b last:border-0">
                                      <td className="p-2 text-slate-500">{neg["Data do Negócio"]}</td>
                                      <td className="p-2 font-medium">{neg["Tipo de Movimentação"]}</td>
                                      <td className="p-2 text-right">{neg["Quantidade"]}</td>
                                      <td className="p-2 text-right">R$ {neg["Preço"].toFixed(2)}</td>
                                      <td className="p-2 text-right font-semibold">R$ {neg["Valor"].toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* 3. Tabela de Histórico de Proventos */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-700">
                              <Coins size={16} />
                              <span className="text-xs font-bold uppercase">Histórico de Proventos ({data.ano_referencia})</span>
                            </div>
                            <div className="bg-white rounded border overflow-x-auto">
                              <table className="w-full text-[10px]">
                                <thead className="bg-emerald-50 border-b">
                                  <tr>
                                    <th className="p-2 text-left">Data</th>
                                    <th className="p-2 text-left">Tipo</th>
                                    <th className="p-2 text-right">Valor Líquido</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.drill_down_proventos.length > 0 ? item.drill_down_proventos.map((prov: any, pIdx: number) => (
                                    <tr key={pIdx} className="border-b last:border-0">
                                      <td className="p-2 text-slate-500">{prov["Data do Negócio"]}</td>
                                      <td className="p-2 font-medium">{prov["Tipo de Movimentação"]}</td>
                                      <td className="p-2 text-right font-semibold text-emerald-600">R$ {prov["Valor"].toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                  )) : (
                                    <tr><td colSpan={3} className="p-4 text-center text-slate-400 italic">Nenhum provento no período.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FICHA: RENDIMENTOS ISENTOS --- */}
        <TabsContent value="isentos">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rendimentos Isentos (Dividendos / FIIs / Rendimentos)</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-2">Fonte Pagadora</th>
                    <th className="p-2 text-right">Dividendos</th>
                    <th className="p-2 text-right">Rend. FII/Ações</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.carteira.filter((i:any) => (i.totais_proventos.dividendos + i.totais_proventos.rendimento_fii + i.totais_proventos.rendimento_acoes + i.totais_proventos.reembolso) > 0).map((item: any, idx: number) => {
                    const totalIsento = item.totais_proventos.dividendos + item.totais_proventos.rendimento_fii + item.totais_proventos.rendimento_acoes + item.totais_proventos.reembolso;
                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-2">
                          <div className="flex flex-col">
                            <span className="font-bold">{item.ticker}</span>
                            <span className="text-[10px] font-mono text-slate-500">{item.cnpj}</span>
                          </div>
                        </td>
                        <td className="p-2 text-right text-xs">R$ {item.totais_proventos.dividendos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 text-right text-xs">R$ {(item.totais_proventos.rendimento_fii + item.totais_proventos.rendimento_acoes).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">R$ {totalIsento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FICHA: TRIBUTAÇÃO EXCLUSIVA --- */}
        <TabsContent value="exclusiva">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rend. Sujeitos à Tributação Exclusiva (JCP)</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-2">Fonte Pagadora</th>
                    <th className="p-2 text-right">Valor Líquido (JCP)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.carteira.filter((i:any) => i.totais_proventos.jcp > 0).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">
                        <div className="flex flex-col">
                          <span className="font-bold">{item.ticker}</span>
                          <span className="text-[10px] font-mono text-slate-500">{item.cnpj}</span>
                        </div>
                      </td>
                      <td className="p-2 text-right font-bold text-orange-700">
                        R$ {item.totais_proventos.jcp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FICHA: RENDA VARIÁVEL --- */}
        <TabsContent value="renda_variavel">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operações Comuns / Day-Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-4 italic">Resultados mensais apurados no ano de {data.ano_referencia}.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {data.resumo_anual_lucros.map((mes: any) => (
                  <div key={mes.mes} className="border p-3 rounded-md text-center bg-white shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{mes.mes_nome}</p>
                    <p className={`text-sm font-bold mt-1 ${mes.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      R$ {mes.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}