import { Link } from "react-router";

import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Main from "../components/layouts/Main";
import Wrapper from "../components/layouts/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Home() {
  useTitle("Home");

  return (
    <Wrapper>
      <Header />
      <Main>
        <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-16 text-center">
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
            All your files. One place.
          </h1>
          <p className="mt-4 max-w-lg text-gray-500">
            A simple space to keep and organize what matters.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <Link
              className="rounded-full bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              to="/register"
            >
              Get started!
            </Link>
          </div>
        </section>
      </Main>
      <Footer />
    </Wrapper>
  );
}
