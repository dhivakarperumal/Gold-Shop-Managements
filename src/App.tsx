import { Outlet } from "react-router-dom";
import Navbar from "./components/CommonComponents/Navbar";
import Header from "./components/CommonComponents/Header";
import Footer from "./components/CommonComponents/Footer";

function App() {
  return (
    <section>
      <Header />
      <Navbar />
      <Outlet />
      <Footer />
    </section>
  );
}

export default App;
