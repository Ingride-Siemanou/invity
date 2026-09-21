import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfGuest = {
  firstName: string;
  lastName: string;
  status: string;
  companionCount: number;
  childrenCount: number;
  childrenAges: string | null;
};

export type PdfEvent = {
  title: string;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
};

function statusLabel(status: string) {
  if (status === "accepted") return "Présent(e)";
  if (status === "declined") return "Absent(e)";
  if (status === "maybe") return "Incertain(e)";
  return "En attente";
}

function safeCount(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function formatDate(date: string) {
  if (!date) return "Non renseignée";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function downloadGuestsPdf(event: PdfEvent, guests: PdfGuest[]) {
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.setTextColor(170, 45, 120);
  pdf.text("Invity", 14, 20);

  pdf.setFontSize(15);
  pdf.setTextColor(35, 35, 35);

  const titleLines = pdf.splitTextToSize(
    event.title || "Événement",
    180
  );

  pdf.text(titleLines, 14, 32);

  let y = 32 + titleLines.length * 7 + 3;

  pdf.setFontSize(10);
  pdf.setTextColor(90, 90, 90);

  const eventDetails = [
    `Date : ${formatDate(event.eventDate)}`,
    `Heure : ${event.eventTime || "Non renseignée"}`,
    `Lieu : ${event.location || "Non renseigné"}`,
  ];

  for (const detail of eventDetails) {
    const lines = pdf.splitTextToSize(detail, 180);
    pdf.text(lines, 14, y);
    y += lines.length * 5 + 2;
  }

  y += 8;

  autoTable(pdf, {
    startY: y,
    head: [
      [
        "Invité",
        "Réponse",
        "Accomp.",
        "Enfants",
        "Âges des enfants",
        "Total",
      ],
    ],
    body: guests.map((guest) => {
      const isAccepted = guest.status === "accepted";

      const companions = isAccepted
        ? safeCount(guest.companionCount)
        : 0;

      const children = isAccepted
        ? safeCount(guest.childrenCount)
        : 0;

      return [
        `${guest.firstName} ${guest.lastName}`.trim(),
        statusLabel(guest.status),
        isAccepted ? String(companions) : "—",
        isAccepted ? String(children) : "—",
        isAccepted && children > 0
          ? guest.childrenAges?.trim() || "Non renseignés"
          : "—",
        isAccepted
          ? String(1 + companions + children)
          : "—",
      ];
    }),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [170, 45, 120],
    },
    margin: {
      left: 14,
      right: 14,
    },
  });

  const fileName = (event.title || "evenement")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  pdf.save(
    `invity-invites-${fileName || "evenement"}.pdf`
  );
}