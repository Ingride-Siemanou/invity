import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { verifySessionToken } from "@/lib/session";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
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

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error(
        "Configuration Cloudinary manquante."
      );

      return NextResponse.json(
        {
          error:
            "La configuration Cloudinary est incomplète.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucune photo reçue." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format non accepté. Utilisez JPG, PNG ou WebP.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "La photo ne doit pas dépasser 10 Mo.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], {
      type: file.type,
    });

    const cloudinaryForm = new FormData();

    cloudinaryForm.append(
      "file",
      blob,
      file.name
    );

    cloudinaryForm.append(
      "upload_preset",
      uploadPreset
    );

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const result = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error(
        "Cloudinary upload error:",
        {
          message: result?.error?.message,
          http_code: result?.error?.http_code,
        }
      );

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "Cloudinary a refusé la photo.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de la photo vers Cloudinary:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d'envoyer la photo pour le moment.",
      },
      { status: 500 }
    );
  }
}