export interface IEvento {
  id: string;
  evento: string;
  criadoEm: string;
  dados: Record<string, unknown>;
}

export interface IEntrega {
  eventoId: string;
  url: string;
  status: "sucesso" | "falha";
}
