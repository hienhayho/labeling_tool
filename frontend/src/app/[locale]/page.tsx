"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Labelling Tool
                </h1>
                <p className="text-sm text-gray-600">{t("landing.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href={`/${locale}/login`}>{t("auth.login")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t("landing.hero.title")}
              <span className="text-orange-500">
                {" "}
                {t("landing.hero.highlight")}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t("landing.hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
              >
                <Link href={`/${locale}/login`}>
                  {t("landing.hero.ctaStart")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Link href="#features">
                  {t("landing.hero.ctaFeatures")}
                  <Play className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Conversation Labelling */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("landing.features.conversation.title")}
                </h3>
                <p className="text-gray-600">
                  {t("landing.features.conversation.description")}
                </p>
              </CardContent>
            </Card>

            {/* Multi-user Support */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("landing.features.multiuser.title")}
                </h3>
                <p className="text-gray-600">
                  {t("landing.features.multiuser.description")}
                </p>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("landing.features.project.title")}
                </h3>
                <p className="text-gray-600">
                  {t("landing.features.project.description")}
                </p>
              </CardContent>
            </Card>

            {/* Quality Control */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("landing.features.quality.title")}
                </h3>
                <p className="text-gray-600">
                  {t("landing.features.quality.description")}
                </p>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("landing.features.analytics.title")}
                </h3>
                <p className="text-gray-600">
                  {t("landing.features.analytics.description")}
                </p>
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("landing.features.export.title")}
                </h3>
                <p className="text-gray-600">
                  {t("landing.features.export.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("landing.howItWorks.step1.title")}
              </h3>
              <p className="text-gray-600">
                {t("landing.howItWorks.step1.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("landing.howItWorks.step2.title")}
              </h3>
              <p className="text-gray-600">
                {t("landing.howItWorks.step2.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("landing.howItWorks.step3.title")}
              </h3>
              <p className="text-gray-600">
                {t("landing.howItWorks.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-orange-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t("landing.cta.title")}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            {t("landing.cta.subtitle")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            <Link href={`/${locale}/login`}>
              {t("landing.cta.button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Labelling Tool</h3>
                  <p className="text-sm text-gray-400">
                    {t("landing.footer.subtitle")}
                  </p>
                </div>
              </div>
              <p className="text-gray-400">{t("landing.footer.description")}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {t("landing.footer.features.title")}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>{t("landing.footer.features.conversation")}</li>
                <li>{t("landing.footer.features.project")}</li>
                <li>{t("landing.footer.features.multiuser")}</li>
                <li>{t("landing.footer.features.export")}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {t("landing.footer.support.title")}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>{t("landing.footer.support.guide")}</li>
                <li>{t("landing.footer.support.faq")}</li>
                <li>{t("landing.footer.support.contact")}</li>
                <li>{t("landing.footer.support.report")}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {t("landing.footer.contact.title")}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@labelingtool.com</li>
                <li>Phone: +84 123 456 789</li>
                <li>Address: {t("contact.address")}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Labeling Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
