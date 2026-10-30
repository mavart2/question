
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

type ResponseItem = {
  id: string;
  nombre: string;
  email: string;
  answer: string;
  createdAt: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default function Home() {
  const [nombre, setNombre] = useState("");
  const [answer, setAnswer] = useState("");
  const [email, setEmail] = useState("");
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const loadResponses = useCallback(async () => {
    try {
      const response = await fetch("/api/responses", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las respuestas.");
      }

      const data: ResponseItem[] = await response.json();
      setResponses(data);
    } catch (error) {
      console.error(error);
      setMessage("No fue posible cargar las respuestas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadResponses();

    // Actualiza la lista periódicamente como respaldo.
    const interval = window.setInterval(() => {
      void loadResponses();
    }, 5000);

    // Escucha cambios en Supabase Realtime si está configurado.
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null =
      null;

    if (supabase) {
      channel = supabase
        .channel("responses-live")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Response",
          },
          () => {
            void loadResponses();
          }
        )
        .subscribe();
    }

    return () => {
      window.clearInterval(interval);

      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadResponses]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (sending) return;

  const trimmedNombre = nombre.trim();
  const trimmedAnswer = answer.trim();
  const trimmedEmail = email.trim();

  if (!trimmedNombre) {
    setMessage("Ingresa tu nombre.");
    return;
  } 

  if (!trimmedAnswer) {
    setMessage("Escribe tu respuesta antes de enviarla.");
    return;
  }

  if (!trimmedEmail) {
    setMessage("Ingresa tu correo electrónico.");
    return;
  }

  setSending(true);
  setMessage("");

  try {
    const response = await fetch("/api/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: trimmedNombre,  
        answer: trimmedAnswer,
        email: trimmedEmail,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        typeof data?.error === "string"
          ? data.error
          : "No se pudo enviar tu respuesta."
      );
    }

    setNombre("");
    setAnswer("");
    setEmail("");
    setMessage("¡Tu respuesta se publicó correctamente!");

    await loadResponses();
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Ocurrió un error al enviar tu respuesta."
    );
  } finally {
    setSending(false);
  }
}

  return (
    <main className="relative min-h-screen bg-cover bg-center bg-fixed px-4 py-12 sm:px-8"
      style={{
    backgroundImage: "url('/images/fondo.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    position: "relative",
  }}
  >
      {/* Capa oscura para mejorar la lectura */}
      <div className="fixed inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto max-w-3xl ">
        {/* Encabezado */}
        <header className="mb-10 text-center text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            Festival CONFRONTA 2026
          </p>

          <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg sm:text-6xl">
            Cruz & Vargas
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Verónica Cruz y Mauricio Vargas Osses en el marco del Festival de Arte de
            Performance CONFRONTA 2026.
          </p>
        </header>

        {/* Formulario */}
        <section className="rounded-3xl border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-9">
          <div className="mb-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Pregunta
            </span>

            <h2 className="mt-3 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
              ¿Cómo amplías tus espacios de vida?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Escribe tu respuesta y publícala para que otras personas puedan
              leerla.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="answer"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Respuesta:
            </label>

            <textarea
              id="answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Escribe aquí tus ideas..."
              maxLength={1000}
              rows={5}
              required
              className="w-full resize-y rounded-2xl border border-gray-300 bg-white px-4 py-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Tu respuesta será visible para los visitantes.
              </span>
              <span className="shrink-0 text-xs text-gray-500">
                {answer.length}/1000
              </span>
            </div>
            <div className="contenedor mt-4 flex gap-4">
               <div className="flex-1">
              <label htmlFor="email" className="mb-2 mt-4 block text-sm font-medium text-gray-700">
                Correo electrónico:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="tu@email.com"
              />
            </div>
             <div className="flex-1">
              <label htmlFor="nombre" className="mb-2 mt-4 block text-sm font-medium text-gray-700">
                Nombre:
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="Tu nombre"
              />
            </div>

            </div>

           

            <button
              type="submit"
              disabled={sending || !answer.trim() || !email.trim()}
              className="mt-6 w-full rounded-2xl bg-indigo-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Publicando..." : "Publicar respuesta"}
            </button>

            {message && (
              <p
                role="status"
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium shadow-md transition-all ${
                  message.includes("correctamente")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </section>

        {/* Respuestas publicadas */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-3 text-white">
            <h2 className="text-2xl font-bold">Lo que han compartido</h2>

            <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
              {responses.length}{" "}
              {responses.length === 1 ? "respuesta" : "respuestas"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white/90 p-6 text-center text-gray-600 backdrop-blur-md">
              Cargando respuestas...
            </div>
          ) : responses.length === 0 ? (
            <div className="rounded-2xl border border-white/30 bg-white/15 p-8 text-center text-white backdrop-blur-lg">
              <p className="text-lg font-semibold">
                Sé la primera persona en participar.
              </p>
              <p className="mt-2 text-sm text-white/80">
                Tu respuesta aparecerá aquí después de publicarla.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg backdrop-blur-xl sm:p-6"
                >
                  
                  <p className="whitespace-pre-wrap break-words leading-7 text-gray-800">
                    {item.answer}
                  </p>

                  <p className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-500">
                    Publicada por {item.nombre} el{" "}
                    {new Date(item.createdAt).toLocaleString("es-CL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-sm text-white/80">
          Un espacio de diálogo y participación.
        </footer>
      </div>
    </main>
  );
}
