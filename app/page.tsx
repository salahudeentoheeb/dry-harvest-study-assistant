import Image from "next/image";
import { BookOpen } from "lucide-react";
import { BookViewerLoader } from "@/components/BookViewerLoader";
import { PageControls } from "@/components/PageControls";
import { ProgressBar } from "@/components/ProgressBar";
import { StudyPanel } from "@/components/StudyPanel";
import { HeaderActions } from "@/components/HeaderActions";
import { ACTIVE_BOOK } from "@/lib/books/config";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="relative flex items-center justify-between gap-4 border-b bg-background/80 px-7 py-3.5 backdrop-blur-sm">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-primary font-heading text-3xl leading-none tracking-tight italic">
              {ACTIVE_BOOK.title}
            </h1>
            <p className="text-primary mt-1 hidden text-xs tracking-wide uppercase opacity-80 sm:block">
              {ACTIVE_BOOK.tagline}
            </p>
          </div>
        </div>

        <div className="hidden flex-1 flex-col items-center justify-center gap-1 lg:flex">
          <span className="text-primary text-[10px] font-medium tracking-widest uppercase">
            Powered by
          </span>
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-1">
              <Image
                src="/icime-logo.jpeg"
                alt="ICIME"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover shadow-md"
              />
              <p className="text-primary max-w-[210px] text-center text-[10px] leading-tight font-semibold tracking-wide uppercase">
                Institute of Corporate Industrial Management Entrepreneurs (ICIME)
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Image
                src="/mce-logo.jpeg"
                alt="MCE"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover shadow-md"
              />
              <p className="text-primary max-w-[150px] text-center text-[10px] leading-tight font-semibold tracking-wide uppercase">
                Master College of Entrepreneurship (MCE)
              </p>
            </div>
          </div>
        </div>

        <HeaderActions />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-2 md:p-4">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-lg shadow-primary/10 ring-1 ring-accent/50 md:flex-row">
          <section className="flex min-h-0 flex-1 flex-col md:border-r">
            <PageControls />
            <ProgressBar />
            <div className="min-h-0 flex-1">
              <BookViewerLoader />
            </div>
          </section>

          <aside className="min-h-0 flex-1 md:max-w-lg md:min-w-[420px]">
            <StudyPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
