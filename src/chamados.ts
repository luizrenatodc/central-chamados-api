// Chamados entre setores: prazo por prioridade, fila e transições de status.
export type Prioridade = "baixa" | "media" | "alta" | "critica";
export type Status = "aberto" | "andamento" | "resolvido" | "fechado";
export type Chamado = { id: number; titulo: string; setor: string; prioridade: Prioridade; status: Status; abertoEm: Date; prazo: Date };

export const SLA_HORAS: Record<Prioridade, number> = { critica: 4, alta: 8, media: 24, baixa: 72 };
const PESO: Record<Prioridade, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
const TRANSICOES: Record<Status, Status[]> = { aberto: ["andamento"], andamento: ["resolvido", "aberto"], resolvido: ["fechado", "andamento"], fechado: [] };

export class Central {
  chamados: Chamado[] = [];
  proximo = 1;

  abrir(titulo: string, setor: string, prioridade: Prioridade, agora = new Date()): Chamado {
    if (!titulo?.trim()) throw new Error("título obrigatório");
    if (!(prioridade in SLA_HORAS)) throw new Error("prioridade inválida");
    const prazo = new Date(agora.getTime() + SLA_HORAS[prioridade] * 3600000);
    const c: Chamado = { id: this.proximo++, titulo, setor, prioridade, status: "aberto", abertoEm: agora, prazo };
    this.chamados.push(c);
    return c;
  }

  mover(id: number, status: Status): Chamado {
    const c = this.chamados.find((x) => x.id === id);
    if (!c) throw new Error("chamado não encontrado");
    if (!TRANSICOES[c.status].includes(status)) throw new Error(`não pode ir de ${c.status} para ${status}`);
    c.status = status;
    return c;
  }

  // atrasados primeiro, depois prioridade, depois o prazo mais próximo
  fila(agora = new Date()): Chamado[] {
    const atrasado = (c: Chamado) => (c.prazo < agora ? 0 : 1);
    return this.chamados
      .filter((c) => c.status === "aberto" || c.status === "andamento")
      .sort((a, b) => atrasado(a) - atrasado(b) || PESO[a.prioridade] - PESO[b.prioridade] || a.prazo.getTime() - b.prazo.getTime());
  }
}
