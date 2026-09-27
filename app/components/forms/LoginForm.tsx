import { type FormEvent, useState } from "react";
import { FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

import { useLogin } from "~/hooks/useAuth";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Login gagal. Periksa email dan password Anda.";
}

export function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <main className="w-full max-w-105 border border-[#E8E8E4] bg-white p-8 md:p-12">
      <header className="mb-12 text-center">
        <h1 className="display-font text-3xl font-semibold tracking-[0.16em] text-primary">
          MATCH
        </h1>
      </header>

      <section className="mb-10 text-center">
        <h2 className="mb-2 text-[20px] font-medium tracking-normal text-[#1c1b1b]">
          Masuk ke akun Anda
        </h2>
        <p className="text-body-md text-[#8E8E8E]">
          Kelola koleksi dan rekomendasi gaya pribadi
        </p>
      </section>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label
            className="text-label-sm uppercase tracking-widest text-[#5e5e5e]"
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
            className="text-label-sm uppercase tracking-widest text-[#5e5e5e]"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative h-12 w-full">
            <input
              autoComplete="current-password"
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
                <FiEyeOff className="size-5" aria-hidden="true" />
              ) : (
                <FiEye className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {login.error ? (
          <p className="text-sm text-[#ba1a1a]" role="alert">
            {getErrorMessage(login.error)}
          </p>
        ) : null}

        <button
          className="mt-4 flex h-12 w-full items-center justify-center bg-[#1A1A1A] text-label-sm uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={login.isPending}
          type="submit"
        >
          {!login.isPending ? (
            <FiLogIn className="mr-2 size-4" aria-hidden="true" />
          ) : null}
          {login.isPending ? "Memproses..." : "Masuk"}
        </button>

        <div className="mt-4 text-center">
          <a
            className="text-label-sm text-[#5e5e5e] underline-offset-4 transition-colors hover:text-[#1A1A1A] hover:underline"
            href="https://wa.me/6285156692133?text=Halo%20Admin%2C%20saya%20ingin%20melakukan%20pendaftaran%20akun%20MATCH"
            rel="noreferrer"
            target="_blank"
          >
            Hubungi Admin
          </a>
        </div>
      </form>
    </main>
  );
}
