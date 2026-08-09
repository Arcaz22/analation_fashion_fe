import { type FormEvent, useState } from "react";
import { Link } from "react-router";

import { useRegister } from "~/hooks/useAuth";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Registrasi gagal. Periksa data Anda dan coba lagi.";
}

export function RegisterForm() {
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    register.mutate({ name, email, password });
  }

  return (
    <main className="w-full max-w-[420px] border border-[#E8E8E4] bg-white p-8 md:p-12">
      <header className="mb-12 text-center">
        <h1 className="text-brand-logo text-primary">WARDROBE</h1>
      </header>

      <section className="mb-10 text-center">
        <h2 className="mb-2 text-[20px] font-medium tracking-normal text-[#1c1b1b]">
          Buat akun baru
        </h2>
        <p className="text-body-md text-[#8E8E8E]">
          Mulai kelola koleksi dan rekomendasi gaya pribadi
        </p>
      </section>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label
            className="text-label-sm uppercase tracking-[0.1em] text-[#5e5e5e]"
            htmlFor="name"
          >
            Nama
          </label>
          <input
            autoComplete="name"
            className="h-12 w-full border-0 border-b border-[#E8E8E4] bg-transparent px-0 py-2 text-body-md text-[#1c1b1b] outline-none transition-colors placeholder:text-[#c4c7c7] focus:border-[#1A1A1A] focus:ring-0"
            id="name"
            name="name"
            placeholder="Nama lengkap"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-label-sm uppercase tracking-[0.1em] text-[#5e5e5e]"
            htmlFor="email"
          >
            Email
          </label>
          <input
            autoComplete="email"
            className="h-12 w-full border-0 border-b border-[#E8E8E4] bg-transparent px-0 py-2 text-body-md text-[#1c1b1b] outline-none transition-colors placeholder:text-[#c4c7c7] focus:border-[#1A1A1A] focus:ring-0"
            id="email"
            name="email"
            placeholder="nama@email.com"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-label-sm uppercase tracking-[0.1em] text-[#5e5e5e]"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative h-12 w-full">
            <input
              autoComplete="new-password"
              className="h-full w-full border-0 border-b border-[#E8E8E4] bg-transparent px-0 py-2 pr-10 text-body-md text-[#1c1b1b] outline-none transition-colors placeholder:text-[#c4c7c7] focus:border-[#1A1A1A] focus:ring-0"
              id="password"
              name="password"
              placeholder="........"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center p-2 text-[#5e5e5e] transition-colors hover:text-[#1A1A1A]"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <svg
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" x2="23" y1="1" y2="23" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {register.error ? (
          <p className="text-sm text-[#ba1a1a]">
            {getErrorMessage(register.error)}
          </p>
        ) : null}

        <button
          className="mt-4 flex h-12 w-full items-center justify-center bg-[#1A1A1A] text-label-sm uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={register.isPending}
          type="submit"
        >
          {register.isPending ? "Memproses..." : "Register"}
        </button>

        <div className="mt-4 text-center">
          <Link
            className="text-label-sm text-[#5e5e5e] underline-offset-4 transition-colors hover:text-[#1A1A1A] hover:underline"
            to="/login"
          >
            Masuk ke Akun
          </Link>
        </div>
      </form>
    </main>
  );
}
