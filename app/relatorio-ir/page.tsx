"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCopy, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DeclaracaoIRPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    // Endpoint que você criará para retornar os dados mastigados para o IR
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

  if (isLoading) return <p className="text-center mt-10">Processando dados do IR...</p>;
  if (!data) return <p className="text-center mt-10">Nenhum dado encontrado para o período.</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Auxiliar de Declaração IRPF 2025</h1>
        <p className="text-slate-500 text-sm">Ano-calendário 2024 | Posição em 31/12/2024</p>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-blue-500" />
          <p className="text-xs text-blue-700">
            <strong>Atenção:</strong> Copie os valores abaixo e cole nos campos correspondentes do programa da Receita Federal. 
            Os cálculos consideram preço médio histórico e proventos pagos.
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
              <CardTitle className="text-lg">Ficha: Bens e Direitos (Grupo 03 - Ações)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.carteira_ir.map((item: any, idx: number) => (
                <div key={idx} className="border p-4 rounded-md bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-indigo-700">{item.Ticker}</span>
                    <span className="text-xs font-mono text-slate-500">CNPJ: {item.CNPJ}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Discriminação (Sugerida)</p>
                      <div className="relative group mt-1">
                        <p className="bg-slate-50 p-2 rounded text-xs border border-dashed pr-10">
                          {`${item.quantidade} ações de ${item.Razao_Social} (${item.Ticker}). Custo médio de R$ ${item.preco_medio.toFixed(2)}. Custodiado na corretora X.`}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(`${item.quantidade} ações de ${item.Razao_Social}...`, `disc-${idx}`)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-indigo-600"
                        >
                          {copiedIndex === `disc-${idx}` ? <CheckCircle2 size={16} /> : <ClipboardCopy size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <p className="text-gray-500 text-xs">Situação em 31/12/2024 (R$)</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold">
                          R$ {item.total_investido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <button onClick={() => copyToClipboard(item.total_investido.toFixed(2), `val-${idx}`)} className="text-slate-400">
                           <ClipboardCopy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FICHA: RENDIMENTOS ISENTOS (DIVIDENDOS) --- */}
        <TabsContent value="isentos">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rendimentos Isentos e Não Tributáveis (Cód. 09 - Dividendos)</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-2">Fonte Pagadora (CNPJ)</th>
                    <th className="p-2">Nome</th>
                    <th className="p-2 text-right">Valor Recebido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.carteira_ir.filter((i:any) => i.dividendos > 0).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-mono text-xs">{item.CNPJ}</td>
                      <td className="p-2 text-xs">{item.Razao_Social}</td>
                      <td className="p-2 text-right font-bold text-green-700">
                        R$ {item.dividendos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FICHA: TRIBUTAÇÃO EXCLUSIVA (JCP) --- */}
        <TabsContent value="exclusiva">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rend. Sujeitos à Tributação Exclusiva (Cód. 10 - Juros Sobre Capital Próprio)</CardTitle>
            </CardHeader>
            <CardContent>
               <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-2">Fonte Pagadora (CNPJ)</th>
                    <th className="p-2">Nome</th>
                    <th className="p-2 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.carteira_ir.filter((i:any) => i.juros_sobre_capital_proprio > 0).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-mono text-xs">{item.CNPJ}</td>
                      <td className="p-2 text-xs">{item.Razao_Social}</td>
                      <td className="p-2 text-right font-bold text-orange-700">
                        R$ {item.juros_sobre_capital_proprio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FICHA: RENDA VARIÁVEL (VENDAS) --- */}
        <TabsContent value="renda_variavel">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operações Comuns / Day-Trade (Ações)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-4 italic">Informe o lucro ou prejuízo mensal líquido de taxas.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* Aqui você mapearia os 12 meses do ano anterior vindo do df_lucros */}
                {data.lucros_mensais.map((mes: any) => (
                  <div key={mes.mes} className="border p-2 rounded text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{mes.mes_nome}</p>
                    <p className={`font-bold ${mes.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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