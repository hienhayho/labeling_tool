import { Metadata } from "next";
import SignInViewPage from "@/components/login/sigin-view";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return {
    title: `${t("login")} | Labelling Tool`,
    description: t("loginToContinue"),
  };
}

export default function Page() {
  return <SignInViewPage />;
}
