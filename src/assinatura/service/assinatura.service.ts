import { randomUUID } from "node:crypto";
import { AppError } from "../../utils";
import { IAssinatura } from "../interface/assinatura.interface";

export const EVENTOS_SUPORTADOS = ["pedido.criado", "pagamento.aprovado", "pagamento.parcela.estornada"];

export class AssinaturaService {
  private assinaturas: IAssinatura[];

  constructor() {
    this.assinaturas = [];
  }

  cadastrar(evento: string, url: string): IAssinatura {
    if (!EVENTOS_SUPORTADOS.includes(evento)) {
      throw new AppError("Evento não suportado", 400);
    }

    const assinatura: IAssinatura = { id: randomUUID(), evento, url, ativa: true };
    this.assinaturas.push(assinatura);
    return assinatura;
  }

  listar(): IAssinatura[] {
    return this.assinaturas;
  }

  buscarPorId(id: string): IAssinatura {
    const assinatura = this.assinaturas.find((assinatura) => assinatura.id === id);

    if (!assinatura) {
      throw new AppError("Assinatura não encontrada", 404);
    }
    return assinatura;
  }

  alterarStatus(id: string, ativa: boolean): IAssinatura {
    if (typeof ativa !== "boolean") {
      throw new AppError("O campo ativa deve ser true ou false", 400);
    }

    const assinatura = this.buscarPorId(id);
    assinatura.ativa = ativa;
    return assinatura;
  }
}
