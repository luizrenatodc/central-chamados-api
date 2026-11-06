import { createServer } from "node:http";
import { Central } from "./chamados.ts";

const central = new Central();
const json = (res: any, status: number, dados: unknown) => {
  res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(dados));
};
const ler = async (req: any) => {
  let corpo = "";
  for await (const parte of req) corpo += parte;
  return JSON.parse(corpo);
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  try {
    if (req.method === "GET" && url.pathname === "/fila") return json(res, 200, central.fila());
    if (req.method === "POST" && url.pathname === "/chamados") {
      const d = await ler(req);
      return json(res, 201, central.abrir(d.titulo, d.setor, d.prioridade));
    }
    const m = url.pathname.match(/^\/chamados\/(\d+)\/status$/);
    if (req.method === "PATCH" && m) return json(res, 200, central.mover(Number(m[1]), (await ler(req)).status));
    json(res, 404, { erro: "rota não encontrada" });
  } catch (e) {
    json(res, 422, { erro: (e as Error).message });
  }
}).listen(Number(process.env.PORT ?? 3000));
