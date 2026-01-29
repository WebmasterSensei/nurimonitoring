import Image from "next/image";
import MainComponent from "./components/main";

export default function Home() {
  return (
    <div>
      <>
        <MainComponent />
        <footer className="bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} My Nutrition App. All rights
              reserved.
            </p>
            <p className="text-sm animate-pulse">
              Powered By Calorie Ninja
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a
                href="#"
                className="hover:text-yellow-400 transition-colors duration-200"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-yellow-400 transition-colors duration-200"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-yellow-400 transition-colors duration-200"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </>
    </div>
  );
}
