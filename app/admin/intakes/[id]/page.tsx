import { notFound } from "next/navigation";
import { IntakeDetailView } from "@/components/intake-detail-view";
import { parseIntakeAiPayload } from "@/lib/intake-ai-payload";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ai?: string }>;
};

export default async function AdminIntakeDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { ai: aiQuery } = await searchParams;

  const intake = await getPrisma().intake.findUnique({
    where: { id },
    include: {
      aiMetadata: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!intake) notFound();

  const aiPayload =
    intake.aiMetadata?.payload != null
      ? parseIntakeAiPayload(intake.aiMetadata.payload)
      : null;

  return (
    <IntakeDetailView
      id={intake.id}
      title={intake.title}
      createdAtIso={intake.createdAt.toISOString()}
      industry={intake.industry}
      description={intake.description}
      budgetRange={intake.budgetRange}
      timeline={intake.timeline}
      aiPayload={aiPayload}
      aiGeneratedAtIso={intake.aiMetadata?.createdAt.toISOString() ?? null}
      modelLabel={intake.aiMetadata?.model ?? null}
      showPartialBanner={aiQuery === "partial"}
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Admin", href: "/admin" },
        { label: intake.title },
      ]}
      detailsReadOnly
      submitter={{ name: intake.user.name, email: intake.user.email }}
    />
  );
}
