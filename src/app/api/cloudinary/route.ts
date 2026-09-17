import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { verifySessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier que l'organisateur est connecté
    const cookieStore = await cookies();
    const token = cookieStore.get("invity_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

    // 2. Récupérer le secret Cloudinary
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      console.error(
        "CLOUDINARY_API_SECRET est absent de la configuration."
      );

      return NextResponse.json(
        {
          error: "La configuration Cloudinary est incomplète.",
        },
        { status: 500 }
      );
    }

    // 3. Récupérer EXACTEMENT les paramètres envoyés
    // par le widget Cloudinary
    const body = await request.json();
    const paramsToSign = body?.paramsToSign;

    if (
      !paramsToSign ||
      typeof paramsToSign !== "object" ||
      Array.isArray(paramsToSign)
    ) {
      return NextResponse.json(
        {
          error: "Paramètres Cloudinary invalides.",
        },
        { status: 400 }
      );
    }

    // 4. Signer EXACTEMENT ces paramètres.
    // Important :
    // - ne pas créer notre propre timestamp
    // - ne pas supprimer source=uw
    // - ne pas ajouter de paramètres
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    return NextResponse.json({
      signature,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la signature Cloudinary :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de préparer l’envoi de la photo.",
      },
      { status: 500 }
    );
  }
}