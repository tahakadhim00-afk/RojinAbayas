import { ImportantNotice } from "@/components/ImportantNotice";
import { OrderForm } from "@/components/OrderForm";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[540px] flex-col px-5 py-8 sm:py-10">
        {/* The logo lives in the header now, so the page opens on the title. */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">إتمام الطلب</h1>
          <p className="text-sm leading-relaxed text-neutral-500">
            يرجى إدخال معلوماتك بشكل صحيح ليصلك طلبك دون تأخير.
          </p>
        </div>

        <div className="mt-7">
          <ImportantNotice />
        </div>

        <div className="mt-7">
          <OrderForm />
        </div>
      </main>
    </>
  );
}
