import { SignUp } from "@clerk/nextjs";
import BlackBackground from "./black-background";

export default function Page() {
  return (
    <>
      <BlackBackground />
      <div className="fixed inset-0 bg-black z-50">
        <section className="flex justify-center items-center min-h-screen bg-black">
          <SignUp />
        </section>
      </div>
    </>
  );
}
