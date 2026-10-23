import { randomUUID } from "node:crypto";
import { AppError } from "../../utils";
import { AssinaturaService, EVENTOS_SUPORTADOS } from "../../assinatura/service/assinatura.service";
import { IAssinatura } from "../../assinatura/interface/assinatura.interface";
import { IEntrega, IEvento } from "../interface/evento.interface";

export class EventoService {
  private eventos: IEvento[];
  private entregas: IEntrega[];

  constructor(private readonly assinaturaService: AssinaturaService) {
    this.eventos = [];
    this.entregas = [];
  }

  publicar(evento: string, dados: Record<string, unknown>): IEvento {
    if (!EVENTOS_SUPORTADOS.includes(evento)) {
      throw new AppError("Evento não suportado", 400);
    }
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
      throw new AppError("O campo dados deve ser um objeto", 400);
    }

    const novoEvento: IEvento = {
      id: `evt_${randomUUID()}`,
      evento,
      criadoEm: new Date().toISOString(),
      dados,
    };
    this.eventos.push(novoEvento);

    const assinaturas = this.assinaturaService
      .listar()
      .filter((assinatura) => assinatura.ativa && assinatura.evento === evento);

    for (const assinatura of assinaturas) {
      this.enviar(novoEvento, assinatura);
    }

    return novoEvento;
  }

  listar() {
    return this.eventos.map((evento) => this.buscarPorId(evento.id));
  }

  buscarPorId(id: string) {
    const evento = this.eventos.find((evento) => evento.id === id);

    if (!evento) {
      throw new AppError("Evento não encontrado", 404);
    }
    return {
      ...evento,
      entregas: this.entregas.filter((entrega) => entrega.eventoId === id),
    };
  }

  private async enviar(evento: IEvento, assinatura: IAssinatura): Promise<void> {
    const entrega: IEntrega = { eventoId: evento.id, url: assinatura.url, status: "falha" };
    this.entregas.push(entrega);

    try {
      const resposta = await fetch(assinatura.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evento),
        signal: AbortSignal.timeout(5000),
      });
      entrega.status = resposta.ok ? "sucesso" : "falha";
    } catch {
      entrega.status = "falha";
    }
  }
}
