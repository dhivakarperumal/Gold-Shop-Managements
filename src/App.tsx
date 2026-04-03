import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/CommonComponents/Navbar";
import { seedCustomers } from "./lib/seedData";
import Header from "./components/CommonComponents/Header";
import Footer from "./components/CommonComponents/Footer";

function App() {
  useEffect(() => {
    seedCustomers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Header />
      <main className="flex-1 mt-26 overflow-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
