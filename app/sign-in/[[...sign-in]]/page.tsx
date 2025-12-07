import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="flex justify-center items-center min-h-screen bg-black">
      <SignIn />
    </section>
  );
}
