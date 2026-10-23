import express, { NextFunction, Request, Response } from "express";
import { AppError } from "./utils";
import { AssinaturaService } from "./assinatura/service/assinatura.service";

const app = express();
app.use(express.json());

const assinaturaService = new AssinaturaService();

app.post("/assinaturas", (req, res) => {
  const assinatura = assinaturaService.cadastrar(req.body.evento, req.body.url);
  res.status(201).json(assinatura);
});

app.get("/assinaturas", (req, res) => {
  res.status(200).json(assinaturaService.listar());
});

app.get("/assinaturas/:id", (req, res) => {
  res.status(200).json(assinaturaService.buscarPorId(req.params.id));
});

app.patch("/assinaturas/:id", (req, res) => {
  res.status(200).json(assinaturaService.alterarStatus(req.params.id, req.body.ativa));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.code).json({ mensagem: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ mensagem: "Erro interno" });
});

app.listen(3000, () => console.log("rodando em http://localhost:3000"));
