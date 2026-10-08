import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

// Lido em tempo de execução (não no build), para funcionar com a rede do Docker
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:3001").replace(/\/+$/, "");

// ── Rate limit simples em memória (por instância) ──────────────────────────
// O backend enxerga todas as requisições vindo do servidor Next, então o
// limite por IP do visitante fica aqui.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX_REQUESTS;
}

/** Converte a resposta de erro do NestJS ({ message: string | string[] }) em texto para o usuário. */
function backendErrorMessage(status: number, body: unknown): string {
  if (status === 400 && typeof body === "object" && body !== null && "message" in body) {
    const { message } = body as { message: unknown };
    const first = Array.isArray(message) ? message[0] : message;
    if (typeof first === "string" && first) return first;
  }
  if (status === 429) return "Muitas solicitações em sequência. Tente novamente em alguns minutos.";
  return "Não foi possível encaminhar sua solicitação agora.";
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Muitas solicitações em sequência. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[api/leads] Backend indisponível:", error);
    return NextResponse.json(
      { ok: false, error: "Canal temporariamente indisponível." },
      { status: 503 }
    );
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status >= 500) console.error("[api/leads] Erro no backend:", res.status, body);
    return NextResponse.json(
      { ok: false, error: backendErrorMessage(res.status, body) },
      { status: res.status >= 500 ? 502 : res.status }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
