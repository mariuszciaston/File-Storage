import { CloudOff } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Main from "../components/layouts/Main";
import Wrapper from "../components/layouts/Wrapper";

export default function NotFound() {
  return (
    <Wrapper>
      <Header />
      <Main>
        <section className="grid min-h-[75vh] place-content-center justify-items-center text-center">
          <div className="mb-4 grid size-19 place-items-center rounded-full bg-gray-100 text-gray-500">
            <CloudOff size={34} />
          </div>
          <h1 className="text-xl font-normal">404 - Page Not Found</h1>
          <p className="text-sm text-gray-500">
            The page you're looking for doesn't exist.
          </p>
          <Link
            className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
            to="/"
          >
            Back to home
          </Link>
        </section>
      </Main>
      <Footer />
    </Wrapper>
  );
}
