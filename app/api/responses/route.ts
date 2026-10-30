import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: consultar las respuestas
export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error al consultar respuestas:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener las respuestas." },
      { status: 500 }
    );
  }
}

// POST: guardar una nueva respuesta
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answer, email, nombre } = body; // <-- Asegúrate de extraer 'email' aquí

    console.log("Datos recibidos:", { answer, email, nombre }); // Añade esto para depurar en la terminal

    if (!answer || !email || !nombre) {
      return NextResponse.json(
        { error: 'Todos los campos (nombre, correo y respuesta) son obligatorios' },
        { status: 400 }
      );
    }

    const newResponse = await prisma.response.create({
      data: {
        answer,
        email, // Guarda el email 
        nombre,
      },
    });

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error("Error al guardar:", error);
    return NextResponse.json({ error: 'Error al guardar la respuesta' }, { status: 500 });
  }
}