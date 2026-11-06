import test from "node:test";
import assert from "node:assert/strict";
import { Central } from "../src/chamados.ts";

const t0 = new Date("2030-01-07T08:00:00Z");

test("calcula o prazo pela prioridade", () => {
  assert.equal(new Central().abrir("x", "TI", "critica", t0).prazo.toISOString(), "2030-01-07T12:00:00.000Z");
});
test("atrasado passa na frente de prioridade maior", () => {
  const c = new Central();
  const baixa = c.abrir("antigo", "RH", "baixa", t0);
  const depois = new Date(t0.getTime() + 73 * 3600000);
  const critica = c.abrir("novo", "TI", "critica", depois);
  assert.deepEqual(c.fila(depois).map((x) => x.id), [baixa.id, critica.id]);
});
test("bloqueia transição inválida e tira resolvido da fila", () => {
  const c = new Central();
  const x = c.abrir("x", "TI", "alta", t0);
  assert.throws(() => c.mover(x.id, "fechado"), /não pode/);
  c.mover(x.id, "andamento");
  c.mover(x.id, "resolvido");
  assert.equal(c.fila(t0).length, 0);
});
