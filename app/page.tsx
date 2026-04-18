import { Suspense } from "react";
import { LandingPage } from "@/app/components/LandingPage";

export default function Home(props: {
  searchParams: Promise<{ table?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <LandingContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}

async function LandingContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ table?: string }>;
}) {
  const { table } = await searchParamsPromise;
  return <LandingPage tableId={table} />;
}
