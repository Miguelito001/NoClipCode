"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Clock } from "lucide-react";
import { calculateCompletionDate, calculateWorkedTime } from "@/lib/time-tools";

export default function TempoPage() {
  // Calculadora de data final
  const [startDate, setStartDate] = useState("");
  const [hoursToAdd, setHoursToAdd] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [endDateResult, setEndDateResult] = useState<string | null>(null);

  // Calculadora de carga horária
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [lunchDuration, setLunchDuration] = useState("60");
  const [workloadResult, setWorkloadResult] = useState<string | null>(null);

  const calculateEndDate = () => {
    try {
      const result = calculateCompletionDate(startDate, Number(hoursToAdd), Number(hoursPerDay));
      const date = result.date.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      setEndDateResult(`Conclusão: ${date}, após ${result.hoursIntoDay.toLocaleString("pt-BR")}h da jornada (${result.businessDays} dia(s) útil(eis) envolvidos).`);
    } catch (error) {
      setEndDateResult(error instanceof Error ? error.message : "Não foi possível calcular.");
    }
  };

  const calculateWorkload = () => {
    try {
      const result = calculateWorkedTime(entryTime, exitTime, Number(lunchDuration));
      const hours = Math.floor(result.netMinutes / 60);
      const minutes = result.netMinutes % 60;
      setWorkloadResult(`Carga horária: ${hours}h ${minutes.toString().padStart(2, "0")}min (${result.decimalHours.toFixed(2)} horas)${result.overnight ? " — turno atravessa a meia-noite" : ""}.`);
    } catch (error) {
      setWorkloadResult(error instanceof Error ? error.message : "Não foi possível calcular.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Calculadoras de Tempo
            </h1>
            <p className="text-muted-foreground">
              Calcule datas de conclusão e carga horária de trabalho
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calculadora de Data Final */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Data de Conclusão</CardTitle>
                    <CardDescription>
                      O trabalho começa no início da jornada da data informada; sábados e domingos são pulados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Data de início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Total de horas do projeto
                  </label>
                  <input
                    type="number"
                    value={hoursToAdd}
                    onChange={(e) => setHoursToAdd(e.target.value)}
                    placeholder="Ex: 120"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Horas trabalhadas por dia
                  </label>
                  <input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    placeholder="Ex: 8"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground font-mono"
                  />
                </div>

                <Button onClick={calculateEndDate} className="w-full">
                  Calcular Data
                </Button>

                {endDateResult && (
                  <div className="p-4 rounded-lg bg-secondary text-foreground text-center">
                    {endDateResult}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calculadora de Carga Horária */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Carga Horária</CardTitle>
                    <CardDescription>
                      Calcule as horas trabalhadas no dia
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Horário de entrada
                  </label>
                  <input
                    type="time"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Horário de saída
                  </label>
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Duração do almoço (minutos)
                  </label>
                  <input
                    type="number"
                    value={lunchDuration}
                    onChange={(e) => setLunchDuration(e.target.value)}
                    placeholder="Ex: 60"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground font-mono"
                  />
                </div>

                <Button onClick={calculateWorkload} className="w-full">
                  Calcular Horas
                </Button>

                {workloadResult && (
                  <div className="p-4 rounded-lg bg-secondary text-foreground text-center">
                    {workloadResult}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
