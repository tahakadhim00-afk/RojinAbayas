import Image from "next/image";

import { ImportantNotice } from "@/components/ImportantNotice";
import { OrderForm } from "@/components/OrderForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[540px] flex-col px-5 py-10 sm:py-14">
      <header className="flex flex-col items-center gap-5 text-center">
        <Image
          src="/logo.png"
          alt="عبايات روجين"
          width={746}
          height={321}
          priority
          className="h-auto w-40"
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-neutral-900">إتمام الطلب</h1>
          <p className="text-sm leading-relaxed text-neutral-500">
            يرجى إدخال معلوماتك بشكل صحيح ليصلك طلبك دون تأخير.
          </p>
        </div>
      </header>

      <div className="mt-7">
        <ImportantNotice />
      </div>

      <div className="mt-7">
        <OrderForm />
      </div>
    </main>
  );
}
